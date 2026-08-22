from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, DemandForecast

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("")
def list_forecasts(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(DemandForecast, BloodBank.name)
        .join(BloodBank, DemandForecast.bank_id == BloodBank.id)
        .order_by(DemandForecast.predicted_demand.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": forecast.id,
            "bank_name": bank_name,
            "component": forecast.component,
            "blood_group": forecast.blood_group,
            "forecast_date": forecast.forecast_date,
            "predicted_demand": forecast.predicted_demand,
            "model_version": forecast.model_version,
        }
        for forecast, bank_name in rows
    ]
