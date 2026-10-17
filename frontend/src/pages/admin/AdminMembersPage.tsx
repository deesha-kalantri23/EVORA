import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  CalendarCheck,
  Mail,
  Phone,
  Car,
  MapPin,
  ExternalLink,
  XCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminMember, AdminBooking } from '../../types/admin';
import { formatINR } from '../../utils/cn';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [memberBookings, setMemberBookings] = useState<AdminBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      try {
        const data = await adminDataService.getMembers(search);
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, [search]);

  const handleViewMemberHistory = async (member: AdminMember) => {
    setSelectedMember(member);
    setIsLoadingBookings(true);
    try {
      const bookings = await adminDataService.getMemberBookings(member.email);
      setMemberBookings(bookings);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, email, phone, or vehicle…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Registered EV Members: <span className="font-bold text-white">{members.length}</span>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0F172A]/70 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Contact & Location</th>
                <th className="py-3 px-4 font-semibold">Primary EV</th>
                <th className="py-3 px-4 font-semibold">Registered</th>
                <th className="py-3 px-4 font-semibold">Bookings Stats</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading members list…</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{m.full_name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{m.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{m.phone}</div>
                      <div className="text-[11px] text-slate-500">{m.location}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{m.vehicle_model}</div>
                      <div className="font-mono text-[11px] text-emerald-400">{m.vehicle_registration}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{m.total_bookings_count}</span>
                        <span className="text-[11px] text-slate-500">total</span>
                        <span className="text-[10px] text-emerald-400">({m.completed_bookings_count} ok)</span>
                        {m.cancelled_bookings_count > 0 && (
                          <span className="text-[10px] text-red-400">({m.cancelled_bookings_count} canc)</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.account_status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {m.account_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewMemberHistory(m)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs font-semibold"
                      >
                        View Bookings
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member History Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-[#0F172A] border-l border-[#1E293B] h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
              <div>
                <h2 className="text-base font-bold text-white">{selectedMember.full_name}</h2>
                <p className="text-xs text-slate-400">{selectedMember.email} • {selectedMember.phone}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500">Primary EV</span>
                  <p className="font-semibold text-white mt-0.5">{selectedMember.vehicle_model}</p>
                  <p className="font-mono text-emerald-400 text-[11px]">{selectedMember.vehicle_registration}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Wallet Balance</span>
                  <p className="text-base font-bold text-white mt-0.5">{formatINR(selectedMember.wallet_balance_inr)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Member Booking History ({memberBookings.length})
                </h3>

                {isLoadingBookings ? (
                  <p className="text-slate-500 py-4 text-center">Loading booking records…</p>
                ) : memberBookings.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#111827] text-center text-slate-500">
                    No bookings found for this member account.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {memberBookings.map(b => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400">{b.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {b.booking_status}
                          </span>
                        </div>
                        <p className="text-white font-medium truncate">{b.station_name}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>{b.booking_date} • {b.start_time}</span>
                          <span className="font-bold text-white">{formatINR(b.actual_cost || b.estimated_cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
