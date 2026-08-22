"""PRAVAH Machine Learning Service Layer.

Provides unified inference interfaces for:
1. Demand Forecasting (24h & 72h HistGradientBoostingRegressor)
2. Expiry & Wastage Risk (HistGradientBoostingRegressor + Classifier)
3. Cold-Chain & Equipment Anomaly Detection (Isolation Forest + Hybrid Rule Engine)
4. Event-Driven Dynamic Re-scoring
5. Linear Programming / Greedy Transfer Optimization
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Base path resolution
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Locate model artifacts with fallbacks
POSSIBLE_MODEL_DIRS = [
    PROJECT_ROOT / "ml" / "models",
    PROJECT_ROOT / "sih datacollection 2" / "models",
    BACKEND_DIR / "ml" / "models",
]

MODEL_DIR = next((d for d in POSSIBLE_MODEL_DIRS if d.exists()), PROJECT_ROOT / "ml" / "models")

DATA_DIR = next(
    (
        d
        for d in [
            PROJECT_ROOT / "data" / "processed",
            PROJECT_ROOT / "sih datacollection 2" / "data" / "processed",
        ]
        if d.exists()
    ),
    PROJECT_ROOT / "data" / "processed",
)


class DemandForecastModelService:
    """Wrapper for 24h & 72h Demand Forecasting GBDT models."""

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.path_24h = model_dir / "demand_forecast_model_24h.joblib"
        self.path_72h = model_dir / "demand_forecast_model_72h.joblib"
        self.artifact_24h = None
        self.artifact_72h = None
        self.feature_cols: list[str] = []
        self._load()

    def _load(self) -> None:
        if self.path_24h.exists():
            self.artifact_24h = joblib.load(self.path_24h)
            self.feature_cols = self.artifact_24h.get("features", [])
        if self.path_72h.exists():
            self.artifact_72h = joblib.load(self.path_72h)

    def predict_horizons(
        self,
        current_stock: int,
        expiring_48h: int,
        platelet_requests: int,
        platelet_issued: int,
        unfulfilled_requests: int = 0,
        emergency_requests: int = 0,
        routine_requests: int = 0,
        platelet_transfused: int = 0,
        platelet_returned: int = 0,
        district_bank_count: int = 5,
        state_bank_count: int = 40,
        capacity_proxy: float = 1.0,
        dengue_monsoon_multiplier: float = 1.0,
        facility_demand_multiplier: float = 1.0,
        discard_target: float = 0.15,
        tier_code: int = 1,
    ) -> tuple[int, int]:
        """Predict 24-hour and 72-hour demand given engineered features."""
        features_dict = {
            "tier_code": tier_code,
            "current_stock": current_stock,
            "expiring_48h": expiring_48h,
            "platelet_requests": platelet_requests,
            "platelet_issued": platelet_issued,
            "unfulfilled_requests": unfulfilled_requests,
            "emergency_requests": emergency_requests,
            "routine_requests": routine_requests,
            "platelet_transfused": platelet_transfused,
            "platelet_returned": platelet_returned,
            "district_bank_count": district_bank_count,
            "state_bank_count": state_bank_count,
            "capacity_proxy": capacity_proxy,
            "dengue_monsoon_multiplier": dengue_monsoon_multiplier,
            "facility_demand_multiplier": facility_demand_multiplier,
            "discard_target": discard_target,
        }

        if self.artifact_24h is None or self.artifact_72h is None:
            # Baseline fallback
            pred_24 = max(1, int(platelet_requests * facility_demand_multiplier * dengue_monsoon_multiplier))
            pred_72 = int(pred_24 * 2.8)
            return pred_24, pred_72

        X = pd.DataFrame([features_dict])[self.feature_cols]
        pred_24 = int(np.maximum(0, np.round(self.artifact_24h["model"].predict(X)[0])))
        pred_72 = int(np.maximum(0, np.round(self.artifact_72h["model"].predict(X)[0])))
        return pred_24, pred_72

    def predict_horizons_batch(self, df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
        """Batch compute 24h and 72h demand forecasts in vectorized calls."""
        if self.artifact_24h is not None and not df.empty:
            X = df[self.feature_cols].fillna(0)
            p24 = np.maximum(1, np.round(self.artifact_24h["model"].predict(X)).astype(int))
            p72 = (
                np.maximum(p24, np.round(self.artifact_72h["model"].predict(X)).astype(int))
                if self.artifact_72h is not None
                else np.round(p24 * 2.8).astype(int)
            )
            return p24, p72
        return np.full(len(df), 10), np.full(len(df), 25)

    def predict_from_contract_payload(
        self,
        bank_id: str | int,
        component: str,
        blood_group: str,
        historical_usage: list[int | float],
        current_inventory: int,
    ) -> dict[str, Any]:
        """Supports API contract: POST /ml/demand-forecast/predict."""
        avg_usage = float(np.mean(historical_usage)) if historical_usage else 10.0
        last_req = int(historical_usage[-1]) if historical_usage else 10

        pred_24, pred_72 = self.predict_horizons(
            current_stock=current_inventory,
            expiring_48h=max(0, int(current_inventory * 0.2)),
            platelet_requests=last_req,
            platelet_issued=int(avg_usage),
            unfulfilled_requests=0,
            routine_requests=int(avg_usage * 0.8),
            emergency_requests=int(avg_usage * 0.2),
            platelet_transfused=int(avg_usage * 0.9),
        )

        pred_7day = int(pred_72 * 2.1)

        return {
            "bank_id": str(bank_id),
            "component": component,
            "blood_group": blood_group,
            "forecast": {
                "1_day": pred_24,
                "3_day": pred_72,
                "7_day": pred_7day,
            },
            "model_version": "demand-gbdt-v1",
        }


class ExpiryRiskModelService:
    """Wrapper for Expiry & Wastage Risk Model Family."""

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.path_model = model_dir / "expiry_risk_model.joblib"
        self.artifact = None
        self.prob_model = None
        self.classifier_model = None
        self.feature_cols: list[str] = []
        self._load()

    def _load(self) -> None:
        if self.path_model.exists():
            self.artifact = joblib.load(self.path_model)
            self.prob_model = self.artifact.get("prob_model")
            self.classifier_model = self.artifact.get("classifier_model")
            self.feature_cols = self.artifact.get("features", [])

    def score_unit(
        self,
        platelet_type: str = "RDP",
        facility_tier: str = "district_center",
        status: str = "OK",
        represented_units: int = 1,
        age_hours: float = 48.0,
        remaining_shelf_life_hours: float = 72.0,
        current_stock: int = 20,
        expiring_48h: int = 4,
        demand_next_24h: int = 8,
        demand_next_72h: int = 22,
        stockout_risk_score: float = 0.4,
        wastage_risk_score: float = 0.3,
        cumulative_excursion_minutes: float = 0.0,
        max_temperature_exposure: float = 22.0,
        agitation_off_minutes: float = 0.0,
        health_score: float = 95.0,
        issue_probability: float = 0.7,
    ) -> dict[str, Any]:
        """Compute full risk scoring and explainability factors."""
        type_mapping = {"RDP": 0, "SDP": 1, "Platelet Concentrate": 2, "PLATELETS": 0, "Packed RBC": 0, "Whole Blood": 0, "Plasma": 0}
        tier_mapping = {"peripheral_center": 0, "district_center": 1, "urban_referral": 2, "metro_tertiary_hub": 3}
        status_mapping = {"OK": 0, "WARNING": 1, "CRITICAL": 2, "AVAILABLE": 0, "LOW": 1, "NEAR_EXPIRY": 2}

        features_dict = {
            "platelet_type_code": type_mapping.get(platelet_type, 0),
            "tier_code": tier_mapping.get(facility_tier, 1),
            "status_code": status_mapping.get(status, 0),
            "represented_units": represented_units,
            "age_hours": age_hours,
            "remaining_shelf_life_hours": remaining_shelf_life_hours,
            "current_stock": current_stock,
            "expiring_48h": expiring_48h,
            "demand_next_24h": demand_next_24h,
            "demand_next_72h": demand_next_72h,
            "stockout_risk_score": stockout_risk_score,
            "wastage_risk_score": wastage_risk_score,
            "cumulative_excursion_minutes": cumulative_excursion_minutes,
            "max_temperature_exposure": max_temperature_exposure,
            "agitation_off_minutes": agitation_off_minutes,
            "health_score": health_score,
            "issue_probability": issue_probability,
        }

        contributing_features: list[str] = []
        if remaining_shelf_life_hours <= 48:
            contributing_features.append(f"Low remaining shelf life ({remaining_shelf_life_hours:.1f}h)")
        if cumulative_excursion_minutes > 0 or max_temperature_exposure > 24.0 or max_temperature_exposure < 20.0:
            contributing_features.append(f"Cold chain stress (max {max_temperature_exposure:.1f}°C, {cumulative_excursion_minutes:.0f}m)")
        if agitation_off_minutes > 0:
            contributing_features.append(f"Agitation interruption ({agitation_off_minutes:.0f}m)")
        if current_stock > demand_next_72h:
            contributing_features.append("Local inventory exceeds projected demand")
        if health_score < 70.0:
            contributing_features.append(f"Degraded equipment health ({health_score:.1f}%)")

        if not contributing_features:
            contributing_features.append("Standard shelf-life aging")

        if self.prob_model is not None:
            X = pd.DataFrame([features_dict])[self.feature_cols]
            prob = float(np.clip(self.prob_model.predict(X)[0], 0.0, 1.0))
            binary_prob = (
                float(self.classifier_model.predict_proba(X)[0][1])
                if self.classifier_model is not None
                else prob
            )
        else:
            # Baseline calculation
            prob = max(0.0, min(1.0, (120.0 - remaining_shelf_life_hours) / 120.0 + (0.3 if cumulative_excursion_minutes > 0 else 0)))
            binary_prob = prob

        # Degradation score
        degradation_score = min(
            1.0,
            (cumulative_excursion_minutes / 120.0) * 0.5
            + (agitation_off_minutes / 60.0) * 0.3
            + max(0.0, (100.0 - health_score) / 100.0) * 0.2,
        )

        risk_level = "HIGH" if prob >= 0.65 else ("MEDIUM" if prob >= 0.35 else "LOW")

        recommendation = (
            "CRITICAL: Expedite immediate local transfusion or priority dispatch"
            if prob >= 0.65
            else ("WARNING: Mark for prioritized issue in next 12 hours" if prob >= 0.35 else "MONITOR: Stock healthy")
        )

        return {
            "risk_score": round(prob, 4),
            "binary_risk_probability": round(binary_prob, 4),
            "risk_level": risk_level,
            "degradation_risk_score": round(degradation_score, 4),
            "contributing_features": contributing_features,
            "recommendation": recommendation,
            "model_version": "expiry-risk-gbdt-v1",
        }

    def score_batch(self, features_df: pd.DataFrame) -> np.ndarray:
        """Batch score 5,000+ units in a single vectorized GBDT model call."""
        if self.prob_model is not None and not features_df.empty:
            X = features_df[self.feature_cols].fillna(0)
            preds = self.prob_model.predict(X)
            return np.clip(preds, 0.01, 0.999)
        return np.full(len(features_df), 0.5)

    def predict_from_contract_payload(
        self,
        inventory_id: str | int,
        bank_id: str | int,
        component: str,
        blood_group: str,
        days_to_expiry: float,
        current_inventory: int,
        historical_utilization: float,
        projected_demand: float,
        temperature_stress: float = 0.0,
        agitation_status: int = 1,
        equipment_health: float = 0.95,
    ) -> dict[str, Any]:
        """Supports API contract: POST /ml/expiry-risk/predict."""
        remaining_hours = max(0.0, days_to_expiry * 24.0)
        age_hours = max(0.0, 120.0 - remaining_hours)
        excursion_min = float(temperature_stress * 60.0)
        max_temp = 22.0 + (temperature_stress * 6.0)
        agitation_off = 30.0 if agitation_status == 0 else 0.0
        health_score_pct = equipment_health * 100.0

        res = self.score_unit(
            platelet_type=component,
            status="WARNING" if days_to_expiry <= 2 else "OK",
            represented_units=current_inventory,
            age_hours=age_hours,
            remaining_shelf_life_hours=remaining_hours,
            current_stock=current_inventory,
            expiring_48h=current_inventory if days_to_expiry <= 2 else 0,
            demand_next_24h=int(projected_demand),
            demand_next_72h=int(projected_demand * 2.5),
            cumulative_excursion_minutes=excursion_min,
            max_temperature_exposure=max_temp,
            agitation_off_minutes=agitation_off,
            health_score=health_score_pct,
            issue_probability=historical_utilization,
        )

        return {
            "inventory_id": str(inventory_id),
            "risk_score": res["risk_score"],
            "risk_level": res["risk_level"],
            "contributing_features": res["contributing_features"],
            "model_version": res["model_version"],
        }


class ColdChainAnomalyModelService:
    """Wrapper for Isolation Forest Cold-Chain & Equipment Anomaly Detector."""

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.path_model = model_dir / "cold_chain_anomaly_model.joblib"
        self.artifact = None
        self.model = None
        self.feature_cols: list[str] = []
        self._load()

    def _load(self) -> None:
        if self.path_model.exists():
            self.artifact = joblib.load(self.path_model)
            self.model = self.artifact.get("model")
            self.feature_cols = self.artifact.get("feature_cols", [])

    def score_telemetry_waveform(
        self,
        temperatures: list[float],
        agitation_status: bool | int = True,
        excursion_duration: int = 0,
        excursion_frequency: int = 0,
    ) -> dict[str, Any]:
        """Detect anomalies from temperature sequence and agitation status."""
        if not temperatures:
            return {"anomaly_score": 0.0, "status": "NORMAL", "model_version": "equipment-isoforest-v1"}

        temp_arr = np.array(temperatures)
        curr_temp = float(temp_arr[-1])
        temp_deviation = abs(curr_temp - 22.0)
        temp_mean = float(np.mean(temp_arr))
        temp_std = float(np.std(temp_arr)) if len(temp_arr) > 1 else 0.0
        temp_max = float(np.max(temp_arr))
        temp_min = float(np.min(temp_arr))
        temp_diff = float(temp_arr[-1] - temp_arr[-2]) if len(temp_arr) > 1 else 0.0
        agitation_off = 1 if (agitation_status is False or agitation_status == 0) else 0

        # Hard Clinical Bounds Check
        rule_violation = (curr_temp < 20.0) or (curr_temp > 24.0) or (agitation_off == 1)

        anomaly_score = 0.1
        is_anomaly = rule_violation or (excursion_duration >= 30)

        if self.model is not None:
            features_dict = {
                "temperature": curr_temp,
                "temp_deviation_22c": temp_deviation,
                "temp_rolling_mean_15m": temp_mean,
                "temp_rolling_std_15m": temp_std,
                "temp_rolling_max_15m": temp_max,
                "temp_rolling_min_15m": temp_min,
                "temp_diff_1m": temp_diff,
                "agitation_off": agitation_off,
            }
            X = pd.DataFrame([features_dict])[self.feature_cols]
            decision = float(self.model.decision_function(X)[0])
            ml_anomaly = (self.model.predict(X)[0] == -1) or (decision < 0.0)

            if rule_violation:
                anomaly_score = 1.0
                is_anomaly = True
            elif ml_anomaly:
                anomaly_score = float(np.clip(0.65 + abs(decision) * 2.0, 0.65, 1.0))
                is_anomaly = True
            else:
                anomaly_score = float(np.clip(0.20 - decision * 0.5, 0.05, 0.40))
                is_anomaly = False
        else:
            anomaly_score = 1.0 if rule_violation else 0.1
            is_anomaly = rule_violation

        return {
            "anomaly_score": round(anomaly_score, 4),
            "status": "ANOMALY" if is_anomaly else "NORMAL",
            "rule_violation": rule_violation,
            "model_version": "equipment-isoforest-v1",
        }

    def predict_from_contract_payload(
        self,
        equipment_id: str,
        bank_id: str,
        telemetry: dict[str, Any],
    ) -> dict[str, Any]:
        """Supports API contract: POST /ml/equipment-anomaly/predict."""
        temps = telemetry.get("temperature", [22.0])
        dur = telemetry.get("excursion_duration", 0)
        freq = telemetry.get("excursion_frequency", 0)
        res = self.score_telemetry_waveform(temps, excursion_duration=dur, excursion_frequency=freq)

        return {
            "equipment_id": equipment_id,
            "anomaly_score": res["anomaly_score"],
            "status": res["status"],
            "model_version": res["model_version"],
        }


class OptimizationService:
    """Linear Programming (LP) and Greedy Matching Redistribution Solver."""

    @staticmethod
    def solve_network_flow(
        donors: dict[int | str, int],
        recipients: dict[int | str, int],
        transport_edges: list[dict[str, Any]],
        max_travel_hours: float = 5.0,
    ) -> list[dict[str, Any]]:
        """
        Solves LP min-cost network flow:
        Minimizes transport cost while satisfying surplus bounds and shortage bounds.
        """
        from scipy.optimize import linprog

        if not donors or not recipients or not transport_edges:
            return []

        candidate_edges = [
            e for e in transport_edges
            if e["source_bank"] in donors
            and e["destination_bank"] in recipients
            and (e.get("travel_time_min", 0) / 60.0) <= max_travel_hours
        ]

        if not candidate_edges:
            return []

        num_edges = len(candidate_edges)
        costs = []
        capacities = []
        for e in candidate_edges:
            dist = e.get("distance_km", 20.0)
            tt = e.get("travel_time_min", 30)
            c = (0.05 * dist) + (0.02 * tt) - 80.0  # high priority value of saving expiring platelet unit
            costs.append(c)
            capacities.append(e.get("capacity", 50))

        c = np.array(costs)
        bounds = [(0, cap) for cap in capacities]

        unique_donors = list({e["source_bank"] for e in candidate_edges})
        unique_recipients = list({e["destination_bank"] for e in candidate_edges})

        A_ub = []
        b_ub = []

        # Donor supply upper bounds
        for donor_id in unique_donors:
            row = [1.0 if candidate_edges[i]["source_bank"] == donor_id else 0.0 for i in range(num_edges)]
            A_ub.append(row)
            b_ub.append(donors[donor_id])

        # Recipient demand upper bounds
        for rec_id in unique_recipients:
            row = [1.0 if candidate_edges[i]["destination_bank"] == rec_id else 0.0 for i in range(num_edges)]
            A_ub.append(row)
            b_ub.append(recipients[rec_id])

        A_ub = np.array(A_ub)
        b_ub = np.array(b_ub)

        res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

        recommendations = []
        if res.success:
            flow_values = np.round(res.x).astype(int)
            for idx, flow in enumerate(flow_values):
                if flow > 0:
                    edge = candidate_edges[idx]
                    recommendations.append({
                        "source_bank": edge["source_bank"],
                        "destination_bank": edge["destination_bank"],
                        "component": edge.get("component", "Platelets"),
                        "blood_group": edge.get("blood_group", "O+"),
                        "quantity": int(flow),
                        "distance_km": round(float(edge.get("distance_km", 0.0)), 2),
                        "travel_time_min": int(edge.get("travel_time_min", 0)),
                        "vehicle": edge.get("vehicle", "Refrigerated Van"),
                        "refrigerated": edge.get("refrigerated", True),
                        "solver": "LP-HiGHS",
                        "status": "PENDING",
                    })

        return recommendations

    @staticmethod
    def solve_greedy(
        donors: dict[int | str, int],
        recipients: dict[int | str, int],
        transport_edges: list[dict[str, Any]],
        max_travel_hours: float = 5.0,
    ) -> list[dict[str, Any]]:
        """Greedy nearest-feasible donor-recipient allocation fallback."""
        if not donors or not recipients or not transport_edges:
            return []

        donor_surplus = dict(donors)
        recipient_deficit = dict(recipients)
        sorted_edges = sorted(transport_edges, key=lambda e: e.get("travel_time_min", 999))

        recommendations = []
        for edge in sorted_edges:
            src = edge["source_bank"]
            dst = edge["destination_bank"]
            tt_hours = edge.get("travel_time_min", 0) / 60.0

            if tt_hours > max_travel_hours:
                continue

            avail = donor_surplus.get(src, 0)
            needed = recipient_deficit.get(dst, 0)
            if avail > 0 and needed > 0:
                units = min(avail, needed, int(edge.get("capacity", 50)))
                if units > 0:
                    donor_surplus[src] -= units
                    recipient_deficit[dst] -= units
                    recommendations.append({
                        "source_bank": src,
                        "destination_bank": dst,
                        "component": edge.get("component", "Platelets"),
                        "blood_group": edge.get("blood_group", "O+"),
                        "quantity": int(units),
                        "distance_km": round(float(edge.get("distance_km", 0.0)), 2),
                        "travel_time_min": int(edge.get("travel_time_min", 0)),
                        "vehicle": edge.get("vehicle", "Refrigerated Van"),
                        "refrigerated": edge.get("refrigerated", True),
                        "solver": "Greedy Feasible Allocation",
                        "status": "PENDING",
                    })

        return recommendations


# Singleton instance container
demand_service = DemandForecastModelService()
expiry_service = ExpiryRiskModelService()
anomaly_service = ColdChainAnomalyModelService()
optimization_service = OptimizationService()
