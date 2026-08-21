from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank, Inventory

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("")
def list_inventory(
    blood_group: str | None = Query(default=None),
    component: str | None = Query(default=None),
    bank_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        select(Inventory, BloodBank.name)
        .join(BloodBank, Inventory.bank_id == BloodBank.id)
        .order_by(BloodBank.name, Inventory.component, Inventory.blood_group)
    )

    if blood_group is not None:
        query = query.where(Inventory.blood_group == blood_group)
    if component is not None:
        query = query.where(Inventory.component == component)
    if bank_id is not None:
        query = query.where(Inventory.bank_id == bank_id)

    rows = db.execute(query).all()

    return [
        {
            "id": item.id,
            "bank_name": bank_name,
            "component": item.component,
            "blood_group": item.blood_group,
            "quantity": item.quantity,
            "collection_date": item.collection_date,
            "expiry_date": item.expiry_date,
            "status": item.status,
        }
        for item, bank_name in rows
    ]
