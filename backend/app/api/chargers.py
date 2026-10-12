from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.services.station_service import StationService
from app.schemas.station import BookingRequest

router = APIRouter(prefix="/chargers", tags=["Charging Stations"])

BOOKINGS_STORAGE: List[Dict[str, Any]] = [
    {
        "booking_id": "BK-2026-0901",
        "station_id": "pune-tp-01",
        "station_name": "Tata Power EZ Charge - Phoenix Marketcity",
        "connector_type": "CCS2 (60 kW)",
        "date": "Today",
        "time_slot": "18:00 - 18:45",
        "estimated_duration_min": 45,
        "vehicle_model": "Tata Nexon EV Max",
        "estimated_cost_inr": 420.0,
        "status": "Confirmed (Demo Booking)",
        "data_label": "Demo Booking Flow"
    }
]

@router.get("")
def list_chargers(
    city: Optional[str] = Query(None, description="City filter (e.g. Pune, Mumbai)"),
    state: Optional[str] = Query(None, description="State filter (e.g. Maharashtra)"),
    operator: Optional[str] = Query(None, description="Operator filter (e.g. Tata Power, Jio-bp pulse)"),
    connector_type: Optional[str] = Query(None, description="Connector (e.g. CCS2, Type 2 AC)"),
    min_power: Optional[float] = Query(None, description="Minimum power in kW"),
    search: Optional[str] = Query(None, description="Search query")
):
    result = StationService.get_all_stations(
        city=city,
        state=state,
        operator=operator,
        connector_type=connector_type,
        min_power=min_power,
        search=search
    )
    station_list = result.get("stations", []) if isinstance(result, dict) else result
    return {
        "count": len(station_list),
        "total": result.get("total", len(station_list)) if isinstance(result, dict) else len(station_list),
        "data_source_label": "Dataset Data (India EV Charging Stations 2025)",
        "default_location": "Pune, Maharashtra, India",
        "stations": station_list
    }

@router.get("/filters")
def get_station_filters():
    return StationService.get_filter_options()

@router.get("/stats")
def get_station_stats():
    return StationService.get_station_statistics()

@router.get("/corridor")
def get_corridor_stations(
    origin: str = Query("Pune", description="Origin city"),
    destination: str = Query("Mumbai", description="Destination city")
):
    corridor_stations = StationService.find_corridor_chargers(origin, destination)
    return {
        "origin": origin,
        "destination": destination,
        "count": len(corridor_stations),
        "corridor_stations": corridor_stations,
        "data_source_label": "Dataset Data (India EV Charging Stations 2025)"
    }

@router.get("/user/bookings")
def get_user_bookings():
    from app.database.database import get_all_station_bookings
    bookings = get_all_station_bookings()
    if not bookings:
        # Initial demo entry if empty
        bookings = BOOKINGS_STORAGE
    return {
        "bookings": bookings,
        "data_label": "Dynamic Persistent Bookings (SQLite)"
    }

@router.get("/{station_id}")
def get_charger_detail(station_id: str):
    station = StationService.get_station_by_id(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found in dataset")
    return {
        "station": station,
        "data_source_label": "Dataset Data (India EV Charging Stations 2025)",
        "tariff_label": "Demo Tariff",
        "availability_label": "Demo Availability"
    }

@router.post("/bookings")
def create_booking(booking: BookingRequest):
    from app.database.database import insert_station_booking, get_all_station_bookings, record_wallet_transaction, get_wallet_data
    try:
        all_bks = get_all_station_bookings()
        new_id = f"BK-2026-{len(all_bks) + len(BOOKINGS_STORAGE) + 1:04d}"
        new_bk = {
            "booking_id": new_id,
            "station_id": booking.station_id,
            "station_name": booking.station_name,
            "connector_type": booking.connector_type,
            "date": booking.date,
            "time_slot": booking.time_slot,
            "estimated_duration_min": booking.estimated_duration_min,
            "vehicle_model": booking.vehicle_model,
            "estimated_cost_inr": booking.estimated_cost_inr,
            "status": "Confirmed (Active Reservation)",
            "data_label": "Dynamic Booking (SQLite)"
        }
        saved = insert_station_booking(new_bk)

        # Automatically debit wallet and record transaction in transaction history
        cost = booking.estimated_cost_inr or 400.0
        tx = None
        if cost > 0:
            tx = record_wallet_transaction(
                amount=round(cost, 2),
                transaction_type="debit",
                description=f"Slot Booking: {booking.station_name} ({booking.connector_type}, {booking.time_slot})",
                reference_id=new_id
            )
            wallet_bal = tx["new_balance_inr"]
        else:
            wallet_bal = get_wallet_data()["balance_inr"]

        return {
            "status": "success",
            "message": "Charging slot reserved and payment processed via EVORA Wallet",
            "booking": saved,
            "wallet_transaction": tx,
            "wallet_balance_inr": wallet_bal
        }
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking error: {str(e)}")

@router.post("/bookings/{booking_id}/cancel")
def cancel_booking_endpoint(booking_id: str):
    from app.database.database import cancel_station_booking, record_wallet_transaction, get_wallet_data
    cancelled = cancel_station_booking(booking_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Booking not found")

    refund_amt = cancelled.get("estimated_cost_inr") or 0.0
    tx = None
    if refund_amt > 0:
        tx = record_wallet_transaction(
            amount=round(refund_amt, 2),
            transaction_type="credit",
            description=f"Booking Refund: {cancelled.get('station_name', 'Charging Station')} ({booking_id})",
            reference_id=booking_id
        )

    return {
        "status": "success",
        "message": f"Booking {booking_id} cancelled. ₹{refund_amt:,.2f} refunded to wallet.",
        "booking": cancelled,
        "wallet_transaction": tx,
        "wallet_balance_inr": tx["new_balance_inr"] if tx else get_wallet_data()["balance_inr"]
    }

