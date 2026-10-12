import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BatteryCharging,
  Zap,
  Leaf,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  RotateCcw,
  CalendarCheck,
  TrendingUp,
  Coins,
  ChevronRight,
  Car,
  CloudSun,
  Wind,
  Droplets,
  Database,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { evoraApi } from '../services/api';
import { ChargingStation, TelemetryData, Vehicle, Booking } from '../types';
import {
  INITIAL_TELEMETRY,
  INITIAL_STATIONS,
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_USER
} from '../data/mockData';
import { getUserGreeting } from '../utils/greeting';

// Energy consumption data for the weekly chart
const WEEKLY_ENERGY_DATA = [
  { day: 'Mon', energyKwh: 16.4, km: 116, efficiency: 7.1 },
  { day: 'Tue', energyKwh: 19.2, km: 138, efficiency: 7.2 },
  { day: 'Wed', energyKwh: 14.8, km: 102, efficiency: 6.9 },
  { day: 'Thu', energyKwh: 18.6, km: 132, efficiency: 7.1 },
  { day: 'Fri', energyKwh: 21.0, km: 145, efficiency: 6.9 },
  { day: 'Sat', energyKwh: 12.5, km: 92, efficiency: 7.4 },
  { day: 'Sun (Today)', energyKwh: 18.6, km: 130, efficiency: 7.1 }
];

// Mini SoH health trend
const SOH_MINI_TREND = [
  { cycle: 360, soh: 95.2 },
  { cycle: 380, soh: 94.8 },
  { cycle: 400, soh: 94.4 },
  { cycle: 410, soh: 94.2 },
  { cycle: 421, soh: 94.0 }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState<string>(() => getUserGreeting(INITIAL_USER.name));
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [stations, setStations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLES[0]);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Dynamic time-based greeting updater: re-evaluate greeting periodically
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getUserGreeting(INITIAL_USER.name));
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const dashboard = await evoraApi.getDashboard();
      if (dashboard && dashboard.latest_telemetry) {
        setTelemetry(dashboard.latest_telemetry);
        if (dashboard.live_weather) setLiveWeather(dashboard.live_weather);
        if (Array.isArray(dashboard.recent_predictions)) setPredictionHistory(dashboard.recent_predictions);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setFetchError(null);
      } else {
        // Individual fallback
        const [tel, stns, vhls, bks, preds] = await Promise.all([
          evoraApi.getTelemetry(),
          evoraApi.getStations({ city: 'Pune' }),
          evoraApi.getVehicles(),
          evoraApi.getBookings(),
          evoraApi.getPredictionHistory(5)
        ]);
        setTelemetry(tel);
        if ((tel as any).live_weather) setLiveWeather((tel as any).live_weather);
        setStations(Array.isArray(stns) ? stns : []);
        if (Array.isArray(vhls) && vhls.length > 0) setVehicle(vhls[0]);
        setBookings(Array.isArray(bks) ? bks : []);
        if (Array.isArray(preds)) setPredictionHistory(preds);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setFetchError(null);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setFetchError('Unable to sync with live telemetry stream. Showing latest cached records.');
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh background state every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await evoraApi.refreshDynamicData();
      if (refreshed && refreshed.latest_telemetry) {
        setTelemetry(refreshed.latest_telemetry);
        if (refreshed.live_weather) setLiveWeather(refreshed.live_weather);
      }
      const preds = await evoraApi.getPredictionHistory(5);
      if (Array.isArray(preds)) setPredictionHistory(preds);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setFetchError(null);
    } catch (err) {
      console.warn('Manual refresh failed:', err);
      setFetchError('Refresh request timed out. Please check backend connection.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  };

  // Recent charging sessions
  const recentSessions = [
    {
      id: 'cs-1',
      station: 'Tata Power EZ Charge - Phoenix Marketcity',
      date: 'Yesterday, 7:30 PM',
      energyKwh: 24.2,
      costInr: 447.70,
      duration: '38 mins',
      connector: 'CCS2 60kW'
    },
    {
      id: 'cs-2',
      station: 'Home Smart Wallbox',
      date: '27 Sep, 9:15 PM',
      energyKwh: 32.0,
      costInr: 240.00,
      duration: '5h 10m',
      connector: 'Type 2 AC'
    },
    {
      id: 'cs-3',
      station: 'Jio-bp pulse - Baner High Street',
      date: '24 Sep, 6:40 PM',
      energyKwh: 18.2,
      costInr: 382.20,
      duration: '26 mins',
      connector: 'CCS2 120kW'
    }
  ];

  // Clean production skeleton loader
  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-16 bg-slate-900/60 rounded-2xl w-full border border-slate-800/80" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-72 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          <div className="lg:col-span-4 h-72 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          <div className="h-32 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          <div className="h-32 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
        </div>
      </div>
    );
  }

  const soc = telemetry.soc_percentage ?? 78;
  const usableKwh = ((soc / 100) * 40.5).toFixed(1);
  const estRange = telemetry.estimated_range_km ?? 284;
  const temp = liveWeather?.temperature_c ?? telemetry.battery_temperature_c ?? 32.5;
  const weatherCond = liveWeather?.condition ?? "Sunny / Clear";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Calm Error Notification (if connection fails) */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 2. Welcome & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {vehicle.make} {vehicle.model} • Connected • All systems operating normally
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Last updated</span>
            <span className="text-xs text-slate-200 font-semibold">{lastUpdated}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
            title="Refresh latest telemetry from server"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Vehicle Status & Environmental Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Vehicle Battery & Range Card (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          {/* Top Identifier */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {vehicle.make} {vehicle.model} {vehicle.variant}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.license_plate} • {vehicle.battery_capacity_kwh} kWh Lithium-Iron Pack
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              {telemetry.charging_status || 'Standby'}
            </span>
          </div>

          {/* Primary Metrics: State of Charge & Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
            {/* Battery Level */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Battery Level
                </span>
                <span className="text-xs text-slate-400">
                  {usableKwh} / 40.5 kWh usable
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {soc}%
              </div>
              {/* Clean Linear Battery Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, soc))}%` }}
                />
              </div>
            </div>

            {/* Estimated Range */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estimated Range
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  ~7.1 km/kWh efficiency
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {estRange} <span className="text-lg font-normal text-slate-400">km</span>
              </div>
              <p className="text-xs text-slate-400">
                Weather & driving style adjusted travel estimate
              </p>
            </div>
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Battery Health</span>
              <span className="font-semibold text-white mt-0.5 block">{telemetry.soh_percentage}% SoH</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Pack Temperature</span>
              <span className="font-semibold text-white mt-0.5 block">{telemetry.battery_temperature_c}°C</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Pack Voltage</span>
              <span className="font-semibold text-white mt-0.5 block">{telemetry.battery_voltage_v} V</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Lifetime Cycles</span>
              <span className="font-semibold text-white mt-0.5 block">{telemetry.charge_cycles} cycles</span>
            </div>
          </div>
        </div>

        {/* Live Environmental & Route Conditions (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-base text-white">Live Environmental Conditions</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Pune, IN</span>
            </div>

            {/* Current Observations Grid */}
            <div className="grid grid-cols-2 gap-4 py-5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Ambient Temperature</span>
                <span className="text-2xl font-bold text-white mt-1 block">{temp}°C</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{weatherCond}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">HVAC Range Draw</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {temp > 35 ? "-6%" : "Normal"}
                </span>
                <span className="text-[11px] text-emerald-400 mt-0.5 block">Optimal thermal zone</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                </span>
                <span className="text-lg font-bold text-white mt-1 block">{liveWeather?.humidity_percent ?? 37}%</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Dry pavement</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block flex items-center gap-1">
                  <Wind className="w-3 h-3 text-slate-400" /> Wind Speed
                </span>
                <span className="text-lg font-bold text-white mt-1 block">{liveWeather?.wind_speed_kmh ?? 2.8} km/h</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Light breeze</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => navigate('/range-prediction')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>Calculate Range with Live Conditions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Three High-Level Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Energy & Cost Savings */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Charging Cost</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">₹1,840</div>
          <p className="text-xs text-emerald-400 mt-1">
            Saved ~₹6,800 compared to petrol this month
          </p>
        </div>

        {/* Card 2: Carbon Footprint */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Displaced</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">126 kg CO₂</div>
          <p className="text-xs text-slate-400 mt-1">
            Equivalent to planting 6 mature trees in Pune
          </p>
        </div>

        {/* Card 3: Odometer & Efficiency */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Odometer & Efficiency</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">18,420 km</div>
          <p className="text-xs text-slate-400 mt-1">
            140.8 Wh/km average lifetime efficiency
          </p>
        </div>
      </div>

      {/* 5. Purpose-Driven Quick Navigation Actions */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider px-1">
          Vehicle Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/chargers')}
            className="p-4 rounded-2xl bg-[#111827] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Find Chargers
                </span>
              </div>
              <p className="text-xs text-slate-400">Search verified fast DC & AC stations in Pune</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
          </button>

          <button
            onClick={() => navigate('/range-prediction')}
            className="p-4 rounded-2xl bg-[#111827] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-sm text-white group-hover:text-purple-400 transition-colors">
                  Predict Travel Range
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-variable simulation for speed and terrain</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
          </button>

          <button
            onClick={() => navigate('/battery-health')}
            className="p-4 rounded-2xl bg-[#111827] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                  Battery Diagnostics
                </span>
              </div>
              <p className="text-xs text-slate-400">State of Health curves and cell voltage balance</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
          </button>

          <button
            onClick={() => navigate('/route')}
            className="p-4 rounded-2xl bg-[#111827] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Expressway Route
                </span>
              </div>
              <p className="text-xs text-slate-400">Plan Pune–Mumbai highway charging stops</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
          </button>
        </div>
      </div>

      {/* 6. Meaningful Data Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Energy Draw (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Daily Energy Consumption</h3>
              <p className="text-xs text-slate-400">Weekly kWh draw across regular commute routes</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Avg 7.1 km/kWh
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={telemetry.energy_consumption_7days && telemetry.energy_consumption_7days.length > 0 ? telemetry.energy_consumption_7days : WEEKLY_ENERGY_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} kWh`, 'Energy Used']}
                  labelFormatter={(lbl) => `${lbl}`}
                />
                <Bar dataKey="energyKwh" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Health Retention Trend (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">State of Health Retention</h3>
              <p className="text-xs text-slate-400">Current SoH: {telemetry.soh_percentage}% across {telemetry.charge_cycles} cycles</p>
            </div>
            <button
              onClick={() => navigate('/battery-health')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View Analysis
            </button>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SOH_MINI_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sohGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="cycle" stroke="#6B7280" fontSize={11} tickFormatter={(c) => `C${c}`} tickLine={false} />
                <YAxis domain={[90, 98]} stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val}% SoH`, 'Battery Retention']}
                />
                <Area type="monotone" dataKey="soh" stroke="#10B981" strokeWidth={2} fill="url(#sohGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Cell Voltage Delta: <strong className="text-white">0.012 V (Balanced)</strong></span>
            <span>Pack Thermal State: <strong className="text-emerald-400">Optimal</strong></span>
          </div>
        </div>
      </div>

      {/* 7. Model Inferences & Operational Audit History */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">Recent Model Inferences</h3>
              <p className="text-xs text-slate-400">
                Log of predictions calculated by the loaded predictive model from runtime data
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Engine: <strong>BatteryPredictiveModel v1.2</strong>
          </span>
        </div>

        {predictionHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-2.5 font-semibold">Time</th>
                  <th className="pb-2.5 font-semibold">Model</th>
                  <th className="pb-2.5 font-semibold">Evaluated Input Features</th>
                  <th className="pb-2.5 font-semibold">Prediction Result</th>
                  <th className="pb-2.5 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {predictionHistory.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 font-mono text-slate-400">
                      {p.timestamp ? new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>
                    <td className="py-2.5 font-medium text-white">
                      {p.model_name}
                    </td>
                    <td className="py-2.5 text-slate-300">
                      {p.input_features?.battery_level ? (
                        <span>Battery: {p.input_features.battery_level}% • Temp: {p.input_features.temperature_c}°C • Style: {p.input_features.driving_style}</span>
                      ) : p.input_features?.current_cycles ? (
                        <span>Cycles: {p.input_features.current_cycles} • Temp: {p.input_features.average_temp}°C</span>
                      ) : (
                        <span>Dynamic Runtime Telemetry</span>
                      )}
                    </td>
                    <td className="py-2.5 font-semibold text-emerald-400">
                      {p.prediction_output?.predicted_range_km ? (
                        <span>{p.prediction_output.predicted_range_km} km Estimated Range</span>
                      ) : p.prediction_output?.estimated_soh ? (
                        <span>{p.prediction_output.estimated_soh}% SoH</span>
                      ) : (
                        <span>{JSON.stringify(p.prediction_output)}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {p.confidence_percentage ? `${p.confidence_percentage}%` : '94%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No inference logs recorded yet. Inferences appear as range and diagnostics calculations are executed.
          </div>
        )}
      </div>

      {/* 8. Active Reservation, Charging History & Verified Nearby Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Reservation & Recent Charges (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Upcoming Reservation Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Upcoming Reservation</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Confirmed Slot
              </span>
            </div>

            {bookings.length > 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{bookings[0].station_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Viman Nagar, Pune, Maharashtra</p>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    ₹{bookings[0].estimated_cost_inr} Est.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300">
                    <span className="text-[10px] text-slate-400 block font-medium">Slot Time</span>
                    <span className="font-semibold text-white">{bookings[0].date}, {bookings[0].time_slot}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300">
                    <span className="text-[10px] text-slate-400 block font-medium">Connector</span>
                    <span className="font-semibold text-emerald-400">{bookings[0].connector_type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => navigate('/route')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Get Directions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Manage Reservations
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No active slot reservations. <button onClick={() => navigate('/chargers')} className="text-emerald-400 underline">Browse charging stations</button> to book.
              </div>
            )}
          </div>

          {/* Recent Charging Sessions */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Recent Charging Sessions</h3>
              </div>
              <button
                onClick={() => navigate('/charging-history')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-white text-xs">{s.station}</h4>
                    <p className="text-[11px] text-slate-400">
                      {s.date} • {s.connector} • {s.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white block">{s.energyKwh} kWh</span>
                    <span className="text-[11px] text-slate-400">₹{s.costInr.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Nearby Charging Stations in Pune (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Nearby Charging Stations</h3>
              <p className="text-xs text-slate-400">Verified network hubs across Pune, Maharashtra</p>
            </div>
            <button
              onClick={() => navigate('/chargers')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(Array.isArray(stations) ? stations : []).slice(0, 3).map((st) => (
              <div
                key={st.id}
                onClick={() => navigate(`/chargers/${st.id}`)}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {st.operator}
                      </span>
                      <span className="text-xs text-slate-400">{st.city}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors mt-1">
                      {st.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white flex items-center justify-end gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      {st.power_kw} kW
                    </span>
                    <span className="text-[11px] text-slate-400">₹{st.tariff_inr_per_kwh}/kWh</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">{st.address}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    {st.ports_available_demo}/{st.ports_total} ports available
                  </span>

                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                    <span>View Station</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
