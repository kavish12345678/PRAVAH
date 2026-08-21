from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import (
    BloodBank,
    Equipment,
    Inventory,
    RiskPrediction,
    TransferRecommendation,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()
    near_expiry_cutoff = today + timedelta(days=3)

    blood_banks = db.scalar(select(func.count()).select_from(BloodBank)) or 0
    total_inventory = db.scalar(select(func.coalesce(func.sum(Inventory.quantity), 0))) or 0
    low_stock = (
        db.scalar(
            select(func.count())
            .select_from(Inventory)
            .where(Inventory.quantity <= 10)
        )
        or 0
    )
    near_expiry = (
        db.scalar(
            select(func.count())
            .select_from(Inventory)
            .where(Inventory.expiry_date <= near_expiry_cutoff, Inventory.expiry_date >= today)
        )
        or 0
    )
    equipment_warnings = (
        db.scalar(
            select(func.count())
            .select_from(Equipment)
            .where(
                or_(Equipment.status != "OPERATIONAL", Equipment.health_score < 0.7)
            )
        )
        or 0
    )
    high_risk = (
        db.scalar(
            select(func.count())
            .select_from(RiskPrediction)
            .where(RiskPrediction.risk_level == "HIGH")
        )
        or 0
    )
    active_transfers = (
        db.scalar(
            select(func.count())
            .select_from(TransferRecommendation)
            .where(TransferRecommendation.status.in_(["PENDING", "APPROVED"]))
        )
        or 0
    )

    return {
        "blood_banks": blood_banks,
        "total_inventory": total_inventory,
        "low_stock": low_stock,
        "near_expiry": near_expiry,
        "equipment_warnings": equipment_warnings,
        "high_risk": high_risk,
        "active_transfers": active_transfers,
    }
