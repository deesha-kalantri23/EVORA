-- ==============================================================================
-- Migration: 20261017000000_create_admin_and_ev_tables.sql
-- Description: Core schema for EVORA EV Charging Platform & Admin Management
-- ==============================================================================

-- 1. User Roles Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'operator', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Helper Security Definer function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = check_user_id
          AND role IN ('super_admin', 'admin')
    );
$$;

-- 2. Member Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    location TEXT DEFAULT 'Pune, Maharashtra, India',
    vehicle_model TEXT DEFAULT 'Tata Nexon EV Long Range',
    vehicle_registration TEXT DEFAULT 'MH 12 TE 4590',
    wallet_balance_inr NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    account_status TEXT NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active', 'Suspended', 'Pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Charging Stations Table
CREATE TABLE IF NOT EXISTS public.charging_stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    operator TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    power_kw NUMERIC(6, 2) NOT NULL DEFAULT 60.00,
    ports_total INTEGER NOT NULL DEFAULT 4,
    ports_available INTEGER NOT NULL DEFAULT 2,
    tariff_inr_per_kwh NUMERIC(6, 2) NOT NULL DEFAULT 19.50,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.70,
    reviews_count INTEGER NOT NULL DEFAULT 85,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Maintenance')),
    amenities TEXT[] DEFAULT ARRAY['Cafeteria', 'Restrooms', 'Free Wi-Fi', 'EV Lounge']::TEXT[],
    connector_types TEXT[] DEFAULT ARRAY['CCS2', 'Type 2 AC']::TEXT[],
    operating_hours TEXT DEFAULT '24/7 Always Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stations_city ON public.charging_stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_operator ON public.charging_stations(operator);
CREATE INDEX IF NOT EXISTS idx_stations_status ON public.charging_stations(status);

-- 4. Station Chargers / Connectors
CREATE TABLE IF NOT EXISTS public.station_chargers (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
    connector_type TEXT NOT NULL,
    max_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 60.00,
    bay_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Charging', 'Faulted', 'Out of Service')),
    last_telemetry_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chargers_station_id ON public.station_chargers(station_id);

-- 5. Station Bookings Table (Comprehensive Schema)
CREATE TABLE IF NOT EXISTS public.station_bookings (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    member_email TEXT,
    member_phone TEXT,
    vehicle_registration_number TEXT NOT NULL,
    vehicle_model TEXT DEFAULT 'Tata Nexon EV',
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE RESTRICT,
    station_name TEXT NOT NULL,
    station_location TEXT NOT NULL,
    station_city TEXT NOT NULL,
    charger_id TEXT REFERENCES public.station_chargers(id) ON DELETE SET NULL,
    connector_type TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    estimated_duration_min INTEGER NOT NULL DEFAULT 45,
    booking_status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (booking_status IN ('Pending', 'Confirmed', 'Charging', 'Completed', 'Cancelled', 'No-show')),
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 420.00,
    actual_cost NUMERIC(10, 2),
    energy_consumed_kwh NUMERIC(8, 2),
    payment_status TEXT NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Pending', 'Paid', 'Refunded', 'Failed')),
    payment_method TEXT DEFAULT 'EVORA Wallet',
    cancellation_reason TEXT,
    rescheduled_from_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Prevent overlapping reservations for the same charger & slot
    CONSTRAINT uq_station_charger_date_slot UNIQUE (station_id, charger_id, booking_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_station_id ON public.station_bookings(station_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.station_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.station_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.station_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.station_bookings(payment_status);

-- 6. Active Live Charging Sessions (Real-time Telemetry Monitor)
CREATE TABLE IF NOT EXISTS public.active_charging_sessions (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.station_bookings(id) ON DELETE SET NULL,
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
    station_name TEXT NOT NULL,
    charger_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    member_email TEXT,
    vehicle_registration_number TEXT NOT NULL,
    session_start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    session_end_estimated TIMESTAMPTZ,
    energy_delivered_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    current_charging_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 48.50,
    battery_current_soc NUMERIC(5, 2) NOT NULL DEFAULT 42.00,
    battery_target_soc NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 350.00,
    session_status TEXT NOT NULL DEFAULT 'Charging' CHECK (session_status IN ('Initiating', 'Charging', 'Suspended', 'Completed', 'Faulted')),
    is_telemetry_live BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_station ON public.active_charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_status ON public.active_charging_sessions(session_status);

-- 7. Payment Transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.station_bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('EVORA Wallet', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking')),
    status TEXT NOT NULL DEFAULT 'Success' CHECK (status IN ('Success', 'Pending', 'Refunded', 'Failed')),
    reference_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- 8. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
