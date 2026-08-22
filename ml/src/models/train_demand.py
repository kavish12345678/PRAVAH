import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from src.features.build_features import get_demand_dataset

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

def compute_metrics(y_true, y_pred, model_name="Model"):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    non_zero = y_true > 0
    if np.any(non_zero):
        mape = np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100.0
    else:
        mape = 0.0

    return {
        "model": model_name,
        "MAE": round(float(mae), 4),
        "RMSE": round(float(rmse), 4),
        "R2": round(float(r2), 4),
        "MAPE_pct": round(float(mape), 2)
    }

def train_demand_models():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print(">>> Loading and engineering Demand Forecasting dataset...")
    data = get_demand_dataset(split_date="2026-09-13")
    X_train, X_val = data["X_train"], data["X_val"]
    y_train_24h, y_val_24h = data["y_train_24h"], data["y_val_24h"]
    y_train_72h, y_val_72h = data["y_train_72h"], data["y_val_72h"]
    features = data["feature_names"]

    print(f"Training samples: {len(X_train):,}, Validation samples: {len(X_val):,}")

    # 1. Baseline Evaluation: Historical average / last observed
    baseline_pred_24h = X_val["platelet_requests"]
    baseline_metrics_24h = compute_metrics(y_val_24h, baseline_pred_24h, "Baseline (Last Requests)")
    print(f"Baseline 24h: {baseline_metrics_24h}")

    # 2. Train 24h Model (HistGradientBoosting)
    print(">>> Training HistGradientBoostingRegressor for Demand Next 24h...")
    model_24h = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    model_24h.fit(X_train, y_train_24h)
    pred_val_24h = model_24h.predict(X_val)
    metrics_24h = compute_metrics(y_val_24h, pred_val_24h, "HistGradientBoosting (24h)")
    print(f"24h Model Validation Metrics: {metrics_24h}")

    # 3. Train 72h Model (HistGradientBoosting)
    print(">>> Training HistGradientBoostingRegressor for Demand Next 72h...")
    model_72h = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    model_72h.fit(X_train, y_train_72h)
    pred_val_72h = model_72h.predict(X_val)
    metrics_72h = compute_metrics(y_val_72h, pred_val_72h, "HistGradientBoosting (72h)")
    print(f"72h Model Validation Metrics: {metrics_72h}")

    # Save models
    path_24h = os.path.join(MODELS_DIR, "demand_forecast_model_24h.joblib")
    path_72h = os.path.join(MODELS_DIR, "demand_forecast_model_72h.joblib")
    joblib.dump({"model": model_24h, "features": features}, path_24h)
    joblib.dump({"model": model_72h, "features": features}, path_72h)
    print(f"Saved models to {path_24h} and {path_72h}")

    return {
        "metrics_24h": metrics_24h,
        "metrics_72h": metrics_72h,
        "baseline_metrics_24h": baseline_metrics_24h,
        "features": features
    }

if __name__ == "__main__":
    train_demand_models()
