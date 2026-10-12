"""
Telemetry & Predictive AI Endpoints for EVORA.
Supports:
- Dynamic live telemetry stream retrieval
- Runtime ingestion (POST /api/telemetry/ingest)
- Dynamic refresh (POST /api/telemetry/refresh)
- Weather-aware ML Range Prediction (POST /api/telemetry/predict-range)
- ML Range Anxiety Assessment (POST /api/telemetry/predict-anxiety)
- Persistent Model Prediction History (GET /api/telemetry/predictions/history)
- Dynamic Data Source Status & Health (GET /api/telemetry/source-status)
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.services.telemetry_service import TelemetryService
from app.services.weather_service import WeatherService
from app.database.database import get_prediction_history, get_data_source_statuses

router = APIRouter(prefix="/telemetry", tags=["Battery Telemetry & Predictive AI"])

class RangePredictionRequest(BaseModel):
    battery_level: float = Field(78.0, ge=0.0, le=100.0, description="Current battery State of Charge %")
    temperature_c: Optional[float] = Field(None, description="Ambient temperature °C (omitted = uses live weather)")
    weather: Optional[str] = Field(None, description="Weather condition (omitted = uses live weather)")
    driving_style: str = Field("Normal / Balanced", description="Driving mode (Eco, Normal, Sport/Aggressive)")
    average_speed_kmh: float = Field(45.0, ge=0.0, le=200.0, description="Target or current speed km/h")
    vehicle_load: str = Field("Normal (2-3 Persons)", description="Vehicle load")
    road_type: str = Field("City / Urban", description="Road type (City, Highway, Ghats/Hilly)")
    traffic: str = Field("Moderate", description="Traffic condition (Light, Moderate, Heavy)")
    elevation: str = Field("Flat Terrain", description="Elevation profile")

class RangeAnxietyRequest(BaseModel):
    current_battery: float = Field(78.0, ge=0.0, le=100.0)
    trip_distance_km: float = Field(148.0, gt=0.0)
    predicted_range_km: float = Field(284.0, ge=0.0)
    weather: Optional[str] = "Sunny / Clear (32°C)"
    traffic: Optional[str] = "Moderate"
    driving_style: Optional[str] = "Normal / Balanced"
    vehicle_load: Optional[str] = "Normal (2-3 Persons)"

class IngestionPacket(BaseModel):
    vehicle_id: Optional[str] = "v-nexon-01"
    soc_percentage: Optional[float] = None
    soh_percentage: Optional[float] = None
    battery_voltage_v: Optional[float] = None
    battery_current_a: Optional[float] = None
    battery_temperature_c: Optional[float] = None
    charge_cycles: Optional[int] = None
    power_consumption_wh_per_km: Optional[float] = None
    speed_kmh: Optional[float] = None
    motor_temperature_c: Optional[float] = None
    tire_pressure_psi: Optional[float] = None
    ambient_temperature_c: Optional[float] = None
    source_label: Optional[str] = "External IoT Ingestion"

@router.get("/latest")
def get_latest_telemetry():
    """Returns the latest dynamic telemetry record enriched with live Open-Meteo weather."""
    return TelemetryService.get_latest_telemetry()

@router.post("/refresh")
def refresh_dynamic_telemetry():
    """
    Explicitly triggers dynamic data refresh:
    - Fetches fresh observation from live Open-Meteo Weather API
    - Steps forward or ingests next calibrated telemetry sequence packet
    - Updates persistent SQLite records and returns the latest state
    """
    return TelemetryService.refresh_dynamic_data(step_forward=True)

@router.post("/ingest")
def ingest_telemetry_packet(packet: Dict[str, Any] = Body(...)):
    """
    Dynamic Ingestion Layer:
    Ingests an arbitrary IoT / CAN bus / OBD-II packet into the dynamic pipeline.
    Validates, normalizes feature aliases, executes ML model inference, and persists.
    """
    try:
        result = TelemetryService.ingest_telemetry_packet(packet)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ingestion failed: {str(e)}")

@router.get("/battery-health")
def get_battery_health():
    """Returns battery State of Health metrics and calibrated degradation curve."""
    latest = TelemetryService.get_latest_telemetry()
    forecast = TelemetryService.get_degradation_forecast(500)
    return {
        "timestamp": latest.get("timestamp"),
        "soh_percentage": latest["soh_percentage"],
        "soc_percentage": latest["soc_percentage"],
        "battery_voltage_v": latest["battery_voltage_v"],
        "battery_current_a": latest["battery_current_a"],
        "battery_temperature_c": latest["battery_temperature_c"],
        "cell_temp_min_c": latest["cell_temp_min_c"],
        "cell_temp_max_c": latest["cell_temp_max_c"],
        "charge_cycles": latest["charge_cycles"],
        "pack_health_status": latest["pack_health_status"],
        "cell_balance_status": latest["cell_balance_status"],
        "component_health": latest["component_health"],
        "forecast": forecast,
        "live_weather": latest.get("live_weather"),
        "data_label": "Dynamic Telemetry + Calibrated EVIoT Model"
    }

@router.get("/history")
def get_telemetry_history_endpoint(limit: int = Query(50, ge=1, le=200)):
    """Returns persistent historical telemetry readings from SQLite for charting."""
    return TelemetryService.get_telemetry_history(limit)

@router.get("/forecast")
def get_degradation_forecast(horizon: int = Query(500, ge=50, le=2000)):
    """Calculates SoH degradation curve from latest cycles using loaded model."""
    return {
        "forecast": TelemetryService.get_degradation_forecast(horizon),
        "data_label": "Loaded ML Model (EVIoT Degradation Pattern)"
    }

@router.post("/predict-range")
def predict_range_endpoint(req: RangePredictionRequest):
    """
    Weather & Style Aware EV Range Prediction using runtime ML inference.
    Automatically enriches with live Open-Meteo weather if weather/temperature are omitted.
    Logs inference to prediction_history table.
    """
    return TelemetryService.predict_range_dynamic(req.model_dump())

@router.post("/predict-anxiety")
def predict_anxiety_endpoint(req: RangeAnxietyRequest):
    """Assesses range anxiety risk for travel corridors and logs inference."""
    return TelemetryService.predict_anxiety_dynamic(req.model_dump())

@router.get("/source-status")
def get_source_status_endpoint():
    """
    Returns real-time connection health and record counts for all dynamic sources:
    - Open-Meteo Live Weather API
    - IoT Vehicle Telemetry Stream
    - SQLite Dynamic Store
    """
    statuses = get_data_source_statuses()
    weather = WeatherService.get_current_weather()
    return {
        "sources": statuses,
        "live_weather_status": weather.get("status"),
        "weather_source": weather.get("source"),
        "data_label": "Dynamic Source Health Check"
    }

@router.get("/predictions/history")
def get_prediction_history_endpoint(limit: int = Query(20, ge=1, le=100)):
    """Returns stored prediction history from SQLite."""
    preds = get_prediction_history(limit)
    return {
        "count": len(preds),
        "predictions": preds,
        "data_label": "Persistent ML Prediction History"
    }
