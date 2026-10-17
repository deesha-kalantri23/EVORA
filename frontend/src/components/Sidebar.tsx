import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Activity,
  Compass,
  AlertTriangle,
  Bot,
  Zap,
  Navigation,
  BatteryCharging,
  History,
  Coins,
  CalendarCheck,
  Leaf,
  BarChart3,
  Wallet,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My EV', path: '/my-ev', icon: Car, badge: 'Nexon EV' }
    ]
  },
  {
    title: 'AI & PREDICTIONS',
    items: [
      { label: 'Battery Health', path: '/battery-health', icon: Activity },
      { label: 'Range Prediction', path: '/range-prediction', icon: Compass },
      { label: 'Range Anxiety', path: '/range-anxiety', icon: AlertTriangle },
      { label: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' }
    ]
  },
  {
    title: 'CHARGING',
    items: [
      { label: 'Find Chargers', path: '/chargers', icon: Zap },
      { label: 'Smart Route', path: '/route', icon: Navigation },
      { label: 'Charging', path: '/charging', icon: BatteryCharging },
      { label: 'Charging History', path: '/charging-history', icon: History },
      { label: 'Charging Cost', path: '/charging-cost', icon: Coins },
      { label: 'My Bookings', path: '/bookings', icon: CalendarCheck }
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { label: 'Carbon Footprint', path: '/carbon', icon: Leaf },
      { label: 'EV Analytics', path: '/analytics', icon: BarChart3 }
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Wallet', path: '/wallet', icon: Wallet },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Profile', path: '/profile', icon: User },
      { label: 'Settings', path: '/settings', icon: Settings }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Admin Portal', path: '/admin/dashboard', icon: ShieldCheck, badge: 'OPS' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Zap className="w-6 h-6 text-slate-950 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-white">EVORA</span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-tight truncate">
                Intelligent EV Companion
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-lg bg-[#1E293B] text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            {!collapsed ? (
              <h3 className="px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                {sec.title}
              </h3>
            ) : (
              <div className="h-[1px] bg-slate-800 my-2" />
            )}

            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-[#1E293B]/70"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Dataset & Location Badge Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0F17]/50">
        {!collapsed ? (
          <div className="rounded-xl bg-[#1E293B]/60 p-2.5 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Pune, Maharashtra, IN</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>India EV Stations 2025</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Pune, Maharashtra">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
