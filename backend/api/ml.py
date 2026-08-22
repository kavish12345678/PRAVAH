"""PRAVAH ML Endpoints matching docs/API_CONTRACT.md.

Exposes:
- POST /ml/expiry-risk/predict
- POST /ml/demand-forecast/predict
- POST /ml/equipment-anomaly/predict
"""

from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ml_service import anomaly_service, demand_service, expiry_service

router = APIRouter(prefix="/ml", tags=["machine-learning"])


# --- Schemas ---

class ExpiryRiskRequest(BaseModel):
    inventory_id: str | int = Field(..., example="INV001")
    bank_id: str | int = Field(..., example="BANK001")
    component: str = Field(..., example="PLATELETS")
    blood_group: str = Field(..., example="O+")
    days_to_expiry: float = Field(..., example=1.8)
    current_inventory: int = Field(..., example=18)
    historical_utilization: float = Field(..., example=0.35)
    projected_demand: float = Field(..., example=10.0)
    temperature_stress: float = Field(default=0.0, example=0.2)
    agitation_status: int = Field(default=1, example=1)
    equipment_health: float = Field(default=0.9, example=0.9)


class ExpiryRiskResponse(BaseModel):
    inventory_id: str
    risk_score: float
    risk_level: str
    contributing_features: list[str]
    model_version: str


class DemandForecastRequest(BaseModel):
    bank_id: str | int = Field(..., example="BANK002")
    component: str = Field(..., example="PLATELETS")
    blood_group: str = Field(..., example="O+")
    historical_usage: list[int | float] = Field(..., example=[8, 10, 9, 12, 11, 13, 10])
    current_inventory: int = Field(..., example=10)


class DemandForecastResponse(BaseModel):
    bank_id: str
    component: str
    blood_group: str
    forecast: dict[str, int]
    model_version: str


class TelemetryData(BaseModel):
    temperature: list[float] = Field(..., example=[3.1, 3.0, 3.2, 8.7, 3.1])
    excursion_duration: int = Field(default=0, example=15)
    excursion_frequency: int = Field(default=0, example=2)


class EquipmentAnomalyRequest(BaseModel):
    equipment_id: str = Field(..., example="EQ001")
    bank_id: str = Field(..., example="BANK001")
    telemetry: TelemetryData


class EquipmentAnomalyResponse(BaseModel):
    equipment_id: str
    anomaly_score: float
    status: str
    model_version: str


# --- Endpoints ---

@router.post("/expiry-risk/predict", response_model=ExpiryRiskResponse)
def predict_expiry_risk(payload: ExpiryRiskRequest):
    """Predict expiry risk score, level, and contributing factors using Model 2."""
    try:
        return expiry_service.predict_from_contract_payload(
            inventory_id=payload.inventory_id,
            bank_id=payload.bank_id,
            component=payload.component,
            blood_group=payload.blood_group,
            days_to_expiry=payload.days_to_expiry,
            current_inventory=payload.current_inventory,
            historical_utilization=payload.historical_utilization,
            projected_demand=payload.projected_demand,
            temperature_stress=payload.temperature_stress,
            agitation_status=payload.agitation_status,
            equipment_health=payload.equipment_health,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Expiry risk inference error: {e}")


@router.post("/demand-forecast/predict", response_model=DemandForecastResponse)
def predict_demand_forecast(payload: DemandForecastRequest):
    """Forecast 1-day, 3-day, and 7-day demand using Model 1."""
    try:
        return demand_service.predict_from_contract_payload(
            bank_id=payload.bank_id,
            component=payload.component,
            blood_group=payload.blood_group,
            historical_usage=payload.historical_usage,
            current_inventory=payload.current_inventory,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand forecast inference error: {e}")


@router.post("/equipment-anomaly/predict", response_model=EquipmentAnomalyResponse)
def predict_equipment_anomaly(payload: EquipmentAnomalyRequest):
    """Detect telemetry anomalies and cold-chain excursions using Model 3."""
    try:
        return anomaly_service.predict_from_contract_payload(
            equipment_id=payload.equipment_id,
            bank_id=payload.bank_id,
            telemetry=payload.telemetry.model_dump(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Equipment anomaly inference error: {e}")
