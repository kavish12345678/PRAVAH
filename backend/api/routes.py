"""PRAVAH Road Routing API.

Provides real road routing endpoints returning GeoJSON geometry, road distance, and driving duration.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import BloodBank
from services.routing_service import get_road_route

router = APIRouter(prefix="/api/routes", tags=["routes"])


@router.get("/road")
def get_road_routing(
    source_lat: float = Query(..., description="Source origin latitude"),
    source_lng: float = Query(..., description="Source origin longitude"),
    destination_lat: float = Query(..., description="Destination recipient latitude"),
    destination_lng: float = Query(..., description="Destination recipient longitude"),
    alternatives: bool = Query(default=True, description="Whether to include alternative routes"),
):
    """Calculates real road route with GeoJSON LineString geometry, road distance, and transit time."""
    if source_lat == 0 or source_lng == 0 or destination_lat == 0 or destination_lng == 0:
        raise HTTPException(status_code=400, detail="Invalid coordinates for road routing")

    route_data = get_road_route(
        source_lat=source_lat,
        source_lng=source_lng,
        destination_lat=destination_lat,
        destination_lng=destination_lng,
        request_alternatives=alternatives,
    )
    return route_data


@router.get("/facility-route")
def get_facility_road_route(
    source_id: int = Query(..., description="Source Blood Bank ID"),
    destination_id: int = Query(..., description="Destination Blood Bank ID"),
    db: Session = Depends(get_db),
):
    """Calculates road route directly using coordinates from the PRAVAH blood bank dataset."""
    src = db.get(BloodBank, source_id)
    dst = db.get(BloodBank, destination_id)

    if not src or not dst:
        raise HTTPException(status_code=404, detail="Source or destination facility not found in PRAVAH dataset")

    return get_road_route(
        source_lat=src.latitude,
        source_lng=src.longitude,
        destination_lat=dst.latitude,
        destination_lng=dst.longitude,
        request_alternatives=True,
    )
