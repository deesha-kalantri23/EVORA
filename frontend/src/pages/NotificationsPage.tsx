import React, { useState } from 'react';
import {
  Bell,
  Zap,
  BatteryCharging,
  CalendarCheck,
  ShieldCheck,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';

export type NotificationCategory = 'All' | 'Charging' | 'Battery' | 'Bookings' | 'AI Recommendations' | 'System';

interface NotificationItem {
  id: string;
  category: 'Charging' | 'Battery' | 'Bookings' | 'AI Recommendations' | 'System';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
  severity?: 'normal' | 'warning' | 'success';
}

const INITIAL_NOTIFICATIONS_LIST: NotificationItem[] = [
  {
    id: 'n-1',
    category: 'Charging',
    title: 'Charging session completed',
    description: 'Your Tata Nexon EV reached 80% target SoC at Tata Power EZ Charge Phoenix Marketcity, Pune. 18.4 kWh delivered.',
    time: '15 mins ago',
    read: false,
    link: '/charging-history',
    severity: 'success'
  },
  {
    id: 'n-2',
    category: 'Battery',
    title: 'Battery warning',
    description: 'Pack temperature elevated to 36°C in Pune afternoon ambient heat. BMS liquid cooling activated to maintain cell health.',
    time: '2 hours ago',
    read: false,
    link: '/battery-health',
    severity: 'warning'
  },
  {
    id: 'n-3',
    category: 'Bookings',
    title: 'Booking confirmed',
    description: 'Your fast-charging slot at Zeon Charging Urse Expressway Hub (Booking #BK-2026-8910) is confirmed for 18:30 today.',
    time: '4 hours ago',
    read: false,
    link: '/bookings',
    severity: 'normal'
  },
  {
    id: 'n-4',
    category: 'AI Recommendations',
    title: 'Recommended charging station',
    description: 'Jio-bp pulse on Baner High Street currently has 4 available ultra-fast CCS2 stalls with low wait times.',
    time: 'Yesterday',
    read: true,
    link: '/chargers',
    severity: 'normal'
  },
  {
    id: 'n-5',
    category: 'System',
    title: 'Monthly EVORA Report Ready',
    description: 'You avoided 126 kg CO2 and saved ₹1,840 compared to petrol across 421 lifetime charge cycles.',
    time: '2 days ago',
    read: true,
    link: '/carbon',
    severity: 'normal'
  }
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS_LIST);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('All');

  // Filtered notifications
  const filteredNotifications = notifications.filter(
    n => activeCategory === 'All' || n.category === activeCategory
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const CATEGORIES: NotificationCategory[] = [
    'All',
    'Charging',
    'Battery',
    'Bookings',
    'AI Recommendations',
    'System'
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Charging': return Zap;
      case 'Battery': return BatteryCharging;
      case 'Bookings': return CalendarCheck;
      case 'AI Recommendations': return ShieldCheck;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Notifications & Alerts
            </h1>
            <Badge variant="emerald">{unreadCount} Unread</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time charging updates, battery health warnings, booking confirmations, and AI advisories
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 disabled:opacity-40 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
            title="Clear all notifications"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none text-xs">
        {CATEGORIES.map((cat) => {
          const count = cat === 'All' ? notifications.length : notifications.filter(n => n.category === cat).length;
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-[#131B2B] text-slate-400 hover:text-white border border-[#243046]'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#131B2B] rounded-3xl border border-slate-800 space-y-4">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications in {activeCategory}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are all caught up! System alerts and charging reminders will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const Icon = getCategoryIcon(n.category);
            return (
              <div
                key={n.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  n.read
                    ? 'bg-[#131B2B]/70 border-[#243046] text-slate-400'
                    : 'bg-[#131B2B] border-emerald-500/40 shadow-md text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Category icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    n.severity === 'warning'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : n.severity === 'success'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {n.category}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {n.description}
                    </p>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      {n.time}
                    </span>
                  </div>
                </div>

                {/* Actions: View Link, Mark as Read, Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {n.link && (
                    <button
                      onClick={() => navigate(n.link!)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
