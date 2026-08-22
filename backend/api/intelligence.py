from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from services.intelligence import ENGINE_VERSION, run_intelligence_pipeline

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


@router.get("/status")
def get_intelligence_status():
    return {
        "engine": "PRAVAH AI & ML Intelligence Engine",
        "mode": "ml-gbdt-lp-optimization",
        "version": ENGINE_VERSION,
        "models": {
            "demand_forecasting": "HistGradientBoosting (24h & 72h)",
            "expiry_risk": "HistGradientBoosting (Regressor + Classifier)",
            "cold_chain_anomaly": "IsolationForest (Hybrid)",
            "redistribution_optimizer": "Linear Programming Min-Cost Network Flow (HiGHS)",
        },
        "ready": True,
    }


@router.post("/run")
def run_intelligence(db: Session = Depends(get_db)):
    return run_intelligence_pipeline(db)
