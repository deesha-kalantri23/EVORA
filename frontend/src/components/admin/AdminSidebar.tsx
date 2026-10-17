import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Zap,
  Activity,
  Users,
  BarChart3,
  History,
  CreditCard,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { cn } from '../../utils/cn';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, onCloseMobile }) => {
  const { adminEmail, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck, badge: 'All' },
    { name: 'Charging Stations', path: '/admin/stations', icon: Zap },
    { name: 'Live Monitor', path: '/admin/live-monitor', icon: Activity, live: true },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Charging History', path: '/admin/history', icon: History },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Maintenance & Alerts', path: '/admin/maintenance', icon: AlertTriangle },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col',
        'bg-[#0F172A] border-r border-[#1E293B]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                EVORA <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">ADMIN</span>
              </span>
              <span className="text-[10px] text-slate-400 truncate">Central Fleet & Operations</span>
            </div>
          )}
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-7 h-7 rounded-lg bg-[#1E293B] hover:bg-slate-700 items-center justify-center text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Management Panel
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />

              {!collapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!collapsed && item.live && (
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}

              {!collapsed && item.badge && !item.live && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Separator to User Member Portal */}
        <div className="pt-4 border-t border-[#1E293B] mt-4">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40 transition-colors"
            title={collapsed ? 'Return to Member Portal' : undefined}
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-500" />
            {!collapsed && <span className="truncate">View Member Portal</span>}
          </NavLink>
        </div>
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0F17]/50">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#1E293B]/40 border border-slate-800/80">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-bold text-slate-200 truncate">
                  {adminEmail ? adminEmail.split('@')[0] : 'Administrator'}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {adminEmail || 'admin@evora.in'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout from Admin Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
