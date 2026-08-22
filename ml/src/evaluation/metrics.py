import os
import json
import pandas as pd
import numpy as np
from sklearn.inspection import permutation_importance
import joblib

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

def generate_evaluation_summary(all_metrics):
    """
    Saves metrics report to reports/model_metrics.json
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)
    metrics_path = os.path.join(REPORTS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"\n[REPORT] Saved full model metrics report to {metrics_path}")

def compute_feature_importances(expiry_data):
    """
    Computes permutation importance for the expiry risk model to explain key risk drivers.
    """
    print("\n>>> Computing Model 2 Feature Importances...")
    expiry_artifact = joblib.load(os.path.join(MODELS_DIR, "expiry_risk_model.joblib"))
    model = expiry_artifact["prob_model"]
    features = expiry_artifact["features"]

    X_val = expiry_data["X_val"].sample(n=min(5000, len(expiry_data["X_val"])), random_state=42)
    y_val = expiry_data["y_val_prob"].loc[X_val.index]

    perm = permutation_importance(model, X_val, y_val, n_repeats=5, random_state=42, scoring="neg_mean_absolute_error")
    
    importance_df = pd.DataFrame({
        "feature": features,
        "importance_mean": perm.importances_mean,
        "importance_std": perm.importances_std
    }).sort_values("importance_mean", ascending=False)

    imp_path = os.path.join(REPORTS_DIR, "feature_importance.csv")
    importance_df.to_csv(imp_path, index=False)
    print(f"[REPORT] Saved feature importance rankings to {imp_path}")
    print("\nTop 7 Risk Drivers:")
    print(importance_df.head(7).to_string(index=False))
    return importance_df

if __name__ == "__main__":
    from src.features.build_features import get_expiry_risk_dataset
    data = get_expiry_risk_dataset()
    compute_feature_importances(data)
