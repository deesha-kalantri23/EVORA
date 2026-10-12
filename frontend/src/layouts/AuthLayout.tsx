import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-white">EVORA</h1>
              <p className="text-xs text-slate-400 font-medium">Smart EV Operations & Diagnostics</p>
            </div>
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure EV Fleet & Charging Portal</span>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>

        {/* Bottom footer text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 EVORA. Powered by Indian EV Stations & EVIoT Telemetry Datasets.
        </p>
      </div>
    </div>
  );
};
