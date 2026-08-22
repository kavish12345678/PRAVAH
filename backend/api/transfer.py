from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import AuditLog, BloodBank, TransferRecommendation

router = APIRouter(prefix="/api/transfers", tags=["transfers"])

TransferStatus = Literal["PENDING", "APPROVED", "REJECTED"]


class TransferStatusUpdate(BaseModel):
    status: TransferStatus


def _serialize_transfer(
    transfer: TransferRecommendation,
    source_bank: str,
    destination_bank: str,
) -> dict:
    return {
        "id": transfer.id,
        "source_bank": source_bank,
        "destination_bank": destination_bank,
        "component": transfer.component,
        "blood_group": transfer.blood_group,
        "quantity": transfer.quantity,
        "route": transfer.route,
        "vehicle": transfer.vehicle,
        "status": transfer.status,
        "created_at": transfer.created_at.isoformat() if transfer.created_at else None,
    }


@router.get("")
def list_transfers(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    source_bank = BloodBank.__table__.alias("source_bank")
    destination_bank = BloodBank.__table__.alias("destination_bank")

    rows = db.execute(
        select(
            TransferRecommendation,
            source_bank.c.name,
            destination_bank.c.name,
        )
        .join(source_bank, TransferRecommendation.source_bank_id == source_bank.c.id)
        .join(
            destination_bank,
            TransferRecommendation.destination_bank_id == destination_bank.c.id,
        )
        .order_by(TransferRecommendation.quantity.desc(), TransferRecommendation.created_at.desc())
        .limit(limit)
    ).all()

    return [
        _serialize_transfer(transfer, source_name, destination_name)
        for transfer, source_name, destination_name in rows
    ]


@router.get("/audit")
def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    source_bank = BloodBank.__table__.alias("source_bank")
    destination_bank = BloodBank.__table__.alias("destination_bank")

    rows = db.execute(
        select(
            AuditLog,
            source_bank.c.name,
            destination_bank.c.name,
        )
        .outerjoin(source_bank, AuditLog.source_bank_id == source_bank.c.id)
        .outerjoin(destination_bank, AuditLog.destination_bank_id == destination_bank.c.id)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "action": log.action,
            "user": log.user,
            "recommendation_id": log.recommendation_id,
            "source_bank": source_name or "National Reserve Hub",
            "destination_bank": destination_name or "Regional Trauma Center",
            "quantity": log.quantity,
            "approval_status": log.approval_status,
        }
        for log, source_name, destination_name in rows
    ]


@router.patch("/{transfer_id}/status")
def update_transfer_status(
    transfer_id: int,
    payload: TransferStatusUpdate,
    db: Session = Depends(get_db),
):
    transfer = db.get(TransferRecommendation, transfer_id)
    if transfer is None:
        raise HTTPException(status_code=404, detail="Transfer recommendation not found")

    transfer.status = payload.status

    db.add(
        AuditLog(
            timestamp=datetime.now(),
            action=f"TRANSFER_{payload.status}",
            user="National Logistics Officer",
            recommendation_id=transfer.id,
            source_bank_id=transfer.source_bank_id,
            destination_bank_id=transfer.destination_bank_id,
            quantity=transfer.quantity,
            approval_status=payload.status,
        )
    )

    db.commit()
    db.refresh(transfer)

    source_name = db.scalar(
        select(BloodBank.name).where(BloodBank.id == transfer.source_bank_id)
    )
    destination_name = db.scalar(
        select(BloodBank.name).where(BloodBank.id == transfer.destination_bank_id)
    )

    return _serialize_transfer(transfer, source_name or "", destination_name or "")
