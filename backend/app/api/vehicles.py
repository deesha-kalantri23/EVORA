from fastapi import APIRouter, HTTPException
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["My EV Management"])

@router.get("")
def list_vehicles():
    return {
        "vehicles": VehicleService.get_user_vehicles(),
        "primary_vehicle_id": "v-nexon-01",
        "data_label": "Demo Vehicle Profile"
    }

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    v = VehicleService.get_vehicle_by_id(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"vehicle": v, "data_label": "Demo Vehicle Profile"}
