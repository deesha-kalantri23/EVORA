export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  city: string;
  state: string;
  latitude: floatNumber;
  longitude: floatNumber;
  address: string;
  usage_type: string;
  connector_types: string[];
  power_kw: number;
  ports_total: number;
  ports_available_demo: number;
  tariff_inr_per_kwh: number;
  rating: number;
  reviews_count: number;
  amenities?: string[];
  data_source_label: string;
  status_label: string;
}

type floatNumber = number;

export interface ComponentHealthItem {
  component: string;
  health_score: number;
  status: string;
}

export interface TelemetryData {
  vehicle_id: string;
  vehicle_name: string;
  vin: string;
  soc_percentage: number;
  soh_percentage: number;
  battery_voltage_v: number;
  battery_current_a: number;
  battery_temperature_c: number;
  cell_temp_min_c: number;
  cell_temp_max_c: number;
  charge_cycles: number;
  power_consumption_wh_per_km: number;
  odometer_km: number;
  estimated_range_km: number;
  nominal_capacity_kwh: number;
  current_capacity_kwh: number;
  pack_health_status: string;
  cell_balance_status: string;
  charging_status?: string;
  driving_conditions: {
    mode: string;
    ambient_temp_c: number;
    avg_speed_kmh: number;
    regenerative_braking: string;
    weather_condition?: string;
    wind_speed_kmh?: number;
  };
  component_health: ComponentHealthItem[];
  hourly_telemetry_trend: {
    time: string;
    soc: number;
    voltage: number;
    current: number;
    temp: number;
  }[];
  today_energy_kwh?: number;
  monthly_charging_cost_inr?: number;
  co2_saved_kg?: number;
  avg_efficiency_km_per_kwh?: number;
  ai_recommendation?: string;
  live_weather?: any;
  data_source_info?: any;
  energy_consumption_7days?: {
    day: string;
    energyKwh: number;
    km: number;
    efficiency: number;
  }[];
  data_source_label: string;
  disclaimer?: string;
}

export interface StationFilterOptions {
  cities: string[];
  states: string[];
  operators: string[];
  connectors: string[];
  power_ratings_kw: number[];
  data_source_label: string;
}

export interface StationStatistics {
  total_stations_sample: number;
  average_power_kw: number;
  state_distribution: Record<string, number>;
  operator_distribution: Record<string, number>;
  data_source_label: string;
}

export interface DegradationPoint {
  cycle: number;
  projected_soh: number;
  lower_bound: number;
  upper_bound: number;
  data_label: string;
}

export interface BatteryHealthResponse {
  soh_percentage: number;
  soc_percentage: number;
  battery_voltage_v: number;
  battery_current_a: number;
  battery_temperature_c: number;
  cell_temp_min_c: number;
  cell_temp_max_c: number;
  charge_cycles: number;
  pack_health_status: string;
  cell_balance_status: string;
  component_health: ComponentHealthItem[];
  forecast: DegradationPoint[];
  data_label: string;
}

export interface CarbonMetricsResponse {
  total_co2_saved_kg: number;
  this_month_co2_saved_kg: number;
  energy_used_kwh: number;
  trees_equivalent: number;
  fuel_avoided_liters: number;
  grid_emission_factor: string;
  ice_emissions_factor: string;
  monthly_trend: {
    month: string;
    co2Saved: number;
    energyKwh: number;
    iceAvoided: number;
  }[];
  data_label: string;
}

export interface EnergyAnalyticsResponse {
  weekly_consumption: {
    day: string;
    energyKwh: number;
    km: number;
    efficiency: number;
  }[];
  avg_efficiency_km_per_kwh: number;
  power_consumption_wh_per_km: number;
  data_label: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  battery_capacity_kwh: number;
  rated_range_km: number;
  real_world_range_km: number;
  connector_supported: string[];
  max_ac_charging_kw: number;
  max_dc_charging_kw: number;
  vin: string;
  license_plate: string;
  odometer_km: number;
  city: string;
  state: string;
  connected_status: string;
  is_primary: boolean;
}

export interface Booking {
  booking_id: string;
  station_id: string;
  station_name: string;
  connector_type: string;
  date: string;
  time_slot: string;
  estimated_duration_min: number;
  vehicle_model: string;
  estimated_cost_inr: number;
  status: string;
  data_label: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  walletBalanceINR: number;
}
