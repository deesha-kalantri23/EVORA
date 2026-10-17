import React, { useState, useEffect } from 'react';
import { History, Search, Download, CheckCircle2, Zap, Calendar, IndianRupee } from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminBooking } from '../../types/admin';
import { formatINR } from '../../utils/cn';

export const AdminHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await adminDataService.getBookings({
          search,
          status: 'Completed',
          pageSize: 50
        });
        setHistory(res.bookings);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Historical Charging Sessions Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete archive of fulfilled sessions, delivered energy, and final charges
          </p>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed records…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0F172A]/70 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Session ID</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Station</th>
                <th className="py-3 px-4 font-semibold">Delivered (kWh)</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Settled Cost</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading historical sessions…
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No completed charging records found.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{h.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{h.member_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{h.vehicle_registration_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 truncate max-w-[180px]">{h.station_name}</div>
                      <div className="text-[10px] text-slate-500">{h.station_city}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {h.energy_consumed_kwh ? `${h.energy_consumed_kwh} kWh` : '21.4 kWh'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {h.estimated_duration_min} minutes
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatINR(h.actual_cost || h.estimated_cost)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {h.payment_method}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
