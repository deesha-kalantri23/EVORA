"""
Feature Compatibility & Normalization Layer for EVORA.
Transforms raw heterogeneous external inputs (IoT CAN bus packets, REST payloads,
OBD-II streams, CSV records) into normalized application fields and model feature vectors.

Handles:
- Field name aliasing
- Unit conversions (e.g., fractional 0.0-1.0 to 0-100%, °F to °C)
- Type coercion and null handling
- Missing feature detection
- Value range validation and sanitization
"""

from typing import Dict, Any, Tuple, List, Optional
import math

# Normalized application field schema definitions with accepted aliases
FIELD_ALIAS_MAP = {
    "soc_percentage": [
        "soc_percentage", "soc", "SoC", "battery_level", "state_of_charge",
        "current_soc", "battery_soc", "soc_pct", "battery_pct"
    ],
    "soh_percentage": [
        "soh_percentage", "soh", "SoH", "state_of_health", "battery_soh", "soh_pct"
    ],
    "battery_voltage_v": [
        "battery_voltage_v", "battery_voltage", "Battery_Voltage", "pack_voltage",
        "voltage", "volt", "voltage_v"
    ],
    "battery_current_a": [
        "battery_current_a", "battery_current", "Battery_Current", "pack_current",
        "current", "current_a"
    ],
    "battery_temperature_c": [
        "battery_temperature_c", "battery_temperature", "Battery_Temperature",
        "battery_temp", "pack_temp_c", "temp_c", "temperature_c"
    ],
    "charge_cycles": [
        "charge_cycles", "Charge_Cycles", "cycles", "cycle_count", "total_cycles"
    ],
    "power_consumption_wh_per_km": [
        "power_consumption_wh_per_km", "power_consumption", "Power_Consumption",
        "wh_per_km", "efficiency_wh_km", "power_wh_km"
    ],
    "speed_kmh": [
        "speed_kmh", "Driving_Speed", "speed", "driving_speed", "vehicle_speed_kmh"
    ],
    "motor_temperature_c": [
        "motor_temperature_c", "Motor_Temperature", "motor_temp", "motor_temp_c"
    ],
    "tire_pressure_psi": [
        "tire_pressure_psi", "Tire_Pressure", "tire_pressure"
    ],
    "odometer_km": [
        "odometer_km", "Distance_Traveled", "odometer", "distance_km", "total_km"
    ],
    "ambient_temperature_c": [
        "ambient_temperature_c", "Ambient_Temperature", "ambient_temp", "outside_temp_c"
    ],
    "ambient_humidity_percent": [
        "ambient_humidity_percent", "Ambient_Humidity", "humidity", "relative_humidity"
    ],
    "component_health_score": [
        "component_health_score", "Component_Health_Score", "health_score", "comp_health"
    ]
}

# Model required features and acceptable fallback / calculation methods
REQUIRED_MODEL_FEATURES = [
    "soc_percentage",
    "battery_temperature_c",
    "charge_cycles"
]

class FeatureNormalizer:
    @staticmethod
    def normalize_telemetry_packet(raw_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        """
        Takes raw dynamic data from any supported format and transforms it into
        the normalized application schema.
        Returns:
            (normalized_dict, warnings_list)
        """
        normalized: Dict[str, Any] = {}
        warnings: List[str] = []

        # 1. Alias Resolution
        for standard_key, aliases in FIELD_ALIAS_MAP.items():
            matched_value = None
            for alias in aliases:
                if alias in raw_data and raw_data[alias] is not None:
                    matched_value = raw_data[alias]
                    break

            if matched_value is not None:
                normalized[standard_key] = matched_value

        # 2. Type Coercion & Unit Conversions
        # SoC: Can be decimal 0.0-1.0 or percentage 0-100
        if "soc_percentage" in normalized:
            try:
                val = float(normalized["soc_percentage"])
                if 0.0 <= val <= 1.0:
                    val = val * 100.0
                normalized["soc_percentage"] = round(max(0.0, min(100.0, val)), 2)
            except (ValueError, TypeError):
                warnings.append("Invalid SoC type, clamped to baseline 78.0%")
                normalized["soc_percentage"] = 78.0

        # SoH: Can be decimal 0.0-1.0 or percentage 0-100
        if "soh_percentage" in normalized:
            try:
                val = float(normalized["soh_percentage"])
                if 0.0 <= val <= 1.0:
                    val = val * 100.0
                normalized["soh_percentage"] = round(max(0.0, min(100.0, val)), 2)
            except (ValueError, TypeError):
                warnings.append("Invalid SoH type, clamped to baseline 94.0%")
                normalized["soh_percentage"] = 94.0

        # Battery Temperature: check for Fahrenheit (> 100 is typically °F in ambient/pack sensor)
        if "battery_temperature_c" in normalized:
            try:
                temp = float(normalized["battery_temperature_c"])
                if temp > 80.0:  # likely Fahrenheit
                    celsius = (temp - 32.0) * (5.0 / 9.0)
                    warnings.append(f"Temperature {temp}°F converted to {round(celsius, 1)}°C")
                    temp = celsius
                normalized["battery_temperature_c"] = round(temp, 2)
            except (ValueError, TypeError):
                warnings.append("Invalid battery temp, fallback to 28.4°C")
                normalized["battery_temperature_c"] = 28.4

        # Battery Voltage
        if "battery_voltage_v" in normalized:
            try:
                normalized["battery_voltage_v"] = round(max(0.0, float(normalized["battery_voltage_v"])), 2)
            except (ValueError, TypeError):
                normalized["battery_voltage_v"] = 394.8

        # Battery Current
        if "battery_current_a" in normalized:
            try:
                normalized["battery_current_a"] = round(float(normalized["battery_current_a"]), 2)
            except (ValueError, TypeError):
                normalized["battery_current_a"] = 0.0

        # Charge Cycles
        if "charge_cycles" in normalized:
            try:
                normalized["charge_cycles"] = max(0, int(round(float(normalized["charge_cycles"]))))
            except (ValueError, TypeError):
                normalized["charge_cycles"] = 421

        # Power Consumption Wh/km
        if "power_consumption_wh_per_km" in normalized:
            try:
                val = float(normalized["power_consumption_wh_per_km"])
                # In some datasets, power is given in kW (e.g. 20-30 kW). Convert to ~130-180 Wh/km
                if val < 50.0:
                    val = val * 6.5
                normalized["power_consumption_wh_per_km"] = round(max(50.0, min(350.0, val)), 1)
            except (ValueError, TypeError):
                normalized["power_consumption_wh_per_km"] = 140.8

        # Speed
        if "speed_kmh" in normalized:
            try:
                normalized["speed_kmh"] = round(max(0.0, float(normalized["speed_kmh"])), 1)
            except (ValueError, TypeError):
                normalized["speed_kmh"] = 0.0

        # Ambient Temp
        if "ambient_temperature_c" in normalized:
            try:
                temp = float(normalized["ambient_temperature_c"])
                if temp > 80.0:
                    temp = (temp - 32.0) * (5.0 / 9.0)
                normalized["ambient_temperature_c"] = round(temp, 1)
            except (ValueError, TypeError):
                normalized["ambient_temperature_c"] = 28.0

        # Component Health
        if "component_health_score" in normalized:
            try:
                ch = float(normalized["component_health_score"])
                if 0.0 <= ch <= 1.0:
                    ch = ch * 100.0
                normalized["component_health_score"] = round(max(0.0, min(100.0, ch)), 1)
            except (ValueError, TypeError):
                normalized["component_health_score"] = 94.0

        # 3. Handle Missing Core Features
        missing_features = []
        for req in REQUIRED_MODEL_FEATURES:
            if req not in normalized:
                missing_features.append(req)

        if missing_features:
            warnings.append(f"Missing required model features: {missing_features}. Derived or fallback values applied.")
            if "soc_percentage" not in normalized:
                normalized["soc_percentage"] = 78.0
            if "battery_temperature_c" not in normalized:
                normalized["battery_temperature_c"] = 28.4
            if "charge_cycles" not in normalized:
                normalized["charge_cycles"] = 421

        # Calculate cell temp bounds if missing
        bt = normalized.get("battery_temperature_c", 28.4)
        if "cell_temp_min_c" not in normalized:
            normalized["cell_temp_min_c"] = round(bt - 0.8, 1)
        if "cell_temp_max_c" not in normalized:
            normalized["cell_temp_max_c"] = round(bt + 0.8, 1)

        # Retain metadata and timestamp
        normalized["timestamp"] = raw_data.get("timestamp") or raw_data.get("Timestamp")
        normalized["vehicle_id"] = raw_data.get("vehicle_id", "v-nexon-01")
        normalized["source_label"] = raw_data.get("source_label", "Dynamic Ingested Data")

        return normalized, warnings

    @staticmethod
    def extract_model_features(normalized: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts the exact feature dictionary required by BatteryPredictiveModel.
        """
        return {
            "current_cycles": int(normalized.get("charge_cycles", 421)),
            "average_temp": float(normalized.get("battery_temperature_c", 28.4)),
            "current_soc": float(normalized.get("soc_percentage", 78.0)),
            "current_soh": float(normalized.get("soh_percentage", 94.0)),
            "battery_capacity_kwh": 40.5,
            "efficiency_wh_per_km": float(normalized.get("power_consumption_wh_per_km", 140.8))
        }
