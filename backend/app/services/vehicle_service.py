"""
Vehicle management service for user's registered EV profiles.
India-focused EV portfolio models (Tata Motors, MG India, Mahindra, Hyundai).
"""

from typing import List, Dict, Any, Optional

MY_VEHICLES: List[Dict[str, Any]] = [
    {
        "id": "v-nexon-01",
        "make": "Tata",
        "model": "Nexon EV",
        "variant": "Long Range",
        "year": 2025,
        "battery_capacity_kwh": 40.5,
        "current_soc_percentage": 78.0,
        "battery_health_percentage": 94.0,
        "rated_range_km": 465,
        "real_world_range_km": 100,
        "avg_efficiency_km_per_kwh": 7.1,
        "charging_type": "AC + DC",
        "connector_supported": ["CCS2", "Type 2 AC"],
        "max_ac_charging_kw": 7.2,
        "max_dc_charging_kw": 50.0,
        "vin": "MAT624589P2E99012",
        "license_plate": "MH 12 TE 4590",
        "odometer_km": 18420.0,
        "city": "Pune",
        "state": "Maharashtra",
        "connected_status": "Active (Demo Telemetry)",
        "is_primary": True
    },
    {
        "id": "v-mg-02",
        "make": "MG",
        "model": "ZS EV",
        "variant": "Exclusive Pro",
        "year": 2024,
        "battery_capacity_kwh": 50.3,
        "current_soc_percentage": 65.0,
        "battery_health_percentage": 96.0,
        "rated_range_km": 461,
        "real_world_range_km": 340,
        "avg_efficiency_km_per_kwh": 6.8,
        "charging_type": "AC + DC",
        "connector_supported": ["CCS2", "Type 2 AC"],
        "max_ac_charging_kw": 7.4,
        "max_dc_charging_kw": 50.0,
        "vin": "MAJ891200K4T11983",
        "license_plate": "MH 14 EV 9821",
        "odometer_km": 12200.0,
        "city": "Pune",
        "state": "Maharashtra",
        "connected_status": "Standby (Demo Profile)",
        "is_primary": False
    }
]

class VehicleService:
    @staticmethod
    def get_user_vehicles() -> List[Dict[str, Any]]:
        return MY_VEHICLES

    @staticmethod
    def get_vehicle_by_id(vehicle_id: str) -> Optional[Dict[str, Any]]:
        for v in MY_VEHICLES:
            if v["id"] == vehicle_id:
                return v
        return None

    @staticmethod
    def update_vehicle(vehicle_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for v in MY_VEHICLES:
            if v["id"] == vehicle_id:
                v.update(updates)
                return v
        return None
