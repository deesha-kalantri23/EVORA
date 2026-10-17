import React, { useState } from 'react';
import {
  X,
  CalendarCheck,
  MapPin,
  Clock,
  Zap,
  User,
  Mail,
  Phone,
  Car,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  Ban,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AdminBooking, BookingStatus } from '../../types/admin';
import { formatINR } from '../../utils/cn';

interface BookingDetailDrawerProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onCancelBooking: (booking: AdminBooking) => void;
  onRescheduleBooking: (booking: AdminBooking) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  onCancelBooking,
  onRescheduleBooking
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);

  if (!isOpen || !booking) return null;

  const currentStatus = selectedStatus || booking.booking_status;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Charging':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse';
      case 'Completed':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Cancelled':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'No-show':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getPaymentBadge = (status: string) => {
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-[#0F172A] border-l border-[#1E293B] h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{booking.id}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(booking.booking_status)}`}>
                  {booking.booking_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Created on {new Date(booking.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
          {/* Member & Vehicle Section */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              Member & Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <p className="text-[11px] text-slate-500">Member Name</p>
                <p className="font-semibold text-white mt-0.5">{booking.member_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Registration Number</p>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">{booking.vehicle_registration_number}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-slate-300 mt-0.5 truncate">{booking.member_email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact Phone
                </p>
                <p className="text-slate-300 mt-0.5">{booking.member_phone || '+91 98230 45678'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Car className="w-3 h-3" /> Vehicle Model
                </p>
                <p className="text-slate-300 mt-0.5 font-medium">{booking.vehicle_model}</p>
              </div>
            </div>
          </div>

          {/* Station & Slot Section */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Station & Reservation Slot
            </h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-white font-semibold">{booking.station_name}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{booking.station_location}, {booking.station_city}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Booking Date
                  </p>
                  <p className="font-semibold text-slate-200 mt-0.5">{booking.booking_date}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Reserved Time
                  </p>
                  <p className="font-semibold text-emerald-400 mt-0.5">
                    {booking.start_time} - {booking.end_time} ({booking.estimated_duration_min} min)
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Connector Type
                  </p>
                  <p className="text-slate-200 mt-0.5 font-medium">{booking.connector_type}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Charger / Bay ID</p>
                  <p className="font-mono text-slate-300 mt-0.5">{booking.charger_id || 'Bay 1 (Assigned)'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Payment Section */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment & Settlement
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-slate-500">Estimated Cost</p>
                <p className="text-base font-bold text-white mt-0.5">{formatINR(booking.estimated_cost)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Actual Settled Cost</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">
                  {booking.actual_cost ? formatINR(booking.actual_cost) : 'Pending Delivery'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Payment Status</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(booking.payment_status)}`}>
                  {booking.payment_status}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Payment Method</p>
                <p className="text-slate-300 mt-1 font-medium">{booking.payment_method}</p>
              </div>
              {booking.energy_consumed_kwh && (
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] text-slate-500">Energy Delivered</p>
                  <p className="text-slate-200 font-bold mt-0.5">{booking.energy_consumed_kwh} kWh</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Info if cancelled */}
          {booking.booking_status === 'Cancelled' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Booking Cancelled</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Reason: {booking.cancellation_reason || 'Cancelled by administrative rule'}
              </p>
            </div>
          )}

          {/* Administrative Status Override */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Administrative Status Transition
            </h3>
            <p className="text-[11px] text-slate-400">
              Change the booking state through server-validated status rules.
            </p>
            <div className="flex items-center gap-2">
              <select
                value={currentStatus}
                onChange={(e) => setSelectedStatus(e.target.value as BookingStatus)}
                className="flex-1 bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Charging">Charging</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-show">No-show</option>
              </select>
              <button
                onClick={() => {
                  if (selectedStatus && selectedStatus !== booking.booking_status) {
                    onStatusChange(booking.id, selectedStatus);
                  }
                }}
                disabled={!selectedStatus || selectedStatus === booking.booking_status}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1E293B] bg-[#111827] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {booking.booking_status !== 'Cancelled' && booking.booking_status !== 'Completed' && (
              <button
                onClick={() => onCancelBooking(booking)}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel Booking
              </button>
            )}

            {booking.booking_status !== 'Cancelled' && (
              <button
                onClick={() => onRescheduleBooking(booking)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reschedule
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
