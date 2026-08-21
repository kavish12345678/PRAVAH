from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import RiskPrediction

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("")
def list_risk_predictions(db: Session = Depends(get_db)):
    predictions = db.scalars(
        select(RiskPrediction).order_by(RiskPrediction.created_at.desc())
    ).all()

    return [
        {
            "id": prediction.id,
            "inventory_id": prediction.inventory_id,
            "risk_score": prediction.risk_score,
            "risk_level": prediction.risk_level,
            "contributing_features": prediction.contributing_features,
            "model_version": prediction.model_version,
            "created_at": prediction.created_at,
        }
        for prediction in predictions
    ]
