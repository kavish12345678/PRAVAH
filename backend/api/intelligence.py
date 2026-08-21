from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from services.intelligence import ENGINE_VERSION, run_intelligence_pipeline

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


@router.get("/status")
def get_intelligence_status():
    return {
        "engine": "PRAVAH Intelligence Engine",
        "mode": "rule-based-demo",
        "version": ENGINE_VERSION,
        "ready": True,
    }


@router.post("/run")
def run_intelligence(db: Session = Depends(get_db)):
    return run_intelligence_pipeline(db)
