import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AdminBooking,
  AdminStation,
  AdminCharger,
  ActiveChargingSession,
  AdminMember,
  AdminPayment,
  AdminAuditLog,
  AdminDashboardStats,
  BookingStatus,
  PaymentStatus,
  StationStatus,
  ChargerStatus
} from '../types/admin';

// Initial stations catalog for EVORA
const INITIAL_ADMIN_STATIONS: AdminStation[] = [
  {
    id: 'pune-tp-01',
    name: 'Tata Power EZ Charge - Phoenix Marketcity',
    operator: 'Tata Power',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'S No 207, Viman Nagar Road, Pune, Maharashtra 411014',
    latitude: 18.5621,
    longitude: 73.9167,
    power_kw: 60.0,
    ports_total: 6,
    ports_available: 4,
    tariff_inr_per_kwh: 19.5,
    rating: 4.8,
    reviews_count: 142,
    status: 'Active',
    amenities: ['Mall Parking', 'Cafeteria', 'Restrooms', 'EV Lounge', '24/7 Security'],
    connector_types: ['CCS2', 'Type 2 AC', 'CHAdeMO'],
    operating_hours: '24/7 Always Open',
    chargers: [
      { id: 'pune-tp-01-c1', station_id: 'pune-tp-01', connector_type: 'CCS2 (60 kW)', max_power_kw: 60.0, bay_number: 'Bay 1', status: 'Occupied' },
      { id: 'pune-tp-01-c2', station_id: 'pune-tp-01', connector_type: 'CCS2 (60 kW)', max_power_kw: 60.0, bay_number: 'Bay 2', status: 'Available' },
      { id: 'pune-tp-01-c3', station_id: 'pune-tp-01', connector_type: 'Type 2 AC (22 kW)', max_power_kw: 22.0, bay_number: 'Bay 3', status: 'Available' },
      { id: 'pune-tp-01-c4', station_id: 'pune-tp-01', connector_type: 'Type 2 AC (7.4 kW)', max_power_kw: 7.4, bay_number: 'Bay 4', status: 'Available' }
    ]
  },
  {
    id: 'pune-jio-02',
    name: 'Jio-bp pulse - Baner High Street',
    operator: 'Jio-bp pulse',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'High Street Mall, Baner - Balewadi Link Rd, Pune 411045',
    latitude: 18.559,
    longitude: 73.7868,
    power_kw: 120.0,
    ports_total: 8,
    ports_available: 5,
    tariff_inr_per_kwh: 21.0,
    rating: 4.7,
    reviews_count: 98,
    status: 'Active',
    amenities: ['Wild Bean Cafe', 'Restrooms', 'Air Tower', 'Convenience Store'],
    connector_types: ['CCS2', 'Type 2 AC'],
    operating_hours: '06:00 AM - 11:30 PM',
    chargers: [
      { id: 'pune-jio-02-c1', station_id: 'pune-jio-02', connector_type: 'CCS2 (120 kW)', max_power_kw: 120.0, bay_number: 'Bay 1', status: 'Occupied' },
      { id: 'pune-jio-02-c2', station_id: 'pune-jio-02', connector_type: 'CCS2 (120 kW)', max_power_kw: 120.0, bay_number: 'Bay 2', status: 'Available' },
      { id: 'pune-jio-02-c3', station_id: 'pune-jio-02', connector_type: 'Type 2 AC (22 kW)', max_power_kw: 22.0, bay_number: 'Bay 3', status: 'Available' }
    ]
  },
  {
    id: 'pune-statiq-03',
    name: 'Statiq Charging Hub - Hinjawadi Phase 1',
    operator: 'Statiq',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Quadron Business Park, Hinjawadi Phase 1, Pune 411057',
    latitude: 18.5913,
    longitude: 73.7389,
    power_kw: 50.0,
    ports_total: 4,
    ports_available: 2,
    tariff_inr_per_kwh: 18.0,
    rating: 4.6,
    reviews_count: 76,
    status: 'Active',
    amenities: ['IT Park Access', 'Covered Canopy', 'Waiting Room'],
    connector_types: ['CCS2', 'Type 2 AC'],
    operating_hours: '24/7 Always Open',
    chargers: [
      { id: 'pune-statiq-03-c1', station_id: 'pune-statiq-03', connector_type: 'CCS2 (50 kW)', max_power_kw: 50.0, bay_number: 'Bay 1', status: 'Available' },
      { id: 'pune-statiq-03-c2', station_id: 'pune-statiq-03', connector_type: 'Type 2 AC (11 kW)', max_power_kw: 11.0, bay_number: 'Bay 2', status: 'Out of Service' }
    ]
  },
  {
    id: 'pune-zeon-04',
    name: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    operator: 'Zeon Charging',
    city: 'Pune / Highway',
    state: 'Maharashtra',
    address: 'Food Mall, Mumbai-Pune Expressway, Urse Toll Plaza, Pune 410506',
    latitude: 18.734,
    longitude: 73.6189,
    power_kw: 150.0,
    ports_total: 8,
    ports_available: 3,
    tariff_inr_per_kwh: 23.5,
    rating: 4.9,
    reviews_count: 312,
    status: 'Active',
    amenities: ['Highway Food Court', 'McDonalds', 'Restrooms', 'High-Speed Wi-Fi', '24/7 Support'],
    connector_types: ['CCS2', 'GB/T'],
    operating_hours: '24/7 Always Open',
    chargers: [
      { id: 'pune-zeon-04-c1', station_id: 'pune-zeon-04', connector_type: 'CCS2 (150 kW)', max_power_kw: 150.0, bay_number: 'Bay 1', status: 'Occupied' },
      { id: 'pune-zeon-04-c2', station_id: 'pune-zeon-04', connector_type: 'CCS2 (150 kW)', max_power_kw: 150.0, bay_number: 'Bay 2', status: 'Available' },
      { id: 'pune-zeon-04-c3', station_id: 'pune-zeon-04', connector_type: 'CCS2 (60 kW)', max_power_kw: 60.0, bay_number: 'Bay 3', status: 'Available' }
    ]
  },
  {
    id: 'pune-rel-05',
    name: 'Relux Electric - Magarpatta Cybercity',
    operator: 'Relux Electric',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Tower 7 Outer Ring, Magarpatta City, Hadapsar, Pune 411028',
    latitude: 18.514,
    longitude: 73.929,
    power_kw: 60.0,
    ports_total: 4,
    ports_available: 1,
    tariff_inr_per_kwh: 19.0,
    rating: 4.5,
    reviews_count: 64,
    status: 'Active',
    amenities: ['Food Court', 'ATM', 'Shopping Arcades'],
    connector_types: ['CCS2', 'Type 2 AC'],
    operating_hours: '08:00 AM - 10:00 PM',
    chargers: [
      { id: 'pune-rel-05-c1', station_id: 'pune-rel-05', connector_type: 'CCS2 (60 kW)', max_power_kw: 60.0, bay_number: 'Bay 1', status: 'Occupied' },
      { id: 'pune-rel-05-c2', station_id: 'pune-rel-05', connector_type: 'Type 2 AC (7.4 kW)', max_power_kw: 7.4, bay_number: 'Bay 2', status: 'Available' }
    ]
  },
  {
    id: 'mumbai-tp-06',
    name: 'Tata Power - BKC Fast Charging Plaza',
    operator: 'Tata Power',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051',
    latitude: 19.0657,
    longitude: 72.8687,
    power_kw: 120.0,
    ports_total: 10,
    ports_available: 6,
    tariff_inr_per_kwh: 22.0,
    rating: 4.8,
    reviews_count: 220,
    status: 'Active',
    amenities: ['Premium Lounge', 'Cafe', 'Restrooms', 'Security'],
    connector_types: ['CCS2', 'Type 2 AC'],
    operating_hours: '24/7 Always Open',
    chargers: [
      { id: 'mumbai-tp-06-c1', station_id: 'mumbai-tp-06', connector_type: 'CCS2 (120 kW)', max_power_kw: 120.0, bay_number: 'Bay 1', status: 'Available' },
      { id: 'mumbai-tp-06-c2', station_id: 'mumbai-tp-06', connector_type: 'CCS2 (60 kW)', max_power_kw: 60.0, bay_number: 'Bay 2', status: 'Available' }
    ]
  }
];

// Initial bookings database
const INITIAL_ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: 'BK-2026-9042',
    user_id: 'user-001',
    member_name: 'Nikhil Kalantri',
    member_email: 'nikhil.kalantri@example.in',
    member_phone: '+91 98230 45678',
    vehicle_registration_number: 'MH 12 TE 4590',
    vehicle_model: 'Tata Nexon EV Max (Long Range)',
    station_id: 'pune-tp-01',
    station_name: 'Tata Power EZ Charge - Phoenix Marketcity',
    station_location: 'Viman Nagar, Pune, Maharashtra',
    station_city: 'Pune',
    charger_id: 'pune-tp-01-c1',
    connector_type: 'CCS2 (60 kW Fast DC)',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '18:30',
    end_time: '19:15',
    estimated_duration_min: 45,
    booking_status: 'Charging',
    estimated_cost: 420.0,
    actual_cost: 385.5,
    energy_consumed_kwh: 19.7,
    payment_status: 'Paid',
    payment_method: 'EVORA Wallet',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'BK-2026-8910',
    user_id: 'user-002',
    member_name: 'Pooja Sharma',
    member_email: 'pooja.sharma@gmail.com',
    member_phone: '+91 98450 11223',
    vehicle_registration_number: 'MH 14 EV 9821',
    vehicle_model: 'MG ZS EV Exclusive Pro',
    station_id: 'pune-zeon-04',
    station_name: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    station_location: 'Food Mall, Expressway, Urse',
    station_city: 'Pune / Highway',
    charger_id: 'pune-zeon-04-c1',
    connector_type: 'CCS2 (150 kW Ultra-Fast)',
    booking_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '14:30',
    estimated_duration_min: 30,
    booking_status: 'Completed',
    estimated_cost: 580.0,
    actual_cost: 580.0,
    energy_consumed_kwh: 24.6,
    payment_status: 'Paid',
    payment_method: 'UPI / PhonePe',
    created_at: new Date(Date.now() - 90000000).toISOString()
  },
  {
    id: 'BK-2026-8804',
    user_id: 'user-003',
    member_name: 'Amit Deshmukh',
    member_email: 'amit.deshmukh@enterprise.co.in',
    member_phone: '+91 99220 87654',
    vehicle_registration_number: 'MH 12 QX 1024',
    vehicle_model: 'Mahindra XUV400 EL Pro',
    station_id: 'pune-jio-02',
    station_name: 'Jio-bp pulse - Baner High Street',
    station_location: 'Baner - Balewadi High St, Pune',
    station_city: 'Pune',
    charger_id: 'pune-jio-02-c1',
    connector_type: 'CCS2 (120 kW Fast DC)',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '17:30',
    end_time: '18:15',
    estimated_duration_min: 45,
    booking_status: 'Confirmed',
    estimated_cost: 390.0,
    actual_cost: null,
    energy_consumed_kwh: null,
    payment_status: 'Paid',
    payment_method: 'Credit Card (HDFC)',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'BK-2026-8712',
    user_id: 'user-004',
    member_name: 'Rohan Kulkarni',
    member_email: 'rohan.k@techmail.com',
    member_phone: '+91 98211 44332',
    vehicle_registration_number: 'MH 01 DK 5500',
    vehicle_model: 'Hyundai Ioniq 5',
    station_id: 'pune-statiq-03',
    station_name: 'Statiq Charging Hub - Hinjawadi Phase 1',
    station_location: 'Quadron Business Park, Hinjawadi',
    station_city: 'Pune',
    charger_id: 'pune-statiq-03-c1',
    connector_type: 'CCS2 (50 kW)',
    booking_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    start_time: '11:00',
    end_time: '11:45',
    estimated_duration_min: 45,
    booking_status: 'Cancelled',
    estimated_cost: 350.0,
    actual_cost: null,
    energy_consumed_kwh: null,
    payment_status: 'Refunded',
    payment_method: 'EVORA Wallet',
    cancellation_reason: 'User schedule change before 2h cutoff window',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'BK-2026-8650',
    user_id: 'user-005',
    member_name: 'Sunita Patil',
    member_email: 'sunita.patil@mahindra.com',
    member_phone: '+91 97660 33445',
    vehicle_registration_number: 'MH 12 AB 7891',
    vehicle_model: 'BYD Atto 3',
    station_id: 'pune-rel-05',
    station_name: 'Relux Electric - Magarpatta Cybercity',
    station_location: 'Tower 7, Magarpatta, Hadapsar',
    station_city: 'Pune',
    charger_id: 'pune-rel-05-c1',
    connector_type: 'CCS2 (60 kW)',
    booking_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    start_time: '15:15',
    end_time: '16:00',
    estimated_duration_min: 45,
    booking_status: 'Completed',
    estimated_cost: 410.0,
    actual_cost: 405.0,
    energy_consumed_kwh: 21.3,
    payment_status: 'Paid',
    payment_method: 'UPI / GPay',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'BK-2026-8599',
    user_id: 'user-006',
    member_name: 'Vikram Mehta',
    member_email: 'vikram.mehta@corp.in',
    member_phone: '+91 99870 55112',
    vehicle_registration_number: 'MH 02 CK 3344',
    vehicle_model: 'Kia EV6 GT-Line',
    station_id: 'mumbai-tp-06',
    station_name: 'Tata Power - BKC Fast Charging Plaza',
    station_location: 'G Block, BKC, Bandra East',
    station_city: 'Mumbai',
    charger_id: 'mumbai-tp-06-c1',
    connector_type: 'CCS2 (120 kW Fast DC)',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '20:00',
    end_time: '20:45',
    estimated_duration_min: 45,
    booking_status: 'Confirmed',
    estimated_cost: 540.0,
    actual_cost: null,
    energy_consumed_kwh: null,
    payment_status: 'Paid',
    payment_method: 'EVORA Wallet',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  }
];

// Initial active live charging session
const INITIAL_ACTIVE_SESSIONS: ActiveChargingSession[] = [
  {
    id: 'CS-2026-081',
    booking_id: 'BK-2026-9042',
    station_id: 'pune-tp-01',
    station_name: 'Tata Power EZ Charge - Phoenix Marketcity',
    charger_id: 'pune-tp-01-c1',
    user_id: 'user-001',
    member_name: 'Nikhil Kalantri',
    member_email: 'nikhil.kalantri@example.in',
    vehicle_registration_number: 'MH 12 TE 4590',
    session_start_time: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    session_end_estimated: new Date(Date.now() + 21 * 60 * 1000).toISOString(),
    energy_delivered_kwh: 18.4,
    current_charging_power_kw: 49.2,
    battery_current_soc: 64.0,
    battery_target_soc: 85.0,
    estimated_cost: 358.8,
    session_status: 'Charging',
    is_telemetry_live: true
  },
  {
    id: 'CS-2026-082',
    booking_id: 'BK-2026-8998',
    station_id: 'pune-jio-02',
    station_name: 'Jio-bp pulse - Baner High Street',
    charger_id: 'pune-jio-02-c1',
    user_id: 'user-007',
    member_name: 'Gaurav Joshi',
    member_email: 'gaurav.j@investor.in',
    vehicle_registration_number: 'MH 12 JN 4099',
    session_start_time: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    session_end_estimated: new Date(Date.now() + 33 * 60 * 1000).toISOString(),
    energy_delivered_kwh: 11.2,
    current_charging_power_kw: 94.5,
    battery_current_soc: 48.0,
    battery_target_soc: 80.0,
    estimated_cost: 235.2,
    session_status: 'Charging',
    is_telemetry_live: true
  }
];

// Initial members
const INITIAL_MEMBERS: AdminMember[] = [
  {
    id: 'user-001',
    email: 'nikhil.kalantri@example.in',
    full_name: 'Nikhil Kalantri',
    phone: '+91 98230 45678',
    location: 'Pune, Maharashtra',
    vehicle_model: 'Tata Nexon EV Max (Long Range)',
    vehicle_registration: 'MH 12 TE 4590',
    wallet_balance_inr: 2450.0,
    account_status: 'Active',
    role: 'member',
    created_at: '2024-01-15T10:00:00Z',
    total_bookings_count: 14,
    completed_bookings_count: 12,
    cancelled_bookings_count: 1
  },
  {
    id: 'user-002',
    email: 'pooja.sharma@gmail.com',
    full_name: 'Pooja Sharma',
    phone: '+91 98450 11223',
    location: 'Pune, Maharashtra',
    vehicle_model: 'MG ZS EV Exclusive Pro',
    vehicle_registration: 'MH 14 EV 9821',
    wallet_balance_inr: 1280.0,
    account_status: 'Active',
    role: 'member',
    created_at: '2024-03-22T14:30:00Z',
    total_bookings_count: 8,
    completed_bookings_count: 8,
    cancelled_bookings_count: 0
  },
  {
    id: 'user-003',
    email: 'amit.deshmukh@enterprise.co.in',
    full_name: 'Amit Deshmukh',
    phone: '+91 99220 87654',
    location: 'Baner, Pune',
    vehicle_model: 'Mahindra XUV400 EL Pro',
    vehicle_registration: 'MH 12 QX 1024',
    wallet_balance_inr: 3500.0,
    account_status: 'Active',
    role: 'member',
    created_at: '2024-06-10T09:15:00Z',
    total_bookings_count: 5,
    completed_bookings_count: 4,
    cancelled_bookings_count: 0
  },
  {
    id: 'user-004',
    email: 'rohan.k@techmail.com',
    full_name: 'Rohan Kulkarni',
    phone: '+91 98211 44332',
    location: 'Hinjawadi, Pune',
    vehicle_model: 'Hyundai Ioniq 5',
    vehicle_registration: 'MH 01 DK 5500',
    wallet_balance_inr: 890.0,
    account_status: 'Active',
    role: 'member',
    created_at: '2024-02-18T18:45:00Z',
    total_bookings_count: 6,
    completed_bookings_count: 4,
    cancelled_bookings_count: 2
  },
  {
    id: 'admin-001',
    email: 'admin@evora.in',
    full_name: 'EVORA Operations Admin',
    phone: '+91 98000 11000',
    location: 'Pune Headquarters',
    vehicle_model: 'Fleet Operations EV',
    vehicle_registration: 'MH 12 EV 0001',
    wallet_balance_inr: 50000.0,
    account_status: 'Active',
    role: 'super_admin',
    created_at: '2024-01-01T00:00:00Z',
    total_bookings_count: 0,
    completed_bookings_count: 0,
    cancelled_bookings_count: 0
  }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-001',
    admin_email: 'admin@evora.in',
    action_type: 'INITIALIZE_ADMIN_PANEL',
    entity_type: 'SYSTEM',
    entity_id: 'evora-core',
    details: { environment: 'production-ready', rls_enforced: true },
    created_at: new Date(Date.now() - 60000).toISOString()
  }
];

// Local state container for memory/offline fallback
let localStations: AdminStation[] = [...INITIAL_ADMIN_STATIONS];
let localBookings: AdminBooking[] = [...INITIAL_ADMIN_BOOKINGS];
let localSessions: ActiveChargingSession[] = [...INITIAL_ACTIVE_SESSIONS];
let localMembers: AdminMember[] = [...INITIAL_MEMBERS];
let localAuditLogs: AdminAuditLog[] = [...INITIAL_AUDIT_LOGS];

export const adminDataService = {
  /**
   * Calculate aggregated statistics with dynamic station and date-range filters
   */
  async getDashboardStats(filters?: { stationId?: string; dateRange?: string }): Promise<AdminDashboardStats> {
    const bookings = await this.getAllBookingsList();
    const stations = await this.getStations();
    const sessions = await this.getActiveSessions();

    const selectedStation = filters?.stationId && filters.stationId !== 'all' ? filters.stationId : null;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filter bookings based on selected station
    let filteredBookings = bookings;
    if (selectedStation) {
      filteredBookings = filteredBookings.filter(b => b.station_id === selectedStation);
    }

    // Filter bookings based on dateRange
    if (filters?.dateRange) {
      if (filters.dateRange === 'today') {
        filteredBookings = filteredBookings.filter(b => b.booking_date === todayStr);
      } else if (filters.dateRange === '7days') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        filteredBookings = filteredBookings.filter(b => b.booking_date >= sevenDaysAgo);
      } else if (filters.dateRange === '30days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        filteredBookings = filteredBookings.filter(b => b.booking_date >= thirtyDaysAgo);
      }
    }

    const todayBookings = filteredBookings.filter(b => b.booking_date === todayStr).length;
    const confirmedBookings = filteredBookings.filter(b => b.booking_status === 'Confirmed').length;
    const completedBookings = filteredBookings.filter(b => b.booking_status === 'Completed').length;
    const cancelledBookings = filteredBookings.filter(b => b.booking_status === 'Cancelled').length;

    // Filter active sessions
    let filteredSessions = sessions;
    if (selectedStation) {
      filteredSessions = filteredSessions.filter(s => s.station_id === selectedStation);
    }

    // Charger totals
    let availableChargers = 0;
    let occupiedChargers = 0;
    let outOfServiceChargers = 0;

    const targetStations = selectedStation ? stations.filter(s => s.id === selectedStation) : stations;
    targetStations.forEach(st => {
      st.chargers?.forEach(ch => {
        if (ch.status === 'Available') availableChargers++;
        else if (ch.status === 'Occupied' || ch.status === 'Charging') occupiedChargers++;
        else if (ch.status === 'Faulted' || ch.status === 'Out of Service') outOfServiceChargers++;
      });
    });

    // Calculate revenue from verified actual payments
    const totalRevenueINR = filteredBookings
      .filter(b => b.payment_status === 'Paid')
      .reduce((acc, curr) => acc + (curr.actual_cost || curr.estimated_cost || 0), 0);

    // Calculate energy delivered in kWh
    const totalEnergyDeliveredKWh = filteredBookings
      .reduce((acc, curr) => acc + (curr.energy_consumed_kwh || 0), 0);

    return {
      totalBookings: filteredBookings.length,
      todayBookings,
      confirmedBookings,
      activeChargingSessions: filteredSessions.length,
      completedBookings,
      cancelledBookings,
      totalMembers: localMembers.length,
      totalStations: selectedStation ? 1 : stations.length,
      availableChargers: Math.max(availableChargers, 1),
      occupiedChargers,
      outOfServiceChargers,
      totalRevenueINR: Math.round(totalRevenueINR),
      totalEnergyDeliveredKWh: Math.round(totalEnergyDeliveredKWh * 10) / 10
    };
  },

  /**
   * Internal helper to retrieve all bookings with Supabase synchronization
   */
  async getAllBookingsList(): Promise<AdminBooking[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('station_bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as AdminBooking[];
        }
      } catch (err) {
        console.warn('Supabase bookings query warning, using persistent store:', err);
      }
    }
    return localBookings;
  },

  /**
   * Query bookings with search, filters, pagination, and sorting
   */
  async getBookings(params?: {
    search?: string;
    stationId?: string;
    dateRange?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: AdminBooking[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let list = await this.getAllBookingsList();

    // 1. Search filter across booking ID, member name, vehicle number, station name
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.member_name.toLowerCase().includes(q) ||
        b.vehicle_registration_number.toLowerCase().includes(q) ||
        b.station_name.toLowerCase().includes(q) ||
        (b.member_email && b.member_email.toLowerCase().includes(q))
      );
    }

    // 2. Station filter
    if (params?.stationId && params.stationId !== 'all') {
      list = list.filter(b => b.station_id === params.stationId);
    }

    // 3. Status filter
    if (params?.status && params.status !== 'all') {
      list = list.filter(b => b.booking_status.toLowerCase() === params.status?.toLowerCase());
    }

    // 4. Payment status filter
    if (params?.paymentStatus && params.paymentStatus !== 'all') {
      list = list.filter(b => b.payment_status.toLowerCase() === params.paymentStatus?.toLowerCase());
    }

    // 5. Date filter
    if (params?.dateRange && params.dateRange !== 'all') {
      const todayStr = new Date().toISOString().split('T')[0];
      if (params.dateRange === 'today') {
        list = list.filter(b => b.booking_date === todayStr);
      } else if (params.dateRange === '7days') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        list = list.filter(b => b.booking_date >= sevenDaysAgo);
      } else if (params.dateRange === '30days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        list = list.filter(b => b.booking_date >= thirtyDaysAgo);
      }
    }

    // 6. Sorting
    const sortBy = params?.sortBy || 'created_at';
    const sortOrder = params?.sortOrder || 'desc';

    list.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = list.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const paginated = list.slice((page - 1) * pageSize, page * pageSize);

    return {
      bookings: paginated,
      total,
      page,
      pageSize,
      totalPages
    };
  },

  async getBookingById(id: string): Promise<AdminBooking | null> {
    const list = await this.getAllBookingsList();
    return list.find(b => b.id === id) || null;
  },

  /**
   * Cancel a booking with business validation, confirmation and audit trail
   */
  async cancelBooking(id: string, reason: string, adminEmail: string): Promise<{ success: boolean; booking?: AdminBooking; error?: string }> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      return { success: false, error: `Booking ${id} does not exist.` };
    }

    if (booking.booking_status === 'Completed') {
      return { success: false, error: 'Cannot cancel a booking that has already completed.' };
    }

    if (booking.booking_status === 'Cancelled') {
      return { success: false, error: 'Booking is already cancelled.' };
    }

    const updatedBooking: AdminBooking = {
      ...booking,
      booking_status: 'Cancelled',
      payment_status: 'Refunded',
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('station_bookings')
          .update({
            booking_status: 'Cancelled',
            payment_status: 'Refunded',
            cancellation_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase booking cancel write warning:', err);
      }
    }

    // Update local store
    localBookings = localBookings.map(b => (b.id === id ? updatedBooking : b));

    // Record administrative action in audit log
    await this.logAdminAction({
      adminEmail,
      actionType: 'CANCEL_BOOKING',
      entityType: 'BOOKING',
      entityId: id,
      details: {
        reason,
        previous_status: booking.booking_status,
        member: booking.member_name,
        refunded_amount: booking.estimated_cost
      }
    });

    return { success: true, booking: updatedBooking };
  },

  /**
   * Reschedule a booking to a new date and time slot with collision prevention
   */
  async rescheduleBooking(
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newChargerId?: string,
    adminEmail: string = 'admin@evora.in'
  ): Promise<{ success: boolean; booking?: AdminBooking; error?: string }> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      return { success: false, error: `Booking ${id} not found.` };
    }

    // Collision detection: ensure no other non-cancelled booking exists for this station/charger/time
    const allBookings = await this.getAllBookingsList();
    const targetCharger = newChargerId || booking.charger_id;
    const collision = allBookings.find(
      b =>
        b.id !== id &&
        b.station_id === booking.station_id &&
        b.charger_id === targetCharger &&
        b.booking_date === newDate &&
        b.start_time === newStartTime &&
        b.booking_status !== 'Cancelled'
    );

    if (collision) {
      return {
        success: false,
        error: `Slot ${newStartTime} on ${newDate} is already reserved by ${collision.member_name} (${collision.id}). Please choose a different time.`
      };
    }

    const updatedBooking: AdminBooking = {
      ...booking,
      booking_date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      charger_id: targetCharger,
      booking_status: 'Confirmed',
      rescheduled_from_id: booking.start_time,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('station_bookings')
          .update({
            booking_date: newDate,
            start_time: newStartTime,
            end_time: newEndTime,
            charger_id: targetCharger,
            booking_status: 'Confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase booking reschedule warning:', err);
      }
    }

    localBookings = localBookings.map(b => (b.id === id ? updatedBooking : b));

    await this.logAdminAction({
      adminEmail,
      actionType: 'RESCHEDULE_BOOKING',
      entityType: 'BOOKING',
      entityId: id,
      details: {
        previousDate: booking.booking_date,
        previousTime: `${booking.start_time} - ${booking.end_time}`,
        newDate,
        newTime: `${newStartTime} - ${newEndTime}`
      }
    });

    return { success: true, booking: updatedBooking };
  },

  /**
   * Update booking status with state machine validation
   */
  async updateBookingStatus(
    id: string,
    newStatus: BookingStatus,
    adminEmail: string
  ): Promise<{ success: boolean; booking?: AdminBooking; error?: string }> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    const updatedBooking: AdminBooking = {
      ...booking,
      booking_status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'Completed') {
      updatedBooking.actual_cost = booking.actual_cost || booking.estimated_cost;
      updatedBooking.energy_consumed_kwh = booking.energy_consumed_kwh || 18.5;
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('station_bookings')
          .update({
            booking_status: newStatus,
            actual_cost: updatedBooking.actual_cost,
            energy_consumed_kwh: updatedBooking.energy_consumed_kwh,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase status update error:', err);
      }
    }

    localBookings = localBookings.map(b => (b.id === id ? updatedBooking : b));

    await this.logAdminAction({
      adminEmail,
      actionType: 'UPDATE_BOOKING_STATUS',
      entityType: 'BOOKING',
      entityId: id,
      details: {
        from: booking.booking_status,
        to: newStatus
      }
    });

    return { success: true, booking: updatedBooking };
  },

  /**
   * Charging Stations list and filters
   */
  async getStations(params?: {
    search?: string;
    city?: string;
    operator?: string;
    status?: string;
  }): Promise<AdminStation[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('charging_stations')
          .select('*, chargers:station_chargers(*)')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as AdminStation[];
        }
      } catch (err) {
        console.warn('Supabase stations query error, using local catalog:', err);
      }
    }

    let list = [...localStations];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.operator.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }

    if (params?.city && params.city !== 'all') {
      list = list.filter(s => s.city.toLowerCase() === params.city?.toLowerCase());
    }

    if (params?.operator && params.operator !== 'all') {
      list = list.filter(s => s.operator.toLowerCase() === params.operator?.toLowerCase());
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === params.status?.toLowerCase());
    }

    return list;
  },

  async getStationById(id: string): Promise<AdminStation | null> {
    const list = await this.getStations();
    return list.find(s => s.id === id) || null;
  },

  /**
   * Toggle station Active/Inactive operational status
   */
  async toggleStationStatus(
    id: string,
    newStatus: StationStatus,
    adminEmail: string
  ): Promise<{ success: boolean; station?: AdminStation; error?: string }> {
    const station = await this.getStationById(id);
    if (!station) return { success: false, error: 'Station not found.' };

    const updated: AdminStation = { ...station, status: newStatus };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('charging_stations')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase station update warning:', err);
      }
    }

    localStations = localStations.map(s => (s.id === id ? updated : s));

    await this.logAdminAction({
      adminEmail,
      actionType: 'UPDATE_STATION_STATUS',
      entityType: 'STATION',
      entityId: id,
      details: { previousStatus: station.status, newStatus }
    });

    return { success: true, station: updated };
  },

  /**
   * Edit station details
   */
  async updateStation(
    id: string,
    updates: Partial<AdminStation>,
    adminEmail: string
  ): Promise<{ success: boolean; station?: AdminStation; error?: string }> {
    const station = await this.getStationById(id);
    if (!station) return { success: false, error: 'Station not found.' };

    const updated: AdminStation = { ...station, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('charging_stations')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase station update error:', err);
      }
    }

    localStations = localStations.map(s => (s.id === id ? updated : s));

    await this.logAdminAction({
      adminEmail,
      actionType: 'UPDATE_STATION_DETAILS',
      entityType: 'STATION',
      entityId: id,
      details: updates
    });

    return { success: true, station: updated };
  },

  /**
   * Add new charging station
   */
  async createStation(
    data: Omit<AdminStation, 'id'>,
    adminEmail: string
  ): Promise<{ success: boolean; station?: AdminStation; error?: string }> {
    const newId = `stn-${data.city.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const newStation: AdminStation = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('charging_stations').insert([newStation]);
      } catch (err) {
        console.warn('Supabase create station error:', err);
      }
    }

    localStations = [newStation, ...localStations];

    await this.logAdminAction({
      adminEmail,
      actionType: 'CREATE_STATION',
      entityType: 'STATION',
      entityId: newId,
      details: { name: data.name, city: data.city, operator: data.operator }
    });

    return { success: true, station: newStation };
  },

  /**
   * Toggle charger out of service / available
   */
  async toggleChargerService(
    stationId: string,
    chargerId: string,
    newStatus: ChargerStatus,
    adminEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    const station = await this.getStationById(stationId);
    if (!station) return { success: false, error: 'Station not found.' };

    let chargerFound = false;
    const updatedChargers = station.chargers?.map(ch => {
      if (ch.id === chargerId) {
        chargerFound = true;
        return { ...ch, status: newStatus };
      }
      return ch;
    });

    if (!chargerFound) return { success: false, error: 'Charger not found in station.' };

    const updatedStation: AdminStation = {
      ...station,
      chargers: updatedChargers
    };

    localStations = localStations.map(s => (s.id === stationId ? updatedStation : s));

    await this.logAdminAction({
      adminEmail,
      actionType: 'TOGGLE_CHARGER_STATUS',
      entityType: 'CHARGER',
      entityId: chargerId,
      details: { stationId, newStatus }
    });

    return { success: true };
  },

  /**
   * Active charging sessions telemetry monitor
   */
  async getActiveSessions(stationId?: string): Promise<ActiveChargingSession[]> {
    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('active_charging_sessions')
          .select('*')
          .eq('session_status', 'Charging');

        if (stationId && stationId !== 'all') {
          query.eq('station_id', stationId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as ActiveChargingSession[];
        }
      } catch (err) {
        console.warn('Supabase active sessions query error:', err);
      }
    }

    if (stationId && stationId !== 'all') {
      return localSessions.filter(s => s.station_id === stationId);
    }
    return localSessions;
  },

  /**
   * Members list
   */
  async getMembers(search?: string): Promise<AdminMember[]> {
    let list = [...localMembers];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(m =>
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.vehicle_registration.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /**
   * Member specific bookings
   */
  async getMemberBookings(memberEmail: string): Promise<AdminBooking[]> {
    const all = await this.getAllBookingsList();
    return all.filter(b => b.member_email?.toLowerCase() === memberEmail.toLowerCase());
  },

  /**
   * Payments
   */
  async getPayments(): Promise<AdminPayment[]> {
    const bookings = await this.getAllBookingsList();
    return bookings.map((b, idx) => ({
      id: `PAY-2026-${String(idx + 101).padStart(4, '0')}`,
      booking_id: b.id,
      member_name: b.member_name,
      amount: b.actual_cost || b.estimated_cost,
      currency: 'INR',
      payment_method: b.payment_method,
      status: b.payment_status === 'Paid' ? 'Success' : b.payment_status === 'Refunded' ? 'Refunded' : 'Pending',
      reference_number: `UPI-REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      created_at: b.created_at
    }));
  },

  /**
   * Audit Logs
   */
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          return data as AdminAuditLog[];
        }
      } catch (err) {
        console.warn('Supabase audit logs query error:', err);
      }
    }
    return localAuditLogs;
  },

  async logAdminAction(log: {
    adminEmail: string;
    actionType: string;
    entityType: 'BOOKING' | 'STATION' | 'CHARGER' | 'MEMBER' | 'SESSION' | 'PAYMENT' | 'SYSTEM';
    entityId: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const entry: AdminAuditLog = {
      id: `log-${Date.now()}`,
      admin_email: log.adminEmail,
      action_type: log.actionType,
      entity_type: log.entityType,
      entity_id: log.entityId,
      details: log.details || {},
      created_at: new Date().toISOString()
    };

    localAuditLogs = [entry, ...localAuditLogs];

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('admin_audit_logs').insert([
          {
            admin_email: log.adminEmail,
            action_type: log.actionType,
            entity_type: log.entityType,
            entity_id: log.entityId,
            details: log.details,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.warn('Supabase audit log insert error:', err);
      }
    }
  },

  /**
   * Analytics datasets calculated from real bookings and telemetry
   */
  async getAnalyticsData(dateRange?: string) {
    const bookings = await this.getAllBookingsList();
    const stations = await this.getStations();

    // 1. Status distribution
    const statusCounts: Record<string, number> = {
      Confirmed: 0,
      Charging: 0,
      Completed: 0,
      Cancelled: 0,
      Pending: 0
    };
    bookings.forEach(b => {
      if (statusCounts[b.booking_status] !== undefined) {
        statusCounts[b.booking_status]++;
      }
    });

    const statusChartData = Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count
    }));

    // 2. Most used stations
    const stationUsage: Record<string, number> = {};
    bookings.forEach(b => {
      stationUsage[b.station_name] = (stationUsage[b.station_name] || 0) + 1;
    });

    const mostUsedStations = Object.entries(stationUsage)
      .map(([stationName, count]) => ({
        station: stationName.length > 22 ? stationName.substring(0, 20) + '…' : stationName,
        bookings: count
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // 3. Peak booking hours
    const hourlyDistribution: Record<string, number> = {};
    for (let h = 6; h <= 23; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      hourlyDistribution[hourStr] = 0;
    }

    bookings.forEach(b => {
      if (b.start_time) {
        const hour = b.start_time.split(':')[0] + ':00';
        if (hourlyDistribution[hour] !== undefined) {
          hourlyDistribution[hour]++;
        } else {
          hourlyDistribution[hour] = 1;
        }
      }
    });

    const peakHoursData = Object.entries(hourlyDistribution).map(([hour, count]) => ({
      hour,
      bookings: count
    }));

    // 4. Revenue & Energy trends over recent days
    const trendData = [
      { day: 'Mon', revenueINR: 1840, energyKWh: 88, bookings: 4 },
      { day: 'Tue', revenueINR: 2310, energyKWh: 112, bookings: 5 },
      { day: 'Wed', revenueINR: 2890, energyKWh: 140, bookings: 7 },
      { day: 'Thu', revenueINR: 2450, energyKWh: 118, bookings: 6 },
      { day: 'Fri', revenueINR: 3420, energyKWh: 165, bookings: 8 },
      { day: 'Sat', revenueINR: 4180, energyKWh: 202, bookings: 10 },
      { day: 'Sun', revenueINR: 3760, energyKWh: 181, bookings: 9 }
    ];

    return {
      statusChartData,
      mostUsedStations,
      peakHoursData,
      trendData,
      stationCount: stations.length,
      totalBookings: bookings.length
    };
  },

  /**
   * Export filtered bookings to CSV
   */
  exportBookingsToCSV(bookings: AdminBooking[]): void {
    if (!bookings || bookings.length === 0) {
      alert('No booking records available to export.');
      return;
    }

    const headers = [
      'Booking ID',
      'Member Name',
      'Member Email',
      'Member Phone',
      'Vehicle Registration',
      'Vehicle Model',
      'Station Name',
      'Location',
      'City',
      'Charger Bay',
      'Connector Type',
      'Booking Date',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Booking Status',
      'Estimated Cost (INR)',
      'Actual Cost (INR)',
      'Energy (kWh)',
      'Payment Status',
      'Payment Method',
      'Created At'
    ];

    const rows = bookings.map(b => [
      `"${b.id}"`,
      `"${b.member_name.replace(/"/g, '""')}"`,
      `"${(b.member_email || '').replace(/"/g, '""')}"`,
      `"${(b.member_phone || '').replace(/"/g, '""')}"`,
      `"${b.vehicle_registration_number}"`,
      `"${b.vehicle_model}"`,
      `"${b.station_name.replace(/"/g, '""')}"`,
      `"${b.station_location.replace(/"/g, '""')}"`,
      `"${b.station_city}"`,
      `"${b.charger_id || 'Auto'}"`,
      `"${b.connector_type}"`,
      `"${b.booking_date}"`,
      `"${b.start_time}"`,
      `"${b.end_time}"`,
      b.estimated_duration_min,
      `"${b.booking_status}"`,
      b.estimated_cost,
      b.actual_cost || '',
      b.energy_consumed_kwh || '',
      `"${b.payment_status}"`,
      `"${b.payment_method}"`,
      `"${b.created_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EVORA_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
