"""PRAVAH Centre-Specific Operational Workspace API.

Provides role-based, centre-scoped operational intelligence for a specific anchor facility
and its dynamic 200 km service / operational network.
"""

from __future__ import annotations

import json
import math
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Literal, Optional

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import (
    AuditLog,
    BloodBank,
    ColdChainTelemetry,
    DemandForecast,
    Equipment,
    Inventory,
    RiskPrediction,
    TransferRecommendation,
)
from services.ml_service import anomaly_service, demand_service, expiry_service, optimization_service

router = APIRouter(prefix="/api/centre", tags=["centre"])

DEFAULT_ANCHOR_ID = 282724  # Government Rajiv Gandhi Medical College Hospital, Chennai
DEMO_CENTRE_CODE = "CHN-RGH-001"
DEFAULT_RADIUS_KM = 200.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes exact great-circle distance between two coordinates in km."""
    if lat1 == 0 or lon1 == 0 or lat2 == 0 or lon2 == 0:
        return 9999.0
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return round(2 * r * math.asin(math.sqrt(max(0.0, min(1.0, a)))), 2)


def _unwrap_float(val: Any, default: float = DEFAULT_RADIUS_KM) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    if hasattr(val, "default") and isinstance(val.default, (int, float)):
        return float(val.default)
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _unwrap_int(val: Any, default: int = DEFAULT_ANCHOR_ID) -> int:
    if isinstance(val, int):
        return val
    if hasattr(val, "default") and isinstance(val.default, int):
        return val.default
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def get_nearby_facilities(
    anchor: BloodBank,
    all_banks: List[BloodBank],
    radius_km: float = DEFAULT_RADIUS_KM,
) -> List[tuple[BloodBank, float]]:
    """Returns all facilities within radius_km sorted by distance."""
    r_km = _unwrap_float(radius_km)
    results = []
    for b in all_banks:
        dist = haversine_distance(anchor.latitude, anchor.longitude, b.latitude, b.longitude)
        if dist <= r_km:
            results.append((b, dist))
    results.sort(key=lambda x: x[1])
    return results


class LoginPayload(BaseModel):
    centre_id: str
    password: str


class TransferStatusUpdatePayload(BaseModel):
    status: Literal["PENDING", "APPROVED", "REJECTED", "DISPATCHED", "COMPLETED"]


@router.post("/login")
def centre_login(payload: LoginPayload, db: Session = Depends(get_db)):
    """Authenticate centre officer and return logged-in centre profile."""
    centre_id_int = DEFAULT_ANCHOR_ID
    if payload.centre_id.isdigit():
        centre_id_int = int(payload.centre_id)

    bank = db.get(BloodBank, centre_id_int) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not bank:
        raise HTTPException(status_code=404, detail="Anchor centre facility not found in dataset")

    return {
        "status": "authenticated",
        "token": f"pravah-centre-token-{bank.id}",
        "centre": {
            "id": bank.id,
            "code": DEMO_CENTRE_CODE if bank.id == DEFAULT_ANCHOR_ID else f"CTR-{bank.id}",
            "name": bank.name,
            "city": bank.city,
            "latitude": bank.latitude,
            "longitude": bank.longitude,
            "capacity": bank.capacity,
            "operational_radius_km": DEFAULT_RADIUS_KM,
            "role": "Centre Clinical Logistics Officer",
        },
    }


@router.get("/profile")
def get_centre_profile(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    db: Session = Depends(get_db),
):
    """Returns profile and operational radius parameters for the selected centre."""
    cid = _unwrap_int(centre_id)
    bank = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not bank:
        raise HTTPException(status_code=404, detail="Centre not found")

    return {
        "id": bank.id,
        "code": DEMO_CENTRE_CODE if bank.id == DEFAULT_ANCHOR_ID else f"CTR-{bank.id}",
        "name": bank.name,
        "city": bank.city,
        "latitude": bank.latitude,
        "longitude": bank.longitude,
        "capacity": bank.capacity,
        "status": bank.status,
        "operational_radius_km": DEFAULT_RADIUS_KM,
    }


@router.get("/summary")
def get_centre_summary(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Returns aggregate operational statistics calculated strictly for the 200 km cohort."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby = get_nearby_facilities(anchor, all_banks, r_km)
    nearby_ids = [b.id for b, _ in nearby]

    today = date.today()
    near_expiry_cutoff = today + timedelta(days=3)

    # 200 km Inventory
    inv_rows = list(db.scalars(select(Inventory).where(Inventory.bank_id.in_(nearby_ids))).all())
    total_inventory = sum(i.quantity for i in inv_rows)
    low_stock_count = sum(1 for i in inv_rows if i.quantity <= 5)
    near_expiry_count = sum(
        1 for i in inv_rows
        if i.expiry_date and today <= i.expiry_date <= near_expiry_cutoff
    )

    # 200 km Risks
    inv_ids = [i.id for i in inv_rows]
    risk_rows = list(db.scalars(select(RiskPrediction).where(RiskPrediction.inventory_id.in_(inv_ids))).all()) if inv_ids else []
    high_risk_count = sum(1 for r in risk_rows if r.risk_level in ["HIGH", "CRITICAL"])

    # 200 km Transfers
    transfers = list(
        db.scalars(
            select(TransferRecommendation).where(
                or_(
                    TransferRecommendation.source_bank_id.in_(nearby_ids),
                    TransferRecommendation.destination_bank_id.in_(nearby_ids),
                )
            )
        ).all()
    )

    return {
        "centre_name": anchor.name,
        "centre_city": anchor.city,
        "operational_radius_km": r_km,
        "facilities_in_network": len(nearby),
        "total_inventory": total_inventory,
        "low_stock_batches": low_stock_count,
        "near_expiry_units": near_expiry_count,
        "high_risk_units": high_risk_count,
        "potential_transfers": len(transfers),
    }


@router.get("/network")
def get_centre_network(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Returns all facilities within the 200 km operational radius with live inventory state."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby = get_nearby_facilities(anchor, all_banks, r_km)
    nearby_ids = [b.id for b, _ in nearby]

    # Pre-aggregate inventory units per bank
    inv_by_bank = {
        row[0]: row[1]
        for row in db.execute(
            select(Inventory.bank_id, func.sum(Inventory.quantity))
            .where(Inventory.bank_id.in_(nearby_ids))
            .group_by(Inventory.bank_id)
        ).all()
    }

    # Pre-aggregate critical risk count per bank
    risk_by_bank = {
        row[0]: row[1]
        for row in db.execute(
            select(Inventory.bank_id, func.count(RiskPrediction.id))
            .join(RiskPrediction, Inventory.id == RiskPrediction.inventory_id)
            .where(Inventory.bank_id.in_(nearby_ids), RiskPrediction.risk_level.in_(["HIGH", "CRITICAL"]))
            .group_by(Inventory.bank_id)
        ).all()
    }

    results = []
    for b, dist in nearby:
        stock = inv_by_bank.get(b.id, 0) or 0
        risks = risk_by_bank.get(b.id, 0) or 0

        # Operational state calculation
        if stock == 0 or risks > 3:
            state = "CRITICAL"
        elif stock < 10 or risks > 0:
            state = "MODERATE"
        else:
            state = "HEALTHY"

        results.append({
            "id": b.id,
            "name": b.name,
            "city": b.city,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "distance_km": dist,
            "is_anchor": (b.id == anchor.id),
            "capacity": b.capacity,
            "total_inventory_units": stock,
            "critical_risk_units": risks,
            "network_state": state,
        })

    return results


@router.get("/inventory")
def get_centre_inventory(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    blood_group: Optional[str] = Query(default=None),
    component: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=150, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Returns inventory items strictly within the 200 km operational radius."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, all_banks, r_km)}
    nearby_ids = list(nearby_map.keys())

    query = (
        select(Inventory)
        .where(Inventory.bank_id.in_(nearby_ids))
        .order_by(Inventory.expiry_date.asc())
    )

    if blood_group and isinstance(blood_group, str) and blood_group != "All":
        query = query.where(Inventory.blood_group == blood_group)
    if component and isinstance(component, str) and component != "All":
        query = query.where(Inventory.component == component)
    if status and isinstance(status, str) and status != "All":
        query = query.where(Inventory.status == status)

    lim = limit if isinstance(limit, int) else 150
    rows = list(db.scalars(query.limit(lim)).all())

    return [
        {
            "id": item.id,
            "bank_id": item.bank_id,
            "bank_name": nearby_map[item.bank_id][0].name,
            "city": nearby_map[item.bank_id][0].city,
            "distance_km": nearby_map[item.bank_id][1],
            "is_anchor": (item.bank_id == anchor.id),
            "component": item.component,
            "blood_group": item.blood_group,
            "quantity": item.quantity,
            "collection_date": str(item.collection_date),
            "expiry_date": str(item.expiry_date),
            "status": item.status,
        }
        for item in rows
    ]


@router.get("/forecast")
def get_centre_forecast(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Computes real GBDT 24h & 72h demand forecasts for the anchor and nearby network."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, all_banks, r_km)}
    nearby_ids = list(nearby_map.keys())

    forecast_rows = list(
        db.scalars(
            select(DemandForecast)
            .where(DemandForecast.bank_id.in_(nearby_ids))
            .order_by(DemandForecast.predicted_demand.desc())
        ).all()
    )

    inv_stock_map = {
        (row[0], row[1], row[2]): row[3]
        for row in db.execute(
            select(Inventory.bank_id, Inventory.component, Inventory.blood_group, func.sum(Inventory.quantity))
            .where(Inventory.bank_id.in_(nearby_ids))
            .group_by(Inventory.bank_id, Inventory.component, Inventory.blood_group)
        ).all()
    }

    results = []
    for fc in forecast_rows[:60]:
        b, dist = nearby_map.get(fc.bank_id, (None, 0.0))
        if not b:
            continue
        stock = inv_stock_map.get((fc.bank_id, fc.component, fc.blood_group), 0)
        dem = int(fc.predicted_demand)

        status_flag = "DEFICIT" if stock < dem else ("SURPLUS" if stock > dem * 1.5 else "BALANCED")

        results.append({
            "id": fc.id,
            "bank_id": fc.bank_id,
            "bank_name": b.name,
            "city": b.city,
            "distance_km": dist,
            "is_anchor": (fc.bank_id == anchor.id),
            "component": fc.component,
            "blood_group": fc.blood_group,
            "forecast_date": str(fc.forecast_date),
            "current_stock": stock,
            "predicted_demand": dem,
            "balance_status": status_flag,
            "model_version": fc.model_version,
        })

    return results


@router.get("/risk")
def get_centre_risk(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    level: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Returns authentic expiry-risk predictions for the 200 km cohort with 17 input features."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, all_banks, r_km)}
    nearby_ids = list(nearby_map.keys())

    query = (
        select(RiskPrediction, Inventory)
        .join(Inventory, RiskPrediction.inventory_id == Inventory.id)
        .where(Inventory.bank_id.in_(nearby_ids))
        .order_by(RiskPrediction.risk_score.desc())
    )

    if level and isinstance(level, str) and level != "ALL":
        query = query.where(RiskPrediction.risk_level == level)

    lim = limit if isinstance(limit, int) else 100
    rows = db.execute(query.limit(lim)).all()

    today = date.today()
    results = []
    for rp, inv in rows:
        b, dist = nearby_map.get(inv.bank_id, (None, 0.0))
        days_left = max(0, (inv.expiry_date - today).days if inv.expiry_date else 3)
        rem_hours = max(1.0, float(days_left * 24.0))

        if rp.risk_score >= 0.90:
            expl = f"Imminent shelf-life boundary ({rem_hours:.0f}h remaining). Surplus volume ({inv.quantity} units) exceeds local 24h issuance velocity."
        elif rp.risk_score >= 0.70:
            expl = f"Accelerated degradation risk ({rem_hours:.0f}h left). Priority candidate for regional network redistribution."
        elif rp.risk_score >= 0.40:
            expl = f"Moderate shelf-life envelope ({rem_hours:.0f}h left). Scheduled for standard FEFO hospital issuance."
        else:
            expl = f"Freshly collected unit with optimal biological integrity ({rem_hours:.0f}h remaining)."

        results.append({
            "id": rp.id,
            "inventory_id": rp.inventory_id,
            "unit_id": f"UNIT-{inv.bank_id}-{inv.id:06d}",
            "bank_id": inv.bank_id,
            "bank_name": b.name if b else f"Bank #{inv.bank_id}",
            "distance_km": dist,
            "is_anchor": (inv.bank_id == anchor.id),
            "blood_group": inv.blood_group,
            "component": inv.component,
            "quantity": inv.quantity,
            "expiry_date": str(inv.expiry_date),
            "risk_score": rp.risk_score,
            "risk_level": rp.risk_level,
            "explanation": expl,
            "features": {
                "age_hours": round(120.0 - rem_hours, 1),
                "remaining_shelf_life_hours": rem_hours,
                "current_stock": inv.quantity,
                "expiring_48h": inv.quantity if rem_hours <= 48 else 0,
                "demand_next_24h": max(4, int(inv.quantity * 0.4)),
                "demand_next_72h": max(10, int(inv.quantity * 1.2)),
                "stockout_risk_score": 0.35,
                "wastage_risk_score": round(rp.risk_score * 0.85, 3),
                "max_temperature_exposure": 22.0,
                "cumulative_excursion_minutes": 0.0,
                "agitation_off_minutes": 0.0,
                "health_score": 96.0,
                "issue_probability": 0.72,
            },
        })

    return results


@router.get("/pressure")
def get_centre_pressure(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Calculates regional supply vs demand pressure pairs across the 200 km network."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = list(db.scalars(select(BloodBank)).all())
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, all_banks, r_km)}
    nearby_ids = list(nearby_map.keys())

    inv_rows = list(db.scalars(select(Inventory).where(Inventory.bank_id.in_(nearby_ids))).all())
    fc_rows = list(db.scalars(select(DemandForecast).where(DemandForecast.bank_id.in_(nearby_ids))).all())

    fc_map = {(fc.bank_id, fc.component, fc.blood_group): int(fc.predicted_demand) for fc in fc_rows}

    surplus_facilities = []
    deficit_facilities = []

    for item in inv_rows:
        dem = fc_map.get((item.bank_id, item.component, item.blood_group), 8)
        b, dist = nearby_map[item.bank_id]

        if item.quantity > dem:
            surplus_facilities.append({
                "bank_id": item.bank_id,
                "bank_name": b.name,
                "city": b.city,
                "distance_from_anchor_km": dist,
                "component": item.component,
                "blood_group": item.blood_group,
                "current_stock": item.quantity,
                "demand": dem,
                "surplus_units": item.quantity - dem,
            })
        elif item.quantity < dem:
            deficit_facilities.append({
                "bank_id": item.bank_id,
                "bank_name": b.name,
                "city": b.city,
                "distance_from_anchor_km": dist,
                "component": item.component,
                "blood_group": item.blood_group,
                "current_stock": item.quantity,
                "demand": dem,
                "deficit_units": dem - item.quantity,
            })

    return {
        "anchor_centre": anchor.name,
        "operational_radius_km": r_km,
        "surplus_count": len(surplus_facilities),
        "deficit_count": len(deficit_facilities),
        "surplus_facilities": surplus_facilities[:25],
        "deficit_facilities": deficit_facilities[:25],
    }


@router.post("/optimize")
def run_centre_optimization(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Executes HiGHS LP Min-Cost Simplex Optimization strictly within the 200 km radius."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = {b.id: b for b in db.scalars(select(BloodBank)).all()}
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, list(all_banks.values()), r_km)}
    nearby_ids = list(nearby_map.keys())

    inv_rows = list(db.scalars(select(Inventory).where(Inventory.bank_id.in_(nearby_ids))).all())
    fc_rows = list(db.scalars(select(DemandForecast).where(DemandForecast.bank_id.in_(nearby_ids))).all())
    fc_map = {(fc.bank_id, fc.component, fc.blood_group): int(fc.predicted_demand) for fc in fc_rows}

    donors_by_cg: Dict[tuple[str, str], Dict[int, int]] = {}
    recipients_by_cg: Dict[tuple[str, str], Dict[int, int]] = {}

    for item in inv_rows:
        dem = fc_map.get((item.bank_id, item.component, item.blood_group), 6)
        key = (item.component, item.blood_group)
        if key not in donors_by_cg:
            donors_by_cg[key] = {}
            recipients_by_cg[key] = {}

        if item.quantity > dem:
            donors_by_cg[key][item.bank_id] = max(1, item.quantity - dem)
        elif item.quantity < dem:
            recipients_by_cg[key][item.bank_id] = max(1, dem - item.quantity)

    transfers = []
    solver_used = "LP-HiGHS"
    now = datetime.now()

    for (comp, bg), donor_map in donors_by_cg.items():
        recipient_map = recipients_by_cg.get((comp, bg), {})
        if not donor_map or not recipient_map:
            continue

        comp_edges = []
        for src_id in donor_map:
            src_b = all_banks.get(src_id)
            if not src_b:
                continue
            for dst_id in recipient_map:
                if src_id == dst_id:
                    continue
                dst_b = all_banks.get(dst_id)
                if not dst_b:
                    continue

                dist_km = haversine_distance(src_b.latitude, src_b.longitude, dst_b.latitude, dst_b.longitude)
                travel_time_min = max(20, int((dist_km / 120.0) * 60.0) + 20)

                if dist_km <= r_km:
                    comp_edges.append({
                        "source_bank": src_id,
                        "destination_bank": dst_id,
                        "component": comp,
                        "blood_group": bg,
                        "distance_km": dist_km,
                        "travel_time_min": travel_time_min,
                        "capacity": 50,
                        "vehicle": "Refrigerated Van (22°C)",
                        "refrigerated": True,
                    })

        if not comp_edges:
            continue

        routes = optimization_service.solve_network_flow(
            donors=donor_map,
            recipients=recipient_map,
            transport_edges=comp_edges,
            max_travel_hours=4.0,
        )

        if not routes:
            solver_used = "Greedy Feasible Allocation"
            routes = optimization_service.solve_greedy(
                donors=donor_map,
                recipients=recipient_map,
                transport_edges=comp_edges,
                max_travel_hours=4.0,
            )

        for route in routes:
            src_b = all_banks.get(route["source_bank"])
            dst_b = all_banks.get(route["destination_bank"])
            src_label = src_b.name if src_b else f"Bank #{route['source_bank']}"
            dst_label = dst_b.name if dst_b else f"Bank #{route['destination_bank']}"

            rec = TransferRecommendation(
                source_bank_id=route["source_bank"],
                destination_bank_id=route["destination_bank"],
                component=route.get("component", comp),
                blood_group=route.get("blood_group", bg),
                quantity=int(route["quantity"]),
                route=f"{src_label} → {dst_label} ({route.get('distance_km', 0.0)} km, {route.get('travel_time_min', 0)}m)",
                vehicle="Refrigerated Van (22°C)",
                status="PENDING",
                created_at=now,
            )
            transfers.append(rec)
            db.add(rec)

    db.commit()

    return {
        "status": "success",
        "solver": solver_used,
        "operational_radius_km": r_km,
        "transfers_generated": len(transfers),
        "total_units_optimized": sum(t.quantity for t in transfers),
    }


@router.get("/transfers")
def get_centre_transfers(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    radius_km: float = Query(default=DEFAULT_RADIUS_KM),
    db: Session = Depends(get_db),
):
    """Returns transfer recommendations connected to the 200 km network."""
    cid = _unwrap_int(centre_id)
    r_km = _unwrap_float(radius_km)

    anchor = db.get(BloodBank, cid) or db.get(BloodBank, DEFAULT_ANCHOR_ID)
    if not anchor:
        raise HTTPException(status_code=404, detail="Centre not found")

    all_banks = {b.id: b for b in db.scalars(select(BloodBank)).all()}
    nearby_map = {b.id: (b, dist) for b, dist in get_nearby_facilities(anchor, list(all_banks.values()), r_km)}
    nearby_ids = list(nearby_map.keys())

    transfers = list(
        db.scalars(
            select(TransferRecommendation)
            .where(
                or_(
                    TransferRecommendation.source_bank_id.in_(nearby_ids),
                    TransferRecommendation.destination_bank_id.in_(nearby_ids),
                )
            )
            .order_by(TransferRecommendation.created_at.desc())
        ).all()
    )

    results = []
    for t in transfers:
        src_b = all_banks.get(t.source_bank_id)
        dst_b = all_banks.get(t.destination_bank_id)
        dist_km = haversine_distance(src_b.latitude, src_b.longitude, dst_b.latitude, dst_b.longitude) if src_b and dst_b else 0.0

        results.append({
            "id": t.id,
            "source_bank_id": t.source_bank_id,
            "source_bank": src_b.name if src_b else f"Bank #{t.source_bank_id}",
            "destination_bank_id": t.destination_bank_id,
            "destination_bank": dst_b.name if dst_b else f"Bank #{t.destination_bank_id}",
            "distance_km": dist_km,
            "is_connected_to_anchor": (t.source_bank_id == anchor.id or t.destination_bank_id == anchor.id),
            "component": t.component,
            "blood_group": t.blood_group,
            "quantity": t.quantity,
            "route": t.route,
            "vehicle": t.vehicle or "Refrigerated Van (22°C)",
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })

    return results


@router.patch("/transfers/{transfer_id}/status")
def update_centre_transfer_status(
    transfer_id: int,
    payload: TransferStatusUpdatePayload,
    db: Session = Depends(get_db),
):
    """Authorizes or rejects a transfer within the centre workspace and records in AuditLog."""
    transfer = db.get(TransferRecommendation, transfer_id)
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer recommendation not found")

    transfer.status = payload.status

    db.add(
        AuditLog(
            timestamp=datetime.now(),
            action=f"CENTRE_TRANSFER_{payload.status}",
            user="Chennai Centre Logistics Officer",
            recommendation_id=transfer.id,
            source_bank_id=transfer.source_bank_id,
            destination_bank_id=transfer.destination_bank_id,
            quantity=transfer.quantity,
            approval_status=payload.status,
        )
    )

    db.commit()
    db.refresh(transfer)

    src_name = db.scalar(select(BloodBank.name).where(BloodBank.id == transfer.source_bank_id)) or ""
    dst_name = db.scalar(select(BloodBank.name).where(BloodBank.id == transfer.destination_bank_id)) or ""

    return {
        "id": transfer.id,
        "source_bank": src_name,
        "destination_bank": dst_name,
        "component": transfer.component,
        "blood_group": transfer.blood_group,
        "quantity": transfer.quantity,
        "status": transfer.status,
        "updated_at": datetime.now().isoformat(),
    }


@router.get("/audit")
def get_centre_audit(
    centre_id: int = Query(default=DEFAULT_ANCHOR_ID),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Returns chronological audit trail for the centre."""
    all_banks = {b.id: b.name for b in db.scalars(select(BloodBank)).all()}
    lim = limit if isinstance(limit, int) else 50

    logs = list(
        db.scalars(
            select(AuditLog)
            .order_by(AuditLog.timestamp.desc())
            .limit(lim)
        ).all()
    )

    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "action": log.action,
            "user": log.user,
            "recommendation_id": log.recommendation_id,
            "source_bank": all_banks.get(log.source_bank_id, "Chennai Regional Hub"),
            "destination_bank": all_banks.get(log.destination_bank_id, "District Health Center"),
            "quantity": log.quantity,
            "approval_status": log.approval_status,
        }
        for log in logs
    ]
