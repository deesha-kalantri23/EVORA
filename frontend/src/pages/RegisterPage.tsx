import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Pune');
  const [role, setRole] = useState('EV Owner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to onboarding flow for first-time account setup
      navigate('/onboarding');
    }, 600);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Create EVORA Account</h2>
        <p className="text-xs text-slate-400 mt-1">
          Join India&apos;s intelligent EV companion & smart charging network
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Nikhil Kalantri"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nikhil@example.in"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+91 98230 45678"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* City & Role (2-col grid) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-8 pr-2 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Pune">Pune, MH</option>
                <option value="Mumbai">Mumbai, MH</option>
                <option value="Bengaluru">Bengaluru, KA</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad, TS</option>
                <option value="Ahmedabad">Ahmedabad, GJ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-8 pr-2 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="EV Owner">EV Owner (Default)</option>
                <option value="Fleet Operator">Fleet Operator</option>
                <option value="Charging Host">Charging Host</option>
                <option value="EV Enthusiast">EV Enthusiast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
              className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>
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
              <span>Continue to Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Already have an EVORA account?{' '}
        <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
