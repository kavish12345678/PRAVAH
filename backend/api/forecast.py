from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, DemandForecast

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("")
def list_forecasts(
    bank_id: int | None = Query(default=None),
    component: str | None = Query(default=None),
    blood_group: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = (
        select(DemandForecast, BloodBank.name)
        .join(BloodBank, DemandForecast.bank_id == BloodBank.id)
        .order_by(DemandForecast.predicted_demand.desc())
    )

    if bank_id is not None and isinstance(bank_id, int):
        query = query.where(DemandForecast.bank_id == bank_id)
    if component is not None and isinstance(component, str) and component != "All":
        query = query.where(DemandForecast.component == component)
    if blood_group is not None and isinstance(blood_group, str) and blood_group != "All":
        query = query.where(DemandForecast.blood_group == blood_group)

    limit_val = limit if isinstance(limit, int) else 100
    rows = db.execute(query.limit(limit_val)).all()

    return [
        {
            "id": forecast.id,
            "bank_id": forecast.bank_id,
            "bank_name": bank_name,
            "component": forecast.component,
            "blood_group": forecast.blood_group,
            "forecast_date": str(forecast.forecast_date),
            "predicted_demand": round(float(forecast.predicted_demand), 1),
            "model_version": forecast.model_version,
        }
        for forecast, bank_name in rows
    ]
