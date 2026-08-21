from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
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
        "created_at": transfer.created_at,
    }


@router.get("")
def list_transfers(db: Session = Depends(get_db)):
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
        .order_by(TransferRecommendation.created_at.desc())
    ).all()

    return [
        _serialize_transfer(transfer, source_name, destination_name)
        for transfer, source_name, destination_name in rows
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

    if payload.status == "APPROVED":
        db.add(
            AuditLog(
                timestamp=datetime.now(),
                action="TRANSFER_APPROVED",
                user="prototype-user",
                recommendation_id=transfer.id,
                source_bank_id=transfer.source_bank_id,
                destination_bank_id=transfer.destination_bank_id,
                quantity=transfer.quantity,
                approval_status="APPROVED",
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
