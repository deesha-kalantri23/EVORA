"""
Test Suite: Station Operations Testing for EVORA.
Tests StationService.get_station_by_id() and get_all_stations() from
backend/app/services/station_service.py.
Does NOT duplicate booking or corridor tests from test_dynamic_pipeline.py.
"""

import pytest
from app.services.station_service import StationService


# ═══════════════════════════════════════════════════════════════════
#  get_station_by_id() Tests
# ═══════════════════════════════════════════════════════════════════

# ── TC-STA-01: Retrieve station with valid existing ID ──
def test_get_station_by_id_valid():
    """Known station ID 'pune-tp-01' should return a matching station dict."""
    station = StationService.get_station_by_id("pune-tp-01")

    assert station is not None
    assert station["id"] == "pune-tp-01"
    assert station["name"] == "Tata Power EZ Charge - Phoenix Marketcity"
    assert station["city"] == "Pune"
    assert station["operator"] == "Tata Power"
    assert station["power_kw"] == 60.0


# ── TC-STA-02: Retrieve station with non-existent ID returns None ──
def test_get_station_by_id_invalid():
    """Non-existent station ID should return None (not raise an exception)."""
    station = StationService.get_station_by_id("fake-station-999")

    assert station is None


# ── TC-STA-03: Retrieve station with empty string ID returns None ──
def test_get_station_by_id_empty_string():
    """Empty string station ID should return None."""
    station = StationService.get_station_by_id("")

    assert station is None


# ═══════════════════════════════════════════════════════════════════
#  get_all_stations() Tests
# ═══════════════════════════════════════════════════════════════════

# ── TC-STA-04: Get all stations without filters returns full dataset ──
def test_get_all_stations_no_filters():
    """Calling get_all_stations() with no filters should return all stations."""
    result = StationService.get_all_stations()

    assert isinstance(result, dict)
    assert "stations" in result
    assert "total" in result
    assert result["total"] > 0
    assert len(result["stations"]) == result["total"]


# ── TC-STA-05: Filter stations by city returns only matching results ──
def test_get_all_stations_filter_by_city():
    """Filtering by city='Mumbai' should return only Mumbai stations."""
    result = StationService.get_all_stations(city="Mumbai")

    stations = result["stations"]
    assert len(stations) > 0

    for station in stations:
        assert station["city"] == "Mumbai"


# ── TC-STA-06: Filter by non-existent city returns empty list ──
def test_get_all_stations_filter_nonexistent_city():
    """Filtering by a city that doesn't exist in the dataset should return 0 stations."""
    result = StationService.get_all_stations(city="Atlantis")

    assert result["total"] == 0
    assert len(result["stations"]) == 0


# ── TC-STA-07: Filter by minimum power excludes low-power stations ──
def test_get_all_stations_filter_min_power():
    """Filtering by min_power=120 should only return stations with 120+ kW."""
    result = StationService.get_all_stations(min_power=120.0)

    stations = result["stations"]
    assert len(stations) > 0

    for station in stations:
        assert station["power_kw"] >= 120.0


# ── TC-STA-08: Search query matches station name or address ──
def test_get_all_stations_search_query():
    """Searching for 'Tata Power' should return only Tata Power operated stations."""
    result = StationService.get_all_stations(search="Tata Power")

    stations = result["stations"]
    assert len(stations) > 0

    for station in stations:
        assert (
            "tata power" in station["name"].lower()
            or "tata power" in station["operator"].lower()
            or "tata power" in station["address"].lower()
        )
