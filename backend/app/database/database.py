"""
Database configuration and persistence layer for EVORA.
Supports SQLite default for local zero-dependency persistent storage,
with auto-migration for telemetry records, prediction history, data source status,
and charging station bookings.
"""

import os
import sqlite3
import json
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "evora.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for persistent dynamic data, prediction history, bookings, and wallet transactions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Dynamic Telemetry Stream Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        vehicle_id TEXT NOT NULL,
        soc_percentage REAL NOT NULL,
        soh_percentage REAL NOT NULL,
        battery_voltage_v REAL NOT NULL,
        battery_current_a REAL NOT NULL,
        battery_temperature_c REAL NOT NULL,
        cell_temp_min_c REAL,
        cell_temp_max_c REAL,
        charge_cycles INTEGER NOT NULL,
        power_consumption_wh_per_km REAL NOT NULL,
        speed_kmh REAL,
        motor_temperature_c REAL,
        tire_pressure_psi REAL,
        odometer_km REAL,
        ambient_temperature_c REAL,
        ambient_humidity_percent REAL,
        component_health_score REAL,
        source_label TEXT DEFAULT 'Dynamic Ingestion Stream',
        raw_payload TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Model Prediction History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        vehicle_id TEXT NOT NULL,
        model_name TEXT NOT NULL,
        model_version TEXT NOT NULL,
        input_features TEXT NOT NULL,
        prediction_output TEXT NOT NULL,
        confidence_percentage REAL,
        data_source TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 3. Data Source Status
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_source_status (
        source_name TEXT PRIMARY KEY,
        source_type TEXT NOT NULL,
        status TEXT NOT NULL,
        endpoint_url TEXT,
        last_fetch_time TEXT,
        records_count INTEGER DEFAULT 0,
        last_error TEXT,
        metadata TEXT,
        updated_at TEXT NOT NULL
    );
    """)

    # 4. Station Bookings (enforce unique slot to prevent double-booking as per SRS FR-2.4)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS station_bookings (
        booking_id TEXT PRIMARY KEY,
        station_id TEXT NOT NULL,
        station_name TEXT NOT NULL,
        connector_type TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        estimated_duration_min INTEGER,
        vehicle_model TEXT,
        estimated_cost_inr REAL,
        status TEXT NOT NULL,
        data_label TEXT DEFAULT 'Dynamic Ingestion Booking',
        created_at TEXT NOT NULL,
        UNIQUE(station_id, date, time_slot)
    );
    """)

    # 5. User Wallet Account & Persistent Transactions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_wallet (
        user_id TEXT PRIMARY KEY,
        balance_inr REAL NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wallet_transactions (
        transaction_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date_str TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Completed',
        reference_id TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Seed initial user wallet if not present
    cursor.execute("SELECT balance_inr FROM user_wallet WHERE user_id = 'user_nikhil'")
    if not cursor.fetchone():
        now_iso = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO user_wallet (user_id, balance_inr, updated_at) VALUES (?, ?, ?)",
            ("user_nikhil", 2450.00, now_iso)
        )
        cursor.execute("SELECT COUNT(*) FROM wallet_transactions WHERE user_id = 'user_nikhil'")
        count = cursor.fetchone()[0]
        if count == 0:
            seed_txs = [
                ("TX-9012", "user_nikhil", "30 Sep 2026, 19:30", "Tata Power EZ Charge - Phoenix Marketcity, Pune", 447.70, "debit", "Completed", "BK-2026-0901", now_iso),
                ("TX-8991", "user_nikhil", "28 Sep 2026, 11:20", "Wallet Top-up via HDFC Bank UPI (Demo)", 1000.00, "credit", "Completed", None, now_iso),
                ("TX-8920", "user_nikhil", "26 Sep 2026, 14:15", "Zeon Charging - Mumbai-Pune Expressway (Urse)", 641.25, "debit", "Completed", None, now_iso),
                ("TX-8854", "user_nikhil", "20 Sep 2026, 18:40", "Jio-bp pulse - Baner High Street, Pune", 382.20, "debit", "Completed", None, now_iso),
                ("TX-8790", "user_nikhil", "15 Sep 2026, 10:00", "Wallet Top-up via ICICI RuPay (Demo)", 2000.00, "credit", "Completed", None, now_iso),
            ]
            cursor.executemany("""
            INSERT INTO wallet_transactions (
                transaction_id, user_id, date_str, description, amount, transaction_type, status, reference_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, seed_txs)

    conn.commit()
    conn.close()

# ----------------- Telemetry Persistence Helpers -----------------

def insert_telemetry_record(rec: Dict[str, Any]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    ts = rec.get("timestamp") or now_iso

    cursor.execute("""
    INSERT INTO telemetry_records (
        timestamp, vehicle_id, soc_percentage, soh_percentage,
        battery_voltage_v, battery_current_a, battery_temperature_c,
        cell_temp_min_c, cell_temp_max_c, charge_cycles,
        power_consumption_wh_per_km, speed_kmh, motor_temperature_c,
        tire_pressure_psi, odometer_km, ambient_temperature_c,
        ambient_humidity_percent, component_health_score,
        source_label, raw_payload, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ts,
        rec.get("vehicle_id", "v-nexon-01"),
        float(rec.get("soc_percentage", 78.0)),
        float(rec.get("soh_percentage", 94.0)),
        float(rec.get("battery_voltage_v", 394.8)),
        float(rec.get("battery_current_a", 0.0)),
        float(rec.get("battery_temperature_c", 28.4)),
        float(rec.get("cell_temp_min_c", 27.6)),
        float(rec.get("cell_temp_max_c", 29.2)),
        int(rec.get("charge_cycles", 421)),
        float(rec.get("power_consumption_wh_per_km", 140.8)),
        float(rec.get("speed_kmh", 41.5)),
        float(rec.get("motor_temperature_c", 45.0)),
        float(rec.get("tire_pressure_psi", 33.0)),
        float(rec.get("odometer_km", 18420.0)),
        float(rec.get("ambient_temperature_c", 28.0)),
        float(rec.get("ambient_humidity_percent", 55.0)),
        float(rec.get("component_health_score", 94.0)),
        rec.get("source_label", "Dynamic Ingestion Stream"),
        json.dumps(rec),
        now_iso
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_latest_telemetry_record(vehicle_id: str = "v-nexon-01") -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM telemetry_records
    WHERE vehicle_id = ?
    ORDER BY id DESC LIMIT 1
    """, (vehicle_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_telemetry_history(limit: int = 50, vehicle_id: str = "v-nexon-01") -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM telemetry_records
    WHERE vehicle_id = ?
    ORDER BY id DESC LIMIT ?
    """, (vehicle_id, limit))
    rows = cursor.fetchall()
    conn.close()
    # Return chronological order (oldest to newest for charting)
    return [dict(r) for r in reversed(rows)]

def get_telemetry_count() -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM telemetry_records")
    count = cursor.fetchone()[0]
    conn.close()
    return count

# ----------------- Prediction History Helpers -----------------

def insert_prediction(
    model_name: str,
    model_version: str,
    input_features: Dict[str, Any],
    prediction_output: Dict[str, Any],
    confidence_percentage: Optional[float] = None,
    data_source: str = "Dynamic Sensor Data",
    vehicle_id: str = "v-nexon-01"
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO prediction_history (
        timestamp, vehicle_id, model_name, model_version,
        input_features, prediction_output, confidence_percentage,
        data_source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        vehicle_id,
        model_name,
        model_version,
        json.dumps(input_features),
        json.dumps(prediction_output),
        confidence_percentage,
        data_source,
        now_iso
    ))
    pred_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return pred_id

def get_prediction_history(limit: int = 20, vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if vehicle_id:
        cursor.execute("""
        SELECT * FROM prediction_history
        WHERE vehicle_id = ?
        ORDER BY id DESC LIMIT ?
        """, (vehicle_id, limit))
    else:
        cursor.execute("""
        SELECT * FROM prediction_history
        ORDER BY id DESC LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        try:
            d["input_features"] = json.loads(d["input_features"])
        except Exception:
            pass
        try:
            d["prediction_output"] = json.loads(d["prediction_output"])
        except Exception:
            pass
        results.append(d)
    return results

# ----------------- Data Source Status Helpers -----------------

def update_data_source_status(
    source_name: str,
    source_type: str,
    status: str,
    endpoint_url: Optional[str] = None,
    records_count: Optional[int] = None,
    last_error: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO data_source_status (
        source_name, source_type, status, endpoint_url,
        last_fetch_time, records_count, last_error, metadata, updated_at
    ) VALUES (?, ?, ?, ?, ?, COALESCE(?, 0), ?, ?, ?)
    ON CONFLICT(source_name) DO UPDATE SET
        source_type = excluded.source_type,
        status = excluded.status,
        endpoint_url = COALESCE(excluded.endpoint_url, endpoint_url),
        last_fetch_time = excluded.last_fetch_time,
        records_count = CASE WHEN excluded.records_count IS NOT NULL THEN excluded.records_count ELSE records_count END,
        last_error = excluded.last_error,
        metadata = COALESCE(excluded.metadata, metadata),
        updated_at = excluded.updated_at
    """, (
        source_name,
        source_type,
        status,
        endpoint_url,
        now_iso,
        records_count,
        last_error,
        json.dumps(metadata) if metadata else None,
        now_iso
    ))
    conn.commit()
    conn.close()

def get_data_source_statuses() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM data_source_status ORDER BY source_name ASC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        if d.get("metadata"):
            try:
                d["metadata"] = json.loads(d["metadata"])
            except Exception:
                pass
        results.append(d)
    return results

# ----------------- Station Bookings Persistence -----------------

def insert_station_booking(booking: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Check for existing booking (prevent double booking)
    cursor.execute("""
    SELECT booking_id FROM station_bookings
    WHERE station_id = ? AND date = ? AND time_slot = ?
    """, (booking["station_id"], booking["date"], booking["time_slot"]))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise ValueError(f"Slot {booking['time_slot']} on {booking['date']} at this station is already booked (ID: {existing[0]}). Please choose another slot.")

    cursor.execute("""
    INSERT INTO station_bookings (
        booking_id, station_id, station_name, connector_type,
        date, time_slot, estimated_duration_min, vehicle_model,
        estimated_cost_inr, status, data_label, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        booking["booking_id"],
        booking["station_id"],
        booking["station_name"],
        booking["connector_type"],
        booking["date"],
        booking["time_slot"],
        booking.get("estimated_duration_min", 45),
        booking.get("vehicle_model", "Tata Nexon EV"),
        booking.get("estimated_cost_inr", 400.0),
        booking.get("status", "Confirmed"),
        booking.get("data_label", "Dynamic Booking"),
        now_iso
    ))
    conn.commit()
    conn.close()
    return booking

def get_all_station_bookings() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM station_bookings ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_db_info():
    return {
        "engine": "SQLite Dynamic Store (PostgreSQL / SQLite interchangeable)",
        "db_path": DB_PATH,
        "database_url_configured": bool(os.getenv("DATABASE_URL")),
        "status": "connected"
    }

# ----------------- Wallet & Transaction Helpers -----------------

def get_wallet_data(user_id: str = "user_nikhil") -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT balance_inr FROM user_wallet WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    balance = row[0] if row else 2450.00

    cursor.execute("""
    SELECT transaction_id as id, date_str as date, description, amount, transaction_type as type, status, reference_id
    FROM wallet_transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    """, (user_id,))
    tx_rows = cursor.fetchall()
    conn.close()
    return {
        "balance_inr": balance,
        "transactions": [dict(r) for r in tx_rows]
    }

def record_wallet_transaction(
    amount: float,
    transaction_type: str,
    description: str,
    user_id: str = "user_nikhil",
    reference_id: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    date_str = datetime.now().strftime("%d %b %Y, %H:%M")

    cursor.execute("SELECT balance_inr FROM user_wallet WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    current_balance = row[0] if row else 2450.00

    if transaction_type == "debit":
        new_balance = round(max(0.0, current_balance - amount), 2)
    else:
        new_balance = round(current_balance + amount, 2)

    cursor.execute("""
    INSERT OR REPLACE INTO user_wallet (user_id, balance_inr, updated_at)
    VALUES (?, ?, ?)
    """, (user_id, new_balance, now_iso))

    tx_id = f"TX-{random.randint(1000, 9999)}"
    cursor.execute("""
    INSERT INTO wallet_transactions (
        transaction_id, user_id, date_str, description, amount, transaction_type, status, reference_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (tx_id, user_id, date_str, description, amount, transaction_type, "Completed", reference_id, now_iso))

    conn.commit()
    conn.close()

    return {
        "transaction_id": tx_id,
        "new_balance_inr": new_balance,
        "amount": amount,
        "type": transaction_type,
        "description": description,
        "date": date_str,
        "status": "Completed",
        "reference_id": reference_id
    }

def cancel_station_booking(booking_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM station_bookings WHERE booking_id = ?", (booking_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    bk = dict(row)
    cursor.execute("UPDATE station_bookings SET status = 'Cancelled' WHERE booking_id = ?", (booking_id,))
    conn.commit()
    conn.close()
    bk["status"] = "Cancelled"
    return bk

