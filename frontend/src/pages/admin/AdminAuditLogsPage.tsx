import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, Clock, Download, RefreshCw } from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminAuditLog } from '../../types/admin';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await adminDataService.getAuditLogs();
        setLogs(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action_type.toLowerCase().includes(search.toLowerCase()) ||
      l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Administrative Audit Trail & Security Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all administrative cancellations, status overrides, and station modifications
          </p>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, email, or entity…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0F172A]/70 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Admin Identity</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Payload & Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading audit trail…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      {log.admin_email}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {log.action_type}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {log.entity_type}: {log.entity_id}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-400 font-mono">
                      {JSON.stringify(log.details)}
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
