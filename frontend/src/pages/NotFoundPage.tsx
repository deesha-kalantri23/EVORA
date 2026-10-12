import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      <h2 className="text-3xl font-extrabold text-white">404 — Route Not Found</h2>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        The EVORA navigation system could not find the destination page. Let&apos;s guide you back to the main dashboard.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to EVORA Dashboard</span>
      </Link>
    </div>
  );
};
