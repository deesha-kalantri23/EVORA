# EVORA — AI-Powered Smart EV Management & Smart Charging Platform

**EVORA** is an intelligent EV companion that provides real-time vehicle telemetry monitoring, weather-aware range and anxiety predictions, intelligent route planning, and dynamic slot booking for Indian EV charging infrastructure.

This document details the **Dynamic Runtime Architecture** implemented to support runtime data streams, live external APIs, persistent prediction history, and feature normalization while preserving existing trained Machine Learning models without retraining per request.

---

## 1. System Architecture

## 1. System Architecture

```mermaid
flowchart TD
    subgraph DynamicDataSources["Dynamic Data Sources"]
        direction TB
        OpenMeteo["Open-Meteo REST API (Live Weather)"]
        IoTStream["Dynamic Telemetry Stream / Ingestion API<br/>POST /api/telemetry/ingest"]
        KaggleStations["Indian EV Stations Catalog<br/>2025 Dataset / SQLite"]
    end

    subgraph IngestionNormalization["Data Fetch and Normalization Layer"]
        FetchService["WeatherService and TelemetryService"]
        Normalizer["FeatureNormalizer and Alias Resolution"]
        Validator["Schema Validation<br/>Range Clamping and Type Coercion"]
    end

    subgraph Storage["Persistent Storage - SQLite / PostgreSQL Ready"]
        DB_Telemetry[("telemetry_records")]
        DB_Predictions[("prediction_history")]
        DB_Status[("data_source_status")]
        DB_Bookings[("station_bookings")]
    end

    subgraph MLInference["ML Inference Engine"]
        ModelSingleton["BatteryPredictiveModel<br/>Loaded Once at Startup"]
        RangeInference["Dynamic Range and Anxiety Predictor"]
        DegradationCurve["SoH Degradation Forecast"]
    end

    subgraph BackendAPI["FastAPI Backend Service"]
        EP_Dash["GET /api/dashboard"]
        EP_Latest["GET /api/telemetry/latest"]
        EP_Refresh["POST /api/telemetry/refresh"]
        EP_Preds["POST /api/telemetry/predict-range"]
        EP_Bookings["POST /api/chargers/bookings"]
    end

    subgraph FrontendApp["React 19 + TypeScript + Vite Dashboard"]
        UI_Dash["Dynamic Dashboard<br/>Auto-Refresh Every 30 Seconds"]
        UI_Weather["Live Environmental Impact Card"]
        UI_PredHist["Prediction History Audit Table"]
        UI_Range["Interactive Weather-Aware Range Predictor"]
    end

    OpenMeteo --> FetchService
    IoTStream --> Normalizer
    KaggleStations --> Storage

    FetchService --> Normalizer
    Normalizer --> Validator
    Validator --> Storage

    Validator --> ModelSingleton
    ModelSingleton --> RangeInference
    ModelSingleton --> DegradationCurve

    RangeInference --> DB_Predictions
    DegradationCurve --> DB_Predictions

    Storage --> BackendAPI
    RangeInference --> BackendAPI
    DegradationCurve --> BackendAPI
    BackendAPI --> FrontendApp
```

## 2. Core Concepts: Clear Distinction

| Component | Definition | Role in EVORA |
| :--- | :--- | :--- |
| **TRAINING DATA** | Historical, static dataset used to train/calibrate models | `EV_Predictive_Maintenance_Dataset_15min.csv` (175k rows of EV telemetry) and `Indian_EV_Stations_Simplified.csv`. |
| **DYNAMIC INPUT DATA** | New, latest runtime data supplied to the model during inference | Real-time weather observations from Open-Meteo REST API, live IoT/OBD-II telemetry ingested via `POST /api/telemetry/ingest`, and dynamic session state. |
| **MODEL** | The trained predictive algorithm loaded into memory | `BatteryPredictiveModel` singleton loaded once during backend startup (`lifespan`). **The model is NEVER retrained per request.** |
| **PREDICTION** | The inferred output generated dynamically from runtime input | Weather-adjusted travel range (km), State of Health degradation curve (%), Range Anxiety Risk score, and charging recommendations logged to `prediction_history`. |

---

## 3. Dynamic Data Sources

1. **Live Weather Source (`Open-Meteo Public REST API`)**:
   - Endpoint: `https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
   - Purpose: Provides real-time ambient temperature, humidity, wind, and WMO weather conditions for Pune, Maharashtra (and user-specified coordinates).
   - Caching: 10-minute in-memory TTL to eliminate repetitive network round trips.
   - Fallback: Gracefully falls back to cached baseline observations if the network is disconnected.

2. **Dynamic Ingestion Stream (`IoT Telemetry & Ingestion Pipeline`)**:
   - Endpoint: `POST /api/telemetry/ingest`
   - Purpose: Accepts live packets from CAN bus, OBD-II telemetry streams, or mobile devices.
   - Dynamic Progression: Supports stepping forward through calibrated test sequences or streaming continuous battery updates via `POST /api/telemetry/refresh`.

3. **Persistent SQLite Database (`evora.db`)**:
   - `telemetry_records`: Time-series sensor log.
   - `prediction_history`: Full audit trail of model predictions, input features, and confidence scores.
   - `data_source_status`: Live status tracker (`ONLINE`, `CACHED`, `DEGRADED`) for all connected sources.
   - `station_bookings`: Persistent reservations enforcing double-booking prevention as per SRS FR-2.4.

---

## 4. Feature Normalization & Compatibility Layer

Incoming dynamic data frequently uses differing naming schemes, units, or missing attributes. `FeatureNormalizer` in `backend/app/services/normalization.py` standardizes inputs before model inference:

| Dynamic Field Aliases | Normalized Application Field | Model Schema Field | Unit Conversion / Rule |
| :--- | :--- | :--- | :--- |
| `soc`, `SoC`, `battery_level`, `state_of_charge` | `soc_percentage` | `current_soc` | If $\le 1.0$, multiplied by 100 to convert fraction to %. |
| `soh`, `SoH`, `state_of_health` | `soh_percentage` | `current_soh` | If $\le 1.0$, multiplied by 100 to convert fraction to %. |
| `temp_c`, `temperature`, `pack_temp` | `battery_temperature_c` | `average_temp` | If $> 80$, converts Fahrenheit to Celsius: $(F - 32) \times 5/9$. |
| `volt`, `pack_voltage`, `voltage` | `battery_voltage_v` | N/A (Pack telemetry) | Clamped to non-negative float. |
| `cycles`, `cycle_count` | `charge_cycles` | `current_cycles` | Coerced to non-negative integer. |
| `power_consumption`, `wh_per_km` | `power_consumption_wh_per_km` | `efficiency_wh_per_km` | Converted from kW to Wh/km if $< 50$. |

---

## 5. API Endpoints

### Dynamic Telemetry & AI Predictions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated dashboard summary (latest telemetry, live weather, source status, recent predictions). |
| `GET` | `/api/telemetry/latest` | Returns latest dynamic telemetry enriched with live Open-Meteo weather. |
| `POST` | `/api/telemetry/refresh` | Triggers live data refresh (pulls fresh weather, advances telemetry feed). |
| `POST` | `/api/telemetry/ingest` | Ingests a new dynamic telemetry packet, normalizes, infers model prediction, persists to SQLite. |
| `GET` | `/api/telemetry/history` | Historical time-series telemetry records for charts. |
| `GET` | `/api/telemetry/battery-health` | State of Health metrics and degradation forecast curves. |
| `POST` | `/api/telemetry/predict-range` | Weather & style aware EV range prediction using runtime model inference. |
| `POST` | `/api/telemetry/predict-anxiety` | Trip corridor range anxiety risk classification. |
| `GET` | `/api/telemetry/source-status` | Health check for dynamic sources (`Open-Meteo`, `IoT Stream`, `SQLite`). |
| `GET` | `/api/predictions/history` | Persistent history of model predictions from SQLite. |

### Charging Stations & Bookings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/chargers` | Filters Indian EV charging stations (city, operator, connector, power). |
| `GET` | `/api/chargers/corridor` | Finds stations along Pune-Mumbai and intercity corridors. |
| `POST` | `/api/chargers/bookings` | Reserves slot with collision detection (prevents double bookings, returns 409 on conflict). |
| `GET` | `/api/chargers/user/bookings`| Returns user's persistent bookings from SQLite. |

---

## 6. SRS Alignment Matrix

| SRS Requirement | Status | Implementation Details |
| :--- | :--- | :--- |
| **Dynamic data** | ✅ Complete | Dynamic ingestion layer via `POST /api/telemetry/ingest` & streaming pipeline. |
| **Real-time/latest data** | ✅ Complete | Live Open-Meteo REST API integration for real-time Pune weather and ambient conditions. |
| **ML prediction** | ✅ Complete | `BatteryPredictiveModel` loaded once at startup; runtime inference for range & SoH degradation. |
| **Data preprocessing** | ✅ Complete | `FeatureNormalizer` handles alias mapping, unit conversions (°F to °C), nulls, and outliers. |
| **Dashboard** | ✅ Complete | Updated UI with live stream indicators, last updated timestamp, auto-refresh (30s), and weather impact. |
| **Prediction history** | ✅ Complete | Stored in SQLite `prediction_history` table and rendered in an interactive audit table. |
| **API integration** | ✅ Complete | Open-Meteo REST API, FastAPI backend with CORS, and React `evoraApi` service layer. |
| **Database** | ✅ Complete | SQLite persistent database (`evora.db`) with tables for telemetry, predictions, sources, and bookings. |
| **Double Booking Prevention** | ✅ Complete | Enforced via unique constraint on `(station_id, date, time_slot)` returning HTTP 409. |

---

## 7. How to Run the Complete Project

### Prerequisites
- Python 3.10+ (Python 3.14 virtual environment configured in `backend/venv`)
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be running at `http://localhost:8000` (Interactive docs: `http://localhost:8000/docs`).

### 2. Start the Frontend Application
```bash
cd frontend
npm run dev
```
Frontend dashboard will be running at `http://localhost:5173`.

### 3. Run the Automated Test Suite
```bash
cd backend
source venv/bin/activate
python -m unittest tests/test_dynamic_pipeline.py
```

---

## 8. Environment Variables

### Backend (`backend/.env`)
```ini
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DATABASE_URL=sqlite:///./evora.db
SQLITE_DB_PATH=./evora.db
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1/forecast
DEFAULT_LATITUDE=18.5204
DEFAULT_LONGITUDE=73.8567
DEFAULT_CITY=Pune
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=
```

---

## 9. How to Change the Dynamic Data Source

- **To use a different weather location or API**:
  Modify `DEFAULT_LATITUDE` and `DEFAULT_LONGITUDE` in `backend/.env` or query `/api/telemetry/predict-range` with explicit `temperature_c` and `weather` fields.
- **To stream live telemetry from physical CAN bus / OBD-II device**:
  Send HTTP POST requests with sensor JSON to `http://localhost:8000/api/telemetry/ingest`.
- **To switch to production PostgreSQL**:
  Set `DATABASE_URL=postgresql://user:password@host:port/dbname` in `backend/.env`.

---

## 10. Limitations

1. **Weather Resolution**: Open-Meteo forecasts/observations update approximately every 15 minutes; in-memory cache is set to 10 minutes.
2. **OBD-II Hardware Link**: In the absence of a live physical Bluetooth CAN bus adapter plugged into a vehicle in Pune, the ingestion pipeline supports calibrated sequence stepping (`calibrated_telemetry_series.json`) and external HTTP ingestion packets.
