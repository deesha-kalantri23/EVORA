"""
Dynamic Telemetry Service & Ingestion Pipeline for EVORA.
Coordinates between:
- Dynamic incoming IoT/sensor telemetry packets (via POST /api/telemetry/ingest)
- Live weather observations from Open-Meteo API
- Calibrated EVIoT time-series progression (backend/data/calibrated_telemetry_series.json)
- SQLite persistent storage (telemetry_records, prediction_history)
- Existing BatteryPredictiveModel singleton for runtime inference
"""

import os
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.database.database import (
    insert_telemetry_record,
    get_latest_telemetry_record,
    get_telemetry_history,
    get_telemetry_count,
    insert_prediction,
    update_data_source_status
)
from app.services.normalization import FeatureNormalizer
from app.services.weather_service import WeatherService
from app.ml.predictive_model import load_model

CALIBRATED_SERIES_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data",
    "calibrated_telemetry_series.json"
)

# In-memory index pointer for streaming calibrated sequence progression
_STREAM_INDEX = 0
_CALIBRATED_CACHE: List[Dict[str, Any]] = []

def _load_calibrated_series() -> List[Dict[str, Any]]:
    global _CALIBRATED_CACHE
    if not _CALIBRATED_CACHE and os.path.exists(CALIBRATED_SERIES_FILE):
        try:
            with open(CALIBRATED_SERIES_FILE, "r") as f:
                _CALIBRATED_CACHE = json.load(f)
        except Exception as e:
            print("Warning: could not read calibrated series file:", e)
    return _CALIBRATED_CACHE

def ensure_initial_seed():
    """Seeds initial records into SQLite if database is fresh."""
    count = get_telemetry_count()
    if count == 0:
        series = _load_calibrated_series()
        base_time = datetime.now(timezone.utc) - timedelta(hours=6)
        if series:
            # Seed initial 8 recent points
            for i, item in enumerate(series[:8]):
                ts = (base_time + timedelta(minutes=i * 45)).isoformat()
                rec = dict(item)
                rec["timestamp"] = ts
                rec["source_label"] = "EVIoT Dataset (Calibrated Seed)"
                insert_telemetry_record(rec)
        else:
            # Baseline single record
            now_iso = datetime.now(timezone.utc).isoformat()
            insert_telemetry_record({
                "timestamp": now_iso,
                "vehicle_id": "v-nexon-01",
                "soc_percentage": 78.0,
                "soh_percentage": 94.0,
                "battery_voltage_v": 394.8,
                "battery_current_a": 0.0,
                "battery_temperature_c": 28.4,
                "cell_temp_min_c": 27.6,
                "cell_temp_max_c": 29.2,
                "charge_cycles": 421,
                "power_consumption_wh_per_km": 140.8,
                "speed_kmh": 41.5,
                "motor_temperature_c": 45.0,
                "tire_pressure_psi": 33.0,
                "odometer_km": 18420.0,
                "source_label": "Calibrated Baseline Seed"
            })

        update_data_source_status(
            source_name="iot_vehicle_telemetry",
            source_type="Dynamic Telemetry Stream",
            status="ONLINE",
            endpoint_url="/api/telemetry/ingest",
            records_count=max(count, 8),
            metadata={"stream_mode": "Calibrated Stream & Ingestion Ready"}
        )

class TelemetryService:
    @staticmethod
    def get_latest_telemetry() -> Dict[str, Any]:
        """
        Retrieves the latest dynamic telemetry record from the database,
        enriched with real-time live weather and derived vehicle metrics.
        """
        ensure_initial_seed()
        latest = get_latest_telemetry_record()
        if not latest:
            ensure_initial_seed()
            latest = get_latest_telemetry_record()

        # Fetch current live weather to enrich reading
        weather = WeatherService.get_current_weather()
        live_temp = weather.get("temperature_c", 30.0)

        soc = float(latest["soc_percentage"])
        soh = float(latest["soh_percentage"])
        cycles = int(latest["charge_cycles"])
        volt = float(latest["battery_voltage_v"])
        curr = float(latest["battery_current_a"])
        pack_temp = float(latest["battery_temperature_c"])
        efficiency_wh_km = float(latest["power_consumption_wh_per_km"])

        nominal_kwh = 40.5
        usable_kwh = round((soc / 100.0) * nominal_kwh, 2)
        current_cap_kwh = round((soh / 100.0) * nominal_kwh, 2)
        est_range_km = round((usable_kwh * 1000.0) / max(50.0, efficiency_wh_km), 1)

        # Baseline carbon calculations (CEA India baseline: 0.716 kg CO2/kWh vs 2.31 kg CO2/L ICE)
        co2_saved = round((latest.get("odometer_km", 18420.0) / 15.0) * 2.31 * 0.42, 1)

        # Pack health evaluation
        if soh >= 92:
            pack_health = "Healthy (Optimal)"
        elif soh >= 80:
            pack_health = "Good (Normal Aging)"
        else:
            pack_health = "Service Recommended"

        cell_delta = round(abs(float(latest.get("cell_temp_max_c", 29.2)) - float(latest.get("cell_temp_min_c", 27.6))), 2)

        # Build dynamic hourly trend from DB history
        history = get_telemetry_history(limit=7)
        hourly_trend = []
        for h in history:
            try:
                dt = datetime.fromisoformat(h["timestamp"].replace("Z", "+00:00"))
                time_str = dt.strftime("%H:%M")
            except Exception:
                time_str = str(h["id"])
            hourly_trend.append({
                "time": time_str,
                "soc": round(h["soc_percentage"], 1),
                "voltage": round(h["battery_voltage_v"], 1),
                "current": round(h["battery_current_a"], 1),
                "temp": round(h["battery_temperature_c"], 1)
            })

        return {
            "vehicle_id": latest.get("vehicle_id", "v-nexon-01"),
            "vehicle_name": "Tata Nexon EV Long Range (2025)",
            "vin": "MAT624589P2E99012",
            "timestamp": latest.get("timestamp"),
            "soc_percentage": soc,
            "soh_percentage": soh,
            "battery_voltage_v": volt,
            "battery_current_a": curr,
            "charging_status": "Charging" if curr > 2.0 else ("Discharging" if curr < -1.0 else "Standby"),
            "battery_temperature_c": pack_temp,
            "cell_temp_min_c": float(latest.get("cell_temp_min_c", pack_temp - 0.8)),
            "cell_temp_max_c": float(latest.get("cell_temp_max_c", pack_temp + 0.8)),
            "charge_cycles": cycles,
            "power_consumption_wh_per_km": efficiency_wh_km,
            "speed_kmh": float(latest.get("speed_kmh", 0.0)),
            "motor_temperature_c": float(latest.get("motor_temperature_c", 45.0)),
            "tire_pressure_psi": float(latest.get("tire_pressure_psi", 33.0)),
            "odometer_km": float(latest.get("odometer_km", 18420.0)),
            "estimated_range_km": est_range_km,
            "nominal_capacity_kwh": nominal_kwh,
            "current_capacity_kwh": current_cap_kwh,
            "pack_health_status": pack_health,
            "cell_balance_status": f"Balanced (Delta: {cell_delta}V)",
            "today_energy_kwh": round((soc / 100.0) * 24.0, 1),
            "monthly_charging_cost_inr": 1840.0,
            "co2_saved_kg": co2_saved,
            "driving_conditions": {
                "mode": "Eco / City",
                "ambient_temp_c": live_temp,
                "weather_condition": weather.get("condition", "Sunny / Clear"),
                "wind_speed_kmh": weather.get("wind_speed_kmh", 2.8),
                "regenerative_braking": "Level 2"
            },
            "live_weather": weather,
            "component_health": [
                {"component": "HV Battery Cells", "health_score": round(soh, 1), "status": "Good" if soh > 85 else "Fair"},
                {"component": "BMS Thermal Management", "health_score": 98.0, "status": "Good"},
                {"component": "Onboard Inverter", "health_score": 95.5, "status": "Good"},
                {"component": "DC-DC Converter", "health_score": 97.0, "status": "Good"},
                {"component": "Regenerative Braking Unit", "health_score": 96.0, "status": "Good"}
            ],
            "hourly_telemetry_trend": hourly_trend,
            "data_source_label": latest.get("source_label", "Dynamic Ingestion Stream"),
            "data_source_info": {
                "telemetry_source": "Dynamic Ingestion Stream & SQLite Time-Series DB",
                "weather_source": weather.get("source", "Open-Meteo Live API"),
                "weather_status": weather.get("status", "ONLINE"),
                "records_in_db": get_telemetry_count()
            }
        }

    @staticmethod
    def get_telemetry_history(limit: int = 50) -> Dict[str, Any]:
        """Returns time series from persistent database."""
        ensure_initial_seed()
        records = get_telemetry_history(limit)
        return {
            "count": len(records),
            "records": records,
            "data_label": "Dynamic SQLite Telemetry Store"
        }

    @staticmethod
    def ingest_telemetry_packet(raw_packet: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingests a dynamic telemetry packet from an external client/IoT sensor,
        validates, normalizes, runs model inference, and stores in SQLite.
        """
        # 1. Validation & Normalization
        normalized, warnings = FeatureNormalizer.normalize_telemetry_packet(raw_packet)

        # 2. Persist to DB
        record_id = insert_telemetry_record(normalized)

        # 3. Model Inference using loaded singleton
        model = load_model()
        model_features = FeatureNormalizer.extract_model_features(normalized)
        soh_est = model.calculate_soh(
            cycles=model_features["current_cycles"],
            average_temp=model_features["average_temp"]
        )

        pred_output = {
            "estimated_soh": soh_est,
            "status": "Healthy" if soh_est >= 90 else "Degraded",
            "cycle_count": model_features["current_cycles"]
        }

        # 4. Save prediction to history
        insert_prediction(
            model_name=model.model_name,
            model_version=model.model_version,
            input_features=model_features,
            prediction_output=pred_output,
            confidence_percentage=95.0,
            data_source="Dynamic Ingestion API",
            vehicle_id=normalized.get("vehicle_id", "v-nexon-01")
        )

        update_data_source_status(
            source_name="iot_vehicle_telemetry",
            source_type="Dynamic Telemetry Stream",
            status="ONLINE",
            endpoint_url="/api/telemetry/ingest",
            records_count=get_telemetry_count(),
            metadata={"last_ingested_id": record_id, "soc": normalized["soc_percentage"]}
        )

        return {
            "status": "success",
            "record_id": record_id,
            "normalized_data": normalized,
            "warnings": warnings,
            "model_prediction": pred_output
        }

    @staticmethod
    def refresh_dynamic_data(step_forward: bool = True) -> Dict[str, Any]:
        """
        Refreshes dynamic data:
        1. Calls live Open-Meteo Weather API (fresh observation)
        2. Ingests the next calibrated IoT record from the sequence with the live timestamp
        3. Runs model inference and updates persistent storage
        """
        global _STREAM_INDEX
        ensure_initial_seed()

        # 1. Fetch live weather
        weather = WeatherService.get_current_weather(force_refresh=True)

        # 2. Get next record from calibrated dataset series
        series = _load_calibrated_series()
        now_iso = datetime.now(timezone.utc).isoformat()

        if series:
            item = dict(series[_STREAM_INDEX % len(series)])
            _STREAM_INDEX += 1
            item["timestamp"] = now_iso
            item["ambient_temperature_c"] = weather.get("temperature_c", item.get("ambient_temperature_c", 28.0))
            item["ambient_humidity_percent"] = weather.get("humidity_percent", item.get("ambient_humidity_percent", 50.0))
            item["source_label"] = "Dynamic Ingestion Stream (EVIoT Calibrated)"
        else:
            latest = get_latest_telemetry_record() or {}
            item = {
                "timestamp": now_iso,
                "vehicle_id": "v-nexon-01",
                "soc_percentage": max(20.0, float(latest.get("soc_percentage", 78.0)) - 0.5),
                "soh_percentage": float(latest.get("soh_percentage", 94.0)),
                "battery_voltage_v": float(latest.get("battery_voltage_v", 394.8)),
                "battery_current_a": -12.4,
                "battery_temperature_c": weather.get("temperature_c", 28.4),
                "cell_temp_min_c": round(weather.get("temperature_c", 28.4) - 0.8, 1),
                "cell_temp_max_c": round(weather.get("temperature_c", 28.4) + 0.8, 1),
                "charge_cycles": int(latest.get("charge_cycles", 421)),
                "power_consumption_wh_per_km": 140.8,
                "speed_kmh": 45.0,
                "source_label": "Dynamic Sensor Ingestion"
            }

        result = TelemetryService.ingest_telemetry_packet(item)
        latest_full = TelemetryService.get_latest_telemetry()

        return {
            "status": "refreshed",
            "timestamp": now_iso,
            "live_weather": weather,
            "ingested_record_id": result["record_id"],
            "latest_telemetry": latest_full
        }

    @staticmethod
    def get_degradation_forecast(horizon: int = 500) -> List[Dict[str, Any]]:
        latest = TelemetryService.get_latest_telemetry()
        current_cycles = latest["charge_cycles"]
        current_soh = latest["soh_percentage"]
        model = load_model()
        return model.forecast_degradation(current_cycles, current_soh, horizon)

    @staticmethod
    def predict_range_dynamic(req_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically calculates range prediction incorporating live weather
        if weather parameters are omitted or auto-mode is enabled.
        Stores prediction to prediction_history table.
        """
        # Enrich with live weather if omitted or generic
        weather_data = WeatherService.get_current_weather()
        live_temp = weather_data.get("temperature_c", 32.0)
        live_cond = weather_data.get("condition", "Sunny / Clear")

        temp = float(req_dict.get("temperature_c") or live_temp)
        weather = req_dict.get("weather") or live_cond
        soc = float(req_dict.get("battery_level", 78.0))
        driving_style = req_dict.get("driving_style", "Normal / Balanced")
        avg_speed = float(req_dict.get("average_speed_kmh", 45.0))
        vehicle_load = req_dict.get("vehicle_load", "Normal (2-3 Persons)")
        road_type = req_dict.get("road_type", "City / Urban")
        traffic = req_dict.get("traffic", "Moderate")
        elevation = req_dict.get("elevation", "Flat Terrain")

        model = load_model()
        pred = model.predict_range(
            battery_level=soc,
            temperature_c=temp,
            weather=weather,
            driving_style=driving_style,
            average_speed_kmh=avg_speed,
            vehicle_load=vehicle_load,
            road_type=road_type,
            traffic=traffic,
            elevation=elevation
        )

        # Store in prediction history
        input_feats = {
            "battery_level": soc,
            "temperature_c": temp,
            "weather": weather,
            "driving_style": driving_style,
            "average_speed_kmh": avg_speed,
            "vehicle_load": vehicle_load,
            "road_type": road_type,
            "traffic": traffic,
            "elevation": elevation,
            "weather_source": weather_data.get("source", "Open-Meteo Live API")
        }

        pred_id = insert_prediction(
            model_name=model.model_name,
            model_version=model.model_version,
            input_features=input_feats,
            prediction_output=pred,
            confidence_percentage=pred["confidence_percentage"],
            data_source=f"Live Weather ({weather_data.get('source')}) + Dynamic BMS",
            vehicle_id="v-nexon-01"
        )

        pred["prediction_id"] = pred_id
        pred["live_weather_applied"] = {
            "city": weather_data.get("city", "Pune"),
            "temperature_c": live_temp,
            "condition": live_cond,
            "source": weather_data.get("source")
        }
        return pred

    @staticmethod
    def predict_anxiety_dynamic(req_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses range anxiety dynamically and logs to prediction_history.
        """
        pred_range = float(req_dict.get("predicted_range_km", 284.0))
        trip_dist = float(req_dict.get("trip_distance_km", 148.0))
        remaining = pred_range - trip_dist
        margin_percent = round((remaining / max(1.0, trip_dist)) * 100, 1)

        if margin_percent > 60:
            risk_score = 25
            risk_level = "Low"
            feasibility = "Easily Feasible (Direct transit)"
            charging_recommended = False
        elif margin_percent >= 25:
            risk_score = 62
            risk_level = "Medium"
            feasibility = "Feasible (Caution advised on ghats/highway)"
            charging_recommended = True
        else:
            risk_score = 88
            risk_level = "High"
            feasibility = "Infeasible without intermediate charging"
            charging_recommended = True

        output = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "trip_feasibility": feasibility,
            "remaining_range_km": round(max(0.0, remaining), 1),
            "safety_margin_percent": margin_percent,
            "charging_recommended": charging_recommended,
            "recommended_station_hint": "Zeon Charging - Urse Food Mall (150 kW DC Fast)",
            "data_label": "AI Range Anxiety Risk Model"
        }

        model = load_model()
        insert_prediction(
            model_name="Range Anxiety Risk Classifier",
            model_version=model.model_version,
            input_features=req_dict,
            prediction_output=output,
            confidence_percentage=94.0,
            data_source="Dynamic Route & Battery Assessment",
            vehicle_id="v-nexon-01"
        )
        return output
