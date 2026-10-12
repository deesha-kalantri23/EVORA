import React, { useState } from 'react';
import {
  Settings,
  Bell,
  MapPin,
  Lock,
  Shield,
  Sliders,
  Ruler,
  Moon,
  Sun,
  Database,
  Check,
  Smartphone,
  LogOut,
  RefreshCw,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  // Navigation / active section
  const [activeSection, setActiveSection] = useState<string>('Preferences');

  // Settings states
  const [locationPermission, setLocationPermission] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [chargingAlerts, setChargingAlerts] = useState(true);
  const [batteryWarnings, setBatteryWarnings] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [distanceUnits, setDistanceUnits] = useState('Kilometers (km)');
  const [currency, setCurrency] = useState('Indian Rupees (₹ INR)');
  const [saved, setSaved] = useState(false);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'MacBook Pro (Chrome)', location: 'Pune, Maharashtra', current: true, time: 'Active now' },
    { id: 'sess-2', device: 'iPhone 15 Pro (Safari)', location: 'Pune, Maharashtra', current: false, time: '2 hours ago' }
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const SECTIONS = [
    { id: 'Account', label: 'Account', icon: Lock },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Location', label: 'Location', icon: MapPin },
    { id: 'Privacy', label: 'Privacy', icon: Shield },
    { id: 'Security', label: 'Security', icon: Lock },
    { id: 'Preferences', label: 'Preferences', icon: Sliders },
    { id: 'Units', label: 'Units', icon: Ruler },
    { id: 'Theme', label: 'Theme', icon: Moon },
    { id: 'Data & Privacy', label: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Settings
            </h1>
            <Badge variant="emerald">EVORA System</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure application preferences, privacy permissions, units, and active sessions
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Main Grid: Section Nav Tabs (Left 4 cols) & Configuration Panel (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#131B2B] border border-[#243046] rounded-3xl p-4 space-y-1 shadow-sm h-fit">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1 block">
            Settings Sections
          </span>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Panel (8 cols) */}
        <div className="lg:col-span-8 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">{activeSection} Configuration</h3>
            <span className="text-xs text-slate-400">Settings auto-sync</span>
          </div>

          {/* Section 1: Location & Permissions */}
          {(activeSection === 'Location' || activeSection === 'Preferences') && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Location Settings</h4>
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Location Permission</span>
                  <p className="text-slate-400 text-[11px]">
                    Allows EVORA to discover nearby chargers in Pune and calculate Mumbai-Pune Expressway waypoints.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={locationPermission}
                  onChange={(e) => setLocationPermission(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer flex-shrink-0"
                />
              </div>
            </div>
          )}

          {/* Section 2: Notifications */}
          {(activeSection === 'Notifications' || activeSection === 'Preferences') && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Notification Settings</h4>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Push Notifications</span>
                    <span className="text-slate-400 text-[11px]">Receive updates for charging progress, warnings, and booking alerts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Charging Completion Chime</span>
                    <span className="text-slate-400 text-[11px]">Notify when DC fast charge reaches target 80% SoC.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={chargingAlerts}
                    onChange={(e) => setChargingAlerts(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Battery Thermal Warnings</span>
                    <span className="text-slate-400 text-[11px]">Immediate alert if cell temperature exceeds 38°C in Indian summer.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={batteryWarnings}
                    onChange={(e) => setBatteryWarnings(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Theme */}
          {(activeSection === 'Theme' || activeSection === 'Preferences') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Theme & Display (2 Options)</h4>
                <Badge variant={theme === 'dark' ? 'emerald' : 'amber'}>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Light Theme Card */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    {theme === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h5 className="font-extrabold text-sm text-white">Light Theme</h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Crisp, high-contrast daytime mode with clean backgrounds and vivid emerald accents.
                  </p>
                </div>

                {/* 2. Dark Theme Card */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    {theme === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h5 className="font-extrabold text-sm text-white">Dark Theme</h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Deep OLED dark theme optimized for night driving, energy efficiency, and reduced glare.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Units & Currency */}
          {(activeSection === 'Units' || activeSection === 'Preferences') && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Units & Currency</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                  <label className="font-bold text-white block">Distance Units</label>
                  <select
                    value={distanceUnits}
                    onChange={(e) => setDistanceUnits(e.target.value)}
                    className="w-full bg-[#131B2B] text-slate-200 rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Kilometers (km)">Kilometers (km) • India Standard</option>
                    <option value="Miles (mi)">Miles (mi)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                  <label className="font-bold text-white block">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#131B2B] text-slate-200 rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Indian Rupees (₹ INR)">Indian Rupees (₹ INR)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Session Management */}
          {(activeSection === 'Security' || activeSection === 'Account' || activeSection === 'Preferences') && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Session Management</h4>
              <div className="space-y-2.5 text-xs">
                {activeSessions.map((sess) => (
                  <div key={sess.id} className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-bold text-white block">
                          {sess.device} {sess.current && <span className="text-[10px] text-emerald-400 font-bold ml-1">(This Device)</span>}
                        </span>
                        <span className="text-[10px] text-slate-400">{sess.location} • {sess.time}</span>
                      </div>
                    </div>
                    {!sess.current && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold border border-slate-700"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Data & Privacy */}
          {(activeSection === 'Data & Privacy' || activeSection === 'Privacy') && (
            <div className="space-y-3 pt-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Data & Privacy Disclosure</h4>
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Offline Dataset Telemetry</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Vehicle telemetry is calibrated on the EVIoT Predictive Maintenance dataset. Real vehicle credentials and GPS locations are stored locally on your device and are never sold or shared with third-party advertisers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
