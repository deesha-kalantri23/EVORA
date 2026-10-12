import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BatteryCharging,
  Zap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sliders,
  FileText,
  X,
  ArrowRight,
  Info,
  ChevronRight,
  CalendarCheck,
  Calendar,
  Eye,
  Timer,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Badge } from '../components/Badge';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';

interface LinkedBookingData {
  bookingId: string;
  stationName: string;
  address: string;
  city: string;
  date: string;
  timeSlot: string;
  connector: string;
  estimatedCostInr: number;
  durationMin: number;
  status: string;
}

const DEFAULT_BOOKING: LinkedBookingData = {
  bookingId: 'BK-2026-9042',
  stationName: 'Tata Power EZ Charge - Phoenix Marketcity',
  address: 'Viman Nagar, Pune, Maharashtra',
  city: 'Pune',
  date: 'Today, 30 Sep 2026',
  timeSlot: '18:15 - 02:15 (+1 Day) • 8.0 hrs',
  connector: 'CCS2 (60 kW Fast DC)',
  estimatedCostInr: 690.0,
  durationMin: 480, // 8.0 hrs full charge
  status: 'Upcoming'
};

// Dynamic chart data generators based on session duration
const getBatteryChartData = (durationMin: number, currentBattery: number, targetBattery: number) => {
  if (durationMin >= 360) {
    return [
      { time: '0h', battery: 20 },
      { time: '1.5h', battery: 35 },
      { time: '3.0h', battery: 52 },
      { time: '4.5h', battery: 68 },
      { time: '6.0h', battery: 83 },
      { time: '7.0h (Now)', battery: Math.round(currentBattery) },
      { time: `${(durationMin / 60).toFixed(0)}h (Est)`, battery: targetBattery }
    ];
  }
  if (durationMin >= 120) {
    return [
      { time: '0m', battery: 20 },
      { time: '30m', battery: 38 },
      { time: '60m', battery: 54 },
      { time: '90m (Now)', battery: Math.round(currentBattery) },
      { time: `${durationMin}m (Est)`, battery: targetBattery }
    ];
  }
  return [
    { time: '0m', battery: 20 },
    { time: '10m', battery: 36 },
    { time: '20m (Now)', battery: Math.round(currentBattery) },
    { time: '32m (Est)', battery: Math.min(targetBattery, 80) },
    { time: `${durationMin}m (Est)`, battery: targetBattery }
  ];
};

const getPowerChartData = (durationMin: number, powerKw: number) => {
  if (durationMin >= 360) {
    return [
      { time: '0h', powerKw: 7.2 },
      { time: '2h', powerKw: 7.2 },
      { time: '4h', powerKw: 7.1 },
      { time: '6h', powerKw: 6.8 },
      { time: '7h (Now)', powerKw: powerKw },
      { time: '8h (Est)', powerKw: 3.5 }
    ];
  }
  return [
    { time: '0m', powerKw: 48 },
    { time: '5m', powerKw: 49 },
    { time: '10m', powerKw: 47 },
    { time: '15m', powerKw: 45 },
    { time: '20m (Now)', powerKw: powerKw },
    { time: '25m (Est)', powerKw: 34 },
    { time: '30m (Est)', powerKw: 22 },
    { time: `${durationMin}m (Est)`, powerKw: 15 }
  ];
};

const getEnergyChartData = (durationMin: number, currentEnergy: number) => {
  const targetEnergy = +(Math.min(40.5, (durationMin / 480) * 38.5 + 4.0).toFixed(1));
  if (durationMin >= 360) {
    return [
      { time: '0h', energyKwh: 0.0 },
      { time: '2h', energyKwh: 12.5 },
      { time: '4h', energyKwh: 24.0 },
      { time: '6h', energyKwh: 33.2 },
      { time: '7h (Now)', energyKwh: currentEnergy },
      { time: '8h (Est)', energyKwh: 40.5 }
    ];
  }
  return [
    { time: '0m', energyKwh: 0.0 },
    { time: '5m', energyKwh: 4.1 },
    { time: '10m', energyKwh: 8.5 },
    { time: '15m', energyKwh: 13.2 },
    { time: '20m (Now)', energyKwh: currentEnergy },
    { time: '25m (Est)', energyKwh: 22.8 },
    { time: '32m (Est)', energyKwh: 27.5 },
    { time: `${durationMin}m (Est)`, energyKwh: targetEnergy }
  ];
};

export const ChargingPage: React.FC = () => {
  const navigate = useNavigate();

  // Linked Booking State (synced from localStorage or default demo booking)
  const [linkedBooking, setLinkedBooking] = useState<LinkedBookingData>(() => {
    try {
      const stored = localStorage.getItem('evora_active_booking');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_BOOKING;
  });

  const [availableBookings, setAvailableBookings] = useState<LinkedBookingData[]>(() => {
    try {
      const storedList = localStorage.getItem('evora_bookings_list');
      if (storedList) {
        const parsed = JSON.parse(storedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [DEFAULT_BOOKING];
  });

  // Charging session state (initialized based on booking)
  const durationMin = linkedBooking.durationMin || 480;
  const isFullCharge = durationMin >= 400;

  const [charging, setCharging] = useState(true);
  const [battery, setBattery] = useState(54); // Battery: 54%
  const [target, setTarget] = useState(isFullCharge ? 100 : 80);
  const [power, setPower] = useState(isFullCharge ? 7.2 : 42); // 7.2 kW AC or 42 kW DC
  const [energyDelivered, setEnergyDelivered] = useState(isFullCharge ? 28.6 : 18.4);

  // Modals
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(isFullCharge ? 100 : 80);
  const [activeTab, setActiveTab] = useState<'battery' | 'power' | 'energy'>('battery');

  // Live simulation tick when charging
  useEffect(() => {
    let interval: any = null;
    if (charging && battery < target) {
      interval = setInterval(() => {
        setBattery((prev) => {
          const next = +(prev + 0.1).toFixed(1);
          if (next >= target) {
            setCharging(false);
            return target;
          }
          return next;
        });
        setEnergyDelivered((prev) => +(prev + 0.02).toFixed(2));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [charging, battery, target]);

  // Remaining minutes estimation based on target - battery and duration:
  const percentRemaining = Math.max(0, target - battery);
  const totalPercentSpan = Math.max(1, target - 20);
  const estimatedRemainingMinutes = Math.max(
    1,
    Math.round((percentRemaining / totalPercentSpan) * (durationMin * 0.72))
  );

  const formatRemainingDuration = (minutes: number) => {
    if (minutes <= 0) return 'Complete';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m remaining`;
    if (hrs > 0) return `${hrs}h remaining`;
    return `${mins} mins remaining`;
  };

  const getClockCompletionTime = (timeSlotStr: string) => {
    if (timeSlotStr && timeSlotStr.includes(' - ')) {
      const parts = timeSlotStr.split(' - ')[1].split(' •')[0];
      return parts.trim();
    }
    const now = new Date();
    const end = new Date(now.getTime() + estimatedRemainingMinutes * 60000);
    const h = end.getHours();
    const m = end.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = (h % 12 || 12).toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  const tariffInr = isFullCharge ? 14.5 : 18.5; // Demo Tariff per kWh
  const currentCost = (energyDelivered * tariffInr).toFixed(2);

  const handleSaveTarget = () => {
    setTarget(tempTarget);
    setShowTargetModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="monitor_charging" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Charging Monitor
            </h1>
            <Badge variant="emerald">
              Simulation / Demo Session
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monitoring of DC fast-charging curve, thermal regulation, and energy delivered
          </p>
        </div>

        {/* Global Label */}
        <div className="flex items-center gap-2">
          <Badge variant="emerald" icon={CalendarCheck}>
            Linked to Reservation
          </Badge>
          <Badge variant="slate" icon={Info}>
            Live Simulated Session
          </Badge>
        </div>
      </div>

      {/* Linked Booking Session Banner */}
      <div className="bg-[#131B2B] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CalendarCheck className="w-3.5 h-3.5" />
                Linked Reserved Session: {linkedBooking.bookingId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Clock className="w-3 h-3 text-cyan-400" />
                {linkedBooking.timeSlot}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Timer className="w-3 h-3" />
                {(durationMin / 60).toFixed(1)} hrs duration {isFullCharge ? '(Full Charge)' : ''}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                {linkedBooking.stationName}
              </h2>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {linkedBooking.address}, {linkedBooking.city}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {availableBookings.length > 1 && (
              <select
                aria-label="Switch active reservation"
                value={linkedBooking.bookingId}
                onChange={(e) => {
                  const b = availableBookings.find((x) => x.bookingId === e.target.value);
                  if (b) {
                    setLinkedBooking(b);
                    localStorage.setItem('evora_active_booking', JSON.stringify(b));
                    const isF = (b.durationMin || 480) >= 400;
                    setTarget(isF ? 100 : 80);
                    setPower(isF ? 7.2 : 42);
                    setEnergyDelivered(isF ? 28.6 : 18.4);
                  }
                }}
                className="bg-[#0F172A] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                {availableBookings.map((b) => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.stationName.slice(0, 22)}... ({b.timeSlot})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => navigate('/bookings')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <span>Manage Bookings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Charging Dial (Left) & Live Metrics + Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated Charging Gauge (7 cols) */}
        <div className="lg:col-span-7 bg-[#131B2B] border border-[#243046] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            {/* Status Pill */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                {charging ? (isFullCharge ? '8h Full AC Charging Active' : 'Fast DC Charging Active') : 'Charging Paused'}
              </span>
            </div>

            {/* Circular Visual Gauge */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-56 h-56 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-emerald-400 transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * battery) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
                {/* Target marker indicator */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-amber-400/40"
                  strokeWidth="2"
                  strokeDasharray="1, 8"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <div className="absolute text-center space-y-0.5">
                <span className="text-5xl font-black text-white">{Math.round(battery)}%</span>
                <span className="text-xs font-semibold text-slate-400 block">Current Battery</span>
                <span className="text-[11px] text-emerald-400 font-bold block">
                  Target: {target}%
                </span>
              </div>
            </div>

            {/* 3 Main Action Buttons: Set Target, Stop Charging, View Session */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={() => {
                  setTempTarget(target);
                  setShowTargetModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Set Target</span>
              </button>

              <button
                onClick={() => setCharging(!charging)}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md ${
                  charging
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {charging ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{charging ? 'Stop Charging' : 'Resume Charging'}</span>
              </button>

              <button
                onClick={() => setShowSessionModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>View Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Telemetry KPI Pillars (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Live Session Telemetry</h3>
                <span className="text-[11px] text-slate-400 font-mono">{linkedBooking.bookingId}</span>
              </div>
              <Badge variant="blue">{linkedBooking.connector}</Badge>
            </div>

            <div className="space-y-3 text-xs">
              {/* Charging Power */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Charging Power
                </span>
                <span className="text-base font-black text-white">{power} kW</span>
              </div>

              {/* Energy Delivered */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-blue-400" /> Energy Delivered
                </span>
                <span className="text-base font-black text-white">{energyDelivered} kWh</span>
              </div>

              {/* Estimated Completion & Target Finish Time */}
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Est. Time to Complete
                  </span>
                  <span className="text-base font-black text-amber-400">
                    {formatRemainingDuration(estimatedRemainingMinutes)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    Target Finish Time:
                  </span>
                  <span className="font-bold text-emerald-400">
                    {getClockCompletionTime(linkedBooking.timeSlot)}
                  </span>
                </div>
                {/* Session Completion Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Progress to {target}%</span>
                    <span>{Math.min(100, Math.max(5, Math.round(((battery - 20) / Math.max(1, target - 20)) * 100)))}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(5, Math.round(((battery - 20) / Math.max(1, target - 20)) * 100)))}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Current Cost */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400">Current Cost (₹{tariffInr.toFixed(2)}/kWh)</span>
                <span className="text-base font-black text-emerald-400">₹{currentCost}</span>
              </div>
            </div>
          </div>

          {/* Thermal & Safety Note */}
          <div className="p-4 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isFullCharge ? 'Standard 8h Full AC BMS Balancing' : 'Active BMS Thermal Management'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isFullCharge
                ? `Standard full 8.0 hr AC charging active. Cell voltage balancing automatically manages cell groups up to ${target}% with minimal thermal stress and maximum battery lifespan.`
                : `Pack temperature is regulated at 29.8°C with active liquid cooling. Charging power automatically tapers when approaching ${target}% to preserve State of Health.`}
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Required Charts (Battery vs Time, Charging Power, Energy Delivered) */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">Live Charging Analytics</h3>
            <p className="text-xs text-slate-400">Review real-time progression across the session duration</p>
          </div>

          {/* Chart Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('battery')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'battery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Battery vs Time
            </button>
            <button
              onClick={() => setActiveTab('power')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'power' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Charging Power
            </button>
            <button
              onClick={() => setActiveTab('energy')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'energy' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Energy Delivered
            </button>
          </div>
        </div>

        {/* Active Chart Viewport */}
        <div className="h-72 w-full pt-2">
          {activeTab === 'battery' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getBatteryChartData(durationMin, battery, target)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D26A" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00D26A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Battery SoC']}
                />
                <Area type="monotone" dataKey="battery" stroke="#00D26A" strokeWidth={3} fill="url(#batteryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'power' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getPowerChartData(durationMin, power)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, isFullCharge ? 12 : 70]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} kW`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} kW`, 'Charging Power']}
                />
                <Line type="monotone" dataKey="powerKw" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'energy' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getEnergyChartData(durationMin, energyDelivered)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, isFullCharge ? 65 : 35]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} kWh`, 'Energy Delivered']}
                />
                <Area type="monotone" dataKey="energyKwh" stroke="#38BDF8" strokeWidth={3} fill="url(#energyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Set Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span>Set Charging Target</span>
              </h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Target SoC</span>
                <span className="text-2xl font-black text-emerald-400">{tempTarget}%</span>
              </div>

              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={tempTarget}
                onChange={(e) => setTempTarget(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2">
                {[80, 90, 100].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTempTarget(t)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      tempTarget === t
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {t}% {t === 80 ? '(Ideal)' : ''}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                * Capping charge at 80% is recommended for daily driving to maximize LFP/NMC cell longevity.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Save Target
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Live Session Receipt</span>
              </h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Charging Hub</span>
                <h4 className="font-bold text-white text-sm">{linkedBooking.stationName}</h4>
                <p className="text-[11px] text-slate-400">{linkedBooking.address}, {linkedBooking.city}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Slot: {linkedBooking.timeSlot}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Booking Reference</span>
                  <span className="font-mono font-bold text-white">{linkedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Connector Type</span>
                  <span className="font-bold text-white">{linkedBooking.connector}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Energy Delivered</span>
                  <span className="font-bold text-white">{energyDelivered} kWh</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Applicable Tariff</span>
                  <span className="font-bold text-white">₹{tariffInr.toFixed(2)} / kWh</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-200">Current Total (INR)</span>
                  <span className="text-base font-black text-emerald-400">₹{currentCost}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                Simulation session: No financial transaction is charged to your real bank card or UPI.
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSessionModal(false);
                    navigate('/charging-history');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
                >
                  View Charging History
                </button>
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
