from pydantic import BaseModel, Field
from typing import List, Optional

class StationBase(BaseModel):
    id: str
    name: str
    operator: str
    city: str
    state: str
    latitude: float
    longitude: float
    address: str
    usage_type: str = "Public"
    connector_types: List[str] = Field(default_factory=list)
    power_kw: float
    ports_total: int = 4
    ports_available_demo: int = 3
    tariff_inr_per_kwh: float = 18.5
    rating: float = 4.6
    reviews_count: int = 48
    data_source_label: str = "Dataset Data (India Charging Stations 2025)"
    status_label: str = "Demo Availability"

class StationFilterParams(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    operator: Optional[str] = None
    connector_type: Optional[str] = None
    min_power: Optional[float] = None
    search: Optional[str] = None

class BookingRequest(BaseModel):
    station_id: str
    station_name: str
    connector_type: str
    date: str
    time_slot: str
    estimated_duration_min: int = 45
    vehicle_model: str = "Tata Nexon EV Max"
    estimated_cost_inr: float = 450.0
