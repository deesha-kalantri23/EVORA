export type BookingStatus = 'Pending' | 'Confirmed' | 'Charging' | 'Completed' | 'Cancelled' | 'No-show';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';
export type StationStatus = 'Active' | 'Inactive' | 'Maintenance';
export type ChargerStatus = 'Available' | 'Occupied' | 'Charging' | 'Faulted' | 'Out of Service';
export type SessionStatus = 'Initiating' | 'Charging' | 'Suspended' | 'Completed' | 'Faulted';

export interface AdminBooking {
  id: string;
  user_id?: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  vehicle_registration_number: string;
  vehicle_model: string;
  station_id: string;
  station_name: string;
  station_location: string;
  station_city: string;
  charger_id?: string;
  connector_type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  estimated_duration_min: number;
  booking_status: BookingStatus;
  estimated_cost: number;
  actual_cost?: number | null;
  energy_consumed_kwh?: number | null;
  payment_status: PaymentStatus;
  payment_method: string;
  cancellation_reason?: string;
  rescheduled_from_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminStation {
  id: string;
  name: string;
  operator: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  power_kw: number;
  ports_total: number;
  ports_available: number;
  tariff_inr_per_kwh: number;
  rating: number;
  reviews_count: number;
  status: StationStatus;
  amenities: string[];
  connector_types: string[];
  operating_hours?: string;
  created_at?: string;
  chargers?: AdminCharger[];
}

export interface AdminCharger {
  id: string;
  station_id: string;
  connector_type: string;
  max_power_kw: number;
  bay_number: string;
  status: ChargerStatus;
  last_telemetry_at?: string;
}

export interface ActiveChargingSession {
  id: string;
  booking_id?: string;
  station_id: string;
  station_name: string;
  charger_id: string;
  user_id?: string;
  member_name: string;
  member_email?: string;
  vehicle_registration_number: string;
  session_start_time: string;
  session_end_estimated?: string;
  energy_delivered_kwh: number;
  current_charging_power_kw: number;
  battery_current_soc: number;
  battery_target_soc: number;
  estimated_cost: number;
  session_status: SessionStatus;
  is_telemetry_live: boolean;
  updated_at?: string;
}

export interface AdminMember {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  location: string;
  vehicle_model: string;
  vehicle_registration: string;
  wallet_balance_inr: number;
  account_status: 'Active' | 'Suspended' | 'Pending';
  role: 'super_admin' | 'admin' | 'operator' | 'member';
  created_at: string;
  total_bookings_count: number;
  completed_bookings_count: number;
  cancelled_bookings_count: number;
}

export interface AdminPayment {
  id: string;
  booking_id?: string;
  user_id?: string;
  member_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'Success' | 'Pending' | 'Refunded' | 'Failed';
  reference_number?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string;
  admin_email: string;
  action_type: string;
  entity_type: 'BOOKING' | 'STATION' | 'CHARGER' | 'MEMBER' | 'SESSION' | 'PAYMENT' | 'SYSTEM';
  entity_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface AdminDashboardStats {
  totalBookings: number;
  todayBookings: number;
  confirmedBookings: number;
  activeChargingSessions: number;
  completedBookings: number;
  cancelledBookings: number;
  totalMembers: number;
  totalStations: number;
  availableChargers: number;
  occupiedChargers: number;
  outOfServiceChargers: number;
  totalRevenueINR: number;
  totalEnergyDeliveredKWh: number;
}
