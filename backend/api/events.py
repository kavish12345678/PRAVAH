"""PRAVAH Real-Time Event & Incident Rescoring Router.

Simulates and executes dynamic re-scoring when temperature excursions,
equipment degradation, or cold-chain alerts occur in the network.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, Inventory
from services.ml_service import expiry_service

router = APIRouter(prefix="/api/events", tags=["events"])


class IncidentEventRequest(BaseModel):
    bank_id: int = Field(..., example=1)
    event_type: str = Field(default="Temperature_Excursion", example="Thermal Excursion & Agitation Interruption")
    excursion_temp: float = Field(default=27.4, example=27.4)
    duration_min: int = Field(default=45, example=45)
    agitation_off: bool = Field(default=True, example=True)


class UnitRescoreAudit(BaseModel):
    inventory_id: int
    component: str
    blood_group: str
    remaining_shelf_life_days: float
    old_risk_score: float
    new_risk_score: float
    risk_delta: float
    old_risk_level: str
    new_risk_level: str
    action_recommended: str


class IncidentEventResponse(BaseModel):
    event_id: str
    bank_id: int
    bank_name: str
    event_type: str
    excursion_temp: float
    duration_min: int
    units_affected: int
    audit_trail: list[UnitRescoreAudit]
    optimization_rerun_recommended: bool


@router.post("/rescore", response_model=IncidentEventResponse)
def rescore_incident_event(payload: IncidentEventRequest, db: Session = Depends(get_db)):
    """Simulate a cold chain incident or equipment failure and re-score affected inventory in real time."""
    bank = db.get(BloodBank, payload.bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail=f"Blood bank ID {payload.bank_id} not found")

    items = db.scalars(
        select(Inventory).where(Inventory.bank_id == payload.bank_id)
    ).all()

    if not items:
        return IncidentEventResponse(
            event_id=f"EVT-{payload.bank_id}-EMPTY",
            bank_id=payload.bank_id,
            bank_name=bank.name,
            event_type=payload.event_type,
            excursion_temp=payload.excursion_temp,
            duration_min=payload.duration_min,
            units_affected=0,
            audit_trail=[],
            optimization_rerun_recommended=False,
        )

    from datetime import date
    today = date.today()

    audit_trail: list[UnitRescoreAudit] = []
    has_high_risk_increase = False

    for item in items:
        days_left = max(0.1, (item.expiry_date - today).days)
        remaining_hours = days_left * 24.0
        age_hours = max(0.0, 120.0 - remaining_hours)

        # Baseline scoring
        old_res = expiry_service.score_unit(
            platelet_type=item.component,
            status=item.status,
            represented_units=item.quantity,
            age_hours=age_hours,
            remaining_shelf_life_hours=remaining_hours,
            current_stock=item.quantity,
            expiring_48h=item.quantity if days_left <= 2 else 0,
            demand_next_24h=10,
            demand_next_72h=25,
            cumulative_excursion_minutes=0.0,
            max_temperature_exposure=22.0,
            agitation_off_minutes=0.0,
            health_score=95.0,
        )

        # Re-score with incident stress
        new_res = expiry_service.score_unit(
            platelet_type=item.component,
            status="CRITICAL",
            represented_units=item.quantity,
            age_hours=age_hours,
            remaining_shelf_life_hours=remaining_hours,
            current_stock=item.quantity,
            expiring_48h=item.quantity if days_left <= 2 else 0,
            demand_next_24h=10,
            demand_next_72h=25,
            cumulative_excursion_minutes=float(payload.duration_min),
            max_temperature_exposure=payload.excursion_temp,
            agitation_off_minutes=float(payload.duration_min) if payload.agitation_off else 0.0,
            health_score=50.0,
        )

        old_score = old_res["risk_score"]
        new_score = new_res["risk_score"]
        delta = round(new_score - old_score, 4)

        if new_score >= 0.65:
            has_high_risk_increase = True

        audit_trail.append(
            UnitRescoreAudit(
                inventory_id=item.id,
                component=item.component,
                blood_group=item.blood_group,
                remaining_shelf_life_days=days_left,
                old_risk_score=old_score,
                new_risk_score=new_score,
                risk_delta=delta,
                old_risk_level=old_res["risk_level"],
                new_risk_level=new_res["risk_level"],
                action_recommended=new_res["recommendation"],
            )
        )

    import uuid
    event_id = f"EVT-{str(uuid.uuid4())[:8].upper()}"

    return IncidentEventResponse(
        event_id=event_id,
        bank_id=payload.bank_id,
        bank_name=bank.name,
        event_type=payload.event_type,
        excursion_temp=payload.excursion_temp,
        duration_min=payload.duration_min,
        units_affected=len(audit_trail),
        audit_trail=audit_trail,
        optimization_rerun_recommended=has_high_risk_increase,
    )
