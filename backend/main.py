from pathlib import Path
from typing import Dict, Any

import pandas as pd
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from api.dashboard import router as dashboard_router
from api.events import router as events_router
from api.forecast import router as forecast_router
from api.intelligence import router as intelligence_router
from api.inventory import router as inventory_router
from api.ml import router as ml_router
from api.risk import router as risk_router
from api.transfer import router as transfer_router
from database.connection import get_db
from database.models import BloodBank, Inventory, DemandForecast, RiskPrediction, TransferRecommendation

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

POSSIBLE_DATA_DIRS = [
    PROJECT_ROOT / "sih datacollection 2" / "data" / "processed",
    PROJECT_ROOT / "data" / "processed",
    BACKEND_DIR / "data" / "processed",
]
DATA_DIR = next((d for d in POSSIBLE_DATA_DIRS if d.exists()), PROJECT_ROOT / "data" / "processed")

app = FastAPI(
    title="PRAVAH API",
    description="AI-Powered Blood Supply & Cold-Chain Intelligence",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(inventory_router)
app.include_router(forecast_router)
app.include_router(risk_router)
app.include_router(transfer_router)
app.include_router(intelligence_router)
app.include_router(events_router)
app.include_router(ml_router)


@app.get("/")
def root():
    return {
        "project": "PRAVAH",
        "status": "running",
        "version": "1.2.0",
    }


@app.get("/api/health")
def get_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Diagnostic health check reporting dynamic live record counts."""
    bank_cnt = db.scalar(select(func.count(BloodBank.id))) or 0
    inv_cnt = db.scalar(select(func.count(Inventory.id))) or 0
    fc_cnt = db.scalar(select(func.count(DemandForecast.id))) or 0
    risk_cnt = db.scalar(select(func.count(RiskPrediction.id))) or 0
    rec_cnt = db.scalar(select(func.count(TransferRecommendation.id))) or 0

    return {
        "status": "ok",
        "database": "connected",
        "dataset": "loaded" if bank_cnt > 0 and inv_cnt > 0 else "empty",
        "blood_bank_records": bank_cnt,
        "inventory_records": inv_cnt,
        "demand_forecast_records": fc_cnt,
        "risk_prediction_records": risk_cnt,
        "transfer_recommendation_records": rec_cnt,
    }


@app.get("/api/data-status")
def get_data_status() -> Dict[str, Any]:
    """Reports actual presence and row counts of all PRAVAH CSV datasets."""
    csv_files = [
        "blood_banks.csv",
        "platelet_inventory.csv",
        "platelet_demand.csv",
        "cold_chain.csv",
        "cold_chain_alerts.csv",
        "events.csv",
        "transport.csv",
        "prediction_targets.csv",
        "unit_expiry_risk_features.csv",
        "bank_profile_features.csv",
        "equipment.csv",
        "redistribution_recommendations.csv",
    ]

    file_statuses = {}
    for filename in csv_files:
        filepath = DATA_DIR / filename
        if filepath.exists():
            try:
                # Count lines without full parsing for speed
                with open(filepath, "r", encoding="utf-8") as f:
                    line_count = sum(1 for _ in f) - 1  # minus header
                file_statuses[filename] = {
                    "available": True,
                    "records": max(0, line_count),
                    "path": str(filepath),
                }
            except Exception as e:
                file_statuses[filename] = {
                    "available": True,
                    "records": "error reading",
                    "error": str(e),
                }
        else:
            file_statuses[filename] = {
                "available": False,
                "records": 0,
            }

    return {
        "status": "ok",
        "data_directory": str(DATA_DIR),
        "files": file_statuses,
    }
