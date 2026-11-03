import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Wrench, ShieldAlert, Clock, RefreshCw, Zap, Search, Bike, Car } from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  stationName: string;
  chargerId: string;
  vehicleType: '2W Scooty' | '4W Car' | 'Station Hub';
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
    vehicleType: '4W Car',
    severity: 'Critical',
    message: 'Type 2 AC connector interlock contactor failed self-test. Bay isolated from reservation matrix.',
    reportedAt: 'Today, 09:20 AM',
    status: 'Open'
  },
  {
    id: 'ALT-1088',
    stationName: 'Tata Power EZ Charge - Phoenix Marketcity',
    chargerId: 'pune-tp-01-c4',
    vehicleType: '4W Car',
    severity: 'Warning',
    message: 'Cooling fan operating at 85% duty cycle due to ambient thermal threshold in Pune (32°C).',
    reportedAt: 'Yesterday, 14:10 PM',
    status: 'Investigating'
  },
  {
    id: 'ALT-1085',
    stationName: 'Ather Grid Hub - FC Road Deccan',
    chargerId: 'pune-ather-07-c2',
    vehicleType: '2W Scooty',
    severity: 'Critical',
    message: '2W Ather proprietary charging dock latch sensor unresponsive. Auto-eject pin locked in bay 2.',
    reportedAt: 'Today, 08:45 AM',
    status: 'Open'
  },
  {
    id: 'ALT-1081',
    stationName: 'Ola Hypercharger Center - Koramangala',
    chargerId: 'blr-ola-08-c3',
    vehicleType: '2W Scooty',
    severity: 'Warning',
    message: '2W Hypercharger cable tension retractor stuck; power reduced to 5 kW safe charging mode.',
    reportedAt: 'Today, 07:15 AM',
    status: 'Investigating'
  },
  {
    id: 'ALT-1078',
    stationName: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    chargerId: 'pune-zeon-04-c1',
    vehicleType: '4W Car',
    severity: 'Critical',
    message: '150 kW CCS2 liquid-cooled cable temperature sensor triggered threshold at 62°C. Contactor opened.',
    reportedAt: 'Yesterday, 19:30 PM',
    status: 'Investigating'
  },
  {
    id: 'ALT-1074',
    stationName: 'Bolt.Earth EV Plaza - Connaught Place',
    chargerId: 'del-bolt-09-c3',
    vehicleType: '2W Scooty',
    severity: 'Warning',
    message: '3.3 kW LEV 2W socket ground fault loop impedance out of spec (18.2 ohms). Scheduled re-grounding.',
    reportedAt: 'Yesterday, 11:00 AM',
    status: 'Open'
  },
  {
    id: 'ALT-1070',
    stationName: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    chargerId: 'pune-zeon-04-c2',
    vehicleType: '4W Car',
    severity: 'Info',
    message: 'Scheduled 10,000-hour liquid cooling fluid inspection due next week.',
    reportedAt: '3 days ago',
    status: 'Investigating'
  },
  {
    id: 'ALT-1066',
    stationName: 'Relux Electric - Magarpatta Cybercity',
    chargerId: 'pune-rel-05-c3',
    vehicleType: '2W Scooty',
    severity: 'Critical',
    message: '2W Scooty 16A smart socket tripped on internal RCD residual current test. Bay 3 isolated.',
    reportedAt: '2 days ago',
    status: 'Open'
  },
  {
    id: 'ALT-1062',
    stationName: 'Tata Power - BKC Fast Charging Plaza',
    chargerId: 'mumbai-tp-06-c1',
    vehicleType: '4W Car',
    severity: 'Warning',
    message: '120 kW CCS2 primary display touch digitizer unresponsive. App/RFID charging operational.',
    reportedAt: '3 days ago',
    status: 'Investigating'
  },
  {
    id: 'ALT-1058',
    stationName: 'Statiq Super Hub - Hitec City Mindspace',
    chargerId: 'hyd-statiq-11-c3',
    vehicleType: '2W Scooty',
    severity: 'Info',
    message: 'Type 6 2W LEV connector firmware update queued: OTA version 2.4.1 pending reboot.',
    reportedAt: '4 days ago',
    status: 'Investigating'
  },
  {
    id: 'ALT-1055',
    stationName: 'Jio-bp pulse - Baner High Street',
    chargerId: 'pune-jio-02-c2',
    vehicleType: '4W Car',
    severity: 'Warning',
    message: 'RFID card reader NFC antenna intermittent response on Car Bay 2.',
    reportedAt: '5 days ago',
    status: 'Resolved'
  },
  {
    id: 'ALT-1050',
    stationName: 'ChargeZone DC Hub - Goregaon East WEH',
    chargerId: 'mum-cz-12-c3',
    vehicleType: '2W Scooty',
    severity: 'Critical',
    message: '2W LEV 3.3 kW bay surge protection device (SPD) status flag tripped after grid voltage spike.',
    reportedAt: '6 days ago',
    status: 'Resolved'
  }
];

export const AdminMaintenancePage: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(INITIAL_ALERTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.map(a => (a.id === id ? { ...a, status: 'Resolved' } : a)));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterType === '2w' && a.vehicleType !== '2W Scooty') return false;
    if (filterType === '4w' && a.vehicleType !== '4W Car') return false;
    if (filterSeverity !== 'all' && a.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.stationName.toLowerCase().includes(q) ||
        a.chargerId.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeIssuesCount = alerts.filter(a => a.status !== 'Resolved').length;

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
            Automated OCPP fault diagnostics and charger isolation monitor across 2W Scooty and 4W Car stations
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold self-start sm:self-auto">
          {activeIssuesCount} Active Issues ({alerts.length} Total Logs)
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111827] border border-[#1E293B] text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, bay, station, or message…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-xl border border-[#1E293B]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('2w')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterType === '2w' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>2W Scooty</span>
            </button>
            <button
              onClick={() => setFilterType('4w')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterType === '4w' ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>4W Car</span>
            </button>
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="Warning">Warning Only</option>
            <option value="Info">Info Only</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-500">
            No maintenance alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl bg-[#111827] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors ${
                alert.status === 'Resolved'
                  ? 'border-slate-800 opacity-60'
                  : alert.severity === 'Critical'
                  ? 'border-red-500/40 bg-red-950/10'
                  : alert.severity === 'Warning'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-blue-500/30 bg-blue-950/10'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-white">{alert.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      alert.severity === 'Critical'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : alert.severity === 'Warning'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      alert.vehicleType === '2W Scooty'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : alert.vehicleType === '4W Car'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {alert.vehicleType}
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
          ))
        )}
      </div>
    </div>
  );
};
