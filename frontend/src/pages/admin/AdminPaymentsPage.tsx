import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, IndianRupee, Download, ShieldCheck } from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminPayment } from '../../types/admin';
import { formatINR } from '../../utils/cn';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      try {
        const data = await adminDataService.getPayments();
        setPayments(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.member_name.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      (p.booking_id && p.booking_id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSettled = payments
    .filter((p) => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] sm:col-span-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Financial Transactions & Settlement
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            PCI-DSS compliant transaction records. Sensitive payment details and auth tokens are secured and never exposed.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-transparent">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Gross Settled Revenue</span>
          <div className="text-2xl font-bold text-white mt-1">{formatINR(totalSettled)}</div>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments by ID, booking, member or method…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{filtered.length}</span> payment events
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0F172A]/70 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Payment ID</th>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Gateway Ref</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading payments…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{p.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{p.booking_id || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{p.member_name}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{formatINR(p.amount)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.payment_method}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                      {p.reference_number || 'UPI-GATEWAY-AUTH'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.status === 'Success'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : p.status === 'Refunded'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {p.status}
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
