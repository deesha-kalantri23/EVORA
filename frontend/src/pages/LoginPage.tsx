import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nikhil.kalantri@example.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Welcome Back to EVORA</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your smart EV telemetry, charging map, and AI assistant
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.in"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-10 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="remember"
            type="checkbox"
            defaultChecked
            className="rounded border-[#243046] bg-[#0B0F17] text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
            Keep me signed in on this device
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an EVORA account?{' '}
        <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>

      <div className="mt-6 p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-[11px] text-slate-400">
        <span className="font-semibold text-emerald-400">Quick Demo Access:</span> Pre-filled with demo credentials for Pune, Maharashtra EV owner. Simply click Sign In.
      </div>
    </div>
  );
};
