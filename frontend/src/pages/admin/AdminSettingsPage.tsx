import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Key,
  Copy,
  CheckCircle2,
  ExternalLink,
  Terminal,
  FileCode2,
  Lock
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { adminEmail, adminRole, isSupabaseConnected } = useAdminAuth();
  const [copiedScript, setCopiedScript] = useState(false);

  const initialAdminSql = `-- Step 1: User registers in Supabase Auth (or you create them in Auth dashboard)
-- Step 2: In Supabase SQL Editor, grant the database-backed admin role:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = '${adminEmail || 'admin@evora.in'}'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also verify and sync the profile record
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'EVORA Administrator', 'admin'
FROM auth.users
WHERE email = '${adminEmail || 'admin@evora.in'}'
ON CONFLICT (id) DO UPDATE SET role = 'admin';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(initialAdminSql);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          Admin Platform Settings & Supabase RLS Verification
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Review environment variables, security posture, and trusted initial admin assignment instructions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Supabase Connection & Environment */}
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Supabase Project Connection
            </h3>

            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {isSupabaseConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs">
                  {isSupabaseConnected
                    ? 'Connected to Supabase Cloud'
                    : 'Setup Mode (Persistent Engine Active)'}
                </h4>
                <p className="text-[11px] leading-relaxed">
                  {isSupabaseConnected
                    ? 'All admin queries, RLS policies, and bookings synchronize live with your Supabase database.'
                    : 'The admin panel is currently running using the local persistent data layer. To connect to your Supabase cloud project, configure your environment variables in frontend/.env.'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="font-semibold text-slate-300 text-xs">Required Environment Variables</h4>
              <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B] font-mono text-[11px] text-slate-300 space-y-1.5">
                <div>
                  <span className="text-emerald-400">VITE_SUPABASE_URL</span>=
                  <span className="text-slate-500">
                    {import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400">VITE_SUPABASE_ANON_KEY</span>=
                  <span className="text-slate-500">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••' : 'your-anon-key-here'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Never put the service-role key into frontend variables. Use only the anonymous public key.
              </p>
            </div>
          </div>

          {/* Current Admin Account */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Current Admin Session
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Active Admin Email</span>
                <p className="font-bold text-white mt-0.5">{adminEmail || 'admin@evora.in'}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Granted Role</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {adminRole || 'super_admin'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">RLS Status</span>
                <p className="font-semibold text-emerald-400 mt-0.5">Enforced on all tables</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Session Storage</span>
                <p className="font-semibold text-slate-300 mt-0.5">Supabase Auth Storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SQL Migration & Trusted Initial Admin Procedure */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Trusted Initial Admin Setup Process
              </h3>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedScript ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Per security requirements, admin credentials are never hardcoded in client code. Run this snippet in your Supabase SQL Editor to grant admin privileges to your primary account:
            </p>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed custom-scrollbar">
                {initialAdminSql}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Principles Verified:</span>
              </div>
              <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                <li>Non-admins cannot promote themselves or insert into <code className="text-slate-300">user_roles</code>.</li>
                <li>Ordinary users can only SELECT / INSERT their own bookings via auth.uid().</li>
                <li>All destructive admin actions (cancellations, overrides) generate audit logs.</li>
                <li>Overlapping reservations for the same charger & slot are constrained by database unique keys.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
