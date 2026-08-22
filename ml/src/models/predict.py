import os
import joblib
import numpy as np
import pandas as pd
from src.features.build_features import get_demand_dataset, get_expiry_risk_dataset

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

class PravahPredictor:
    def __init__(self):
        self.demand_24h_artifact = joblib.load(os.path.join(MODELS_DIR, "demand_forecast_model_24h.joblib"))
        self.demand_72h_artifact = joblib.load(os.path.join(MODELS_DIR, "demand_forecast_model_72h.joblib"))
        self.expiry_artifact = joblib.load(os.path.join(MODELS_DIR, "expiry_risk_model.joblib"))
        self.cold_chain_artifact = joblib.load(os.path.join(MODELS_DIR, "cold_chain_anomaly_model.joblib"))

    def forecast_demand(self, X):
        features = self.demand_24h_artifact["features"]
        X_mat = X[features] if isinstance(X, pd.DataFrame) else X
        pred_24h = np.maximum(0, np.round(self.demand_24h_artifact["model"].predict(X_mat)).astype(int))
        pred_72h = np.maximum(0, np.round(self.demand_72h_artifact["model"].predict(X_mat)).astype(int))
        return pred_24h, pred_72h

    def score_unit_risk(self, X):
        features = self.expiry_artifact["features"]
        X_mat = X[features] if isinstance(X, pd.DataFrame) else X
        prob = np.clip(self.expiry_artifact["prob_model"].predict(X_mat), 0.0, 1.0)
        bin_prob = self.expiry_artifact["classifier_model"].predict_proba(X_mat)[:, 1]
        return prob, bin_prob

def generate_sample_predictions():
    os.makedirs(REPORTS_DIR, exist_ok=True)
    predictor = PravahPredictor()

    # Load demand validation slice
    demand_data = get_demand_dataset()
    X_val = demand_data["X_val"]
    meta_val = demand_data["meta_val"]
    pred_24h, pred_72h = predictor.forecast_demand(X_val)

    df_out = meta_val.copy()
    df_out["predicted_demand_24h"] = pred_24h
    df_out["actual_demand_24h"] = demand_data["y_val_24h"].values
    df_out["predicted_demand_72h"] = pred_72h
    df_out["actual_demand_72h"] = demand_data["y_val_72h"].values

    sample_path = os.path.join(REPORTS_DIR, "sample_predictions.csv")
    df_out.head(100).to_csv(sample_path, index=False)
    print(f"Generated sample predictions report at {sample_path}")
    return df_out

if __name__ == "__main__":
    generate_sample_predictions()
