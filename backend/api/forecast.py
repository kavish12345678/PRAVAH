from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, DemandForecast

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("")
def list_forecasts(db: Session = Depends(get_db)):
    rows = db.execute(
        select(DemandForecast, BloodBank.name)
        .join(BloodBank, DemandForecast.bank_id == BloodBank.id)
        .order_by(DemandForecast.forecast_date, BloodBank.name, DemandForecast.component)
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
