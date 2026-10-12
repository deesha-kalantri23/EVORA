import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Zap,
  Navigation,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Eye,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sun,
  Moon,
  Timer,
  BatteryCharging,
  Info,
  Wallet
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { INITIAL_STATIONS, INITIAL_VEHICLES } from '../data/mockData';
import { ChargingStation } from '../types';
import { formatINR } from '../utils/cn';
import { useWallet } from '../hooks/useWallet';

interface BookingItem {
  bookingId: string;
  stationId: string;
  stationName: string;
  address: string;
  city: string;
  date: string;
  timeSlot: string;
  connector: string;
  estimatedCostInr: number;
  durationMin: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const INITIAL_BOOKINGS_LIST: BookingItem[] = [
  {
    bookingId: 'BK-2026-9042',
    stationId: 'pune-tp-01',
    stationName: 'Tata Power EZ Charge - Phoenix Marketcity',
    address: 'Viman Nagar, Pune, Maharashtra',
    city: 'Pune',
    date: 'Today, 30 Sep 2026',
    timeSlot: '18:30 - 19:15',
    connector: 'CCS2 (60 kW Fast DC)',
    estimatedCostInr: 420.0,
    durationMin: 45,
    status: 'Upcoming'
  },
  {
    id: 'b-completed-1',
    bookingId: 'BK-2026-8910',
    stationId: 'pune-zeon-04',
    stationName: 'Zeon Charging - Pune-Mumbai Expressway (Urse)',
    address: 'Food Mall, Mumbai-Pune Expressway, Urse',
    city: 'Pune / Highway',
    date: '26 Sep 2026',
    timeSlot: '14:00 - 14:30',
    connector: 'CCS2 (150 kW Ultra-Fast)',
    estimatedCostInr: 580.0,
    durationMin: 30,
    status: 'Completed'
  } as any,
  {
    id: 'b-completed-2',
    bookingId: 'BK-2026-8804',
    stationId: 'pune-jio-02',
    stationName: 'Jio-bp pulse - Baner High Street',
    address: 'Baner - Balewadi High St, Pune',
    city: 'Pune',
    date: '20 Sep 2026',
    timeSlot: '17:30 - 18:15',
    connector: 'CCS2 (120 kW Fast DC)',
    estimatedCostInr: 390.0,
    durationMin: 45,
    status: 'Completed'
  } as any,
  {
    id: 'b-cancelled-1',
    bookingId: 'BK-2026-8712',
    stationId: 'pune-statiq-03',
    stationName: 'Statiq Charging Hub - Hinjawadi Phase 1',
    address: 'Rajiv Gandhi Infotech Park, Hinjawadi',
    city: 'Pune',
    date: '15 Sep 2026',
    timeSlot: '11:00 - 11:45',
    connector: 'CCS2 (50 kW)',
    estimatedCostInr: 350.0,
    durationMin: 45,
    status: 'Cancelled'
  } as any
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TimeSlotItem {
  id: string;
  startTime: string;
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  bay: string;
  tag: string;
  isPeak?: boolean;
  isOffPeak?: boolean;
  isSolar?: boolean;
}

const ALL_TIME_SLOTS: TimeSlotItem[] = [
  // Morning (06:00 - 12:00)
  { id: 's-0600', startTime: '06:00', period: 'Morning', bay: 'Bay 1', tag: 'Off-Peak (Save ₹4/kWh)', isOffPeak: true },
  { id: 's-0715', startTime: '07:15', period: 'Morning', bay: 'Bay 2', tag: 'Off-Peak (Save ₹4/kWh)', isOffPeak: true },
  { id: 's-0830', startTime: '08:30', period: 'Morning', bay: 'Bay 1', tag: 'Fast Turnaround' },
  { id: 's-0945', startTime: '09:45', period: 'Morning', bay: 'Bay 3', tag: 'Available' },
  { id: 's-1100', startTime: '11:00', period: 'Morning', bay: 'Bay 2', tag: 'Available' },

  // Afternoon (12:00 - 17:00)
  { id: 's-1215', startTime: '12:15', period: 'Afternoon', bay: 'Bay 1', tag: 'Lunch Charging' },
  { id: 's-1330', startTime: '13:30', period: 'Afternoon', bay: 'Bay 2', tag: 'Solar Green ☀️', isSolar: true },
  { id: 's-1445', startTime: '14:45', period: 'Afternoon', bay: 'Bay 1', tag: 'Solar Green ☀️', isSolar: true },
  { id: 's-1600', startTime: '16:00', period: 'Afternoon', bay: 'Bay 3', tag: 'Available' },

  // Evening (17:00 - 21:00)
  { id: 's-1715', startTime: '17:15', period: 'Evening', bay: 'Bay 1', tag: 'High Demand', isPeak: true },
  { id: 's-1815', startTime: '18:15', period: 'Evening', bay: 'Bay 2', tag: 'Immediate', isPeak: true },
  { id: 's-1915', startTime: '19:15', period: 'Evening', bay: 'Bay 1', tag: 'Popular', isPeak: true },
  { id: 's-2015', startTime: '20:15', period: 'Evening', bay: 'Bay 3', tag: 'High Demand', isPeak: true },

  // Night (21:00 - 00:00)
  { id: 's-2115', startTime: '21:15', period: 'Night', bay: 'Bay 1', tag: 'Off-Peak Tariff', isOffPeak: true },
  { id: 's-2215', startTime: '22:15', period: 'Night', bay: 'Bay 2', tag: 'Off-Peak Tariff', isOffPeak: true },
  { id: 's-2315', startTime: '23:15', period: 'Night', bay: 'Bay 1', tag: 'Night Owl Mode', isOffPeak: true }
];

function calculateEndTime(startTimeStr: string, durationHours: number): { endTimeStr: string; isNextDay: boolean } {
  const cleanStart = startTimeStr.includes(' - ') ? startTimeStr.split(' - ')[0] : startTimeStr;
  const [hStr, mStr] = cleanStart.split(':');
  const startH = parseInt(hStr || '18', 10);
  const startM = parseInt(mStr || '0', 10);

  const totalStartMinutes = startH * 60 + startM;
  const totalDurationMinutes = Math.round(durationHours * 60);
  const totalEndMinutes = totalStartMinutes + totalDurationMinutes;

  const endDayMinutes = totalEndMinutes % (24 * 60);
  const isNextDay = totalEndMinutes >= 24 * 60;

  const endH = Math.floor(endDayMinutes / 60);
  const endM = endDayMinutes % 60;

  const formattedH = endH < 10 ? `0${endH}` : `${endH}`;
  const formattedM = endM < 10 ? `0${endM}` : `${endM}`;

  return {
    endTimeStr: `${formattedH}:${formattedM}`,
    isNextDay
  };
}

function formatSlotTiming(startTimeStr: string, durationHours: number): string {
  const cleanStart = startTimeStr.includes(' - ') ? startTimeStr.split(' - ')[0] : startTimeStr;
  if (durationHours === 0) {
    return `${cleanStart} (Immediate Check-in)`;
  }
  const { endTimeStr, isNextDay } = calculateEndTime(cleanStart, durationHours);
  const nextDaySuffix = isNextDay ? ' +1 Day' : '';
  const durLabel = durationHours === 1 ? '1.0 hr' : `${durationHours.toFixed(1)} hrs`;
  return `${cleanStart} - ${endTimeStr}${nextDaySuffix} (${durLabel})`;
}

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Tabs: Upcoming, Completed, Cancelled
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS_LIST);

  // Modals: View Booking & Multi-Step Booking Flow Modal
  const [viewingBooking, setViewingBooking] = useState<BookingItem | null>(null);
  const [showBookingFlowModal, setShowBookingFlowModal] = useState(false);

  // 6-step Booking Flow state:
  // 1: Select Station, 2: Select Connector, 3: Select Date, 4: Select Time, 5: Review, 6: Confirm/Done
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStation, setSelectedStation] = useState<ChargingStation>(INITIAL_STATIONS[0]);
  const [selectedConnector, setSelectedConnector] = useState(INITIAL_STATIONS[0].connector_types[0] || 'CCS2');
  const [selectedDate, setSelectedDate] = useState('Today, 30 Sep 2026');
  const [selectedStartTime, setSelectedStartTime] = useState('18:15');
  const [durationHours, setDurationHours] = useState(2.0); // 0 to 8 Hours (8h = Full Charge)
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [confirmedTxId, setConfirmedTxId] = useState('');
  const [updatedWalletBalance, setUpdatedWalletBalance] = useState(2450);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  // Reactive EVORA Wallet
  const { balance: walletBalance, deductForBooking, refundBooking } = useWallet();

  // Calendar & Slot Filter State
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(8); // 8 = September (0-indexed)
  const [timeFilter, setTimeFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('All');

  // Handle Cancel Action with Wallet Refund
  const handleCancelBooking = async (bookingId: string) => {
    const bk = bookings.find(b => b.bookingId === bookingId);
    if (bk && bk.status !== 'Cancelled') {
      const refundAmt = bk.estimatedCostInr || 0;
      if (refundAmt > 0) {
        await refundBooking({
          bookingId: bk.bookingId,
          stationName: bk.stationName,
          amount: refundAmt
        });
        setCancelFeedback(`Reservation ${bookingId} cancelled. ₹${refundAmt} refunded to your EVORA Wallet.`);
        setTimeout(() => setCancelFeedback(null), 4000);
      }
    }
    setBookings(prev => prev.map(b => {
      if (b.bookingId === bookingId) {
        return { ...b, status: 'Cancelled' };
      }
      return b;
    }));
  };

  // Computed values based on duration and station
  const calculatedEstimatedCost = Math.round(
    durationHours === 0 
      ? 90 
      : 90 + durationHours * (selectedStation.power_kw >= 100 ? 110 : (selectedStation.power_kw >= 50 ? 75 : 45))
  );

  // Start new booking flow
  const handleOpenBookingFlow = () => {
    setCurrentStep(1);
    setSelectedStation(INITIAL_STATIONS[0]);
    setSelectedConnector(INITIAL_STATIONS[0].connector_types[0] || 'CCS2');
    setSelectedDate('Today, 30 Sep 2026');
    setSelectedStartTime('18:15');
    setDurationHours(2.0);
    setCalendarYear(2026);
    setCalendarMonth(8);
    setTimeFilter('All');
    setConfirmedBookingId('');
    setShowBookingFlowModal(true);
  };

  // Calendar Navigation & Helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => null);

  const handlePrevMonth = () => {
    if (calendarYear === 2026 && calendarMonth <= 8) return;
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const handleSelectCalendarDay = (day: number) => {
    const isToday = calendarYear === 2026 && calendarMonth === 8 && day === 30;
    const isTomorrow = calendarYear === 2026 && calendarMonth === 9 && day === 1;
    const dateObj = new Date(calendarYear, calendarMonth, day);
    const dayOfWeek = DAY_NAMES_FULL[dateObj.getDay()];
    const monthShort = MONTH_NAMES[calendarMonth].slice(0, 3);
    const formattedDay = day < 10 ? `0${day}` : `${day}`;

    if (isToday) {
      setSelectedDate('Today, 30 Sep 2026');
    } else if (isTomorrow) {
      setSelectedDate('Tomorrow, 01 Oct 2026');
    } else {
      setSelectedDate(`${dayOfWeek}, ${formattedDay} ${monthShort} ${calendarYear}`);
    }
  };

  // Confirm new booking in Step 5 -> 6
  const handleConfirmNewBooking = async () => {
    const newId = `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedSlot = formatSlotTiming(selectedStartTime, durationHours);

    const newBooking: BookingItem = {
      bookingId: newId,
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      address: selectedStation.address,
      city: selectedStation.city,
      date: selectedDate,
      timeSlot: formattedSlot,
      connector: selectedConnector,
      estimatedCostInr: calculatedEstimatedCost,
      durationMin: Math.round(durationHours * 60),
      status: 'Upcoming'
    };

    // 1. Deduct wallet amount & record debit transaction in EVORA Wallet ledger
    const walletRes = await deductForBooking({
      bookingId: newId,
      stationName: selectedStation.name,
      connector: selectedConnector,
      timeSlot: formattedSlot,
      amount: calculatedEstimatedCost
    });

    setConfirmedBookingId(newId);
    setConfirmedTxId(walletRes.transaction.id);
    setUpdatedWalletBalance(walletRes.newBalance);

    // 2. Persist to active bookings state and storage
    setBookings([newBooking, ...bookings]);
    try {
      localStorage.setItem('evora_active_booking', JSON.stringify(newBooking));
      localStorage.setItem('evora_bookings_list', JSON.stringify([newBooking, ...bookings]));
    } catch {
      // ignore
    }

    // 3. Post to backend SQLite store
    try {
      fetch('http://localhost:8000/api/chargers/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: selectedStation.id,
          station_name: selectedStation.name,
          connector_type: selectedConnector,
          date: selectedDate,
          time_slot: formattedSlot,
          estimated_duration_min: Math.round(durationHours * 60),
          vehicle_model: 'Tata Nexon EV Max',
          estimated_cost_inr: calculatedEstimatedCost
        })
      }).catch(() => {});
    } catch {
      // Local persistence intact
    }

    setCurrentStep(6); // Step 6: Confirmation screen
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="book_slot" />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Bookings
            </h1>
            <Badge variant="emerald">
              Demo Booking System
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage reserved slots, schedule upcoming fast-charging sessions, and review past visits
          </p>
        </div>

        <button
          onClick={handleOpenBookingFlow}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book a Slot (Demo)</span>
        </button>
      </div>

      {/* Tabs: Upcoming, Completed, Cancelled */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => {
          const count = bookings.filter(b => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-[#131B2B] text-slate-400 hover:text-white border border-[#243046]'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-[#131B2B] rounded-3xl border border-slate-800 space-y-4">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No {activeTab} Bookings</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not have any {activeTab.toLowerCase()} charging reservations. Use the demo booking flow to reserve a stall in Pune.
          </p>
          {activeTab !== 'Upcoming' ? (
            <button
              onClick={() => setActiveTab('Upcoming')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Back to Upcoming
            </button>
          ) : (
            <button
              onClick={handleOpenBookingFlow}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
            >
              Reserve First Slot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.bookingId}
              className="bg-[#131B2B] border border-[#243046] hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-sm relative transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{b.bookingId}</span>
                    <Badge variant={b.status === 'Upcoming' ? 'emerald' : b.status === 'Completed' ? 'blue' : 'slate'}>
                      {b.status}
                    </Badge>
                  </div>
                  <h4 className="font-extrabold text-base text-white mt-1 leading-snug">
                    {b.stationName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{b.address}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-emerald-400 block">
                    ₹{b.estimatedCostInr.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Demo Cost</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                  <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Date & Time
                  </span>
                  <span className="font-bold text-white mt-1 block">{b.date}</span>
                  <span className="text-[10px] text-emerald-400">{b.timeSlot}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                  <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Connector Port
                  </span>
                  <span className="font-bold text-white mt-1 block truncate">{b.connector}</span>
                  <span className="text-[10px] text-slate-500">{b.durationMin} mins slot</span>
                </div>
              </div>

              {/* 3 Buttons: View, Cancel, Navigate */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingBooking(b)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('evora_active_booking', JSON.stringify(b));
                      } catch {
                        // ignore
                      }
                      navigate('/charging');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Monitor Live</span>
                  </button>

                  <button
                    onClick={() => navigate('/route')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Navigate</span>
                  </button>
                </div>

                {b.status === 'Upcoming' && (
                  <button
                    onClick={() => handleCancelBooking(b.bookingId)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================
          6-STEP DEMO BOOKING FLOW MODAL
      ================================================== */}
      {showBookingFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  <span>Reserve a Charging Stall (Demo Flow)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Step {currentStep} of 6 {currentStep === 6 ? '• Completed' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowBookingFlowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>

            {/* STEP 1: Select Station */}
            {currentStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Step 1: Select Station</h4>
                  <p className="text-slate-400">Choose a verified charging station from the Indian catalog in Pune</p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {INITIAL_STATIONS.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStation(st);
                        setSelectedConnector(st.connector_types[0] || 'CCS2');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedStation.id === st.id
                          ? 'bg-[#152338] border-emerald-500 shadow-md'
                          : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{st.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{st.power_kw} kW</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{st.address}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5"
                  >
                    <span>Next: Select Connector</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Connector */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Step 2: Select Connector</h4>
                  <p className="text-slate-400">Compatible ports available at {selectedStation.name}</p>
                </div>

                <div className="space-y-2">
                  {selectedStation.connector_types.map((c) => (
                    <div
                      key={c}
                      onClick={() => setSelectedConnector(c)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedConnector === c
                          ? 'bg-[#152338] border-emerald-500 shadow-md'
                          : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="font-bold text-white text-sm block">{c}</span>
                          <span className="text-[10px] text-slate-400">Fast charging protocol</span>
                        </div>
                      </div>
                      {selectedConnector === c && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5"
                  >
                    <span>Next: Select Date</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Date - Interactive Visual Calendar */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-400" />
                      <span>Step 3: Select Reservation Date</span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">Interactive calendar view for slot availability</p>
                  </div>
                  <Badge variant="emerald">
                    {selectedStation.city}
                  </Badge>
                </div>

                {/* Quick Presets row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap mr-1">
                    Quick:
                  </span>
                  {[
                    { label: 'Today (30 Sep)', y: 2026, m: 8, d: 30, val: 'Today, 30 Sep 2026' },
                    { label: 'Tomorrow (01 Oct)', y: 2026, m: 9, d: 1, val: 'Tomorrow, 01 Oct 2026' },
                    { label: '02 Oct (Fri)', y: 2026, m: 9, d: 2, val: 'Fri, 02 Oct 2026' },
                    { label: '03 Oct (Sat)', y: 2026, m: 9, d: 3, val: 'Sat, 03 Oct 2026' },
                    { label: '04 Oct (Sun)', y: 2026, m: 9, d: 4, val: 'Sun, 04 Oct 2026' }
                  ].map((preset) => {
                    const isActive = selectedDate === preset.val;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setCalendarYear(preset.y);
                          setCalendarMonth(preset.m);
                          setSelectedDate(preset.val);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Month & Grid Container */}
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                  {/* Month Header Navigation */}
                  <div className="flex items-center justify-between px-1">
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                      {calendarYear === 2026 && calendarMonth === 8 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Current Month
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={calendarYear === 2026 && calendarMonth <= 8}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center transition-colors"
                        title="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        title="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DAY_NAMES_SHORT.map((wd) => (
                      <span key={wd} className="text-[11px] font-bold text-slate-400 uppercase py-1">
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* Day Cells Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {paddingArray.map((_, idx) => (
                      <div key={`pad-${idx}`} className="h-9 w-full" />
                    ))}
                    {daysArray.map((day) => {
                      const isPast =
                        calendarYear < 2026 ||
                        (calendarYear === 2026 && calendarMonth < 8) ||
                        (calendarYear === 2026 && calendarMonth === 8 && day < 30);
                      const isToday = calendarYear === 2026 && calendarMonth === 8 && day === 30;
                      const isTomorrow = calendarYear === 2026 && calendarMonth === 9 && day === 1;

                      const dateObj = new Date(calendarYear, calendarMonth, day);
                      const dayOfWeek = DAY_NAMES_FULL[dateObj.getDay()];
                      const monthShort = MONTH_NAMES[calendarMonth].slice(0, 3);
                      const dayStr = day < 10 ? `0${day}` : `${day}`;
                      const currentVal = isToday
                        ? 'Today, 30 Sep 2026'
                        : isTomorrow
                          ? 'Tomorrow, 01 Oct 2026'
                          : `${dayOfWeek}, ${dayStr} ${monthShort} ${calendarYear}`;

                      const isSelected = selectedDate === currentVal;

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleSelectCalendarDay(day)}
                          className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                            isPast
                              ? 'text-slate-600 opacity-25 cursor-not-allowed bg-transparent'
                              : isSelected
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-105 z-10'
                                : isToday
                                  ? 'text-emerald-400 ring-1 ring-emerald-500/80 bg-emerald-500/10 hover:bg-emerald-500/20'
                                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{day}</span>
                          {isToday && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Date Confirmation Banner */}
                <div className="p-3 rounded-2xl bg-[#0F172A] border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Selected Date
                      </span>
                      <span className="font-extrabold text-white text-xs">{selectedDate}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Stalls Open</span>
                  </span>
                </div>

                {/* Step Nav Buttons */}
                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <span>Next: Select Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Select Time Slot & Duration */}
            {currentStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Step 4: Select Charging Duration & Time</span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Slide to select duration (0–8 hrs). Timing updates automatically for {selectedDate}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    {ALL_TIME_SLOTS.length} Available Slots
                  </span>
                </div>

                {/* 1. Charging Duration Selector Slider (0 - 8 Hours) */}
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-xs block">
                          Charging Duration: {durationHours.toFixed(1)} Hours
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {durationHours === 0
                            ? 'Instant Check-in Only'
                            : `${Math.round(durationHours * 60)} minutes session`}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {durationHours === 8 ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/40">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Full 100% Charge (~8 hrs)</span>
                      </span>
                    ) : durationHours >= 6 ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                        Deep Charge (80–100%)
                      </span>
                    ) : durationHours >= 3 ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-[10px]">
                        Standard Session
                      </span>
                    ) : durationHours > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[10px]">
                        Quick Top-Up
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-[10px]">
                        Instant Check-in Only
                      </span>
                    )}
                  </div>

                  {/* Range Slider 0 to 8 */}
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.5}
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                      <span>0h (Check-in)</span>
                      <span>2h</span>
                      <span>4h (Half)</span>
                      <span>6h</span>
                      <span className="text-emerald-400 font-bold">8h (Full Charge ⚡)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-0.5 scrollbar-none">
                    <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
                      Presets:
                    </span>
                    {[
                      { label: '1.0 hr (Quick)', val: 1.0 },
                      { label: '2.0 hrs (Standard)', val: 2.0 },
                      { label: '4.0 hrs (Half Pack)', val: 4.0 },
                      { label: '8.0 hrs (Full 100% ⚡)', val: 8.0 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setDurationHours(preset.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                          durationHours === preset.val
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Guidance Note */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-300">
                    <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-emerald-400">EV Benchmark:</strong> Standard AC charging ideally takes <strong className="text-white">~8.0 hours</strong> for a full 100% battery charge (40.5 kWh Nexon EV). Start and end timings below update automatically according to your selected duration.
                    </p>
                  </div>
                </div>

                {/* 2. Start Time Slots Filter & Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Select Start Time:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Calculated End Time with +{durationHours.toFixed(1)}h
                    </span>
                  </div>

                  {/* Time Period Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((period) => {
                      const isSelected = timeFilter === period;
                      const count = period === 'All'
                        ? ALL_TIME_SLOTS.length
                        : ALL_TIME_SLOTS.filter(s => s.period === period).length;

                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setTimeFilter(period)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <span>{period}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {ALL_TIME_SLOTS
                      .filter(slot => timeFilter === 'All' || slot.period === timeFilter)
                      .map((slot) => {
                        const isSelected = selectedStartTime === slot.startTime;
                        const timingInfo = calculateEndTime(slot.startTime, durationHours);
                        const displayRange = durationHours === 0
                          ? `${slot.startTime} (Immediate)`
                          : `${slot.startTime} – ${timingInfo.endTimeStr}${timingInfo.isNextDay ? ' (+1D)' : ''}`;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedStartTime(slot.startTime)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-[#152338] border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-[#162338]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-emerald-400 font-black' : 'text-white'}`}>
                                  {displayRange}
                                </span>
                              </div>
                              {isSelected ? (
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">{slot.bay}</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className={`font-semibold flex items-center gap-1 ${
                                durationHours === 8
                                  ? 'text-emerald-400'
                                  : slot.isOffPeak
                                    ? 'text-emerald-400'
                                    : slot.isSolar
                                      ? 'text-amber-400'
                                      : slot.isPeak
                                        ? 'text-orange-400'
                                        : 'text-slate-400'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{durationHours === 8 ? 'Full 100% Charge ⚡' : slot.tag}</span>
                              </span>
                              <span className="text-slate-400 font-medium">
                                {durationHours === 0 ? 'Instant' : `${durationHours.toFixed(1)} hrs`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Slot Confirmation Bar */}
                <div className="p-3 rounded-2xl bg-[#0F172A] border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Calculated Session Timing
                      </span>
                      <span className="font-extrabold text-white text-xs">
                        {formatSlotTiming(selectedStartTime, durationHours)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-xs block">
                      ₹{calculatedEstimatedCost}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{Math.min(40.5, Math.round(durationHours * 5.1 + 4.5))} kWh
                    </span>
                  </div>
                </div>

                {/* Step Nav Buttons */}
                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <span>Next: Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Step 5: Review Reservation</h4>
                  <p className="text-slate-400">Please confirm your reservation details before locking the demo stall</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Station</span>
                    <span className="font-bold text-white text-right">{selectedStation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connector</span>
                    <span className="font-bold text-emerald-400">{selectedConnector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="font-bold text-white">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Charging Duration</span>
                    <span className="font-bold text-emerald-400">
                      {durationHours.toFixed(1)} Hours {durationHours === 8 ? '(Full 100% Charge)' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session Window</span>
                    <span className="font-bold text-white">
                      {formatSlotTiming(selectedStartTime, durationHours)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Energy Delivered</span>
                    <span className="font-bold text-slate-200">
                      ~{Math.min(40.5, Math.round(durationHours * 5.1 + 4.5))} kWh (40.5 kWh Pack)
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-200">Estimated Cost (Demo Tariff)</span>
                    <span className="font-black text-emerald-400 text-sm">
                      ₹{calculatedEstimatedCost}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                  * This is a DEMO booking system. No real payments or credit cards are charged.
                </div>

                <div className="pt-3 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmNewBooking}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <span>Confirm Booking</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Confirmation Outcome */}
            {currentStep === 6 && (
              <div className="text-center py-4 space-y-5 text-xs">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">Booking Confirmed!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Your demo charging bay has been scheduled successfully.
                  </p>
                </div>

                {/* Confirmed Ticket Card */}
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking ID</span>
                    <span className="font-mono font-bold text-emerald-400">{confirmedBookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Station</span>
                    <span className="font-bold text-white text-right">{selectedStation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="font-bold text-white">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session Window</span>
                    <span className="font-bold text-white">{formatSlotTiming(selectedStartTime, durationHours)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-bold text-emerald-400">
                      {durationHours.toFixed(1)} Hours {durationHours === 8 ? '(Full Charge)' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-200">Estimated Cost</span>
                    <span className="font-black text-emerald-400 text-sm">
                      ₹{calculatedEstimatedCost}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => {
                      setShowBookingFlowModal(false);
                      setActiveTab('Upcoming');
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    View in Upcoming
                  </button>
                  <button
                    onClick={() => {
                      setShowBookingFlowModal(false);
                      navigate('/charging');
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Monitor Live Charging</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW BOOKING DETAILS MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Booking Details</h3>
                <span className="text-xs font-mono text-emerald-400">{viewingBooking.bookingId}</span>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Station</span>
                <h4 className="font-bold text-white">{viewingBooking.stationName}</h4>
                <p className="text-[11px] text-slate-400">{viewingBooking.address}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Slot</span>
                  <span className="font-bold text-white">{viewingBooking.date}, {viewingBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connector Port</span>
                  <span className="font-bold text-emerald-400">{viewingBooking.connector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservation Status</span>
                  <span className="font-bold text-white">{viewingBooking.status}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Estimated Cost</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{viewingBooking.estimatedCostInr}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  onClick={() => {
                    setViewingBooking(null);
                    navigate('/route');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Navigate Route</span>
                </button>
                <button
                  onClick={() => setViewingBooking(null)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
