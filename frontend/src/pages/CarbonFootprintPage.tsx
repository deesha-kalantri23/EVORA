import React, { useState } from 'react';
import {
  Leaf,
  Trees,
  Droplets,
  Wind,
  ShieldCheck,
  TrendingUp,
  Info,
  Zap,
  Activity,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../components/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { useNavigate } from 'react-router-dom';

// 1. Chart: CO₂ Saved Over Time (Cumulative & Monthly kg)
const CO2_SAVED_OVER_TIME = [
  { month: 'Apr', monthlySaved: 18, cumulativeSaved: 18 },
  { month: 'May', monthlySaved: 22, cumulativeSaved: 40 },
  { month: 'Jun', monthlySaved: 20, cumulativeSaved: 60 },
  { month: 'Jul', monthlySaved: 24, cumulativeSaved: 84 },
  { month: 'Aug', monthlySaved: 26, cumulativeSaved: 110 },
  { month: 'Sep', monthlySaved: 34, cumulativeSaved: 126 } // Current Month: 34 kg, Total: 126 kg
];

// 2. Chart: Monthly Energy (kWh)
const MONTHLY_ENERGY_DATA = [
  { month: 'Apr', energyKwh: 140 },
  { month: 'May', energyKwh: 165 },
  { month: 'Jun', energyKwh: 155 },
  { month: 'Jul', energyKwh: 190 },
  { month: 'Aug', energyKwh: 205 },
  { month: 'Sep', energyKwh: 245 } // Current Energy Used: 245 kWh
];

// 3. Chart: Charging Activity Split
const CHARGING_ACTIVITY_DATA = [
  { name: 'Home Smart AC (7.2kW)', value: 172, percent: 70, color: '#00D26A' },
  { name: 'Public DC Fast (50-60kW)', value: 49, percent: 20, color: '#38BDF8' },
  { name: 'Highway Hub (120-150kW)', value: 24, percent: 10, color: '#F59E0B' }
];

import { evoraApi } from '../services/api';

export const CarbonFootprintPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeChartTab, setActiveChartTab] = useState<'co2' | 'energy' | 'activity'>('co2');
  const [carbonData, setCarbonData] = useState<any>(null);

  React.useEffect(() => {
    evoraApi.getCarbonMetrics().then(res => {
      if (res) setCarbonData(res);
    }).catch(console.error);
  }, []);

  const totalCo2 = carbonData?.total_co2_saved_kg ?? 126;
  const monthCo2 = carbonData?.this_month_co2_saved_kg ?? 34;
  const energyKwh = carbonData?.energy_used_kwh ?? 245;
  const treesEquiv = carbonData?.trees_equivalent ?? (totalCo2 / 21.77).toFixed(1);
  const fuelAvoided = carbonData?.fuel_avoided_liters ?? (totalCo2 / 2.31).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Carbon Footprint & Emissions Avoided
            </h1>
            <Badge variant="emerald" icon={Leaf}>
              Impact Tracker
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking avoided tailpipe emissions, equivalent trees planted, and fossil fuel displacement
          </p>
        </div>

        <Badge variant="slate" icon={Info}>
          Calculated from Telemetry (CEA Grid Baseline)
        </Badge>
      </div>

      {/* Prominent Estimation Disclosure Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Calculation Notice:</strong> All values are calculated estimates based on the Central Electricity Authority (CEA) of India Baseline Carbon Emissions Database. Standard Indian grid intensity is calibrated at 0.716 kg CO₂/kWh versus petrol combustion at 2.31 kg CO₂/L.
          </span>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
          Estimated Models
        </span>
      </div>

      {/* 4 Core Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CO2 Saved */}
        <div className="p-6 rounded-3xl bg-[#131B2B] border border-[#243046] hover:border-emerald-500/50 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total CO₂ Saved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{totalCo2}</span>
            <span className="text-sm font-bold text-emerald-400">kg CO₂</span>
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">Cumulative tailpipe abatement</span>
        </div>

        {/* This Month */}
        <div className="p-6 rounded-3xl bg-[#131B2B] border border-[#243046] hover:border-emerald-500/50 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{monthCo2}</span>
            <span className="text-sm font-bold text-blue-400">kg CO₂</span>
          </div>
          <span className="text-[11px] text-slate-400 block">+28% vs previous month</span>
        </div>

        {/* Energy Used */}
        <div className="p-6 rounded-3xl bg-[#131B2B] border border-[#243046] hover:border-emerald-500/50 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Energy Used</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{energyKwh}</span>
            <span className="text-sm font-bold text-amber-400">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Current billing cycle</span>
        </div>

        {/* Estimated ICE Emissions Avoided */}
        <div className="p-6 rounded-3xl bg-[#131B2B] border border-[#243046] hover:border-emerald-500/50 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ICE Emissions Avoided</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">301</span>
            <span className="text-sm font-bold text-rose-400">kg gross</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Gross petrol tailpipe displacement</span>
        </div>
      </div>

      {/* 3 Impact Equivalence Cards: Trees Equivalent, Fuel Avoided, Environmental Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Trees Equivalent */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#131B2B] to-[#152338] border border-[#243046] hover:border-emerald-500/40 transition-all shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Trees className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Urban Ecology
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Trees Equivalent</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-white">{treesEquiv}</span>
              <span className="text-base font-bold text-emerald-400">Mature Trees</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Equivalent to the annual carbon absorption capacity of ~{treesEquiv} mature trees growing in urban Maharashtra (~21.8 kg CO₂/tree/year).
          </p>
        </div>

        {/* Card 2: Fuel Avoided */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#131B2B] to-[#152338] border border-[#243046] hover:border-blue-500/40 transition-all shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Fossil Displacement
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Fuel Avoided</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-white">{fuelAvoided}</span>
              <span className="text-base font-bold text-blue-400">Litres Petrol</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unburned fossil petrol saved based on 14.5 km/litre fuel economy for comparable internal combustion vehicles in city traffic.
          </p>
        </div>

        {/* Card 3: Environmental Impact */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#131B2B] to-[#152338] border border-[#243046] hover:border-amber-500/40 transition-all shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Greenhouse Reduction
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Environmental Impact</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-emerald-400">-78.8%</span>
              <span className="text-base font-bold text-slate-200">Emissions</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Net operational emission reduction including upstream power generation in the Maharashtra state electrical grid.
          </p>
        </div>
      </div>

      {/* Charts Section: CO2 Saved Over Time, Monthly Energy, Charging Activity */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">Carbon & Energy Visualizations</h3>
            <p className="text-xs text-slate-400">
              Analyze emissions avoidance, power intake, and charging source distribution
            </p>
          </div>

          {/* Chart Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveChartTab('co2')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'co2' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. CO₂ Saved Over Time
            </button>
            <button
              onClick={() => setActiveChartTab('energy')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'energy' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Monthly Energy (kWh)
            </button>
            <button
              onClick={() => setActiveChartTab('activity')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeChartTab === 'activity' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Charging Activity
            </button>
          </div>
        </div>

        {/* Viewport for Active Chart */}
        <div className="h-72 w-full pt-2">
          {activeChartTab === 'co2' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CO2_SAVED_OVER_TIME} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D26A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00D26A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `${v} kg`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any, name: any) => [
                    `${val} kg CO₂`,
                    name === 'cumulativeSaved' ? 'Total Cumulative Saved' : 'Monthly Avoided'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSaved"
                  name="cumulativeSaved"
                  stroke="#00D26A"
                  strokeWidth={3}
                  fill="url(#co2Grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'energy' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ENERGY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} kWh`, 'Energy Consumed']}
                />
                <Bar dataKey="energyKwh" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center">
              <div className="md:col-span-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CHARGING_ACTIVITY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {CHARGING_ACTIVITY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val} kWh`, 'Energy']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="md:col-span-6 space-y-3 text-xs pl-2">
                <h4 className="font-bold text-white text-sm">Charging Infrastructure Mix</h4>
                <div className="space-y-2">
                  {CHARGING_ACTIVITY_DATA.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">{item.value} kWh</span>
                        <span className="text-[10px] text-slate-400">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Methodology & Calculation Disclaimer Card */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 text-xs text-slate-300 space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>India Environmental Benchmark Disclosure</span>
        </h4>
        <p className="text-slate-400 leading-relaxed">
          The calculations shown above use an empirical formula comparing your EV&apos;s real-world power consumption (average 140.8 Wh/km) against an internal combustion engine (ICE) passenger car achieving 14.5 km/litre in Pune urban traffic. Carbon emission factors: <strong>0.716 kg CO₂/kWh</strong> (Central Electricity Authority Baseline Database Version 19) vs <strong>2.31 kg CO₂/L</strong> petrol. All metrics are labeled as estimates for simulation and informational purposes.
        </p>
      </div>
    </div>
  );
};
