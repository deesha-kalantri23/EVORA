import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Wrench, ShieldAlert, Clock, RefreshCw, Zap } from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  stationName: string;
  chargerId: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  reportedAt: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}

const INITIAL_ALERTS: MaintenanceAlert[] = [
  {
    id: 'ALT-1092',
    stationName: 'Statiq Charging Hub - Hinjawadi Phase 1',
    chargerId: 'pune-statiq-03-c2',
    severity: 'Critical',
    message: 'Type 2 AC connector interlock contactor failed self-test. Bay isolated from reservation matrix.',
    reportedAt: 'Today, 09:20 AM',
    status: 'Open'
  },
  {
    id: 'ALT-1088',
    stationName: 'Tata Power EZ Charge - Phoenix Marketcity',
    chargerId: 'pune-tp-01-c4',
    severity: 'Warning',
    message: 'Cooling fan operating at 85% duty cycle due to ambient thermal threshold in Pune (32°C).',
    reportedAt: 'Yesterday, 14:10 PM',
    status: 'Investigating'
  },
  {
    id: 'ALT-1070',
    stationName: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    chargerId: 'pune-zeon-04-c1',
    severity: 'Info',
    message: 'Scheduled 10,000-hour liquid cooling fluid inspection due next week.',
    reportedAt: '3 days ago',
    status: 'Investigating'
  }
];

export const AdminMaintenancePage: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(INITIAL_ALERTS);

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.map(a => (a.id === id ? { ...a, status: 'Resolved' } : a)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            Charger Hardware Maintenance & Incident Alarms
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated OCPP fault diagnostics and charger isolation monitor
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold self-start sm:self-auto">
          {alerts.filter(a => a.status !== 'Resolved').length} Active Issues
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl bg-[#111827] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors ${
              alert.status === 'Resolved'
                ? 'border-slate-800 opacity-60'
                : alert.severity === 'Critical'
                ? 'border-red-500/40 bg-red-950/10'
                : 'border-amber-500/30 bg-amber-950/10'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white">{alert.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    alert.severity === 'Critical'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-slate-400">• {alert.reportedAt}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-200">{alert.stationName}</h4>
              <p className="text-slate-400 text-xs">{alert.message}</p>
              <div className="text-[11px] text-slate-500 font-mono">Affected Bay: {alert.chargerId}</div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {alert.status !== 'Resolved' ? (
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
