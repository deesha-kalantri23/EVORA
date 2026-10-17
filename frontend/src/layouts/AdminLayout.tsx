import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminDataService } from '../services/adminDataService';
import { AdminStation } from '../types/admin';
import { cn } from '../utils/cn';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stations, setStations] = useState<AdminStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isSupabaseConnected } = useAdminAuth();
  const location = useLocation();

  // Load stations catalog for global header filter
  useEffect(() => {
    let mounted = true;
    async function loadStations() {
      try {
        const data = await adminDataService.getStations();
        if (mounted) setStations(data);
      } catch (err) {
        console.error('Failed to load stations:', err);
      }
    }
    loadStations();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await adminDataService.getStations();
      setStations(data);
      // Trigger a custom event for child pages to refresh
      window.dispatchEvent(new CustomEvent('evora-admin-refresh'));
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getPageTitle = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1 || segments[1] === 'dashboard') return 'Admin Dashboard Overview';
    const main = segments[1]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return main;
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-[#0F172A] h-full shadow-2xl z-10 flex flex-col">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <AdminHeader
          pageTitle={getPageTitle(location.pathname)}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          stations={stations}
          selectedStationId={selectedStationId}
          onStationChange={setSelectedStationId}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Supabase Setup Guidance Banner (shown when credentials need configuring) */}
        {!isSupabaseConnected && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Supabase Setup Mode:</strong> Connected using local persistent data engine. To connect live Supabase Cloud, add your URL & anon key in{' '}
                <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">frontend/.env</code>.
              </span>
            </div>
            <a
              href="/admin/settings"
              className="hidden sm:inline-flex items-center gap-1 font-bold text-amber-400 hover:underline shrink-0"
            >
              <span>Setup Guide</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary fallbackTitle="Admin Panel Error">
            <Outlet context={{ selectedStationId, selectedDateRange, stations }} />
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1E293B] bg-[#0F172A]/50 py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">EVORA Admin Operations</span>
              <span>— Central Smart EV Platform</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>RLS Enforced: Yes</span>
              <span>•</span>
              <span>Version 2.0.4 Admin</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
