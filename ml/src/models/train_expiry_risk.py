import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    brier_score_loss,
    mean_absolute_error,
    mean_squared_error
)
from src.features.build_features import get_expiry_risk_dataset

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

def train_expiry_risk_models():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print(">>> Loading and engineering Unit Expiry Risk dataset...")
    data = get_expiry_risk_dataset(split_ratio=0.8)
    X_train, X_val = data["X_train"], data["X_val"]
    y_train_prob, y_val_prob = data["y_train_prob"], data["y_val_prob"]
    y_train_bin, y_val_bin = data["y_train_bin"], data["y_val_bin"]
    y_train_deg, y_val_deg = data["y_train_deg"], data["y_val_deg"]
    features = data["feature_names"]

    print(f"Unit Training samples: {len(X_train):,}, Validation samples: {len(X_val):,}")

    # 1. Train Probability Regressor
    print(">>> Training HistGradientBoostingRegressor for Expiry Risk Probability...")
    prob_model = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    prob_model.fit(X_train, y_train_prob)
    pred_val_prob = prob_model.predict(X_val)
    pred_val_prob = np.clip(pred_val_prob, 0.0, 1.0)

    prob_mae = mean_absolute_error(y_val_prob, pred_val_prob)
    prob_rmse = np.sqrt(mean_squared_error(y_val_prob, pred_val_prob))
    brier = brier_score_loss(y_val_bin, pred_val_prob)

    # 2. Train Binary Classification Model
    print(">>> Training HistGradientBoostingClassifier for Will-Expire-Unused Binary Label...")
    clf_model = HistGradientBoostingClassifier(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    clf_model.fit(X_train, y_train_bin)
    pred_val_bin_prob = clf_model.predict_proba(X_val)[:, 1]
    pred_val_bin_class = clf_model.predict(X_val)

    roc_auc = roc_auc_score(y_val_bin, pred_val_bin_prob)
    pr_auc = average_precision_score(y_val_bin, pred_val_bin_prob)
    f1 = f1_score(y_val_bin, pred_val_class := (pred_val_bin_prob >= 0.5).astype(int))
    precision = precision_score(y_val_bin, pred_val_class, zero_division=0)
    recall = recall_score(y_val_bin, pred_val_class, zero_division=0)

    metrics = {
        "expiry_prob_MAE": round(float(prob_mae), 4),
        "expiry_prob_RMSE": round(float(prob_rmse), 4),
        "Brier_Score": round(float(brier), 4),
        "Binary_ROC_AUC": round(float(roc_auc), 4),
        "Binary_PR_AUC": round(float(pr_auc), 4),
        "Binary_F1_Score": round(float(f1), 4),
        "Binary_Precision": round(float(precision), 4),
        "Binary_Recall": round(float(recall), 4)
    }
    print(f"Expiry Risk Model Validation Metrics: {metrics}")

    # Save artifact
    path_model = os.path.join(MODELS_DIR, "expiry_risk_model.joblib")
    joblib.dump({
        "prob_model": prob_model,
        "classifier_model": clf_model,
        "features": features
    }, path_model)
    print(f"Saved expiry risk models to {path_model}")

    return {
        "metrics": metrics,
        "features": features
    }

if __name__ == "__main__":
    train_expiry_risk_models()
