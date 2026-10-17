-- ==============================================================================
-- Migration: 20261017000001_rls_policies.sql
-- Description: Row Level Security (RLS) policies for EVORA EV Charging Platform
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Policies for public.user_roles
-- ------------------------------------------------------------------------------
-- Admins can view and manage all user roles
CREATE POLICY "Admins have full access to user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can only read their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 3. Policies for public.profiles
-- ------------------------------------------------------------------------------
-- Admins can view all member profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admins can update profiles (e.g. change status)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. Policies for public.charging_stations
-- ------------------------------------------------------------------------------
-- Everyone can view active charging stations (Public map & listings)
CREATE POLICY "Public can view active stations"
ON public.charging_stations
FOR SELECT
TO anon, authenticated
USING (status = 'Active' OR public.is_admin());

-- Admins have full access to create, update, delete stations
CREATE POLICY "Admins have full access to charging stations"
ON public.charging_stations
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. Policies for public.station_chargers
-- ------------------------------------------------------------------------------
-- Public can view chargers of stations
CREATE POLICY "Public can view chargers"
ON public.station_chargers
FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can manage chargers (add, edit, toggle out of service)
CREATE POLICY "Admins can manage chargers"
ON public.station_chargers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. Policies for public.station_bookings
-- ------------------------------------------------------------------------------
-- Admins can view ALL bookings across every station
CREATE POLICY "Admins can view all bookings"
ON public.station_bookings
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admins can update/cancel/reschedule any booking
CREATE POLICY "Admins can update any booking"
ON public.station_bookings
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Regular authenticated users can only view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.station_bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Regular users can create bookings for themselves
CREATE POLICY "Users can insert own bookings"
ON public.station_bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Regular users can cancel their own bookings
CREATE POLICY "Users can cancel own bookings"
ON public.station_bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND booking_status IN ('Cancelled', 'Pending'));

-- ------------------------------------------------------------------------------
-- 7. Policies for public.active_charging_sessions
-- ------------------------------------------------------------------------------
-- Admins can monitor and manage all active sessions
CREATE POLICY "Admins can manage active sessions"
ON public.active_charging_sessions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view their own active session
CREATE POLICY "Users can view own active session"
ON public.active_charging_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 8. Policies for public.payments
-- ------------------------------------------------------------------------------
-- Admins can view all payment transactions
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Users can only view their own payment transactions
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 9. Policies for public.admin_audit_logs
-- ------------------------------------------------------------------------------
-- ONLY admins can view and record audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());
