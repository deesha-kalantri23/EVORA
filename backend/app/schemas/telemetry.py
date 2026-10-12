from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TelemetrySummary(BaseModel):
    vehicle_vin: str = "IN-EV-2024-NX889"
    vehicle_model: str = "Tata Nexon EV Max (40.5 kWh)"
    soc_percentage: float = 78.4
    soh_percentage: float = 96.2
    battery_voltage_v: float = 394.8
    battery_current_a: float = 14.6
    battery_temperature_c: float = 29.8
    cell_temp_min_c: float = 28.5
    cell_temp_max_c: float = 31.2
    charge_cycles: int = 318
    power_consumption_wh_per_km: float = 138.5
    odometer_km: float = 24650.0
    estimated_range_km: float = 265.0
    nominal_capacity_kwh: float = 40.5
    current_capacity_kwh: float = 38.96
    pack_health_status: str = "Optimal"
    degradation_rate_percent_per_10k_km: float = 1.45
    driving_mode: str = "City / Eco"
    data_source_label: str = "EVIoT Telemetry Dataset (Simulation & Predictive Models)"
    predictive_alert: Optional[str] = "Normal cell balance observed. Next recommended preventive check at 30,000 km."

class DegradationForecastPoint(BaseModel):
    cycles: int
    projected_soh: float
    confidence_lower: float
    confidence_upper: float

class RangeAnxietyRisk(BaseModel):
    risk_level: str  # "Low", "Moderate", "High"
    confidence_score: float
    current_soc: float
    estimated_range_km: float
    distance_to_destination_km: float
    headroom_km: float
    recommendation: str
    safety_margin_percent: float
    data_label: str = "AI Prototype / Estimated"
