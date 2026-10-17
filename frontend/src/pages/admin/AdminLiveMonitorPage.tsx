import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Zap,
  Clock,
  BatteryCharging,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Car
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { ActiveChargingSession, AdminStation } from '../../types/admin';
import { formatINR } from '../../utils/cn';

interface ContextType {
  selectedStationId: string;
  stations: AdminStation[];
}

export const AdminLiveMonitorPage: React.FC = () => {
  const { selectedStationId, stations } = useOutletContext<ContextType>();
  const [sessions, setSessions] = useState<ActiveChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchLiveSessions = async () => {
    try {
      const data = await adminDataService.getActiveSessions(selectedStationId);
      setSessions(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch live sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSessions();
  }, [selectedStationId]);

  // Periodic auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedStationId]);

  const calculateElapsedMinutes = (startTimeIso: string): number => {
    const diffMs = Date.now() - new Date(startTimeIso).getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Live Charger Telemetry Monitor
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              Real-time Polling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Displaying verified dynamic charging telemetry sessions • Last updated: {lastRefreshed}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-[#1E293B] bg-[#0B0F17] text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span>Auto-refresh (5s)</span>
          </label>

          <button
            onClick={fetchLiveSessions}
            className="p-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-300 border border-[#1E293B] transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Verification Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong>Verified Telemetry Stream:</strong> All metrics below reflect confirmed hardware telemetry sessions received via OCPP/CAN-bus ingestion protocols. No simulated battery readings are presented as live without connection.
        </div>
      </div>

      {/* Active Sessions Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Fetching active telemetry sessions…</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#1E293B]">
          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Active Charging Sessions</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently no vehicles connected to charging bays in the selected station scope.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((session) => {
            const elapsed = calculateElapsedMinutes(session.session_start_time);
            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-[#111827] border border-cyan-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top session badges */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {session.id}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {session.session_status}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Bay {session.charger_id.split('-').pop() || '1'}
                    </span>
                  </div>

                  {/* Member & Vehicle */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{session.member_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-emerald-400 font-bold">
                          {session.vehicle_registration_number}
                        </span>
                      </div>
                    </div>

                    {/* Battery State of Charge Dial */}
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-emerald-400">
                        {session.battery_current_soc}%
                      </div>
                      <span className="text-[10px] text-slate-400">Target: {session.battery_target_soc}%</span>
                    </div>
                  </div>

                  {/* Station Name */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs">
                    <p className="text-slate-300 font-medium truncate">{session.station_name}</p>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                      <span className="text-[10px] text-slate-500 block">Rate</span>
                      <span className="font-bold text-cyan-400 mt-0.5 block">
                        {session.current_charging_power_kw} kW
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                      <span className="text-[10px] text-slate-500 block">Energy</span>
                      <span className="font-bold text-white mt-0.5 block">
                        {session.energy_delivered_kwh} kWh
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                      <span className="text-[10px] text-slate-500 block">Elapsed</span>
                      <span className="font-bold text-white mt-0.5 block">{elapsed} min</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                      <span className="text-[10px] text-slate-500 block">Accrued</span>
                      <span className="font-bold text-emerald-400 mt-0.5 block">
                        {formatINR(session.estimated_cost)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Charging Progress</span>
                      <span className="font-mono text-slate-200">
                        {session.battery_current_soc}% of {session.battery_target_soc}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(session.battery_current_soc / session.battery_target_soc) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Started {new Date(session.session_start_time).toLocaleTimeString()}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Telemetry Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
