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
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = (
        select(Inventory, BloodBank.name)
        .join(BloodBank, Inventory.bank_id == BloodBank.id)
        .order_by(Inventory.expiry_date.asc(), BloodBank.name)
    )

    if blood_group is not None and isinstance(blood_group, str) and blood_group != "All":
        query = query.where(Inventory.blood_group == blood_group)
    if component is not None and isinstance(component, str) and component != "All":
        query = query.where(Inventory.component == component)
    if bank_id is not None and isinstance(bank_id, int):
        query = query.where(Inventory.bank_id == bank_id)
    if status is not None and isinstance(status, str) and status != "All":
        query = query.where(Inventory.status == status)

    limit_val = limit if isinstance(limit, int) else 100
    query = query.limit(limit_val)
    rows = db.execute(query).all()

    return [
        {
            "id": item.id,
            "bank_id": item.bank_id,
            "bank_name": bank_name,
            "component": item.component,
            "blood_group": item.blood_group,
            "quantity": item.quantity,
            "collection_date": str(item.collection_date),
            "expiry_date": str(item.expiry_date),
            "status": item.status,
        }
        for item, bank_name in rows
    ]


@router.get("/{inventory_id}")
def get_inventory_item(inventory_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        select(Inventory, BloodBank.name)
        .join(BloodBank, Inventory.bank_id == BloodBank.id)
        .where(Inventory.id == inventory_id)
    ).first()

    if not row:
        return None

    item, bank_name = row
    return {
        "id": item.id,
        "bank_id": item.bank_id,
        "bank_name": bank_name,
        "component": item.component,
        "blood_group": item.blood_group,
        "quantity": item.quantity,
        "collection_date": str(item.collection_date),
        "expiry_date": str(item.expiry_date),
        "status": item.status,
    }
