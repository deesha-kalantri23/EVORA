import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { cn } from '../utils/cn';
import { ShieldCheck, Info } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to extract a friendly title from path
  const getPageTitle = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') return 'Dashboard Overview';
    const main = segments[0]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return main;
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-[#0F172A] h-full shadow-2xl z-10 flex flex-col">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Header
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />

        {/* Page View Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary fallbackTitle="Page View Error">
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1E293B] bg-[#0F172A]/40 py-6 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">EVORA</span>
              <span>— Intelligent EV Fleet & Charging Management</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pune, Maharashtra
              </span>
              <span>•</span>
              <span>Version 1.2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
