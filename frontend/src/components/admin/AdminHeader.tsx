import React from 'react';
import { Menu, RefreshCw, Database, CheckCircle2, AlertCircle, Building2, Calendar } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminStation } from '../../types/admin';

interface AdminHeaderProps {
  pageTitle: string;
  onMobileMenuClick: () => void;
  stations?: AdminStation[];
  selectedStationId?: string;
  onStationChange?: (stationId: string) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (dateRange: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  pageTitle,
  onMobileMenuClick,
  stations = [],
  selectedStationId = 'all',
  onStationChange,
  selectedDateRange = 'all',
  onDateRangeChange,
  onRefresh,
  isRefreshing = false
}) => {
  const { isSupabaseConnected } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg bg-[#1E293B] text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight truncate flex items-center gap-2">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Station Filter, Date Filter, Refresh, Supabase Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Station Filter Dropdown */}
        {onStationChange && (
          <div className="relative hidden md:flex items-center">
            <Building2 className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedStationId}
              onChange={(e) => onStationChange(e.target.value)}
              className="bg-[#111827] text-slate-200 text-xs rounded-xl pl-8 pr-7 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="all">All Stations (Aggregate)</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Global Date Range Filter */}
        {onDateRangeChange && (
          <div className="relative hidden sm:flex items-center">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedDateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-[#111827] text-slate-200 text-xs rounded-xl pl-8 pr-7 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#111827] border border-[#1E293B] text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        )}

        {/* Supabase Connection Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={
            isSupabaseConnected
              ? 'Supabase Cloud connected with active RLS enforcement'
              : 'Supabase configuration pending. Running with local persistent data engine.'
          }
        >
          <Database className="w-3 h-3" />
          <span className="hidden sm:inline">
            {isSupabaseConnected ? 'Supabase RLS Active' : 'Local Persistence'}
          </span>
          {isSupabaseConnected ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
        </div>
      </div>
    </header>
  );
};
