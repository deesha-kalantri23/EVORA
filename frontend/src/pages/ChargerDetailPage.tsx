import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Navigation,
  Share2,
  ShieldCheck,
  Star,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { ChargingStation } from '../types';
import { evoraApi } from '../services/api';
import { INITIAL_STATIONS, INITIAL_VEHICLES } from '../data/mockData';
import { IndiaMapLeaflet } from '../components/IndiaMapLeaflet';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { Calculator } from 'lucide-react';

export const ChargerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [station, setStation] = useState<ChargingStation | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('18:00 - 18:45');
  const [selectedConnector, setSelectedConnector] = useState('');
  const [durationMin, setDurationMin] = useState(45);

  useEffect(() => {
    async function loadStation() {
      if (!id) return;
      const data = await evoraApi.getStationById(id);
      if (data) {
        setStation(data);
        if (data.connector_types.length > 0) {
          setSelectedConnector(data.connector_types[0]);
        }
      }
    }
    loadStation();
  }, [id]);

  if (!station) {
    return (
      <div className="p-12 text-center bg-[#131B2B] rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Loading Station Details...</h3>
        <p className="text-xs text-slate-400">Fetching verified station record from Indian dataset.</p>
        <button
          onClick={() => navigate('/chargers')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
        >
          Back to Chargers
        </button>
      </div>
    );
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await evoraApi.createBooking({
      station_id: station.id,
      station_name: station.name,
      connector_type: selectedConnector,
      date: 'Today',
      time_slot: selectedSlot,
      estimated_duration_min: durationMin,
      vehicle_model: INITIAL_VEHICLES[0].model,
      estimated_cost_inr: Math.round(durationMin * 8.5)
    });
    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="view_station" stationId={station.id} />

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/chargers')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Charging Stations</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="emerald">{station.data_source_label}</Badge>
          <Badge variant="slate">{station.status_label}</Badge>
        </div>
      </div>

      {/* Main Details Banner */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {station.operator}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {station.usage_type} • {station.city}, {station.state}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{station.rating} ({station.reviews_count} reviews)</span>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {station.name}
            </h2>

            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{station.address}</span>
            </p>
          </div>

          {/* Quick Action / Reserve */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/charging-cost')}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Estimate Cost</span>
            </button>

            <button
              onClick={() => navigate('/route')}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Plan Route</span>
            </button>

            <button
              onClick={() => {
                setBookingSuccess(false);
                setShowBookingModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot (Demo Flow)</span>
            </button>
          </div>
        </div>

        {/* Technical Specs 4-Card Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-xs text-slate-400 block">Peak Charging Power</span>
            <span className="text-2xl font-black text-white mt-1 block flex items-center gap-1">
              <Zap className="w-5 h-5 text-emerald-400" />
              {station.power_kw} <span className="text-xs font-normal text-slate-400">kW</span>
            </span>
            <span className="text-[10px] text-emerald-400">Ultra-fast DC Charging</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-xs text-slate-400 block">Pricing Tariff</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₹{station.tariff_inr_per_kwh} <span className="text-xs font-normal text-slate-400">/ kWh</span>
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">Demo Tariff (Not live tariff)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-xs text-slate-400 block">Live Availability</span>
            <span className="text-sm font-bold text-slate-300 mt-2 block">
              Demo Simulation
            </span>
            <span className="text-[10px] text-slate-400 leading-tight block mt-1">
              Availability data is not provided by the dataset.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
            <span className="text-xs text-slate-400 block">Coordinates (Dataset)</span>
            <span className="text-xs font-mono font-bold text-slate-200 mt-2 block">
              {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
            </span>
            <span className="text-[10px] text-emerald-400">GPS Verified Point</span>
          </div>
        </div>

        {/* Connectors & Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">Supported Connectors</h4>
            <div className="grid grid-cols-2 gap-3">
              {station.connector_types.map((c) => (
                <div key={c} className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{c}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">Station Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {station.amenities?.map((a) => (
                <span key={a} className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-xs font-semibold text-slate-300 border border-slate-800">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mini Leaflet Pinpoint */}
        <div className="pt-2">
          <h4 className="font-bold text-sm text-white mb-3">Location on OpenStreetMap</h4>
          <IndiaMapLeaflet
            stations={[station]}
            center={[station.latitude, station.longitude]}
            zoom={14}
            height="260px"
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Demo Charging Slot Reservation</span>
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-white">Demo Slot Reserved!</h4>
                <p className="text-xs text-slate-300">
                  Your reservation at <strong>{station.name}</strong> for slot <strong>{selectedSlot}</strong> is confirmed.
                </p>
                <div className="p-3 rounded-xl bg-[#0F172A] text-[11px] text-slate-400">
                  Demo booking saved to your account. No payment was charged.
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    navigate('/bookings');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  View in My Bookings
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Connector</label>
                  <select
                    value={selectedConnector}
                    onChange={(e) => setSelectedConnector(e.target.value)}
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046]"
                  >
                    {station.connector_types.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Time Slot (Today)</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046]"
                  >
                    <optgroup label="Morning (06:00 - 12:00)">
                      <option value="06:00 - 06:45">06:00 - 06:45 (Off-Peak Tariff)</option>
                      <option value="07:15 - 08:00">07:15 - 08:00 (Off-Peak Tariff)</option>
                      <option value="08:30 - 09:15">08:30 - 09:15 (Fast Turnaround)</option>
                      <option value="09:45 - 10:30">09:45 - 10:30</option>
                      <option value="11:00 - 11:45">11:00 - 11:45</option>
                    </optgroup>
                    <optgroup label="Afternoon (12:00 - 17:00)">
                      <option value="12:15 - 13:00">12:15 - 13:00 (Lunch Charging)</option>
                      <option value="13:30 - 14:15">13:30 - 14:15 (Solar Green ☀️)</option>
                      <option value="14:45 - 15:30">14:45 - 15:30 (Solar Green ☀️)</option>
                      <option value="16:00 - 16:45">16:00 - 16:45</option>
                    </optgroup>
                    <optgroup label="Evening (17:00 - 21:00)">
                      <option value="17:15 - 18:00">17:15 - 18:00 (High Demand)</option>
                      <option value="18:15 - 19:00">18:15 - 19:00 (Immediate Bay 1)</option>
                      <option value="19:15 - 20:00">19:15 - 20:00 (Popular)</option>
                      <option value="20:15 - 21:00">20:15 - 21:00</option>
                    </optgroup>
                    <optgroup label="Night (21:00 - 00:00)">
                      <option value="21:15 - 22:00">21:15 - 22:00 (Off-Peak Tariff)</option>
                      <option value="22:15 - 23:00">22:15 - 23:00 (Off-Peak Tariff)</option>
                      <option value="23:15 - 00:00">23:15 - 00:00 (Night Owl Mode)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Duration</span>
                    <span className="font-semibold text-slate-200">{durationMin} min</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Cost (Demo Tariff)</span>
                    <span className="font-bold text-emerald-400">₹{Math.round(durationMin * 8.5)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  >
                    Confirm Booking
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
