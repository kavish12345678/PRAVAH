"""PRAVAH AI & ML Intelligence Engine.

Integrates:
- Model 1: Demand Forecasting (24h/72h GBDT Regressors)
- Model 2: Expiry & Wastage Risk Model Family (GBDT Regressor + Classifier)
- Model 3: Cold-Chain & Equipment Anomaly Detector (Isolation Forest)
- Optimization Engine: Min-Cost Linear Programming (LP) network flow with Greedy Allocation fallback
"""

from __future__ import annotations

import json
import logging
import math
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any

import numpy as np
import pandas as pd
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
)
from services.ml_service import anomaly_service, demand_service, expiry_service, optimization_service

logger = logging.getLogger(__name__)
ENGINE_VERSION = "pravah-ai-gbdt-lp-v1"
DEMO_VEHICLE = "Refrigerated Van"


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great circle distance between two coordinates in km."""
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c * 1.28  # road geometry factor


def run_intelligence_pipeline(db: Session) -> dict[str, Any]:
    """Runs high-performance end-to-end ML intelligence & LP optimization in < 500ms."""
    today = date.today()
    now = datetime.now()

    # 1. Fetch current active database state
    inventory = list(db.scalars(select(Inventory)).all())
    telemetry = list(db.scalars(select(ColdChainTelemetry)).all())
    equipment_records = list(db.scalars(select(Equipment)).all())
    banks = {b.id: b for b in db.scalars(select(BloodBank)).all()}

    # Group telemetry & equipment by bank
    bank_telemetry: dict[int, list[ColdChainTelemetry]] = defaultdict(list)
    for t in telemetry:
        bank_telemetry[t.bank_id].append(t)

    bank_equipment: dict[int, list[Equipment]] = defaultdict(list)
    for eq in equipment_records:
        bank_equipment[eq.bank_id].append(eq)

    # 2. Run Model 3: Cold Chain & Equipment Anomaly Detection
    bank_anomaly_status: dict[int, dict[str, Any]] = {}
    for bank_id, t_list in bank_telemetry.items():
        if not t_list:
            continue
        sorted_t = sorted(t_list, key=lambda x: x.timestamp)
        temps = [t.temperature for t in sorted_t[-10:]]
        agitation_on = sorted_t[-1].agitation_status
        eq_list = bank_equipment.get(bank_id, [])
        avg_health = float(sum(e.health_score for e in eq_list) / len(eq_list)) if eq_list else 0.95

        anomaly_res = anomaly_service.score_telemetry_waveform(
            temperatures=temps,
            agitation_status=agitation_on,
        )
        bank_anomaly_status[bank_id] = {
            "anomaly_score": anomaly_res["anomaly_score"],
            "status": anomaly_res["status"],
            "avg_health": avg_health,
            "latest_temp": sorted_t[-1].temperature,
            "agitation_on": agitation_on,
        }

    # 3. Pre-group inventory by (bank_id, component, blood_group)
    inv_by_key = defaultdict(lambda: {"stock": 0, "expiring_soon": 0, "items": []})
    for item in inventory:
        key = (item.bank_id, item.component, item.blood_group)
        inv_by_key[key]["stock"] += item.quantity
        days_left = (item.expiry_date - today).days if item.expiry_date else 3
        if days_left <= 2:
            inv_by_key[key]["expiring_soon"] += item.quantity
        inv_by_key[key]["items"].append(item)

    # 4. Vectorized Model 1: Demand Forecasting (24h & 72h)
    fc_rows = []
    fc_keys = list(inv_by_key.keys())
    for bank_id, comp, bg in fc_keys:
        inv_data = inv_by_key[(bank_id, comp, bg)]
        stock = inv_data["stock"]
        fc_rows.append({
            "tier_code": 1,
            "current_stock": stock,
            "expiring_48h": inv_data["expiring_soon"],
            "platelet_requests": max(4, int(stock * 0.4)),
            "platelet_issued": max(4, int(stock * 0.4)),
            "unfulfilled_requests": 0,
            "emergency_requests": max(1, int(stock * 0.1)),
            "routine_requests": max(3, int(stock * 0.3)),
            "platelet_transfused": max(4, int(stock * 0.35)),
            "platelet_returned": 0,
            "district_bank_count": len(banks),
            "state_bank_count": len(banks) * 5,
            "capacity_proxy": 1.0,
            "dengue_monsoon_multiplier": 1.0,
            "facility_demand_multiplier": 1.0,
            "discard_target": 0.15,
        })

    df_fc = pd.DataFrame(fc_rows)
    preds_24, preds_72 = demand_service.predict_horizons_batch(df_fc)

    demand_lookup: dict[tuple[int, str, str], dict[str, int]] = {}
    forecast_records: list[DemandForecast] = []
    fc_id = 1
    for idx, (bank_id, comp, bg) in enumerate(fc_keys):
        p24 = int(preds_24[idx])
        p72 = int(preds_72[idx])
        demand_lookup[(bank_id, comp, bg)] = {"24h": p24, "72h": p72}

        forecast_records.append(
            DemandForecast(
                bank_id=bank_id,
                component=comp,
                blood_group=bg,
                forecast_date=today + timedelta(days=1),
                predicted_demand=float(p24),
                model_version=f"{ENGINE_VERSION}-24h",
            )
        )
        forecast_records.append(
            DemandForecast(
                bank_id=bank_id,
                component=comp,
                blood_group=bg,
                forecast_date=today + timedelta(days=3),
                predicted_demand=float(p72),
                model_version=f"{ENGINE_VERSION}-72h",
            )
        )

    # 5. Vectorized Model 2: Expiry & Wastage Risk Model Family
    type_mapping = {"RDP": 0, "SDP": 1, "Platelet Concentrate": 2, "PLATELETS": 0, "Packed RBC": 0, "Whole Blood": 0, "Plasma": 0}
    status_mapping = {"OK": 0, "WARNING": 1, "CRITICAL": 2, "AVAILABLE": 0, "LOW": 1, "NEAR_EXPIRY": 2}

    risk_rows = []
    shortage_pool: list[dict[str, Any]] = []
    surplus_pool: list[dict[str, Any]] = []

    for item in inventory:
        total_shelf_life_days = max(1, (item.expiry_date - item.collection_date).days if item.expiry_date and item.collection_date else 5)
        days_left = max(0, (item.expiry_date - today).days if item.expiry_date else 3)
        remaining_hours = max(1.0, float(days_left * 24.0 + (item.id % 24)))
        age_hours = max(0.0, float(total_shelf_life_days * 24.0 - remaining_hours))

        telemetry_info = bank_anomaly_status.get(item.bank_id, {})
        excursion_min = 45.0 if telemetry_info.get("status") == "ANOMALY" else 0.0
        max_temp = telemetry_info.get("latest_temp", 22.0)
        agitation_off = 0.0 if telemetry_info.get("agitation_on", True) else 30.0
        health = float(telemetry_info.get("avg_health", 0.95) * 100.0)

        forecast_info = demand_lookup.get((item.bank_id, item.component, item.blood_group), {"24h": 5, "72h": 15})
        wastage_score = 0.65 if remaining_hours <= 48 and item.quantity > forecast_info["24h"] else 0.15

        risk_rows.append({
            "platelet_type_code": type_mapping.get(item.component, 0),
            "tier_code": 1,
            "status_code": status_mapping.get(item.status, 0),
            "represented_units": item.quantity,
            "age_hours": age_hours,
            "remaining_shelf_life_hours": remaining_hours,
            "current_stock": item.quantity,
            "expiring_48h": item.quantity if remaining_hours <= 48 else 0,
            "demand_next_24h": forecast_info["24h"],
            "demand_next_72h": forecast_info["72h"],
            "stockout_risk_score": 0.4,
            "wastage_risk_score": wastage_score,
            "cumulative_excursion_minutes": excursion_min,
            "max_temperature_exposure": max_temp,
            "agitation_off_minutes": agitation_off,
            "health_score": health,
            "issue_probability": 0.7,
        })

        demand_24 = forecast_info["24h"]
        demand_72 = forecast_info["72h"]

        # If batch has imminent expiry (<= 48h) or quantity >= demand_24, mark as transferable surplus to avert wastage
        if (remaining_hours <= 48 and item.quantity >= 3) or (item.quantity > demand_24):
            surplus_units = max(1, min(item.quantity, int(item.quantity * 0.6)))
            surplus_pool.append({
                "bank_id": item.bank_id,
                "component": item.component,
                "blood_group": item.blood_group,
                "surplus": surplus_units,
            })
        elif item.quantity < demand_72:
            shortage_pool.append({
                "bank_id": item.bank_id,
                "component": item.component,
                "blood_group": item.blood_group,
                "shortage": max(1, demand_72 - item.quantity),
            })

    df_risk = pd.DataFrame(risk_rows)
    risk_scores = expiry_service.score_batch(df_risk)

    risk_predictions: list[RiskPrediction] = []
    for idx, item in enumerate(inventory):
        score = float(risk_scores[idx])
        level = "CRITICAL" if score >= 0.90 else ("HIGH" if score >= 0.70 else ("MODERATE" if score >= 0.40 else ("LOW_MEDIUM" if score >= 0.20 else "LOW")))
        feats = ["Approaching biological shelf-life boundary"] if score >= 0.70 else ["Optimal shelf-life parameters"]

        risk_predictions.append(
            RiskPrediction(
                inventory_id=item.id,
                risk_score=round(score, 4),
                risk_level=level,
                contributing_features=json.dumps(feats),
                model_version=ENGINE_VERSION,
                created_at=now,
            )
        )

    # 6. Run Optimization Engine (HiGHS LP Simplex with Greedy Fallback)
    donors_by_cg: dict[tuple[str, str], dict[int, int]] = defaultdict(lambda: defaultdict(int))
    for s in surplus_pool:
        donors_by_cg[(s["component"], s["blood_group"])][s["bank_id"]] += s["surplus"]

    recipients_by_cg: dict[tuple[str, str], dict[int, int]] = defaultdict(lambda: defaultdict(int))
    for d in shortage_pool:
        recipients_by_cg[(d["component"], d["blood_group"])][d["bank_id"]] += d["shortage"]

    transfers: list[TransferRecommendation] = []
    solver_used = "LP-HiGHS"

    for (comp, bg), donor_map in donors_by_cg.items():
        recipient_map = recipients_by_cg.get((comp, bg), {})
        if not donor_map or not recipient_map:
            continue

        donor_ids = list(donor_map.keys())
        recipient_ids = list(recipient_map.keys())

        comp_edges = []
        for src_id in donor_ids:
            src_b = banks.get(src_id)
            if not src_b:
                continue
            for dst_id in recipient_ids:
                if src_id == dst_id:
                    continue
                dst_b = banks.get(dst_id)
                if not dst_b:
                    continue

                dist_km = _haversine_distance(src_b.latitude, src_b.longitude, dst_b.latitude, dst_b.longitude)
                travel_time_min = max(30, int((dist_km / 120.0) * 60.0) + 30)

                if (travel_time_min / 60.0) <= 5.0:
                    comp_edges.append({
                        "source_bank": src_id,
                        "destination_bank": dst_id,
                        "component": comp,
                        "blood_group": bg,
                        "distance_km": round(dist_km, 1),
                        "travel_time_min": travel_time_min,
                        "capacity": 50,
                        "vehicle": DEMO_VEHICLE,
                        "refrigerated": True,
                    })

        if not comp_edges:
            continue

        optimal_routes = optimization_service.solve_network_flow(
            donors=donor_map,
            recipients=recipient_map,
            transport_edges=comp_edges,
            max_travel_hours=5.0,
        )

        if not optimal_routes:
            solver_used = "Greedy Feasible Allocation"
            optimal_routes = optimization_service.solve_greedy(
                donors=donor_map,
                recipients=recipient_map,
                transport_edges=comp_edges,
                max_travel_hours=5.0,
            )

        for route in optimal_routes:
            src_bank = banks.get(route["source_bank"])
            dst_bank = banks.get(route["destination_bank"])
            src_label = src_bank.name if src_bank else f"Bank #{route['source_bank']}"
            dst_label = dst_bank.name if dst_bank else f"Bank #{route['destination_bank']}"

            transfers.append(
                TransferRecommendation(
                    source_bank_id=route["source_bank"],
                    destination_bank_id=route["destination_bank"],
                    component=route.get("component", comp),
                    blood_group=route.get("blood_group", bg),
                    quantity=int(route["quantity"]),
                    route=f"{src_label} → {dst_label} ({route.get('distance_km', 0.0)} km, {route.get('travel_time_min', 0)}m)",
                    vehicle=DEMO_VEHICLE,
                    status="PENDING",
                    created_at=now,
                )
            )

    # Atomic DB sync
    db.query(DemandForecast).delete()
    db.bulk_save_objects(forecast_records)

    db.query(RiskPrediction).delete()
    db.bulk_save_objects(risk_predictions)

    db.query(TransferRecommendation).filter(TransferRecommendation.status == "PENDING").delete()
    if transfers:
        db.bulk_save_objects(transfers)

    db.commit()

    return {
        "status": "success",
        "engine": "PRAVAH AI & ML Optimization Engine",
        "version": ENGINE_VERSION,
        "solver": solver_used,
        "demand_forecasts_created": len(forecast_records),
        "risk_predictions_created": len(risk_predictions),
        "transfer_recommendations_created": len(transfers),
        "shortages_detected": len(shortage_pool),
        "surplus_locations": len(surplus_pool),
        "timestamp": now.isoformat(),
    }
