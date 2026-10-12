import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/cn';
import { useWallet } from '../hooks/useWallet';

export const WalletPage: React.FC = () => {
  const { balance, transactions, addMoney } = useWallet();
  const [rechargeAmt, setRechargeAmt] = useState(1000);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMoney(rechargeAmt, selectedMethod);
    setTopupSuccess(true);
    setTimeout(() => {
      setTopupSuccess(false);
      setShowAddMoneyModal(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              EVORA Wallet
            </h1>
            <Badge variant="emerald">
              Demo Wallet Only
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Universal EV charging balance for interoperable fast charging across Indian networks
          </p>
        </div>

        <button
          onClick={() => {
            setTopupSuccess(false);
            setShowAddMoneyModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Money</span>
        </button>
      </div>

      {/* Demo Disclosure Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Demo Sandbox Mode:</strong> This is a simulation wallet for application demonstration. No real bank accounts, UPI apps, or credit cards are debited.
          </span>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
          No Real Payments
        </span>
      </div>

      {/* Balance Card & Linked Instruments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wallet Balance Display (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-[#131B2B] via-[#162338] to-[#131B2B] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Balance</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {formatINR(balance)}
              </span>
              <span className="text-xs text-emerald-400 font-bold block mt-1">
                Available for 1-Tap fast charging
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Auto-pay enabled for Pune stalls</span>
            </span>
            <Badge variant="emerald">Active</Badge>
          </div>
        </div>

        {/* Linked Demo Instruments (7 cols) */}
        <div className="lg:col-span-7 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Linked Payment Instruments</h3>
            <span className="text-xs text-slate-400">Demo Sandbox</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  UPI
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">HDFC Bank UPI</h4>
                  <p className="text-[11px] text-slate-400">nikhil@okhdfcbank • Default for expressway hubs</p>
                </div>
              </div>
              <Badge variant="emerald">Primary</Badge>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">ICICI RuPay Platinum Card</h4>
                  <p className="text-[11px] text-slate-400">•••• •••• •••• 4129 • Exp 08/29</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Backup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section with Table */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm overflow-hidden">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">Transaction History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Records of all charging sessions and wallet recharges</p>
          </div>
          <Badge variant="slate">Verified Ledger</Badge>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/25 transition-colors">
                  <td className="py-3.5 text-slate-300 font-medium whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3.5 text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{tx.description}</span>
                    </div>
                  </td>
                  <td className={`py-3.5 text-right font-black text-sm whitespace-nowrap ${
                    tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatINR(tx.amount)}
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Add Money to Wallet</span>
              </h3>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {topupSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-white">Wallet Recharged!</h4>
                <p className="text-xs text-slate-300">Added ₹{rechargeAmt} to your demo balance.</p>
              </div>
            ) : (
              <form onSubmit={handleAddMoney} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">Select Amount (INR)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmt(amt)}
                        className={`py-2 rounded-xl font-bold transition-all ${
                          rechargeAmt === amt
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Payment Method (Demo)</label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full bg-[#0F172A] text-slate-200 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="HDFC Bank UPI">HDFC Bank UPI (nikhil@okhdfcbank)</option>
                    <option value="ICICI RuPay Card">ICICI RuPay Card (•••• 4129)</option>
                    <option value="Net Banking">State Bank of India Net Banking</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                  * Demo Sandbox: No real money will be charged to your card or UPI.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  >
                    Add ₹{rechargeAmt}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
