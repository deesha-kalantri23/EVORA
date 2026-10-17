import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  CalendarCheck,
  Zap,
  Activity,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  BatteryCharging,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminDashboardStats, AdminBooking, ActiveChargingSession, AdminStation } from '../../types/admin';
import { formatINR } from '../../utils/cn';

interface ContextType {
  selectedStationId: string;
  selectedDateRange: string;
  stations: AdminStation[];
}

export const AdminDashboardPage: React.FC = () => {
  const { selectedStationId, selectedDateRange, stations } = useOutletContext<ContextType>();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsData = await adminDataService.getDashboardStats({
        stationId: selectedStationId,
        dateRange: selectedDateRange
      });
      setStats(statsData);

      const bookingsResult = await adminDataService.getBookings({
        stationId: selectedStationId,
        dateRange: selectedDateRange,
        pageSize: 5
      });
      setRecentBookings(bookingsResult.bookings);

      const sessionsData = await adminDataService.getActiveSessions(selectedStationId);
      setActiveSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStationId, selectedDateRange]);

  useEffect(() => {
    loadDashboardData();

    // Listen to global header refresh event
    const handleGlobalRefresh = () => loadDashboardData();
    window.addEventListener('evora-admin-refresh', handleGlobalRefresh);
    return () => window.removeEventListener('evora-admin-refresh', handleGlobalRefresh);
  }, [loadDashboardData]);

  const selectedStationName =
    selectedStationId === 'all'
      ? 'All Charging Stations'
      : stations.find(s => s.id === selectedStationId)?.name || 'Selected Station';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              {selectedStationName}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operations summary • Filter: {selectedDateRange === 'all' ? 'All Time' : selectedDateRange}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/bookings"
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
          >
            <span>Manage All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Total Bookings */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.totalBookings ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across filtered scope</p>
        </div>

        {/* Today's Bookings */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today&apos;s Bookings</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.todayBookings ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Scheduled for today</p>
        </div>

        {/* Active Charging Sessions */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-transparent relative overflow-hidden">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Live Charging</span>
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.activeChargingSessions ?? 0}
          </div>
          <p className="text-[10px] text-cyan-400/70 mt-1">Active telemetry streams</p>
        </div>

        {/* Confirmed Bookings */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.confirmedBookings ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Upcoming reservations</p>
        </div>

        {/* Completed Bookings */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.completedBookings ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Finished sessions</p>
        </div>

        {/* Cancelled Bookings */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">
            {isLoading ? <span className="text-slate-600 text-lg">…</span> : stats?.cancelledBookings ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Cancelled & refunded</p>
        </div>
      </div>

      {/* Second Row: Revenue, Energy Delivered, Chargers & Member Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Revenue</span>
            <div className="text-2xl font-bold text-white mt-1">
              {isLoading ? '…' : formatINR(stats?.totalRevenueINR ?? 0)}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Database settled payments
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Total Energy Delivered */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Energy Delivered</span>
            <div className="text-2xl font-bold text-white mt-1">
              {isLoading ? '…' : `${stats?.totalEnergyDeliveredKWh ?? 0} kWh`}
            </div>
            <p className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-medium">
              <Zap className="w-3.5 h-3.5" />
              Verified charging kWh
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BatteryCharging className="w-6 h-6" />
          </div>
        </div>

        {/* Chargers Status Breakdown */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chargers Fleet</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-emerald-400 font-semibold">Available</p>
              <p className="text-base font-bold text-white mt-0.5">{stats?.availableChargers ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-cyan-400 font-semibold">In Use</p>
              <p className="text-base font-bold text-white mt-0.5">{stats?.occupiedChargers ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-400 font-semibold">Maintenance</p>
              <p className="text-base font-bold text-white mt-0.5">{stats?.outOfServiceChargers ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Total Registered Members & Stations */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Network</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div>
                <p className="text-base font-bold text-white">{stats?.totalMembers ?? 0}</p>
                <p className="text-[10px] text-slate-500">EV Members</p>
              </div>
              <div className="w-px h-7 bg-slate-800" />
              <div>
                <p className="text-base font-bold text-white">{stats?.totalStations ?? 0}</p>
                <p className="text-[10px] text-slate-500">Stations</p>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Bookings & Active Live Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings Feed */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Station Bookings</h3>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="pb-2">Booking ID</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Station</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No bookings found for the selected scope.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono text-emerald-400 font-bold">{b.id}</td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-200">{b.member_name}</p>
                        <p className="text-[10px] text-slate-500">{b.vehicle_registration_number}</p>
                      </td>
                      <td className="py-3 text-slate-300 max-w-[150px] truncate" title={b.station_name}>
                        {b.station_name}
                      </td>
                      <td className="py-3 text-slate-400">
                        {b.booking_date}
                        <span className="block text-[10px] text-slate-500">{b.start_time}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.booking_status === 'Confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : b.booking_status === 'Charging'
                              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                              : b.booking_status === 'Completed'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Active Sessions Feed */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Live Charging Sessions</h3>
            </div>
            <Link
              to="/admin/live-monitor"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-500">
                No active charging sessions currently plugged into {selectedStationName}.
              </div>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl bg-[#0B0F17] border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{session.member_name}</span>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {session.vehicle_registration_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{session.station_name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Rate: {session.current_charging_power_kw} kW</span>
                      <span>•</span>
                      <span>Delivered: {session.energy_delivered_kwh} kWh</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {session.battery_current_soc}%
                    </span>
                    <span className="text-[10px] text-slate-400">Target {session.battery_target_soc}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
