"""Rule-based PRAVAH intelligence pipeline (replaceable by ML later)."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import date, datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from database.models import (
    BloodBank,
    ColdChainTelemetry,
    DemandForecast,
    Equipment,
    Inventory,
    RiskPrediction,
    TransferRecommendation,
    UsageHistory,
)

ENGINE_VERSION = "rule-based-demo-v1"
DEMO_VEHICLE = "Refrigerated Van"
TEMP_MIN_C = 2.0
TEMP_MAX_C = 8.0


def _risk_level(score: float) -> str:
    if score >= 0.70:
        return "HIGH"
    if score >= 0.40:
        return "MEDIUM"
    return "LOW"


def _days_to_expiry(expiry_date: date, today: date) -> int:
    return (expiry_date - today).days


def _latest_forecast(
    forecasts: list[DemandForecast],
    bank_id: int,
    component: str,
    blood_group: str,
) -> DemandForecast | None:
    """Most recent forecast for a bank/component/blood_group combination."""
    matches = [
        f
        for f in forecasts
        if f.bank_id == bank_id
        and f.component == component
        and f.blood_group == blood_group
    ]
    if not matches:
        return None
    return max(matches, key=lambda f: f.forecast_date)


def _latest_temperature(
    telemetry: list[ColdChainTelemetry], bank_id: int
) -> float | None:
    """Most recent cold-chain reading for a bank."""
    readings = [t for t in telemetry if t.bank_id == bank_id]
    if not readings:
        return None
    return max(readings, key=lambda t: t.timestamp).temperature


def _calculate_risk(
    item: Inventory,
    today: date,
    forecast: DemandForecast | None,
    temperature: float | None,
) -> tuple[float, list[str]]:
    """
    Transparent demo risk scoring.
    Each rule adds to the score; capped at 1.0.
    """
    score = 0.0
    features: list[str] = []

    days_left = _days_to_expiry(item.expiry_date, today)
    if days_left <= 2:
        score += 0.50
        features.append(f"near_expiry({days_left}d)")
    elif days_left <= 5:
        score += 0.30
        features.append(f"expiring_soon({days_left}d)")

    if item.quantity <= 5:
        score += 0.20
        features.append(f"very_low_stock({item.quantity})")
    elif item.quantity <= 10:
        score += 0.20
        features.append(f"low_stock({item.quantity})")

    if forecast and item.quantity < forecast.predicted_demand:
        score += 0.10
        features.append(
            f"below_forecast_demand({item.quantity}<{forecast.predicted_demand})"
        )

    if temperature is not None and (temperature < TEMP_MIN_C or temperature > TEMP_MAX_C):
        score += 0.15
        features.append(f"temperature_stress({temperature}C)")

    return min(score, 1.0), features


def _aggregate_inventory(inventory: list[Inventory]) -> dict[tuple[int, str, str], int]:
    """Sum available quantity by bank, component, and blood group."""
    totals: dict[tuple[int, str, str], int] = defaultdict(int)
    for item in inventory:
        if item.status != "AVAILABLE" and item.status not in {"LOW", "SURPLUS", "NEAR_EXPIRY"}:
            continue
        key = (item.bank_id, item.component, item.blood_group)
        totals[key] += item.quantity
    return totals


def _detect_shortages_and_surpluses(
    inventory_totals: dict[tuple[int, str, str], int],
    forecasts: list[DemandForecast],
) -> tuple[list[dict], list[dict], int, int]:
    """
    Compare aggregated inventory against most recent demand forecast.
    SHORTAGE: inventory < demand
    SURPLUS:  inventory > demand * 1.5
    """
    shortages: list[dict] = []
    surpluses: list[dict] = []
    shortage_keys: set[tuple[int, str, str]] = set()
    surplus_keys: set[tuple[int, str, str]] = set()

    for (bank_id, component, blood_group), quantity in inventory_totals.items():
        forecast = _latest_forecast(forecasts, bank_id, component, blood_group)
        if forecast is None:
            continue

        demand = forecast.predicted_demand

        if quantity < demand:
            amount = demand - quantity
            shortages.append(
                {
                    "bank_id": bank_id,
                    "component": component,
                    "blood_group": blood_group,
                    "shortage": amount,
                    "demand": demand,
                    "inventory": quantity,
                }
            )
            shortage_keys.add((bank_id, component, blood_group))

        if quantity > demand * 1.5:
            amount = quantity - demand * 1.5
            surpluses.append(
                {
                    "bank_id": bank_id,
                    "component": component,
                    "blood_group": blood_group,
                    "surplus": amount,
                    "demand": demand,
                    "inventory": quantity,
                }
            )
            surplus_keys.add((bank_id, component, blood_group))

    return shortages, surpluses, len(shortage_keys), len(surplus_keys)


def _match_transfers(
    shortages: list[dict],
    surpluses: list[dict],
    banks: dict[int, BloodBank],
    now: datetime,
) -> list[TransferRecommendation]:
    """
    Match surplus banks to shortage banks with the same component and blood group.
    Transfer quantity = min(source_surplus, destination_shortage).
    """
    # Track remaining surplus per source location (mutable copy)
    surplus_pool = {
        (s["bank_id"], s["component"], s["blood_group"]): s["surplus"]
        for s in surpluses
    }

    recommendations: list[TransferRecommendation] = []

    for shortage in shortages:
        key = (shortage["component"], shortage["blood_group"])
        remaining_shortage = shortage["shortage"]

        for source_key, available in list(surplus_pool.items()):
            source_bank_id, component, blood_group = source_key
            if component != shortage["component"] or blood_group != shortage["blood_group"]:
                continue
            if source_bank_id == shortage["bank_id"]:
                continue
            if available <= 0 or remaining_shortage <= 0:
                continue

            transfer_qty = int(min(available, remaining_shortage))
            if transfer_qty <= 0:
                continue

            source_bank = banks[source_bank_id]
            dest_bank = banks[shortage["bank_id"]]

            recommendations.append(
                TransferRecommendation(
                    source_bank_id=source_bank_id,
                    destination_bank_id=shortage["bank_id"],
                    component=component,
                    blood_group=blood_group,
                    quantity=transfer_qty,
                    route=f"{source_bank.city} → {dest_bank.city}",
                    vehicle=DEMO_VEHICLE,
                    status="PENDING",
                    created_at=now,
                )
            )

            surplus_pool[source_key] = available - transfer_qty
            remaining_shortage -= transfer_qty

    return recommendations


def run_intelligence_pipeline(db: Session) -> dict:
    """Run the full rule-based intelligence pipeline in a single transaction."""
    today = date.today()
    now = datetime.now()

    # --- Step 1-5: Read current state ---
    inventory = list(db.scalars(select(Inventory)).all())
    forecasts = list(db.scalars(select(DemandForecast)).all())
    db.scalars(select(UsageHistory)).all()  # loaded for future ML; not used in rules yet
    telemetry = list(db.scalars(select(ColdChainTelemetry)).all())
    db.scalars(select(Equipment)).all()  # loaded for future ML; not used in rules yet
    banks = {b.id: b for b in db.scalars(select(BloodBank)).all()}

    # --- Step 6: Generate risk predictions ---
    # Clear previous demo predictions so the endpoint is rerunnable.
    db.execute(
        delete(RiskPrediction).where(RiskPrediction.model_version == ENGINE_VERSION)
    )

    risk_predictions: list[RiskPrediction] = []
    for item in inventory:
        forecast = _latest_forecast(
            forecasts, item.bank_id, item.component, item.blood_group
        )
        temperature = _latest_temperature(telemetry, item.bank_id)
        score, features = _calculate_risk(item, today, forecast, temperature)

        risk_predictions.append(
            RiskPrediction(
                inventory_id=item.id,
                risk_score=round(score, 2),
                risk_level=_risk_level(score),
                contributing_features=json.dumps(features),
                model_version=ENGINE_VERSION,
                created_at=now,
            )
        )

    db.add_all(risk_predictions)

    # --- Step 7: Detect shortages and surpluses ---
    inventory_totals = _aggregate_inventory(inventory)
    shortages, surpluses, shortages_detected, surplus_locations = (
        _detect_shortages_and_surpluses(inventory_totals, forecasts)
    )

    # --- Step 8-9: Match transfers and persist ---
    # Clear previous demo PENDING recommendations so the endpoint is rerunnable.
    db.execute(
        delete(TransferRecommendation).where(
            TransferRecommendation.status == "PENDING",
            TransferRecommendation.vehicle == DEMO_VEHICLE,
        )
    )

    transfers = _match_transfers(shortages, surpluses, banks, now)
    db.add_all(transfers)

    db.commit()

    return {
        "status": "success",
        "risk_predictions_created": len(risk_predictions),
        "transfer_recommendations_created": len(transfers),
        "shortages_detected": shortages_detected,
        "surplus_locations": surplus_locations,
    }
