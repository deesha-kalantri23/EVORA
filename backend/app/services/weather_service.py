"""
Dynamic Weather Service integrating the Open-Meteo public REST API.
Provides live weather observations (temperature, relative humidity, wind speed, condition)
for Pune, Maharashtra and other locations to power weather-aware EV range predictions.
Implements TTL caching, timeout resilience, and automatic fallback.
"""

import time
import requests
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.database.database import update_data_source_status

DEFAULT_LAT = 18.5204
DEFAULT_LON = 73.8567
DEFAULT_CITY = "Pune"

CACHE_TTL_SECONDS = 600  # 10 minutes

_WEATHER_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "data": None
}

WMO_WEATHER_CODES = {
    0: ("Clear Sky", "Sunny / Clear"),
    1: ("Mainly Clear", "Sunny / Clear"),
    2: ("Partly Cloudy", "Partly Cloudy"),
    3: ("Overcast", "Overcast / Gloomy"),
    45: ("Fog", "Foggy / Mist"),
    48: ("Depositing Rime Fog", "Foggy"),
    51: ("Light Drizzle", "Light Rain / Drizzle"),
    53: ("Moderate Drizzle", "Rain"),
    55: ("Dense Drizzle", "Rain"),
    61: ("Slight Rain", "Light Rain"),
    63: ("Moderate Rain", "Rain / Monsoon"),
    65: ("Heavy Rain", "Monsoon Heavy Rain"),
    71: ("Slight Snow", "Snow"),
    80: ("Slight Rain Showers", "Rain Showers"),
    81: ("Moderate Rain Showers", "Rain Showers"),
    82: ("Violent Rain Showers", "Heavy Rain"),
    95: ("Thunderstorm", "Thunderstorm / Rain")
}

def decode_wmo_code(code: int) -> str:
    return WMO_WEATHER_CODES.get(code, ("Clear Sky", "Sunny / Clear"))[1]

class WeatherService:
    @staticmethod
    def get_current_weather(
        latitude: float = DEFAULT_LAT,
        longitude: float = DEFAULT_LON,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Fetches live current weather from the Open-Meteo API.
        Uses in-memory cache to prevent repetitive network requests.
        """
        global _WEATHER_CACHE
        now = time.time()

        cache_key = f"{round(latitude, 3)},{round(longitude, 3)}"
        cached_entry = _WEATHER_CACHE.get(cache_key)

        if not force_refresh and cached_entry and (now - cached_entry["timestamp"]) < CACHE_TTL_SECONDS:
            data = dict(cached_entry["data"])
            data["cache_status"] = "CACHED"
            data["age_seconds"] = int(now - cached_entry["timestamp"])
            return data

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
            "timezone": "auto"
        }

        try:
            resp = requests.get(url, params=params, timeout=4.0)
            if resp.status_code == 200:
                payload = resp.json()
                current = payload.get("current", {})
                temp = float(current.get("temperature_2m", 30.0))
                humidity = float(current.get("relative_humidity_2m", 50.0))
                wind = float(current.get("wind_speed_10m", 3.0))
                wmo_code = int(current.get("weather_code", 1))
                condition_desc = decode_wmo_code(wmo_code)
                fetched_at = datetime.now(timezone.utc).isoformat()

                weather_result = {
                    "city": DEFAULT_CITY if (abs(latitude - DEFAULT_LAT) < 0.1 and abs(longitude - DEFAULT_LON) < 0.1) else "Detected Location",
                    "latitude": latitude,
                    "longitude": longitude,
                    "temperature_c": round(temp, 1),
                    "humidity_percent": round(humidity, 1),
                    "wind_speed_kmh": round(wind, 1),
                    "weather_code": wmo_code,
                    "condition": condition_desc,
                    "fetched_at": fetched_at,
                    "source": "Open-Meteo Live API",
                    "status": "ONLINE",
                    "cache_status": "FRESH"
                }

                _WEATHER_CACHE[cache_key] = {
                    "timestamp": now,
                    "data": weather_result
                }

                update_data_source_status(
                    source_name="open_meteo_weather",
                    source_type="Public REST API",
                    status="ONLINE",
                    endpoint_url=url,
                    records_count=1,
                    last_error=None,
                    metadata={"last_temp": temp, "condition": condition_desc, "city": DEFAULT_CITY}
                )

                return weather_result

            else:
                raise ValueError(f"HTTP {resp.status_code}: {resp.text}")

        except Exception as e:
            # Fallback handling
            err_msg = str(e)
            update_data_source_status(
                source_name="open_meteo_weather",
                source_type="Public REST API",
                status="DEGRADED",
                endpoint_url=url,
                last_error=err_msg
            )

            # Return realistic fallback
            now_iso = datetime.now(timezone.utc).isoformat()
            fallback_result = {
                "city": DEFAULT_CITY,
                "latitude": latitude,
                "longitude": longitude,
                "temperature_c": 31.5,
                "humidity_percent": 45.0,
                "wind_speed_kmh": 6.5,
                "weather_code": 1,
                "condition": "Sunny / Clear",
                "fetched_at": now_iso,
                "source": "Open-Meteo (Cached Fallback)",
                "status": "FALLBACK",
                "cache_status": "FALLBACK",
                "error": err_msg
            }
            return fallback_result
