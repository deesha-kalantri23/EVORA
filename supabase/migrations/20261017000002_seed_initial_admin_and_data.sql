-- ==============================================================================
-- Migration: 20261017000002_seed_initial_admin_and_data.sql
-- Description: Trusted Initial Admin Setup Instructions & Seed Data
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRUSTED SETUP PROCEDURE FOR INITIAL ADMIN ACCOUNT
-- ------------------------------------------------------------------------------
-- DO NOT hardcode admin credentials in frontend client code.
--
-- To grant admin access to your initial account:
-- Option A: If the user already signed up via Supabase Auth:
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin'
--   FROM auth.users
--   WHERE email = 'admin@evora.in'
--   ON CONFLICT (user_id, role) DO NOTHING;
--
-- Option B: Run the function below in the Supabase SQL Editor:
CREATE OR REPLACE FUNCTION public.assign_admin_role_by_email(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;

    IF target_user_id IS NULL THEN
        RETURN 'Error: User with email ' || target_email || ' does not exist in auth.users. Please create the account first.';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Also ensure profile exists
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (target_user_id, target_email, 'EVORA Administrator', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

    RETURN 'Success: Admin role granted to ' || target_email;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Initial Charging Stations Seed
-- ------------------------------------------------------------------------------
INSERT INTO public.charging_stations (
    id, name, operator, city, state, address, latitude, longitude,
    power_kw, ports_total, ports_available, tariff_inr_per_kwh, rating, reviews_count, status, amenities, connector_types
) VALUES
(
    'pune-tp-01',
    'Tata Power EZ Charge - Phoenix Marketcity',
    'Tata Power',
    'Pune',
    'Maharashtra',
    'S No 207, Viman Nagar Road, Pune, Maharashtra 411014',
    18.5621,
    73.9167,
    60.00,
    6,
    4,
    19.50,
    4.8,
    142,
    'Active',
    ARRAY['Mall Parking', 'Cafeteria', 'Restrooms', 'EV Lounge', '24/7 Security'],
    ARRAY['CCS2', 'Type 2 AC', 'CHAdeMO']
),
(
    'pune-jio-02',
    'Jio-bp pulse - Baner High Street',
    'Jio-bp pulse',
    'Pune',
    'Maharashtra',
    'High Street Mall, Baner - Balewadi Link Rd, Pune 411045',
    18.5590,
    73.7868,
    120.00,
    8,
    5,
    21.00,
    4.7,
    98,
    'Active',
    ARRAY['Wild Bean Cafe', 'Restrooms', 'Air Tower', 'Convenience Store'],
    ARRAY['CCS2', 'Type 2 AC']
),
(
    'pune-statiq-03',
    'Statiq Charging Hub - Hinjawadi Phase 1',
    'Statiq',
    'Pune',
    'Maharashtra',
    'Quadron Business Park, Hinjawadi Phase 1, Pune 411057',
    18.5913,
    73.7389,
    50.00,
    4,
    2,
    18.00,
    4.6,
    76,
    'Active',
    ARRAY['IT Park Access', 'Covered Canopy', 'Waiting Room'],
    ARRAY['CCS2', 'Type 2 AC']
),
(
    'pune-zeon-04',
    'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    'Zeon Charging',
    'Pune / Highway',
    'Maharashtra',
    'Food Mall, Mumbai-Pune Expressway, Urse Toll Plaza, Pune 410506',
    18.7340,
    73.6189,
    150.00,
    8,
    3,
    23.50,
    4.9,
    312,
    'Active',
    ARRAY['Highway Food Court', 'McDonalds', 'Restrooms', 'High-Speed Wi-Fi', '24/7 Support'],
    ARRAY['CCS2', 'GB/T']
),
(
    'pune-rel-05',
    'Relux Electric - Magarpatta Cybercity',
    'Relux Electric',
    'Pune',
    'Maharashtra',
    'Tower 7 Outer Ring, Magarpatta City, Hadapsar, Pune 411028',
    18.5140,
    73.9290,
    60.00,
    4,
    1,
    19.00,
    4.5,
    64,
    'Active',
    ARRAY['Food Court', 'ATM', 'Shopping Arcades'],
    ARRAY['CCS2', 'Type 2 AC']
),
(
    'mumbai-tp-06',
    'Tata Power - BKC Fast Charging Plaza',
    'Tata Power',
    'Mumbai',
    'Maharashtra',
    'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051',
    19.0657,
    72.8687,
    120.00,
    10,
    6,
    22.00,
    4.8,
    220,
    'Active',
    ARRAY['Premium Lounge', 'Cafe', 'Restrooms', 'Security'],
    ARRAY['CCS2', 'Type 2 AC']
)
ON CONFLICT (id) DO UPDATE SET
    power_kw = EXCLUDED.power_kw,
    ports_available = EXCLUDED.ports_available,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 3. Initial Chargers Seed
-- ------------------------------------------------------------------------------
INSERT INTO public.station_chargers (id, station_id, connector_type, max_power_kw, bay_number, status)
VALUES
('pune-tp-01-c1', 'pune-tp-01', 'CCS2', 60.0, 'Bay 1', 'Occupied'),
('pune-tp-01-c2', 'pune-tp-01', 'CCS2', 60.0, 'Bay 2', 'Available'),
('pune-tp-01-c3', 'pune-tp-01', 'Type 2 AC', 22.0, 'Bay 3', 'Available'),
('pune-jio-02-c1', 'pune-jio-02', 'CCS2', 120.0, 'Bay 1', 'Occupied'),
('pune-jio-02-c2', 'pune-jio-02', 'CCS2', 120.0, 'Bay 2', 'Available'),
('pune-zeon-04-c1', 'pune-zeon-04', 'CCS2', 150.0, 'Bay 1', 'Occupied'),
('pune-zeon-04-c2', 'pune-zeon-04', 'CCS2', 150.0, 'Bay 2', 'Available')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Initial Bookings Seed
-- ------------------------------------------------------------------------------
INSERT INTO public.station_bookings (
    id, member_name, member_email, member_phone, vehicle_registration_number, vehicle_model,
    station_id, station_name, station_location, station_city, charger_id, connector_type,
    booking_date, start_time, end_time, estimated_duration_min, booking_status,
    estimated_cost, actual_cost, energy_consumed_kwh, payment_status, payment_method, created_at
) VALUES
(
    'BK-2026-9042',
    'Nikhil Kalantri',
    'nikhil.kalantri@example.in',
    '+91 98230 45678',
    'MH 12 TE 4590',
    'Tata Nexon EV Max',
    'pune-tp-01',
    'Tata Power EZ Charge - Phoenix Marketcity',
    'Viman Nagar, Pune',
    'Pune',
    'pune-tp-01-c1',
    'CCS2 (60 kW Fast DC)',
    CURRENT_DATE,
    '18:30',
    '19:15',
    45,
    'Charging',
    420.00,
    385.50,
    19.7,
    'Paid',
    'EVORA Wallet',
    NOW() - INTERVAL '2 hours'
),
(
    'BK-2026-8910',
    'Pooja Sharma',
    'pooja.s@example.com',
    '+91 98450 11223',
    'MH 14 EV 9821',
    'MG ZS EV Exclusive',
    'pune-zeon-04',
    'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    'Food Mall, Urse Expressway',
    'Pune / Highway',
    'pune-zeon-04-c1',
    'CCS2 (150 kW Ultra-Fast)',
    CURRENT_DATE,
    '14:00',
    '14:30',
    30,
    'Completed',
    580.00,
    580.00,
    28.5,
    'Paid',
    'UPI / PhonePe',
    NOW() - INTERVAL '1 day'
),
(
    'BK-2026-8804',
    'Amit Deshmukh',
    'amit.deshmukh@enterprise.co.in',
    '+91 99220 87654',
    'MH 12 QX 1024',
    'Mahindra XUV400',
    'pune-jio-02',
    'Jio-bp pulse - Baner High Street',
    'High Street, Baner, Pune',
    'Pune',
    'pune-jio-02-c1',
    'CCS2 (120 kW Fast DC)',
    CURRENT_DATE + INTERVAL '1 day',
    '17:30',
    '18:15',
    45,
    'Confirmed',
    390.00,
    NULL,
    NULL,
    'Paid',
    'Credit Card',
    NOW() - INTERVAL '3 hours'
),
(
    'BK-2026-8712',
    'Rohan Kulkarni',
    'rohan.k@techmail.com',
    '+91 98211 44332',
    'MH 01 DK 5500',
    'Hyundai Ioniq 5',
    'pune-statiq-03',
    'Statiq Charging Hub - Hinjawadi Phase 1',
    'Quadron Business Park, Hinjawadi',
    'Pune',
    NULL,
    'CCS2 (50 kW)',
    CURRENT_DATE - INTERVAL '3 days',
    '11:00',
    '11:45',
    45,
    'Cancelled',
    350.00,
    NULL,
    NULL,
    'Refunded',
    'EVORA Wallet',
    NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. Initial Active Charging Sessions Seed
-- ------------------------------------------------------------------------------
INSERT INTO public.active_charging_sessions (
    id, booking_id, station_id, station_name, charger_id, member_name, member_email,
    vehicle_registration_number, session_start_time, energy_delivered_kwh,
    current_charging_power_kw, battery_current_soc, battery_target_soc, estimated_cost, session_status, is_telemetry_live
) VALUES
(
    'CS-2026-081',
    'BK-2026-9042',
    'pune-tp-01',
    'Tata Power EZ Charge - Phoenix Marketcity',
    'pune-tp-01-c1',
    'Nikhil Kalantri',
    'nikhil.kalantri@example.in',
    'MH 12 TE 4590',
    NOW() - INTERVAL '24 minutes',
    18.4,
    49.2,
    64.0,
    85.0,
    358.80,
    'Charging',
    true
)
ON CONFLICT (id) DO NOTHING;
