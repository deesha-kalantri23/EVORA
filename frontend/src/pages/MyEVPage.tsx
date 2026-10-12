import React, { useState, useEffect } from 'react';
import {
  Car,
  BatteryCharging,
  Zap,
  Activity,
  Gauge,
  Clock,
  ShieldCheck,
  Edit3,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Flame,
  Droplets,
  Coins,
  Cpu,
  Layers,
  Thermometer,
  RotateCw,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { INITIAL_VEHICLES, INITIAL_TELEMETRY } from '../data/mockData';
import { evoraApi } from '../services/api';
import { Vehicle, TelemetryData } from '../types';

export const MyEVPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  // Vehicle profile specifications (user-entered & manufacturer specs)
  const [vehicle, setVehicle] = useState({
    id: "v-nexon-01",
    make: "Tata",
    model: "Nexon EV",
    variant: "Long Range",
    year: 2025,
    battery_capacity_kwh: 40.5,
    charging_type: "AC + DC (CCS2)",
    license_plate: "MH 12 TE 4590",
    vin: "MAT624589P2E99012",
    city: "Pune",
    state: "Maharashtra",
    rated_range_km: 465,
    real_world_range_km: 284,
    odometer_km: 18420,
    avg_efficiency_km_per_kwh: 7.1,
    current_soc_percentage: 78,
    battery_health_percentage: 94,
    max_ac_kw: 7.2,
    max_dc_kw: 50.0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...vehicle });
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    evoraApi.getTelemetry().then(t => setTelemetry(t)).catch(console.error);
  }, []);

  // Synchronize form when vehicle changes
  useEffect(() => {
    setFormData({ ...vehicle });
  }, [vehicle]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicle({ ...formData });
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Monthly driving distance data
  const monthlyDrivingData = [
    { month: 'Apr', km: 1350, kwh: 190 },
    { month: 'May', km: 1620, kwh: 228 },
    { month: 'Jun', km: 1480, kwh: 208 },
    { month: 'Jul', km: 1750, kwh: 246 },
    { month: 'Aug', km: 1890, kwh: 266 },
    { month: 'Sep', km: 1950, kwh: 274 }
  ];

  // Charging distribution data
  const chargingSplitData = [
    { name: 'Home Slow AC (7.2kW)', value: 74, color: '#00D26A' },
    { name: 'Public DC Fast (50kW)', value: 26, color: '#38BDF8' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Vehicle profile updated successfully!</span>
        </div>
      )}

      {/* Header & Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Electric Vehicle
            </h1>
            <Badge variant="emerald" icon={ShieldCheck}>
              Verified Garage Profile
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete vehicle profile, powertrain specifications, battery diagnostics, and service logs
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ ...vehicle });
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Vehicle</span>
        </button>
      </div>

      {/* ==================================================
          SECTION 1: VEHICLE OVERVIEW
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">1. Vehicle Overview</h2>
          </div>
          <Badge variant="slate">Registered in {vehicle.city}, {vehicle.state}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Vehicle Title Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Primary Vehicle
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-[#0F172A] px-3 py-1 rounded-full border border-slate-800">
                {vehicle.license_plate}
              </span>
            </div>

            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                {vehicle.variant} • Model Year {vehicle.year}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                VIN: {vehicle.vin}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Odometer (Logged)</span>
                <span className="text-base font-black text-white mt-0.5 block">
                  {telemetry.odometer_km.toLocaleString()} km
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Avg Efficiency (EVIoT)</span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                  {telemetry.avg_efficiency_km_per_kwh || 7.1} km/kWh
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Charging Port Spec</span>
                <span className="text-base font-black text-white mt-0.5 block">
                  {vehicle.charging_type}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Circular Battery State & Health Quick Glance (Dataset Telemetry) */}
          <div className="lg:col-span-6 flex flex-wrap items-center justify-center lg:justify-end gap-6 bg-[#0F172A]/60 p-6 rounded-2xl border border-slate-800/80">
            {/* Battery Circular Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - (238.76 * telemetry.soc_percentage) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{telemetry.soc_percentage}%</span>
                <span className="text-[10px] text-slate-400 block font-medium">SoC (EVIoT)</span>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Estimated Range</span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {telemetry.estimated_range_km} <span className="text-sm font-bold text-emerald-400">km</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Rated ARAI Spec: {vehicle.rated_range_km} km</span>
              </div>

              <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Battery Health</span>
                  <span className="font-extrabold text-white text-sm">{telemetry.soh_percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Pack Capacity</span>
                  <span className="font-extrabold text-white text-sm">{vehicle.battery_capacity_kwh} kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 2: VEHICLE SPECIFICATIONS
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">2. Vehicle Specifications</h2>
          </div>
          <Badge variant="blue">Gen-2 Ziptron Powertrain</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Motor Type</span>
            <span className="font-bold text-white text-sm block">PMSM</span>
            <span className="text-[10px] text-slate-500">Permanent Magnet Sync</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Peak Power</span>
            <span className="font-bold text-white text-sm block">106.4 kW</span>
            <span className="text-[10px] text-emerald-400">143 bhp</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Peak Torque</span>
            <span className="font-bold text-white text-sm block">215 Nm</span>
            <span className="text-[10px] text-slate-500">Instant off the line</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Acceleration</span>
            <span className="font-bold text-white text-sm block">0-100 in 8.9s</span>
            <span className="text-[10px] text-slate-500">Top Speed: 150 km/h</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Drive & Drivetrain</span>
            <span className="font-bold text-white text-sm block">Front Wheel Drive</span>
            <span className="text-[10px] text-slate-500">Single-speed reduction</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Regenerative Modes</span>
            <span className="font-bold text-white text-sm block">4 Selectable Levels</span>
            <span className="text-[10px] text-emerald-400">Paddle shifter control</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">AC Home Charging</span>
            <span className="font-bold text-white text-sm block">7.2 kW Type 2</span>
            <span className="text-[10px] text-slate-500">10-100% in ~6.0 hrs</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">DC Fast Charging</span>
            <span className="font-bold text-white text-sm block">50 kW CCS2</span>
            <span className="text-[10px] text-slate-500">10-80% in ~56 mins</span>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 3: BATTERY INFORMATION
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">3. Battery Information</h2>
          </div>
          <Badge variant="emerald">EVIoT Predictive Model Calibrated</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Nominal Capacity</span>
            <span className="font-black text-white text-base block">{vehicle.battery_capacity_kwh} kWh</span>
            <span className="text-[10px] text-slate-500">Usable: ~38.07 kWh</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Chemistry & Pack</span>
            <span className="font-black text-white text-base block">LFP Prismatic</span>
            <span className="text-[10px] text-emerald-400">IP67 Ingress Rated</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">State of Health (SoH)</span>
            <span className="font-black text-emerald-400 text-base block">{telemetry.soh_percentage}%</span>
            <span className="text-[10px] text-slate-500">{telemetry.pack_health_status}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Total Charge Cycles</span>
            <span className="font-black text-white text-base block">{telemetry.charge_cycles} Cycles</span>
            <span className="text-[10px] text-slate-500">Expected: 1,500+</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Operating Voltage</span>
            <span className="font-bold text-white text-sm block">{telemetry.battery_voltage_v} V</span>
            <span className="text-[10px] text-slate-500">Pack Bus Nominal 380-410V</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Pack Temperature</span>
            <span className="font-bold text-emerald-400 text-sm block">{telemetry.battery_temperature_c} °C</span>
            <span className="text-[10px] text-slate-500">Min {telemetry.cell_temp_min_c}°C / Max {telemetry.cell_temp_max_c}°C</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Cell Balancing Delta</span>
            <span className="font-bold text-white text-sm block">{telemetry.cell_balance_status?.includes('0.012') ? '0.012 V' : 'Balanced'}</span>
            <span className="text-[10px] text-emerald-400">Optimum (&lt;0.030V)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Thermal Circuit</span>
            <span className="font-bold text-white text-sm block">Liquid Chilled</span>
            <span className="text-[10px] text-slate-500">Glycol-water active</span>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 4: DRIVING STATISTICS
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">4. Driving Statistics</h2>
          </div>
          <Badge variant="emerald">Lifetime Cumulative</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Total Distance Driven</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {vehicle.odometer_km.toLocaleString()} km
            </span>
            <span className="text-[10px] text-slate-500">384 total trips</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Average Efficiency</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {vehicle.avg_efficiency_km_per_kwh} km/kWh
            </span>
            <span className="text-[10px] text-slate-500">140.8 Wh/km</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Total Energy Used</span>
            <span className="text-2xl font-black text-white mt-1 block">
              2,594 kWh
            </span>
            <span className="text-[10px] text-slate-500">From traction battery</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Driving Mode Share</span>
            <span className="text-base font-bold text-white mt-1 block">
              68% Eco • 24% City
            </span>
            <span className="text-[10px] text-slate-500">8% Sport spirited</span>
          </div>
        </div>

        {/* Monthly Driving Distance Chart */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Monthly Kilometers Traveled (Past 6 Months)
          </h4>
          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDrivingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} km`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} km`, 'Distance']}
                />
                <Bar dataKey="km" fill="#00D26A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 5: CHARGING STATISTICS
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">5. Charging Statistics</h2>
          </div>
          <Badge variant="blue">Pune & Maharashtra</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Metrics */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Total Charging Sessions</span>
              <span className="text-2xl font-black text-white block">142 Sessions</span>
              <span className="text-[10px] text-slate-500">2,840 kWh drawn</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Total Charging Cost</span>
              <span className="text-2xl font-black text-emerald-400 block">₹18,450</span>
              <span className="text-[10px] text-slate-500">Avg ₹1.45 per km</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Net Savings vs Petrol</span>
              <span className="text-2xl font-black text-white block">₹67,950</span>
              <span className="text-[10px] text-emerald-400">Based on ₹106/L petrol</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Favorite Public Station</span>
              <span className="font-bold text-white text-xs block truncate">
                Tata Power Phoenix Marketcity
              </span>
              <span className="text-[10px] text-slate-500">Viman Nagar, Pune</span>
            </div>
          </div>

          {/* Donut Chart of AC vs DC */}
          <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center">
            <h4 className="text-xs font-bold text-white mb-2">Home AC vs Public DC Share</h4>
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chargingSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {chargingSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Home AC (74%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Public DC (26%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 6: MAINTENANCE
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">6. Maintenance & Component Health</h2>
          </div>
          <Badge variant="emerald">All Systems Healthy</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-[11px] block">Last Service Inspection</span>
            <span className="font-bold text-white text-sm block">15,000 km</span>
            <span className="text-[10px] text-emerald-400">Completed at Tata Motors Pune</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-[11px] block">Next Scheduled Service</span>
            <span className="font-bold text-white text-sm block">30,000 km</span>
            <span className="text-[10px] text-slate-400">Due in 11,580 km</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-[11px] block">12V Aux Battery</span>
            <span className="font-bold text-emerald-400 text-sm block">Healthy (13.6 V)</span>
            <span className="text-[10px] text-slate-500">Lead-acid accessory bus</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-[11px] block">Brake Pad Thickness</span>
            <span className="font-bold text-white text-sm block">88% Remaining</span>
            <span className="text-[10px] text-emerald-400">Preserved by Level 2 Regen</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Firmware Version: V2.4.1 (OTA-Active)</span>
              <span className="text-[11px] text-slate-400">BMS thermal curve optimization patch applied</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            Up to date
          </span>
        </div>
      </div>

      {/* ==================================================
          SECTION 7: RECENT ACTIVITY
      ================================================== */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">7. Recent Activity & Diagnostic Logs</h2>
          </div>
          <Badge variant="slate">Automated Log</Badge>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Fast DC Charging Completed</h4>
                <span className="text-[10px] text-slate-500">Yesterday, 20:08</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                Added 24.2 kWh (42% to 78%) at Tata Power EZ Charge Phoenix Marketcity, Pune in 38 minutes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Pune to Lonavala Trip Completed</h4>
                <span className="text-[10px] text-slate-500">26 Sep 2026, 17:30</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                Distance: 64.8 km • Energy: 9.2 kWh • Average Speed: 52 km/h • Efficiency: 7.04 km/kWh.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">EVIoT Telemetry Health Scan Passed</h4>
                <span className="text-[10px] text-slate-500">25 Sep 2026, 09:00</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                All 96 cells verified within 0.012V delta tolerance. Inverter and thermal cooling pump nominal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          EDIT VEHICLE MODAL / FORM
      ================================================== */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Edit Demo Vehicle Information</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Make / Brand</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => handleFormChange('make', e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleFormChange('model', e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Variant</label>
                  <input
                    type="text"
                    value={formData.variant}
                    onChange={(e) => handleFormChange('variant', e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Battery Capacity (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.battery_capacity_kwh}
                    onChange={(e) => handleFormChange('battery_capacity_kwh', parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current SoC (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.current_soc_percentage}
                    onChange={(e) => handleFormChange('current_soc_percentage', parseInt(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Battery Health SoH (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.battery_health_percentage}
                    onChange={(e) => handleFormChange('battery_health_percentage', parseInt(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={formData.odometer_km}
                    onChange={(e) => handleFormChange('odometer_km', parseInt(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Avg Efficiency (km/kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.avg_efficiency_km_per_kwh}
                    onChange={(e) => handleFormChange('avg_efficiency_km_per_kwh', parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registration / Number Plate</label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => handleFormChange('license_plate', e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
