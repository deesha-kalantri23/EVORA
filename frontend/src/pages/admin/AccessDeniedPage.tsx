import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AccessDeniedPage: React.FC = () => {
  const { user, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSwitchAccount = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-[#111827] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-5 shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-white">403 — Administrator Access Denied</h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The signed-in account <span className="font-semibold text-slate-200">{user?.email || 'current user'}</span> does not have verified administrative privileges in the database (<code className="text-emerald-400">public.user_roles</code>).
        </p>

        <div className="mt-6 p-4 rounded-xl bg-[#0B0F17] border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>How to resolve access:</span>
          </div>
          <ol className="list-decimal list-inside text-slate-400 text-[11px] space-y-1 pl-1">
            <li>Ensure you are logging in with your designated administrator email.</li>
            <li>In Supabase, execute the admin grant SQL migration to assign the admin role to this user ID.</li>
            <li>Sign out and authenticate again once the role is attached.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSwitchAccount}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account / Sign In</span>
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Member Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
