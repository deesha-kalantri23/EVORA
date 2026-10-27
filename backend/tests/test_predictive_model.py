"""
Test Suite: Predictive ML Model Testing for EVORA.
Tests BatteryPredictiveModel.calculate_soh() and assess_range_anxiety()
with valid and edge-case inputs.
Does NOT duplicate model singleton tests from test_dynamic_pipeline.py.
"""

import pytest
from app.ml.predictive_model import BatteryPredictiveModel


@pytest.fixture
def model():
    """Create a fresh model instance for testing (does not use the global singleton)."""
    return BatteryPredictiveModel()


# ═══════════════════════════════════════════════════════════════════
#  calculate_soh() Tests
# ═══════════════════════════════════════════════════════════════════

# ── TC-ML-01: SoH with low cycles and normal temperature ──
def test_calculate_soh_low_cycles_normal_temp(model):
    """New battery with few cycles at 25°C should have SoH very close to 100%."""
    soh = model.calculate_soh(cycles=50, average_temp=25.0)

    assert isinstance(soh, float)
    assert 99.0 <= soh <= 100.0


# ── TC-ML-02: SoH with high cycles and elevated temperature ──
def test_calculate_soh_high_cycles_high_temp(model):
    """Heavily used battery at high temperature should show significant degradation."""
    soh = model.calculate_soh(cycles=800, average_temp=42.0)

    assert isinstance(soh, float)
    # High cycles + thermal stress → SoH should be noticeably below 100
    assert soh < 98.0
    # But model clamps at minimum 70%
    assert soh >= 70.0


# ── TC-ML-03: SoH never drops below 70% floor ──
def test_calculate_soh_extreme_degradation_clamps_at_70(model):
    """Even with extreme cycles and temperature, SoH should never go below 70%."""
    soh = model.calculate_soh(cycles=5000, average_temp=55.0)

    assert soh == 70.0


# ── TC-ML-04: SoH with zero cycles returns 100% ──
def test_calculate_soh_zero_cycles(model):
    """Brand new battery (0 cycles) should have exactly 100% SoH."""
    soh = model.calculate_soh(cycles=0, average_temp=25.0)

    assert soh == 100.0


# ═══════════════════════════════════════════════════════════════════
#  assess_range_anxiety() Tests
# ═══════════════════════════════════════════════════════════════════

# ── TC-ML-05: High SoC with short trip → Low risk ──
def test_range_anxiety_low_risk(model):
    """85% SoC with a 20km trip should yield Low risk."""
    result = model.assess_range_anxiety(
        current_soc=85.0,
        battery_capacity_kwh=40.5,
        efficiency_wh_per_km=140.0,
        trip_distance_km=20.0,
        ac_on=False,
        traffic_factor=1.0
    )

    assert result["risk_level"] == "Low"
    assert result["risk_color"] == "#10B981"
    assert result["estimated_range_km"] > 0
    assert result["buffer_headroom_km"] >= 35.0


# ── TC-ML-06: Low SoC with long trip → High risk ──
def test_range_anxiety_high_risk(model):
    """15% SoC with a 50km trip should yield High risk."""
    result = model.assess_range_anxiety(
        current_soc=15.0,
        battery_capacity_kwh=40.5,
        efficiency_wh_per_km=140.0,
        trip_distance_km=50.0,
        ac_on=True,
        traffic_factor=1.2
    )

    assert result["risk_level"] == "High"
    assert result["risk_color"] == "#EF4444"
    assert result["buffer_headroom_km"] < 15.0
    assert "charging stop" in result["recommendation"].lower()


# ── TC-ML-07: Zero SoC edge case ──
def test_range_anxiety_zero_soc(model):
    """0% SoC should give 0 km range and High risk regardless of trip distance."""
    result = model.assess_range_anxiety(
        current_soc=0.0,
        battery_capacity_kwh=40.5,
        efficiency_wh_per_km=140.0,
        trip_distance_km=10.0
    )

    assert result["estimated_range_km"] == 0.0
    assert result["risk_level"] == "High"


# ── TC-ML-08: Output structure contains all required keys ──
def test_range_anxiety_output_structure(model):
    """Verify the output dictionary contains all expected keys."""
    result = model.assess_range_anxiety(
        current_soc=60.0,
        battery_capacity_kwh=40.5,
        efficiency_wh_per_km=140.0,
        trip_distance_km=30.0
    )

    expected_keys = [
        "risk_level", "risk_color", "current_soc_percent",
        "estimated_range_km", "trip_distance_km", "buffer_headroom_km",
        "safety_margin_percent", "recommendation", "data_label"
    ]
    for key in expected_keys:
        assert key in result, f"Missing key: {key}"
