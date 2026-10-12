from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.telemetry_service import TelemetryService
from app.services.station_service import StationService

router = APIRouter(prefix="/ai", tags=["EVORA AI Assistant"])

class ChatRequest(BaseModel):
    query: str
    vehicle_context: Optional[Dict[str, Any]] = None

class ChatAction(BaseModel):
    label: str
    route: str
    description: str

class ChatResponse(BaseModel):
    reply: str
    action: Optional[ChatAction] = None
    data_label: str = "AI Prototype"
    provider: str = "EVORA AI Service Layer"

@router.post("/chat", response_model=ChatResponse)
def handle_ai_chat(req: ChatRequest):
    q = req.query.lower().strip()
    tel = TelemetryService.get_latest_telemetry()
    soh = tel.get("soh_percentage", 94.0)
    soc = tel.get("soc_percentage", 78.0)
    cycles = tel.get("charge_cycles", 421)
    temp = tel.get("battery_temperature_c", 28.4)
    volt = tel.get("battery_voltage_v", 394.8)
    est_range = int((soc / 100.0) * 100.0)  # 100km at 100% SoC benchmark

    # 1. Battery Health Query
    if "battery" in q and ("health" in q or "healthy" in q or "soh" in q or "degrad" in q):
        return ChatResponse(
            reply=f"Battery is Healthy: {soh}% SoH across {cycles} cycles with pack temp at {temp}°C ({volt}V balanced). Degradation is nominal at ~1.4% per 10k km.",
            action=ChatAction(
                label="Navigate to Battery Health",
                route="/battery-health",
                description="Explore cell voltage delta & degradation curve"
            )
        )

    # 2. Charging Station / Pune queries
    elif "charge" in q or "charger" in q or "station" in q or "near" in q or "pune" in q:
        pune_stations = StationService.get_all_stations(city="Pune")
        stn_count = len(pune_stations.get("stations", [])) if isinstance(pune_stations, dict) else len(pune_stations)
        return ChatResponse(
            reply=f"Found {stn_count} verified hubs in Pune (Tata Power 60 kW at Phoenix Mall, Jio-bp 120 kW at Baner).",
            action=ChatAction(
                label="Navigate to Chargers Map",
                route="/chargers",
                description="Browse Indian charging catalog on Google Maps"
            )
        )

    # 3. Intercity corridor / Route query across Maharashtra
    elif any(city in q for city in ["mumbai", "nashik", "kolhapur", "sambhajinagar", "aurangabad", "shirdi", "mahabaleshwar", "solapur", "nagpur", "satara", "lonavala", "alibaug", "ratnagiri", "route", "reach", "expressway", "trip"]):
        dest_match = "Mumbai"
        if "nashik" in q: dest_match = "Nashik (212 km via NH60)"
        elif "kolhapur" in q: dest_match = "Kolhapur (233 km via NH48)"
        elif "sambhajinagar" in q or "aurangabad" in q: dest_match = "Chhatrapati Sambhajinagar (235 km)"
        elif "shirdi" in q: dest_match = "Shirdi (185 km)"
        elif "mahabaleshwar" in q: dest_match = "Mahabaleshwar (120 km via Pasarni Ghat)"
        elif "solapur" in q: dest_match = "Solapur (255 km via NH65)"
        elif "nagpur" in q: dest_match = "Nagpur (710 km via Samruddhi Mahamarg)"
        elif "satara" in q: dest_match = "Satara (112 km via NH48)"
        elif "lonavala" in q: dest_match = "Lonavala (65 km)"
        elif "alibaug" in q: dest_match = "Alibaug (142 km)"
        elif "ratnagiri" in q: dest_match = "Ratnagiri (305 km via Amba Ghat)"

        return ChatResponse(
            reply=f"Statewide corridor route to {dest_match} is ready. Smart routing models battery consumption over Ghats and assigns verified fast charging hubs.",
            action=ChatAction(
                label="Navigate to Route Planner",
                route="/route",
                description="View Maharashtra expressway charging stops and waypoint map"
            )
        )

    # 4. Range / Prediction
    elif "range" in q or "predict" in q or "distance" in q or "how far" in q:
        return ChatResponse(
            reply=f"At {soc}% battery, estimated range is {est_range} km (benchmark: 100 km average at 100% full charge).",
            action=ChatAction(
                label="Navigate to Range Prediction",
                route="/range-prediction",
                description="Adjust driving style, speed, and climate options"
            )
        )

    # 5. Charging Cost query
    elif "cost" in q or "price" in q or "tariff" in q or "80%" in q:
        return ChatResponse(
            reply="Charging 20% to 80% costs ~₹182 on Home AC (₹7.5/unit) vs ~₹450 on DC Fast (₹18.5/unit). EV cost is ~₹1.45/km.",
            action=ChatAction(
                label="Navigate to Cost Calculator",
                route="/charging-cost",
                description="Compare AC vs DC fast vs off-peak savings"
            )
        )

    # 6. Improving Battery Life query
    elif "improve" in q or "life" in q or "longevity" in q or "care" in q:
        return ChatResponse(
            reply="Keep daily charging between 20%–80%, cool pack 15 min after fast driving, and park in shade during Pune summers.",
            action=ChatAction(
                label="Navigate to Battery Health",
                route="/battery-health",
                description="Review thermal management & longevity tips"
            )
        )

    # 7. Carbon / Sustainability
    elif "carbon" in q or "co2" in q or "green" in q or "saving" in q:
        return ChatResponse(
            reply="You've saved 126 kg CO₂ and ₹8,425 this month compared to petrol, equivalent to planting ~6 mature trees.",
            action=ChatAction(
                label="Navigate to Carbon Footprint",
                route="/carbon",
                description="View environmental impact and fuel displacement"
            )
        )

    # 8. Wallet query
    elif "wallet" in q or "balance" in q or "pay" in q or "money" in q:
        return ChatResponse(
            reply="Your EVORA demo wallet balance is ₹2,450, ready for one-tap RFID and QR charging sessions.",
            action=ChatAction(
                label="Navigate to Wallet",
                route="/wallet",
                description="Manage balance and view transaction receipts"
            )
        )

    # 9. Generic / Default
    else:
        return ChatResponse(
            reply=f"I analyzed '{req.query}'. Your vehicle is at {soc}% SoC and {soh}% SoH. Choose an option below to navigate:",
            action=ChatAction(
                label="Navigate to Dashboard",
                route="/dashboard",
                description="Open EVORA main overview"
            )
        )
