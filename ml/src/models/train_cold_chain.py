import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
from src.features.build_features import get_cold_chain_telemetry

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

def engineer_telemetry_features(df):
    """
    Computes rolling temperature statistics and agitation state features per bank.
    """
    df = df.sort_values(["bank_id", "timestamp"]).copy()
    
    # Rolling features over 15-minute windows
    df["temp_rolling_mean_15m"] = df.groupby("bank_id")["temperature"].transform(lambda x: x.rolling(15, min_periods=1).mean())
    df["temp_rolling_std_15m"] = df.groupby("bank_id")["temperature"].transform(lambda x: x.rolling(15, min_periods=1).std()).fillna(0)
    df["temp_rolling_max_15m"] = df.groupby("bank_id")["temperature"].transform(lambda x: x.rolling(15, min_periods=1).max())
    df["temp_rolling_min_15m"] = df.groupby("bank_id")["temperature"].transform(lambda x: x.rolling(15, min_periods=1).min())
    
    # Deviation from nominal 22.0 C setpoint
    df["temp_deviation_22c"] = np.abs(df["temperature"] - 22.0)
    
    # Temperature rate of change (derivative)
    df["temp_diff_1m"] = df.groupby("bank_id")["temperature"].diff().fillna(0)
    
    # Agitation flag (1 = ON, 0 = OFF)
    df["agitation_off"] = (df["agitation_status"] != "ON").astype(int)

    feature_cols = [
        "temperature",
        "temp_deviation_22c",
        "temp_rolling_mean_15m",
        "temp_rolling_std_15m",
        "temp_rolling_max_15m",
        "temp_rolling_min_15m",
        "temp_diff_1m",
        "agitation_off"
    ]
    return df, feature_cols

def train_cold_chain_anomaly_detector():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    print(">>> Loading Cold-Chain telemetry records...")
    df_raw = get_cold_chain_telemetry()
    print(f"Loaded {len(df_raw):,} minute telemetry readings.")

    df, feature_cols = engineer_telemetry_features(df_raw)
    
    # Target ground truth excursion flag (from physics/rules simulator)
    y_true = df["excursion_flag"].astype(int)
    X = df[feature_cols]

    # Split into normal baseline training set and evaluation set
    # Anomaly models learn normal operating patterns
    normal_mask = y_true == 0
    X_normal = X[normal_mask]

    print(">>> Training Isolation Forest on nominal cold-chain telemetry...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )
    # Fit on normal telemetry
    sample_train = X_normal.sample(n=min(50000, len(X_normal)), random_state=42)
    iso_forest.fit(sample_train)

    # Anomaly scores (-1 is anomaly, 1 is normal)
    raw_scores = iso_forest.score_samples(X)
    # Convert to 0..1 anomaly probability where higher means more anomalous
    anomaly_scores = -raw_scores
    anomaly_scores = (anomaly_scores - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min() + 1e-6)

    # Hybrid Detector: ML Anomaly Score OR Hard Clinical Violation (<20C or >24C or Agitation OFF)
    rule_violation = (df["temperature"] < 20.0) | (df["temperature"] > 24.0) | (df["agitation_off"] == 1)
    combined_pred = ((anomaly_scores > 0.65) | rule_violation).astype(int)

    precision = precision_score(y_true, combined_pred, zero_division=0)
    recall = recall_score(y_true, combined_pred, zero_division=0)
    f1 = f1_score(y_true, combined_pred, zero_division=0)
    roc_auc = roc_auc_score(y_true, anomaly_scores)

    metrics = {
        "ML_Anomaly_ROC_AUC": round(float(roc_auc), 4),
        "Hybrid_Precision": round(float(precision), 4),
        "Hybrid_Recall": round(float(recall), 4),
        "Hybrid_F1": round(float(f1), 4),
        "Total_Excursions_Detected": int(combined_pred.sum()),
        "Ground_Truth_Excursions": int(y_true.sum())
    }
    print(f"Cold-Chain Anomaly Detector Metrics: {metrics}")

    # Save model artifact
    path_model = os.path.join(MODELS_DIR, "cold_chain_anomaly_model.joblib")
    joblib.dump({
        "model": iso_forest,
        "feature_cols": feature_cols
    }, path_model)
    print(f"Saved cold chain anomaly detector to {path_model}")

    return {
        "metrics": metrics,
        "feature_cols": feature_cols
    }

if __name__ == "__main__":
    train_cold_chain_anomaly_detector()
