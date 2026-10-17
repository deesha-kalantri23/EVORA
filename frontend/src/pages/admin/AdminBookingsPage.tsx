import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Ban,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminBooking, BookingStatus, PaymentStatus, AdminStation } from '../../types/admin';
import { BookingDetailDrawer } from '../../components/admin/BookingDetailDrawer';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatINR } from '../../utils/cn';

interface ContextType {
  selectedStationId: string;
  selectedDateRange: string;
  stations: AdminStation[];
}

export const AdminBookingsPage: React.FC = () => {
  const { selectedStationId: globalStationId, selectedDateRange: globalDateRange, stations } =
    useOutletContext<ContextType>();
  const { adminEmail } = useAdminAuth();

  // State filters & pagination
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState<string>(globalStationId);
  const [dateFilter, setDateFilter] = useState<string>(globalDateRange);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data state
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal / Drawer states
  const [activeBooking, setActiveBooking] = useState<AdminBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<AdminBooking | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<AdminBooking | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    startTime: '10:00',
    endTime: '10:45',
    chargerId: ''
  });

  // Sync with global header filters
  useEffect(() => {
    if (globalStationId) setStationFilter(globalStationId);
  }, [globalStationId]);

  useEffect(() => {
    if (globalDateRange) setDateFilter(globalDateRange);
  }, [globalDateRange]);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminDataService.getBookings({
        search,
        stationId: stationFilter,
        dateRange: dateFilter,
        status: statusFilter,
        paymentStatus: paymentFilter,
        sortBy,
        sortOrder,
        page,
        pageSize
      });
      setBookings(res.bookings);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setFeedbackMessage({ type: 'error', text: 'Error querying bookings records.' });
    } finally {
      setIsLoading(false);
    }
  }, [search, stationFilter, dateFilter, statusFilter, paymentFilter, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExportCSV = async () => {
    const res = await adminDataService.getBookings({
      search,
      stationId: stationFilter,
      dateRange: dateFilter,
      status: statusFilter,
      paymentStatus: paymentFilter,
      sortBy,
      sortOrder,
      page: 1,
      pageSize: 1000
    });
    adminDataService.exportBookingsToCSV(res.bookings);
  };

  // Status transition handler
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const res = await adminDataService.updateBookingStatus(bookingId, newStatus, adminEmail || 'admin@evora.in');
    if (res.success && res.booking) {
      setActiveBooking(res.booking);
      setFeedbackMessage({ type: 'success', text: `Booking ${bookingId} status transitioned to ${newStatus}.` });
      fetchBookings();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to update status.' });
    }
  };

  // Cancel action handlers
  const handleOpenCancel = (b: AdminBooking) => {
    setBookingToCancel(b);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason?: string) => {
    if (!bookingToCancel) return;
    const res = await adminDataService.cancelBooking(
      bookingToCancel.id,
      reason || 'Administrative cancellation',
      adminEmail || 'admin@evora.in'
    );
    setCancelModalOpen(false);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: `Booking ${bookingToCancel.id} was successfully cancelled and refunded.` });
      setDrawerOpen(false);
      fetchBookings();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Cancellation failed.' });
    }
    setBookingToCancel(null);
  };

  // Reschedule handlers
  const handleOpenReschedule = (b: AdminBooking) => {
    setBookingToReschedule(b);
    setRescheduleForm({
      date: b.booking_date,
      startTime: b.start_time,
      endTime: b.end_time,
      chargerId: b.charger_id || ''
    });
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingToReschedule) return;

    const res = await adminDataService.rescheduleBooking(
      bookingToReschedule.id,
      rescheduleForm.date,
      rescheduleForm.startTime,
      rescheduleForm.endTime,
      rescheduleForm.chargerId || undefined,
      adminEmail || 'admin@evora.in'
    );

    if (res.success) {
      setRescheduleModalOpen(false);
      setFeedbackMessage({ type: 'success', text: `Booking ${bookingToReschedule.id} rescheduled to ${rescheduleForm.date} (${rescheduleForm.startTime}).` });
      setDrawerOpen(false);
      fetchBookings();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Reschedule conflict occurred.' });
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Charging':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Completed':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Cancelled':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'No-show':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Refunded':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Failed':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Alert / Feedback Notification */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Search & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, member, vehicle plate, or station…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* Buttons: CSV Export & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700/60"
            title="Download CSV report of current filtered view"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#1E293B]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Secondary Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#111827] border border-[#1E293B] text-xs">
        {/* Station Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Station Scope
          </label>
          <select
            value={stationFilter}
            onChange={(e) => {
              setStationFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Stations</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.city})
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Booking Status Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Booking Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Charging">Charging</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
            <option value="No-show">No-show</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Payment Status
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0F172A]/70 text-[11px] text-slate-400 uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Booking ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('member_name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Member & Vehicle</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Station & City</th>
                <th
                  onClick={() => handleSort('booking_date')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Charger / Port</th>
                <th
                  onClick={() => handleSort('booking_status')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Booking Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('estimated_cost')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Cost & Payment</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading bookings records…</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-300">No bookings match the selected criteria.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting the station, search, or status filters.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Booking ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {b.id}
                    </td>

                    {/* Member & Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.member_name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-emerald-400">{b.vehicle_registration_number}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{b.vehicle_model}</span>
                      </div>
                    </td>

                    {/* Station & City */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 truncate max-w-[170px]" title={b.station_name}>
                        {b.station_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.station_city}</div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{b.booking_date}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.start_time} - {b.end_time} ({b.estimated_duration_min}m)
                      </div>
                    </td>

                    {/* Charger ID & Connector */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{b.connector_type}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.charger_id || 'Bay 1'}</div>
                    </td>

                    {/* Booking Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(b.booking_status)}`}>
                        {b.booking_status}
                      </span>
                    </td>

                    {/* Cost & Payment Status */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">
                        {formatINR(b.actual_cost || b.estimated_cost)}
                      </div>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${getPaymentBadge(b.payment_status)}`}>
                        {b.payment_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveBooking(b);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View complete booking details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {b.booking_status !== 'Cancelled' && (
                          <button
                            onClick={() => handleOpenReschedule(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            title="Reschedule reservation slot"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b.booking_status !== 'Cancelled' && b.booking_status !== 'Completed' && (
                          <button
                            onClick={() => handleOpenCancel(b)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                            title="Cancel booking"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0F172A]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{bookings.length}</span> of{' '}
            <span className="font-bold text-white">{totalCount}</span> booking records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#0B0F17] text-slate-200 rounded-lg px-2 py-1 border border-[#1E293B] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Slide-Over Drawer */}
      <BookingDetailDrawer
        booking={activeBooking}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onCancelBooking={handleOpenCancel}
        onRescheduleBooking={handleOpenReschedule}
      />

      {/* Cancellation Confirmation Dialog */}
      <AdminConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Booking & Refund"
        message={`Are you sure you want to cancel booking ${bookingToCancel?.id} for ${bookingToCancel?.member_name}? A refund of ${formatINR(bookingToCancel?.estimated_cost || 0)} will be initiated.`}
        confirmLabel="Confirm Cancellation"
        isDestructive={true}
        requireReason={true}
        reasonPlaceholder="e.g. Member requested cancellation / Station under emergency maintenance"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* Reschedule Modal */}
      {rescheduleModalOpen && bookingToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-sm font-bold text-white mb-1">Reschedule Charging Reservation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Booking {bookingToReschedule.id} • {bookingToReschedule.station_name}
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Reservation Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={rescheduleForm.startTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={rescheduleForm.endTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
