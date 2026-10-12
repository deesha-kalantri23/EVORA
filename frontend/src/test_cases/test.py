import sys
from pathlib import Path
import pytest

# Ensure the backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parents[3] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.telemetry import normalize_telemetry


def test_normalize_telemetry_with_valid_input():
    """Test normalization with basic valid battery level."""
    input_data = {
        "battery_level": 80
    }

    result = normalize_telemetry(input_data)

    assert result is not None
    assert isinstance(result, dict)
    assert result["soc_percentage"] == 80.0
    # Core model features should be filled with sensible defaults if missing
    assert "battery_temperature_c" in result
    assert "charge_cycles" in result


def test_normalize_telemetry_fractional_soc_and_soh():
    """Test that decimal fractions (0.0 - 1.0) for SoC and SoH are converted to percentages (0 - 100%)."""
    input_data = {
        "soc": 0.85,
        "soh": 0.94
    }

    result = normalize_telemetry(input_data)

    assert result["soc_percentage"] == 85.0
    assert result["soh_percentage"] == 94.0


def test_normalize_telemetry_fahrenheit_temperature_conversion():
    """Test that temperatures above 80 are interpreted as Fahrenheit and converted to Celsius."""
    # 95.0 °F = (95 - 32) * 5/9 = 35.0 °C
    input_data = {
        "temp_c": 95.0
    }

    result = normalize_telemetry(input_data)

    assert pytest.approx(result["battery_temperature_c"], 0.1) == 35.0


def test_normalize_telemetry_power_consumption_conversion():
    """Test that low power figures (< 50 kW) are converted into Wh/km."""
    # 25.0 kW * 6.5 = 162.5 Wh/km
    input_data = {
        "power_consumption": 25.0
    }

    result = normalize_telemetry(input_data)

    assert result["power_consumption_wh_per_km"] == 162.5


def test_normalize_telemetry_field_aliases():
    """Test that various field aliases from different IoT/CAN bus protocols resolve to standard names."""
    input_data = {
        "battery_soc": 74.5,
        "state_of_health": 92.0,
        "pack_voltage": 395.4,
        "pack_current": 18.2,
        "battery_temp": 29.5,
        "cycles": 340,
        "speed": 62.0,
        "odometer": 18450.0,
        "ambient_temp": 31.0
    }

    result = normalize_telemetry(input_data)

    assert result["soc_percentage"] == 74.5
    assert result["soh_percentage"] == 92.0
    assert result["battery_voltage_v"] == 395.4
    assert result["battery_current_a"] == 18.2
    assert result["battery_temperature_c"] == 29.5
    assert result["charge_cycles"] == 340
    assert result["speed_kmh"] == 62.0
    assert result["odometer_km"] == 18450.0
    assert result["ambient_temperature_c"] == 31.0


def test_normalize_telemetry_soc_clamping():
    """Test that out-of-range SoC values are clamped to [0.0, 100.0]."""
    underflow = normalize_telemetry({"soc_percentage": -15.0})
    overflow = normalize_telemetry({"soc_percentage": 140.0})

    assert underflow["soc_percentage"] == 0.0
    assert overflow["soc_percentage"] == 100.0


def test_normalize_telemetry_string_numbers_coercion():
    """Test type coercion for numeric fields provided as string inputs."""
    input_data = {
        "soc": "79.2",
        "cycles": "480",
        "voltage": "392.5",
        "speed": "48.6"
    }

    result = normalize_telemetry(input_data)

    assert result["soc_percentage"] == 79.2
    assert result["charge_cycles"] == 480
    assert result["battery_voltage_v"] == 392.5
    assert result["speed_kmh"] == 48.6


def test_normalize_telemetry_missing_features_fallbacks():
    """Test that sparse input uses defaults for missing required model features without raising errors."""
    sparse_input = {
        "voltage": 390.0
    }

    result, warnings = normalize_telemetry(sparse_input, return_warnings=True)

    assert result["battery_voltage_v"] == 390.0
    # Defaults applied
    assert result["soc_percentage"] == 78.0
    assert result["battery_temperature_c"] == 28.4
    assert result["charge_cycles"] == 421
    # Cell temp bounds automatically computed
    assert "cell_temp_min_c" in result
    assert "cell_temp_max_c" in result
    assert result["cell_temp_min_c"] < result["cell_temp_max_c"]
    # Warnings emitted
    assert len(warnings) > 0


def test_normalize_telemetry_metadata_preservation():
    """Test that metadata fields like vehicle_id, timestamp, and source_label are retained."""
    input_data = {
        "soc": 88.0,
        "vehicle_id": "v-custom-nexon",
        "timestamp": "2026-10-12T12:00:00Z",
        "source_label": "OBD2 Bluetooth Adapter"
    }

    result = normalize_telemetry(input_data)

    assert result["vehicle_id"] == "v-custom-nexon"
    assert result["timestamp"] == "2026-10-12T12:00:00Z"
    assert result["source_label"] == "OBD2 Bluetooth Adapter"


def test_normalize_telemetry_invalid_input_type():
    """Test that passing a non-dict input raises TypeError."""
    with pytest.raises(TypeError):
        normalize_telemetry("not-a-dictionary")

    with pytest.raises(TypeError):
        normalize_telemetry(None)


if __name__ == "__main__":
    print("Running telemetry normalization tests...")
    test_normalize_telemetry_with_valid_input()
    test_normalize_telemetry_fractional_soc_and_soh()
    test_normalize_telemetry_fahrenheit_temperature_conversion()
    test_normalize_telemetry_power_consumption_conversion()
    test_normalize_telemetry_field_aliases()
    test_normalize_telemetry_soc_clamping()
    test_normalize_telemetry_string_numbers_coercion()
    test_normalize_telemetry_missing_features_fallbacks()
    test_normalize_telemetry_metadata_preservation()
    test_normalize_telemetry_invalid_input_type()
    print("All telemetry normalization tests passed successfully!")
    