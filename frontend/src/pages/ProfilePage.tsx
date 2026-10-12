import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Car,
  Zap,
  Edit3,
  Camera,
  ShieldCheck,
  CheckCircle2,
  X,
  BatteryCharging
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { INITIAL_USER, INITIAL_VEHICLES } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    name: INITIAL_USER.name,
    email: INITIAL_USER.email,
    phone: INITIAL_USER.phone,
    city: 'Pune, Maharashtra',
    vehicle: 'Tata Nexon EV Long Range 2025 (40.5 kWh)',
    preferredChargingType: 'CCS2 Dual Gun (Fast DC, 60-150 kW)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleOpenEdit = () => {
    setFormData({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...formData });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditModalOpen(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Profile
            </h1>
            <Badge variant="emerald">EVORA Member</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal credentials, EV registration ownership, and preferred fast-charging standards
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Profile Photo & Key Identity (4 cols) */}
        <div className="lg:col-span-4 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 text-center space-y-5 shadow-sm">
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-xl bg-slate-800">
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback initials if image cannot load
                  (e.target as any).style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-slate-800">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <button
              onClick={handleOpenEdit}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="font-extrabold text-xl text-white">{user.name}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">EV Pioneer • {user.city}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <span className="font-bold text-slate-200 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified EV Registration</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              Account linked with Maharashtra Green Plate registration MH-12-TE-4590.
            </p>
          </div>
        </div>

        {/* Right Card: Full Profile Details (8 cols) */}
        <div className="lg:col-span-8 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Account & Vehicle Credentials</h3>
            <span className="text-xs text-slate-400 font-medium">Updated Sep 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Name */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Full Name</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{user.name}</span>
              </span>
            </div>

            {/* Email */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="truncate">{user.email}</span>
              </span>
            </div>

            {/* Phone */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Phone</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{user.phone}</span>
              </span>
            </div>

            {/* City */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">City</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{user.city}</span>
              </span>
            </div>

            {/* Vehicle */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Primary Vehicle</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                <span>{user.vehicle}</span>
              </span>
            </div>

            {/* Preferred Charging Type */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Preferred Charging Type</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{user.preferredChargingType}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Edit Profile</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle</label>
                <select
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Tata Nexon EV Long Range 2025 (40.5 kWh)">Tata Nexon EV Long Range 2025 (40.5 kWh)</option>
                  <option value="MG ZS EV Exclusive Pro (50.3 kWh)">MG ZS EV Exclusive Pro (50.3 kWh)</option>
                  <option value="Mahindra XUV400 EL Pro (39.4 kWh)">Mahindra XUV400 EL Pro (39.4 kWh)</option>
                  <option value="Tata Punch EV Long Range (35.0 kWh)">Tata Punch EV Long Range (35.0 kWh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Charging Type</label>
                <select
                  value={formData.preferredChargingType}
                  onChange={(e) => setFormData({ ...formData, preferredChargingType: e.target.value })}
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="CCS2 Dual Gun (Fast DC, 60-150 kW)">CCS2 Dual Gun (Fast DC, 60-150 kW)</option>
                  <option value="Type 2 AC (Home Smart Wallbox, 7.2 kW)">Type 2 AC (Home Smart Wallbox, 7.2 kW)</option>
                  <option value="Bharat DC-001 (Commercial Fast DC, 15 kW)">Bharat DC-001 (Commercial Fast DC, 15 kW)</option>
                </select>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
