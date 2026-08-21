"""Populate the local PRAVAH database with synthetic demo data."""

from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import delete, select

from database.connection import SessionLocal
from database.models import (
    AuditLog,
    BloodBank,
    ColdChainTelemetry,
    DemandForecast,
    Equipment,
    Inventory,
    RiskPrediction,
    TransferRecommendation,
    UsageHistory,
)

DEMO_PREFIX = "[DEMO]"

COMPONENTS = ["Whole Blood", "Packed RBC", "Platelets", "Plasma"]
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

SHELF_LIFE_DAYS = {
    "Whole Blood": 35,
    "Packed RBC": 42,
    "Platelets": 5,
    "Plasma": 365,
}

DEMO_BANKS = [
    {
        "name": f"{DEMO_PREFIX} Delhi Central Blood Bank",
        "city": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "capacity": 5000,
        "profile": "surplus",
    },
    {
        "name": f"{DEMO_PREFIX} Mumbai Regional Blood Centre",
        "city": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "capacity": 4200,
        "profile": "low",
    },
    {
        "name": f"{DEMO_PREFIX} Bengaluru City Blood Bank",
        "city": "Bengaluru",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "capacity": 3800,
        "profile": "near_expiry",
    },
    {
        "name": f"{DEMO_PREFIX} Chennai South Blood Bank",
        "city": "Chennai",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "capacity": 3500,
        "profile": "shortage",
    },
    {
        "name": f"{DEMO_PREFIX} Hyderabad Central Blood Bank",
        "city": "Hyderabad",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "capacity": 4000,
        "profile": "healthy",
    },
]


def _inventory_quantity(profile: str, component: str, blood_group: str) -> int:
    high_demand_groups = {"O+", "B+", "A+"}
    if profile == "surplus":
        return 55 if blood_group in high_demand_groups else 40
    if profile == "shortage":
        return 1 if blood_group in high_demand_groups else 3
    if profile == "low":
        return 6 if blood_group in high_demand_groups else 12
    if profile == "near_expiry":
        return 18 if component == "Platelets" else 22
    return 25 if blood_group in high_demand_groups else 20


def _inventory_dates(profile: str, component: str, today: date) -> tuple[date, date]:
    shelf_life = SHELF_LIFE_DAYS[component]

    if profile == "near_expiry" and component in {"Whole Blood", "Packed RBC", "Platelets"}:
        days_to_expiry = 2 if component == "Platelets" else 3
        expiry_date = today + timedelta(days=days_to_expiry)
    elif profile == "surplus":
        expiry_date = today + timedelta(days=min(shelf_life - 5, 30))
    elif profile == "shortage":
        expiry_date = today + timedelta(days=min(shelf_life - 2, 14))
    else:
        expiry_date = today + timedelta(days=min(shelf_life // 2, 21))

    collection_date = expiry_date - timedelta(days=shelf_life)
    if collection_date > today:
        collection_date = today - timedelta(days=max(1, shelf_life // 4))
        expiry_date = collection_date + timedelta(days=shelf_life)

    return collection_date, expiry_date


def _inventory_status(profile: str, quantity: int, expiry_date: date, today: date) -> str:
    if expiry_date <= today + timedelta(days=2):
        return "NEAR_EXPIRY"
    if profile == "shortage" or quantity <= 3:
        return "LOW"
    if profile == "surplus" and quantity >= 40:
        return "SURPLUS"
    return "AVAILABLE"


def clear_demo_data(session) -> None:
    demo_bank_ids = list(
        session.scalars(
            select(BloodBank.id).where(BloodBank.name.like(f"{DEMO_PREFIX}%"))
        )
    )
    if not demo_bank_ids:
        return

    inventory_ids = list(
        session.scalars(select(Inventory.id).where(Inventory.bank_id.in_(demo_bank_ids)))
    )
    transfer_ids = list(
        session.scalars(
            select(TransferRecommendation.id).where(
                TransferRecommendation.source_bank_id.in_(demo_bank_ids)
                | TransferRecommendation.destination_bank_id.in_(demo_bank_ids)
            )
        )
    )

    if transfer_ids:
        session.execute(
            delete(AuditLog).where(AuditLog.recommendation_id.in_(transfer_ids))
        )
    if inventory_ids:
        session.execute(
            delete(RiskPrediction).where(RiskPrediction.inventory_id.in_(inventory_ids))
        )
    if transfer_ids:
        session.execute(
            delete(TransferRecommendation).where(
                TransferRecommendation.id.in_(transfer_ids)
            )
        )

    session.execute(delete(UsageHistory).where(UsageHistory.bank_id.in_(demo_bank_ids)))
    session.execute(
        delete(ColdChainTelemetry).where(ColdChainTelemetry.bank_id.in_(demo_bank_ids))
    )
    session.execute(delete(Equipment).where(Equipment.bank_id.in_(demo_bank_ids)))
    session.execute(delete(DemandForecast).where(DemandForecast.bank_id.in_(demo_bank_ids)))
    session.execute(delete(Inventory).where(Inventory.bank_id.in_(demo_bank_ids)))
    session.execute(delete(BloodBank).where(BloodBank.id.in_(demo_bank_ids)))
    session.commit()


def seed_blood_banks(session, counts: dict[str, int]) -> list[BloodBank]:
    banks: list[BloodBank] = []
    for bank_data in DEMO_BANKS:
        bank = BloodBank(
            name=bank_data["name"],
            city=bank_data["city"],
            latitude=bank_data["latitude"],
            longitude=bank_data["longitude"],
            capacity=bank_data["capacity"],
            status="ACTIVE",
        )
        session.add(bank)
        banks.append(bank)

    session.flush()
    counts["blood_banks"] += len(banks)
    return banks


def seed_inventory(session, banks: list[BloodBank], today: date, counts: dict[str, int]) -> list[Inventory]:
    items: list[Inventory] = []
    bank_profiles = {bank.name: data["profile"] for bank, data in zip(banks, DEMO_BANKS)}

    for bank in banks:
        profile = bank_profiles[bank.name]
        for component in COMPONENTS:
            for blood_group in BLOOD_GROUPS:
                quantity = _inventory_quantity(profile, component, blood_group)
                collection_date, expiry_date = _inventory_dates(profile, component, today)
                status = _inventory_status(profile, quantity, expiry_date, today)
                item = Inventory(
                    bank_id=bank.id,
                    component=component,
                    blood_group=blood_group,
                    quantity=quantity,
                    collection_date=collection_date,
                    expiry_date=expiry_date,
                    status=status,
                )
                session.add(item)
                items.append(item)

    session.flush()
    counts["inventory"] += len(items)
    return items


def seed_usage_history(session, banks: list[BloodBank], today: date, counts: dict[str, int]) -> None:
    records = 0
    for bank in banks:
        for day_offset in range(1, 31, 3):
            usage_date = today - timedelta(days=day_offset)
            for component, blood_group in zip(
                COMPONENTS,
                ["O+", "B+", "A+", "AB+"],
            ):
                units_used = 4 + (day_offset % 5)
                session.add(
                    UsageHistory(
                        bank_id=bank.id,
                        component=component,
                        blood_group=blood_group,
                        date=usage_date,
                        units_used=units_used,
                    )
                )
                records += 1

    session.flush()
    counts["usage_history"] += records


def seed_cold_chain(session, banks: list[BloodBank], now: datetime, counts: dict[str, int]) -> None:
    records = 0
    for bank_index, bank in enumerate(banks):
        for hour_offset in range(0, 72, 6):
            timestamp = now - timedelta(hours=hour_offset)
            is_excursion = bank_index == 2 and hour_offset in {12, 18}
            temperature = 9.2 if is_excursion else round(4.0 + (hour_offset % 4) * 0.3, 1)
            agitation_status = not is_excursion
            session.add(
                ColdChainTelemetry(
                    bank_id=bank.id,
                    timestamp=timestamp,
                    temperature=temperature,
                    agitation_status=agitation_status,
                )
            )
            records += 1

    session.flush()
    counts["cold_chain_telemetry"] += records


def seed_equipment(session, banks: list[BloodBank], counts: dict[str, int]) -> None:
    equipment_types = [
        ("Refrigerator", 0.92, "OPERATIONAL"),
        ("Platelet Agitator", 0.88, "OPERATIONAL"),
        ("Plasma Freezer", 0.54, "DEGRADED"),
    ]
    records = 0
    for bank in banks:
        for equipment_type, health_score, status in equipment_types:
            session.add(
                Equipment(
                    bank_id=bank.id,
                    equipment_type=equipment_type,
                    health_score=health_score,
                    status=status,
                )
            )
            records += 1

    session.flush()
    counts["equipment"] += records


def seed_demand_forecasts(session, banks: list[BloodBank], today: date, counts: dict[str, int]) -> None:
    records = 0
    for bank in banks:
        for component in COMPONENTS:
            for day_offset in (1, 3, 7):
                session.add(
                    DemandForecast(
                        bank_id=bank.id,
                        component=component,
                        blood_group="O+",
                        forecast_date=today + timedelta(days=day_offset),
                        predicted_demand=round(8.5 + day_offset * 1.2, 1),
                        model_version="demo-v1",
                    )
                )
                records += 1

    session.flush()
    counts["demand_forecasts"] += records


def seed_demo_data() -> dict[str, int]:
    today = date.today()
    now = datetime.now()
    counts = {
        "blood_banks": 0,
        "inventory": 0,
        "usage_history": 0,
        "cold_chain_telemetry": 0,
        "equipment": 0,
        "demand_forecasts": 0,
        "risk_predictions": 0,
        "transfer_recommendations": 0,
        "audit_logs": 0,
    }

    session = SessionLocal()
    try:
        clear_demo_data(session)

        banks = seed_blood_banks(session, counts)
        seed_inventory(session, banks, today, counts)
        seed_usage_history(session, banks, today, counts)
        seed_cold_chain(session, banks, now, counts)
        seed_equipment(session, banks, counts)
        seed_demand_forecasts(session, banks, today, counts)

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    return counts


def print_summary(counts: dict[str, int]) -> None:
    print("PRAVAH demo data seeded successfully.")
    print()
    print("Records inserted:")
    for table_name in (
        "blood_banks",
        "inventory",
        "usage_history",
        "cold_chain_telemetry",
        "equipment",
        "demand_forecasts",
        "risk_predictions",
        "transfer_recommendations",
        "audit_logs",
    ):
        print(f"  {table_name}: {counts[table_name]}")


if __name__ == "__main__":
    summary = seed_demo_data()
    print_summary(summary)
