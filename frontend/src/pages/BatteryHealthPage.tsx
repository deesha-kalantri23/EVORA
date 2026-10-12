import React, { useState } from 'react';
import {
  Activity,
  Zap,
  TrendingDown,
  Info,
  Clock,
  ShieldCheck,
  AlertCircle,
  Thermometer,
  Gauge,
  Cpu,
  Layers,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { evoraApi } from '../services/api';

// 1. Historical cycles trend
const HEALTH_TREND_DATA = [
  { cycle: 50, soh: 99.2 },
  { cycle: 100, soh: 98.4 },
  { cycle: 150, soh: 97.6 },
  { cycle: 200, soh: 96.9 },
  { cycle: 250, soh: 96.2 },
  { cycle: 300, soh: 95.5 },
  { cycle: 350, soh: 94.8 },
  { cycle: 400, soh: 94.2 },
  { cycle: 421, soh: 94.0 }
];

// 2. Battery Temperature Trend during operation (°C)
const TEMPERATURE_DATA = [
  { time: '08:00', temp: 26.5, ambient: 24 },
  { time: '10:00', temp: 29.2, ambient: 27 },
  { time: '12:00', temp: 31.8, ambient: 31 },
  { time: '14:00 (Fast DC)', temp: 33.4, ambient: 32 },
  { time: '16:00', temp: 32.0, ambient: 31 },
  { time: '18:00', temp: 29.5, ambient: 28 },
  { time: '20:00', temp: 27.8, ambient: 26 }
];

// 3. SoC Trend (State of Charge %)
const SOC_TREND_DATA = [
  { time: '06:00', soc: 95 },
  { time: '09:00', soc: 86 },
  { time: '12:00', soc: 68 },
  { time: '14:30 (Charged)', soc: 85 },
  { time: '17:00', soc: 78 },
  { time: '20:00', soc: 78 }
];

// 4. Charge Cycles Cumulative Growth
const CHARGE_CYCLES_DATA = [
  { month: 'Apr', cycles: 340 },
  { month: 'May', cycles: 362 },
  { month: 'Jun', cycles: 379 },
  { month: 'Jul', cycles: 395 },
  { month: 'Aug', cycles: 408 },
  { month: 'Sep', cycles: 421 }
];

export const BatteryHealthPage: React.FC = () => {
  const [activeChartTab, setActiveChartTab] = useState<'health' | 'temp' | 'soc' | 'cycles' | 'degradation'>('health');
  const [healthData, setHealthData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    Promise.all([
      evoraApi.getBatteryHealth(),
      evoraApi.getDegradationForecast(500)
    ]).then(([bh, fc]) => {
      setHealthData(bh);
      if (fc && fc.forecast) setForecastData(fc.forecast);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const soh = healthData?.soh_percentage ?? 94;
  const soc = healthData?.soc_percentage ?? 78;
  const temp = healthData?.battery_temperature_c ?? 28.4;
  const volt = healthData?.battery_voltage_v ?? 394.8;
  const curr = healthData?.battery_current_a ?? 0.0;
  const cycles = healthData?.charge_cycles ?? 421;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Battery Health & Pack Diagnostics
            </h1>
            <Badge variant="emerald" icon={Cpu}>
              EVIoT Telemetry Baseline
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time state-of-health tracking, degradation modeling, and cell temperature analysis
          </p>
        </div>

        {/* Global Dataset Label Notice */}
        <div className="flex items-center gap-2">
          <Badge variant="slate" icon={Info}>
            Tata Nexon EV (40.5 kWh Pack)
          </Badge>
        </div>
      </div>

      {/* Hero: Battery Health Score & Status Card */}
      <div className="bg-gradient-to-r from-[#131B2B] via-[#162338] to-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Diagnostic Evaluation
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {soh} <span className="text-2xl font-bold text-slate-400">/ 100</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Status: {healthData?.pack_health_status ?? "Healthy"}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Calculated from EVIoT generic battery telemetry records. Pack voltage is nominal at {volt}V and cell balancing delta is {healthData?.cell_balance_status?.includes("0.012") ? "0.012 V" : "optimal"} with {cycles} logged charge cycles.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block">Pack Condition</span>
              <span className="font-extrabold text-white text-sm block">Healthy (Grade A)</span>
              <span className="text-[10px] text-emerald-400">Degradation: -{(100 - soh).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Required Telemetry Cards */}
      <div>
        <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3 px-1">
          Active Battery Telemetry Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: SoH */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">SoH</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{soh}%</span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">State of Health</span>
            </div>
          </div>

          {/* Card 2: SoC */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">SoC</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{soc}%</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">State of Charge</span>
            </div>
          </div>

          {/* Card 3: Temperature */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Temperature</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{temp}°C</span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Thermal: Normal</span>
            </div>
          </div>

          {/* Card 4: Voltage */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Voltage</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{volt} V</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Pack Bus Voltage</span>
            </div>
          </div>

          {/* Card 5: Current */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Current</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{curr === 0 ? "0.0 A" : `${curr} A`}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Simulation (Idle)</span>
            </div>
          </div>

          {/* Card 6: Charge Cycles */}
          <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cycles</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white block">{cycles}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{cycles} / 1500+ rated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Required Charts in an Interactive Tabbed Card */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">EVIoT Telemetry & Degradation Visualizer</h3>
            <p className="text-xs text-slate-400">Explore telemetry trends calibrated on the EVIoT predictive maintenance dataset</p>
          </div>

          {/* Chart Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveChartTab('health')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'health' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Health Trend
            </button>
            <button
              onClick={() => setActiveChartTab('temp')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'temp' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Temperature
            </button>
            <button
              onClick={() => setActiveChartTab('soc')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'soc' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. SoC
            </button>
            <button
              onClick={() => setActiveChartTab('cycles')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'cycles' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Cycles
            </button>
            <button
              onClick={() => setActiveChartTab('degradation')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'degradation' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              5. Degradation Forecast
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 w-full pt-2">
          {activeChartTab === 'health' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HEALTH_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D26A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00D26A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="cycle" stroke="#64748B" fontSize={11} tickFormatter={(c) => `Cycle ${c}`} />
                <YAxis domain={[90, 100]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val}% SoH`, 'Battery Health']}
                  labelFormatter={(lbl) => `Charge Cycle: ${lbl}`}
                />
                <Area type="monotone" dataKey="soh" stroke="#00D26A" strokeWidth={3} fill="url(#sohGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'temp' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMPERATURE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[20, 45]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}°C`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} °C`, 'Temperature']}
                />
                <Line type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={3} name="Battery Pack Temp" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ambient" stroke="#64748B" strokeDasharray="4 4" strokeWidth={2} name="Ambient Temp" />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'soc' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SOC_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'State of Charge']}
                />
                <Area type="monotone" dataKey="soc" stroke="#38BDF8" strokeWidth={3} fill="url(#socGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'cycles' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHARGE_CYCLES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis domain={[300, 450]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} Cycles`, 'Accumulated Cycles']}
                />
                <Bar dataKey="cycles" fill="#00D26A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'degradation' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastData.length > 0 ? forecastData.map(f => ({
                  cycle: f.cycle,
                  projectedSoh: f.projected_soh,
                  lowerBound: f.lower_bound,
                  upperBound: f.upper_bound
                })) : [
                  { cycle: 421, projectedSoh: 94.0, lowerBound: 93.4, upperBound: 94.6 },
                  { cycle: 550, projectedSoh: 92.5, lowerBound: 91.8, upperBound: 93.2 },
                  { cycle: 700, projectedSoh: 90.8, lowerBound: 89.9, upperBound: 91.7 },
                  { cycle: 850, projectedSoh: 89.1, lowerBound: 88.0, upperBound: 90.2 },
                  { cycle: 1000, projectedSoh: 87.4, lowerBound: 86.1, upperBound: 88.7 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="degradeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="cycle" stroke="#64748B" fontSize={11} tickFormatter={(c) => `Cycle ${c}`} />
                <YAxis domain={[80, 96]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Projected SoH']}
                />
                <Area type="monotone" dataKey="projectedSoh" stroke="#A855F7" strokeWidth={3} fill="url(#degradeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Analysis & Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Analysis (6 cols) */}
        <div className="lg:col-span-6 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>AI Analysis</span>
            </h3>
            <Badge variant="emerald">EVIoT ML Model</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Battery Condition</span>
              <span className="font-extrabold text-emerald-400 text-sm block">Healthy</span>
              <span className="text-[10px] text-slate-500">Normal cell impedance</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Thermal Condition</span>
              <span className="font-extrabold text-emerald-400 text-sm block">Normal</span>
              <span className="text-[10px] text-slate-500">Coolant pump nominal</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Degradation Risk</span>
              <span className="font-extrabold text-white text-sm block">Low</span>
              <span className="text-[10px] text-emerald-400">1.4% / 10,000 km</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Maintenance Risk</span>
              <span className="font-extrabold text-white text-sm block">Low</span>
              <span className="text-[10px] text-slate-500">No anomalies detected</span>
            </div>
          </div>
        </div>

        {/* Recommendations (6 cols) */}
        <div className="lg:col-span-6 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              <span>Longevity Guidelines</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated battery longevity guidelines</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white">Maintain healthy charging patterns</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Keep daily battery charge between 20% and 80% for routine city driving to minimize cathode stress.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white">Avoid prolonged extreme temperatures</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Park in sheltered or basement areas during peak midday heat to prevent thermal cooling drain.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white">Monitor temperature during fast charging</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  The liquid-cooled BMS ensures pack temperature remains under 38°C during 50kW+ DC charging sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 italic border-t border-slate-800">
            * All telemetry calculations are calibrated on the EVIoT predictive maintenance dataset. All predictions are marked as demo/prototype until live hardware sensors are certified.
          </div>
        </div>
      </div>
    </div>
  );
};
