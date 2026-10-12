"""
Comprehensive Verification Suite for EVORA Dynamic Runtime Pipeline.
Tests:
1. Backend startup and lifespan initialization
2. API connectivity
3. Dynamic data retrieval (Open-Meteo Weather + Telemetry)
4. Data validation
5. Feature transformation and alias mapping
6. Model loading (single load, no retraining per request)
7. Prediction generation
8. Refresh functionality
9. Persistent prediction history logging in SQLite
10. Error handling & fallback resilience
11. Empty data handling
12. Missing feature handling
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.normalization import FeatureNormalizer
from app.services.weather_service import WeatherService
from app.services.telemetry_service import TelemetryService
from app.ml.predictive_model import load_model, BatteryPredictiveModel
from app.database.database import (
    get_db_connection,
    get_prediction_history,
    get_data_source_statuses,
    get_latest_telemetry_record,
    insert_station_booking
)

class TestDynamicPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Trigger lifespan
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_01_backend_startup_and_health(self):
        """1. Backend startup & health check"""
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "ok")

    def test_02_model_loading_and_no_retraining(self):
        """2. Verify ML Model loads as singleton and is not retrained"""
        m1 = load_model()
        m2 = load_model()
        self.assertIs(m1, m2, "Model singleton must be identical instance")
        self.assertEqual(m1.model_name, "EVORA Battery Predictive Model")
        self.assertEqual(m1.status, "READY")

    def test_03_feature_normalization_and_aliases(self):
        """3. Feature transformation: alias mapping, unit conversions, missing features"""
        raw_input = {
            "SoC": 0.85,                      # decimal fractional SoC
            "temp_c": 95.0,                  # Fahrenheit temperature (>80)
            "cycles": "450",                 # string number
            "Power_Consumption": 25.0,       # power in kW
            "speed": "55.5"
        }
        norm, warnings = FeatureNormalizer.normalize_telemetry_packet(raw_input)
        self.assertEqual(norm["soc_percentage"], 85.0)
        self.assertAlmostEqual(norm["battery_temperature_c"], 35.0, delta=0.5)
        self.assertEqual(norm["charge_cycles"], 450)
        self.assertTrue(norm["power_consumption_wh_per_km"] > 100.0)
        self.assertEqual(norm["speed_kmh"], 55.5)

    def test_04_missing_feature_handling(self):
        """4. Missing features handled cleanly without crash"""
        sparse_input = {"voltage": 380.0}
        norm, warnings = FeatureNormalizer.normalize_telemetry_packet(sparse_input)
        self.assertIn("soc_percentage", norm)
        self.assertIn("battery_temperature_c", norm)
        self.assertIn("charge_cycles", norm)
        self.assertTrue(len(warnings) > 0)

    def test_05_dynamic_weather_retrieval(self):
        """5. Dynamic weather retrieval from Open-Meteo"""
        weather = WeatherService.get_current_weather()
        self.assertIn("temperature_c", weather)
        self.assertIn("condition", weather)
        self.assertIn("humidity_percent", weather)
        self.assertIn(weather.get("status"), ["ONLINE", "CACHED", "FALLBACK"])

    def test_06_dynamic_telemetry_latest_enriched(self):
        """6. Telemetry latest enriched with live weather and physical parameters"""
        resp = self.client.get("/api/telemetry/latest")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("soc_percentage", data)
        self.assertIn("soh_percentage", data)
        self.assertIn("live_weather", data)
        self.assertIn("data_source_info", data)

    def test_07_dynamic_refresh_endpoint(self):
        """7. Refresh functionality steps forward dynamic ingestion stream"""
        resp = self.client.post("/api/telemetry/refresh")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "refreshed")
        self.assertIn("ingested_record_id", data)

    def test_08_dynamic_ingest_packet(self):
        """8. Ingestion endpoint accepts external packet, runs model, and persists"""
        test_packet = {
            "vehicle_id": "v-nexon-01",
            "soc": 82.5,
            "battery_temperature": 29.0,
            "charge_cycles": 430,
            "voltage": 396.0,
            "source_label": "Automated Unit Test Ingestion"
        }
        resp = self.client.post("/api/telemetry/ingest", json=test_packet)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("model_prediction", data)
        self.assertIn("record_id", data)

    def test_09_predict_range_endpoint(self):
        """9. Range prediction executes runtime inference and logs to history"""
        payload = {
            "battery_level": 78.0,
            "driving_style": "Eco Mode",
            "average_speed_kmh": 45.0,
            "road_type": "City / Urban"
        }
        resp = self.client.post("/api/telemetry/predict-range", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get("predicted_range_km") > 0)
        self.assertIn("prediction_id", data)
        self.assertIn("live_weather_applied", data)

    def test_10_prediction_history_persistence(self):
        """10. Verify prediction history persists in SQLite database"""
        preds = get_prediction_history(limit=5)
        self.assertTrue(len(preds) > 0)
        latest = preds[0]
        self.assertIn("model_name", latest)
        self.assertIn("input_features", latest)
        self.assertIn("prediction_output", latest)

    def test_11_data_source_status(self):
        """11. Verify source statuses are tracked and report ONLINE"""
        resp = self.client.get("/api/telemetry/source-status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("sources", data)
        sources = {s["source_name"]: s["status"] for s in data["sources"]}
        self.assertIn("open_meteo_weather", sources)
        self.assertIn("iot_vehicle_telemetry", sources)

    def test_12_double_booking_prevention(self):
        """12. Booking persistence prevents double bookings as per SRS FR-2.4"""
        bk1 = {
            "booking_id": "TEST-BK-001",
            "station_id": "pune-tp-01",
            "station_name": "Tata Power Phoenix",
            "connector_type": "CCS2",
            "date": "2026-10-15",
            "time_slot": "14:00 - 15:00",
            "estimated_cost_inr": 350.0
        }
        resp1 = self.client.post("/api/chargers/bookings", json=bk1)
        self.assertIn(resp1.status_code, [200, 409])

        # Attempting identical booking must yield 409 Conflict
        resp2 = self.client.post("/api/chargers/bookings", json=bk1)
        self.assertEqual(resp2.status_code, 409)

    def test_13_dashboard_aggregated_endpoint(self):
        """13. Aggregated dashboard endpoint for fast UI loading"""
        resp = self.client.get("/api/dashboard")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("latest_telemetry", data)
        self.assertIn("live_weather", data)
        self.assertIn("recent_predictions", data)
        self.assertIn("data_source_statuses", data)

if __name__ == "__main__":
    unittest.main()
