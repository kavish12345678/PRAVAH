import csv
import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import RiskPrediction
from services.intelligence import ENGINE_VERSION, run_intelligence_pipeline

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
SIH_DIR = PROJECT_ROOT / "sih datacollection 2"


@router.get("/status")
def get_intelligence_status():
    return {
        "engine": "PRAVAH AI & ML Intelligence Engine",
        "mode": "ml-gbdt-lp-optimization",
        "version": ENGINE_VERSION,
        "dataset_name": "PRAVAH National Blood Supply Dataset",
        "dataset_status": "READY",
        "models": {
            "demand_forecasting": "HistGradientBoosting (24h & 72h)",
            "expiry_risk": "HistGradientBoosting (Regressor + Classifier)",
            "cold_chain_anomaly": "IsolationForest (Hybrid)",
            "redistribution_optimizer": "Linear Programming Min-Cost Network Flow (HiGHS)",
        },
        "ready": True,
    }


@router.get("/risk-summary")
def get_risk_summary(db: Session = Depends(get_db)):
    """Returns authentic distribution of risk predictions across the dataset."""
    total_count = db.scalar(select(func.count(RiskPrediction.id))) or 0
    if total_count == 0:
        return {
            "total_units": 0,
            "distribution": {
                "LOW": 0,
                "LOW_MEDIUM": 0,
                "MODERATE": 0,
                "HIGH": 0,
                "CRITICAL": 0,
            },
            "percentages": {
                "LOW": 0.0,
                "LOW_MEDIUM": 0.0,
                "MODERATE": 0.0,
                "HIGH": 0.0,
                "CRITICAL": 0.0,
            },
        }

    rows = db.execute(
        select(RiskPrediction.risk_level, func.count(RiskPrediction.id))
        .group_by(RiskPrediction.risk_level)
    ).all()
    counts = {r[0]: r[1] for r in rows}

    return {
        "total_units": total_count,
        "distribution": {
            "LOW": counts.get("LOW", 0),
            "LOW_MEDIUM": counts.get("LOW_MEDIUM", 0),
            "MODERATE": counts.get("MODERATE", 0),
            "HIGH": counts.get("HIGH", 0),
            "CRITICAL": counts.get("CRITICAL", 0),
        },
        "percentages": {
            "LOW": round((counts.get("LOW", 0) / total_count) * 100, 2),
            "LOW_MEDIUM": round((counts.get("LOW_MEDIUM", 0) / total_count) * 100, 2),
            "MODERATE": round((counts.get("MODERATE", 0) / total_count) * 100, 2),
            "HIGH": round((counts.get("HIGH", 0) / total_count) * 100, 2),
            "CRITICAL": round((counts.get("CRITICAL", 0) / total_count) * 100, 2),
        },
    }


@router.get("/metrics")
def get_model_metrics():
    metrics_path = SIH_DIR / "reports" / "model_metrics.json"
    feature_imp_path = SIH_DIR / "reports" / "feature_importance.csv"

    metrics = {}
    if metrics_path.exists():
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)

    feature_importance = []
    if feature_imp_path.exists():
        with open(feature_imp_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                feature_importance.append({
                    "feature": row.get("feature", ""),
                    "importance_mean": float(row.get("importance_mean", 0.0)),
                    "importance_std": float(row.get("importance_std", 0.0)),
                })

    return {
        "metrics": metrics,
        "feature_importance": feature_importance,
    }


@router.get("/provenance")
def get_provenance():
    prov_path = SIH_DIR / "data" / "metadata" / "pravah_provenance.json"
    if prov_path.exists():
        with open(prov_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "sources": {
            "blood_bank_network": ["e-RaktKosh India Blood Bank Directory snapshot & National Health Portal catalog"],
            "constraints": ["WHO guidance: platelet storage at 20-24°C with continuous agitation"],
            "calibration": ["Telangana & Karnataka regional platelet discard studies"],
        },
        "description": "PRAVAH Operational Project Dataset",
    }


@router.post("/run")
def run_intelligence(db: Session = Depends(get_db)):
    return run_intelligence_pipeline(db)
