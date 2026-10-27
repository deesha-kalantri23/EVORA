"""
Test Suite: API Endpoint Testing for EVORA Charger Endpoints.
Tests the /api/chargers list, filter, and detail endpoints.
Avoids duplicating root and health tests already in test_api.py.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ── TC-API-01: List all chargers returns 200 with valid structure ──
def test_list_chargers_returns_valid_response():
    """Verify GET /api/chargers returns 200 with count, total, and stations list."""
    response = client.get("/api/chargers")

    assert response.status_code == 200

    data = response.json()
    assert "count" in data
    assert "total" in data
    assert "stations" in data
    assert isinstance(data["stations"], list)
    assert data["count"] > 0
    assert data["total"] > 0


# ── TC-API-02: Filter chargers by city returns only matching stations ──
def test_filter_chargers_by_city_pune():
    """Verify GET /api/chargers?city=Pune returns only Pune stations."""
    response = client.get("/api/chargers", params={"city": "Pune"})

    assert response.status_code == 200

    data = response.json()
    stations = data["stations"]
    assert len(stations) > 0

    for station in stations:
        assert station["city"] == "Pune"


# ── TC-API-03: Get station detail by valid ID returns station data ──
def test_get_station_detail_valid_id():
    """Verify GET /api/chargers/{station_id} returns station detail for a known ID."""
    response = client.get("/api/chargers/pune-tp-01")

    assert response.status_code == 200

    data = response.json()
    assert "station" in data
    station = data["station"]
    assert station["id"] == "pune-tp-01"
    assert station["city"] == "Pune"
    assert station["operator"] == "Tata Power"


# ── TC-API-04: Get station detail with invalid ID returns 404 ──
def test_get_station_detail_invalid_id():
    """Verify GET /api/chargers/{station_id} returns 404 for a non-existent station."""
    response = client.get("/api/chargers/non-existent-station-xyz")

    assert response.status_code == 404

    data = response.json()
    assert "detail" in data
