"""
EVORA API Application.
Your Intelligent EV Companion — Smart EV Management & Smart Charging Platform.
Implements dynamic runtime data sources, live weather integration, persistent SQLite storage,
and startup-loaded ML model inference.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import init_db, get_db_info
from app.ml.predictive_model import load_model
from app.services.telemetry_service import TelemetryService, ensure_initial_seed
from app.services.weather_service import WeatherService

from app.api.health import router as health_router
from app.api.chargers import router as chargers_router
from app.api.telemetry import router as telemetry_router
from app.api.vehicles import router as vehicles_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.wallet import router as wallet_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite tables
    init_db()
    # 2. Seed initial telemetry if fresh DB
    ensure_initial_seed()
    # 3. Load model ONCE at startup (NEVER retrained per request)
    app.state.model = load_model()
    # 4. Fetch initial live weather
    WeatherService.get_current_weather()
    print("[EVORA Startup] Database ready, live weather connected, and ML model loaded into memory.")
    yield
    print("[EVORA Shutdown] Backend cleanly terminated.")

app = FastAPI(
    title="EVORA API",
    description="Your Intelligent EV Companion — Smart EV Management & Smart Charging Platform",
    version="1.2.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(health_router, prefix="/api")
app.include_router(chargers_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(wallet_router, prefix="/api")

# Direct alias routes for frontend convenience
@app.get("/api/dashboard")
def api_dashboard_summary():
    """Aggregated dashboard payload returning latest telemetry, weather, dynamic KPIs, and source status."""
    from app.services.station_service import StationService
    from app.database.database import get_prediction_history, get_data_source_statuses

    telemetry = TelemetryService.get_latest_telemetry()
    weather = WeatherService.get_current_weather()
    recent_preds = get_prediction_history(limit=5)
    source_statuses = get_data_source_statuses()
    station_stats = StationService.get_station_statistics()

    return {
        "latest_telemetry": telemetry,
        "live_weather": weather,
        "recent_predictions": recent_preds,
        "data_source_statuses": source_statuses,
        "station_statistics": station_stats,
        "server_time": telemetry.get("timestamp"),
        "data_label": "Dynamic Runtime EVORA Aggregated Dashboard"
    }

@app.get("/api/latest-data")
def api_latest_data():
    return TelemetryService.get_latest_telemetry()

@app.get("/api/status")
def api_status():
    from app.database.database import get_data_source_statuses
    return {
        "status": "healthy",
        "database": get_db_info(),
        "sources": get_data_source_statuses(),
        "model_loaded": app.state.model.status if hasattr(app.state, "model") else "READY"
    }

@app.get("/api/predictions")
def api_predictions():
    from app.database.database import get_prediction_history
    return {
        "predictions": get_prediction_history(20),
        "data_label": "Persistent ML Prediction History"
    }

@app.get("/api/battery-health")
def api_battery_health():
    from app.api.telemetry import get_battery_health
    return get_battery_health()

@app.get("/api/carbon")
def api_carbon():
    from app.api.analytics import get_carbon_metrics
    return get_carbon_metrics()

@app.get("/")
def root():
    return {
        "app": "EVORA",
        "tagline": "Your Intelligent EV Companion",
        "version": "1.2.0",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "dynamic_data_enabled": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
