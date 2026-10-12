from pydantic import BaseModel
from typing import Optional, List

class VehicleProfile(BaseModel):
    id: str
    make: str
    model: str
    variant: str
    year: int
    battery_capacity_kwh: float
    rated_range_km: int
    real_world_range_km: int
    connector_supported: List[str]
    max_ac_charging_kw: float
    max_dc_charging_kw: float
    vin: str
    license_plate: str
    odometer_km: float
    image_url: Optional[str] = None
    connected_status: str = "Simulated Active"

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    variant: Optional[str] = None
    odometer_km: Optional[float] = None
    license_plate: Optional[str] = None
