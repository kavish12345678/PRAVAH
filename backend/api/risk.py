from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, Inventory, RiskPrediction

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("")
def list_risk_predictions(
    level: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = (
        select(RiskPrediction, Inventory, BloodBank.name)
        .join(Inventory, RiskPrediction.inventory_id == Inventory.id)
        .join(BloodBank, Inventory.bank_id == BloodBank.id)
        .order_by(RiskPrediction.risk_score.desc())
    )

    if level is not None and isinstance(level, str) and level != "All":
        query = query.where(RiskPrediction.risk_level == level.upper())

    limit_val = limit if isinstance(limit, int) else 100
    rows = db.execute(query.limit(limit_val)).all()

    return [
        {
            "id": prediction.id,
            "inventory_id": prediction.inventory_id,
            "bank_name": bank_name,
            "blood_group": inventory.blood_group,
            "component": inventory.component,
            "quantity": inventory.quantity,
            "expiry_date": str(inventory.expiry_date),
            "risk_score": round(float(prediction.risk_score), 3),
            "risk_level": prediction.risk_level,
            "contributing_features": prediction.contributing_features,
            "model_version": prediction.model_version,
            "created_at": prediction.created_at.isoformat() if prediction.created_at else None,
        }
        for prediction, inventory, bank_name in rows
    ]
