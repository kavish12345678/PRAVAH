import os
import joblib
import pandas as pd
import numpy as np
from src.features.build_features import get_expiry_risk_dataset
from src.optimization.greedy_transfer import run_greedy_redistribution

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

class PravahEventOrchestrator:
    """
    Event-driven orchestration layer.
    When a telemetry excursion or equipment alarm occurs, it:
      1. Identifies affected platelet units.
      2. Re-scores expiry and degradation risk in real-time.
      3. Computes risk deltas.
      4. Re-triggers optimization and emits an operational audit trail.
    """
    def __init__(self):
        self.expiry_artifact = joblib.load(os.path.join(MODELS_DIR, "expiry_risk_model.joblib"))
        self.features = self.expiry_artifact["features"]
        self.prob_model = self.expiry_artifact["prob_model"]

    def process_incident_event(self, bank_id, event_type="Temperature_Excursion", excursion_temp=26.8, duration_min=45):
        print(f"\n[EVENT TRIGGERED] Event: {event_type} at Bank ID {bank_id}")
        print(f"Details: Excursion to {excursion_temp}°C for {duration_min} minutes.")

        # Load unit features for target bank
        unit_df = pd.read_csv(os.path.join(DATA_DIR, "unit_expiry_risk_features.csv"))
        bank_units = unit_df[unit_df["bank_id"] == bank_id].copy()

        if bank_units.empty:
            print(f"No active inventory units found for bank {bank_id}.")
            return None

        # Take initial snapshot of units
        baseline_units = bank_units.head(5).copy()

        # Encode features
        type_mapping = {"RDP": 0, "SDP": 1, "Platelet Concentrate": 2}
        tier_mapping = {"peripheral_center": 0, "district_center": 1, "urban_referral": 2, "metro_tertiary_hub": 3}
        status_mapping = {"OK": 0, "WARNING": 1, "CRITICAL": 2}

        bank_units["platelet_type_code"] = bank_units["platelet_type"].map(type_mapping).fillna(0).astype(int)
        bank_units["tier_code"] = bank_units["facility_tier"].map(tier_mapping).fillna(1).astype(int)
        bank_units["status_code"] = bank_units["status"].map(status_mapping).fillna(0).astype(int)

        # Baseline predictions
        X_baseline = bank_units[self.features].fillna(0)
        old_probs = np.clip(self.prob_model.predict(X_baseline), 0.0, 1.0)

        # Apply Real-time Incident Stress
        bank_units["cumulative_excursion_minutes"] += duration_min
        bank_units["max_temperature_exposure"] = np.maximum(bank_units["max_temperature_exposure"], excursion_temp)
        bank_units["health_score"] = np.maximum(10.0, bank_units["health_score"] - 35.0)
        bank_units["status_code"] = 2 # CRITICAL

        # Re-score after stress
        X_stressed = bank_units[self.features].fillna(0)
        new_probs = np.clip(self.prob_model.predict(X_stressed), 0.0, 1.0)

        audit_log = []
        for i, (_, row) in enumerate(bank_units.head(5).iterrows()):
            old_p = old_probs[i]
            new_p = new_probs[i]
            delta = new_p - old_p

            if new_p > 0.60:
                rec_action = "CRITICAL: Expedite immediate local transfusion or priority dispatch"
            elif new_p > 0.30:
                rec_action = "WARNING: Mark for prioritized issue in next 12 hours"
            else:
                rec_action = "MONITOR: Cold-chain stress absorbed; maintain routine issue"

            audit_log.append({
                "unit_id": row["unit_id"],
                "bank_id": bank_id,
                "platelet_type": row["platelet_type"],
                "remaining_shelf_life_hours": row["remaining_shelf_life_hours"],
                "old_risk_probability": round(float(old_p), 4),
                "new_risk_probability": round(float(new_p), 4),
                "risk_delta": round(float(delta), 4),
                "action_recommended": rec_action
            })

        df_audit = pd.DataFrame(audit_log)
        print("\n--- Dynamic Re-Scoring Audit Output ---")
        print(df_audit.to_string(index=False))

        audit_path = os.path.join(REPORTS_DIR, f"event_rescore_audit_bank_{bank_id}.csv")
        df_audit.to_csv(audit_path, index=False)
        print(f"\nSaved event audit trail to {audit_path}")
        return df_audit

def simulate_demo_event():
    orchestrator = PravahEventOrchestrator()
    # Pick a high-capacity bank (e.g. 280695)
    return orchestrator.process_incident_event(
        bank_id=280695,
        event_type="Thermal Excursion & Agitation Interruption",
        excursion_temp=27.4,
        duration_min=60
    )

if __name__ == "__main__":
    simulate_demo_event()
