import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Zap,
  IndianRupee,
  Activity,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminDataService } from '../../services/adminDataService';
import { formatINR } from '../../utils/cn';

const COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#EF4444', '#F59E0B'];

export const AdminAnalyticsPage: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('30days');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const analytics = await adminDataService.getAnalyticsData(dateFilter);
        setData(analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [dateFilter]);

  const handleExportReport = () => {
    if (!data) return;
    const csvContent =
      'Metric,Value\n' +
      `Total Network Bookings,${data.totalBookings}\n` +
      `Total Charging Stations,${data.stationCount}\n` +
      'Status Breakdown:\n' +
      data.statusChartData.map((s: any) => `"${s.name}",${s.count}`).join('\n') +
      '\n\nTop Stations Usage:\n' +
      data.mostUsedStations.map((st: any) => `"${st.station}",${st.bookings}`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EVORA_Executive_Analytics_${dateFilter}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            EV Operations & Utilization Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Database-backed charging trends, peak slot demand, and verified revenue distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Computing database reports…</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Charts Grid: Revenue & Energy Trend + Most Used Stations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Over Time */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    Revenue & Energy Consumption Trend
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Daily verified charging settlement</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="revenueINR" name="Revenue (₹)" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="energyKWh" name="Energy (kWh)" stroke="#06B6D4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most Used Charging Stations */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Top Charging Stations by Bookings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Station utilization frequency</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.mostUsedStations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="station" stroke="#64748B" fontSize={10} interval={0} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#F8FAFC' }}
                    />
                    <Bar dataKey="bookings" name="Bookings" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Charts Grid: Status Distribution + Peak Booking Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Distribution */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-400" />
                  Booking Status Distribution
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ratio of confirmed, charging, and cancelled bookings</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.statusChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak Booking Hours Distribution */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Hourly Demand Distribution
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Peak traffic hours across station bays</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="bookings" name="Hourly Reservations" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
