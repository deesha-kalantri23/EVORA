import React, { useState } from 'react';
import {
  History,
  Download,
  Calendar,
  Zap,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  Coins,
  BatteryCharging,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Badge } from '../components/Badge';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { useNavigate } from 'react-router-dom';

interface SessionRecord {
  id: string;
  date: string;
  station: string;
  city: string;
  type: 'Public DC Fast' | 'Home AC' | 'Highway DC Hub';
  energyKwh: number;
  duration: string;
  costInr: number;
  batteryBefore: number;
  batteryAfter: number;
  connector: string;
}

const ALL_SESSIONS: SessionRecord[] = [
  {
    id: 'CS-8921',
    date: '2026-09-29 19:30',
    station: 'Tata Power EZ Charge - Phoenix Marketcity',
    city: 'Pune',
    type: 'Public DC Fast',
    energyKwh: 24.2,
    duration: '38 mins',
    costInr: 447.70,
    batteryBefore: 42,
    batteryAfter: 78,
    connector: 'CCS2 (60 kW)'
  },
  {
    id: 'CS-8890',
    date: '2026-09-27 21:00',
    station: 'Home Smart Wallbox',
    city: 'Pune',
    type: 'Home AC',
    energyKwh: 32.0,
    duration: '5h 10m',
    costInr: 240.00,
    batteryBefore: 18,
    batteryAfter: 95,
    connector: 'Type 2 AC (7.2 kW)'
  },
  {
    id: 'CS-8812',
    date: '2026-09-22 14:15',
    station: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    city: 'Pune / Highway',
    type: 'Highway DC Hub',
    energyKwh: 28.5,
    duration: '22 mins',
    costInr: 641.25,
    batteryBefore: 30,
    batteryAfter: 82,
    connector: 'CCS2 (150 kW)'
  },
  {
    id: 'CS-8750',
    date: '2026-09-18 18:40',
    station: 'Jio-bp pulse - Baner High Street',
    city: 'Pune',
    type: 'Public DC Fast',
    energyKwh: 18.2,
    duration: '26 mins',
    costInr: 382.20,
    batteryBefore: 45,
    batteryAfter: 80,
    connector: 'CCS2 (120 kW)'
  },
  {
    id: 'CS-8680',
    date: '2026-09-12 22:30',
    station: 'Home Smart Wallbox',
    city: 'Pune',
    type: 'Home AC',
    energyKwh: 28.0,
    duration: '4h 30m',
    costInr: 210.00,
    batteryBefore: 25,
    batteryAfter: 90,
    connector: 'Type 2 AC (7.2 kW)'
  },
  {
    id: 'CS-8610',
    date: '2026-09-05 16:10',
    station: 'Statiq Charging Hub - Hinjawadi Phase 1',
    city: 'Pune',
    type: 'Public DC Fast',
    energyKwh: 22.4,
    duration: '34 mins',
    costInr: 392.00,
    batteryBefore: 35,
    batteryAfter: 82,
    connector: 'CCS2 (50 kW)'
  }
];

// Charts Data
const MONTHLY_ANALYTICS_DATA = [
  { month: 'Apr', energyKwh: 195, costInr: 1680, sessions: 18 },
  { month: 'May', energyKwh: 232, costInr: 1980, sessions: 22 },
  { month: 'Jun', energyKwh: 210, costInr: 1820, sessions: 20 },
  { month: 'Jul', energyKwh: 245, costInr: 2140, sessions: 24 },
  { month: 'Aug', energyKwh: 260, costInr: 2280, sessions: 26 },
  { month: 'Sep', energyKwh: 220, costInr: 1840, sessions: 22 }
];

export const ChargingHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'real' (empty state as required) or 'demo' (simulated sessions)
  const [historyMode, setHistoryMode] = useState<'real' | 'demo'>('real');

  // Search, Filter, Sort, Date range
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'energy'>('date');
  const [dateRange, setDateRange] = useState('All Time');
  const [chartView, setChartView] = useState<'energy' | 'cost' | 'frequency'>('energy');

  // Filtered & Sorted Sessions
  let filtered = ALL_SESSIONS.filter(s => {
    const matchesSearch = s.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.connector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'cost') return b.costInr - a.costInr;
    if (sortBy === 'energy') return b.energyKwh - a.energyKwh;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="view_history" />

      {/* Mode Switcher Banner */}
      <div className="flex items-center justify-between bg-[#131B2B] p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Data Source:</span>
          {historyMode === 'real' ? (
            <Badge variant="slate">Real Dataset Stream</Badge>
          ) : (
            <Badge variant="amber">Demo / Simulation Mode</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setHistoryMode('real')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              historyMode === 'real' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Records
          </button>
          <button
            onClick={() => setHistoryMode('demo')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              historyMode === 'demo' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Simulation
          </button>
        </div>
      </div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Charging History
            </h1>
            <Badge variant="emerald">Session Logs</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review detailed records of all home and public DC fast-charging sessions with Indian tariffs
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/charging-cost')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Coins className="w-4 h-4" />
            <span>Calculate Cost</span>
          </button>

          <button className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Monthly Trend Charts Section */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">Historical Charging Analytics</h3>
            <p className="text-xs text-slate-400">Monthly progression of energy, expenses, and session frequency</p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartView('energy')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                chartView === 'energy' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Monthly Energy (kWh)
            </button>
            <button
              onClick={() => setChartView('cost')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                chartView === 'cost' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Monthly Cost (₹)
            </button>
            <button
              onClick={() => setChartView('frequency')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                chartView === 'frequency' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Charging Frequency
            </button>
          </div>
        </div>

        {/* Viewport for charts */}
        <div className="h-64 w-full pt-1">
          {chartView === 'energy' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} kWh`, 'Energy Charged']}
                />
                <Bar dataKey="energyKwh" fill="#00D26A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === 'cost' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`₹${val}`, 'Monthly Cost']}
                />
                <Bar dataKey="costInr" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === 'frequency' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis domain={[10, 30]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} Sessions`, 'Session Count']}
                />
                <Line type="monotone" dataKey="sessions" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Toolbar: Search, Filter, Sort, Date range */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search station, hub or connector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 rounded-xl pl-9 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Charger Types</option>
              <option value="Public DC Fast">Public DC Fast (50-60 kW)</option>
              <option value="Highway DC Hub">Highway Hub (120-150 kW)</option>
              <option value="Home AC">Home AC Wallbox (7.2 kW)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="date">Sort by: Date (Newest first)</option>
              <option value="cost">Sort by: Cost (High to Low)</option>
              <option value="energy">Sort by: Energy (High to Low)</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All Time">Date Range: All Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 6 Months">Last 6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complete Table with Battery Before & After */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {historyMode === 'real' ? 'Real Dataset Query' : `Showing ${filtered.length} Demo Records`}
          </span>
          {historyMode === 'real' ? (
            <Badge variant="slate">0 Real Records Found</Badge>
          ) : (
            <Badge variant="amber">Demo / Simulation Sessions</Badge>
          )}
        </div>

        {historyMode === 'real' ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No real charging history is available.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The Indian EV Charging Stations (2025) and EVIoT predictive maintenance datasets contain infrastructure points and battery telemetry, but do not contain historical session billing records for this vehicle.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setHistoryMode('demo')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                View Demo / Simulated Sessions
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Station / Hub</th>
                  <th className="pb-3 font-semibold">Energy (kWh)</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Battery Before ➔ After</th>
                  <th className="pb-3 font-semibold text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-3.5 text-slate-300 font-medium whitespace-nowrap">
                      {s.date}
                    </td>
                    <td className="py-3.5 text-white font-semibold">
                      <div>{s.station}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.city} • {s.connector}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-200 font-bold">
                      {s.energyKwh} kWh
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {s.duration}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F172A] border border-slate-800 text-[11px] font-bold">
                        <span className="text-amber-400">{s.batteryBefore}%</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-emerald-400">{s.batteryAfter}%</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-black text-emerald-400 text-sm">
                      ₹{s.costInr.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
