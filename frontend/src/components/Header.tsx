import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  BatteryCharging,
  Wallet,
  Menu,
  Database,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_USER, INITIAL_TELEMETRY } from '../data/mockData';
import { formatINR } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { calculateEstimatedRange } from '../utils/rangeCalculator';

interface HeaderProps {
  onMobileMenuClick: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuClick, pageTitle }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { balance } = useWallet();

  const headerRange = calculateEstimatedRange(INITIAL_TELEMETRY.soc_percentage, {
    mode: 'Eco',
    ambientTempC: INITIAL_TELEMETRY.driving_conditions?.ambient_temp_c,
    speedKmh: INITIAL_TELEMETRY.driving_conditions?.avg_speed_kmh,
  }).estimatedRangeKm;

  return (
    <header className="h-16 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#1E293B] sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
      {/* Left section: mobile hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg bg-[#1E293B] text-slate-300 hover:text-white"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">
            {pageTitle || "EVORA Dashboard"}
          </h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-3 max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chargers, corridors, battery diagnostics..."
            className="w-full bg-[#131B2B] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right section: Telemetry Chip, Wallet, Notification, Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Quick EV SoC Pill */}
        <div
          onClick={() => navigate('/battery-health')}
          className="hidden sm:flex items-center gap-2 bg-[#131B2B] border border-slate-800 hover:border-emerald-500/50 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
          title="Nexon EV State of Charge"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-bold text-white">{INITIAL_TELEMETRY.soc_percentage}%</div>
            <div className="text-[10px] text-slate-400 font-medium">{headerRange} km</div>
          </div>
        </div>

        {/* Wallet Chip */}
        <button
          onClick={() => navigate('/wallet')}
          className="flex items-center gap-2 bg-[#131B2B] hover:bg-[#1E293B] border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          title="Wallet Balance"
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-bold">{formatINR(balance)}</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl bg-[#131B2B] hover:bg-[#1E293B] border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Notifications (3 Unread)"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center ring-2 ring-[#0F172A] shadow-md shadow-emerald-500/25">
            3
          </span>
        </button>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[#131B2B] hover:bg-[#1E293B] border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Admin Portal Quick Link */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
          title="Open Central Admin Portal"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-1 group"
          title="My Profile"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center text-xs font-bold text-white group-hover:border-emerald-500 transition-colors">
            NK
          </div>
        </button>
      </div>
    </header>
  );
};
