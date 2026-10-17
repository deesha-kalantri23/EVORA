import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  Zap,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Power,
  RotateCcw,
  CalendarCheck,
  Star,
  ExternalLink,
  Layers
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import { AdminStation, StationStatus, ChargerStatus } from '../../types/admin';
import { StationModal } from '../../components/admin/StationModal';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatINR } from '../../utils/cn';

interface ContextType {
  selectedStationId: string;
  onStationChange: (id: string) => void;
}

export const AdminStationsPage: React.FC = () => {
  const { adminEmail } = useAdminAuth();
  const [stations, setStations] = useState<AdminStation[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<AdminStation | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [stationToToggle, setStationToToggle] = useState<AdminStation | null>(null);
  const [selectedStationDetail, setSelectedStationDetail] = useState<AdminStation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminDataService.getStations({
        search,
        city: cityFilter,
        operator: operatorFilter,
        status: statusFilter
      });
      setStations(data);
    } catch (err) {
      console.error('Failed to fetch stations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, cityFilter, operatorFilter, statusFilter]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleToggleStationStatus = (st: AdminStation) => {
    setStationToToggle(st);
    setConfirmModalOpen(true);
  };

  const confirmStatusToggle = async () => {
    if (!stationToToggle) return;
    const nextStatus: StationStatus = stationToToggle.status === 'Active' ? 'Inactive' : 'Active';
    const res = await adminDataService.toggleStationStatus(
      stationToToggle.id,
      nextStatus,
      adminEmail || 'admin@evora.in'
    );
    setConfirmModalOpen(false);
    if (res.success) {
      setNotification(`Station ${stationToToggle.name} marked as ${nextStatus}.`);
      fetchStations();
    }
    setStationToToggle(null);
  };

  const handleToggleCharger = async (stationId: string, chargerId: string, currentStatus: ChargerStatus) => {
    const nextStatus: ChargerStatus = currentStatus === 'Available' ? 'Out of Service' : 'Available';
    const res = await adminDataService.toggleChargerService(
      stationId,
      chargerId,
      nextStatus,
      adminEmail || 'admin@evora.in'
    );
    if (res.success) {
      setNotification(`Charger ${chargerId} status updated to ${nextStatus}.`);
      fetchStations();
      if (selectedStationDetail?.id === stationId) {
        const updated = await adminDataService.getStationById(stationId);
        setSelectedStationDetail(updated);
      }
    }
  };

  const handleSaveStation = async (data: Partial<AdminStation>) => {
    if (editingStation) {
      const res = await adminDataService.updateStation(
        editingStation.id,
        data,
        adminEmail || 'admin@evora.in'
      );
      if (res.success) {
        setNotification(`Station ${editingStation.name} updated successfully.`);
        fetchStations();
      }
    } else {
      const res = await adminDataService.createStation(
        data as Omit<AdminStation, 'id'>,
        adminEmail || 'admin@evora.in'
      );
      if (res.success) {
        setNotification(`New charging station created successfully.`);
        fetchStations();
      }
    }
    setStationModalOpen(false);
    setEditingStation(null);
  };

  // Distinct cities and operators for dropdowns
  const cities = Array.from(new Set(stations.map(s => s.city)));
  const operators = Array.from(new Set(stations.map(s => s.operator)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations by name, city, operator, or address…"
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => {
            setEditingStation(null);
            setStationModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Charging Station</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#111827] border border-[#1E293B] text-xs">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            City Filter
          </label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Charge Point Operator (CPO)
          </label>
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none"
          >
            <option value="all">All Operators</option>
            {operators.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Operational Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-[#1E293B] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Loading charging stations…</p>
          </div>
        ) : stations.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-[#111827] rounded-2xl border border-slate-800">
            <p className="font-semibold text-slate-300">No charging stations match your filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the city or operator filter.</p>
          </div>
        ) : (
          stations.map((st) => (
            <div
              key={st.id}
              className={`p-5 rounded-2xl bg-[#111827] border transition-all flex flex-col justify-between ${
                st.status === 'Active'
                  ? 'border-[#1E293B] hover:border-emerald-500/40'
                  : 'border-red-500/30 bg-red-950/10'
              }`}
            >
              <div>
                {/* Card Top: Operator & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {st.operator}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      st.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : st.status === 'Maintenance'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>

                {/* Station Name & City */}
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{st.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{st.address}</span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Power</span>
                    <span className="font-bold text-emerald-400">{st.power_kw} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ports Avail</span>
                    <span className="font-bold text-white">
                      {st.ports_available} / {st.ports_total}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tariff</span>
                    <span className="font-bold text-white">₹{st.tariff_inr_per_kwh}/u</span>
                  </div>
                </div>

                {/* Connectors Supported */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {st.connector_types.map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedStationDetail(st)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>View Chargers & Bookings</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingStation(st);
                      setStationModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit station details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStationStatus(st)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      st.status === 'Active'
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                    title={st.status === 'Active' ? 'Deactivate station' : 'Activate station'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Station Details & Chargers Drawer */}
      {selectedStationDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-[#0F172A] border-l border-[#1E293B] h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
              <div>
                <h2 className="text-base font-bold text-white">{selectedStationDetail.name}</h2>
                <p className="text-xs text-slate-400">{selectedStationDetail.city} • {selectedStationDetail.operator}</p>
              </div>
              <button
                onClick={() => setSelectedStationDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* Chargers List */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Associated Station Chargers ({selectedStationDetail.chargers?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedStationDetail.chargers?.map(ch => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ch.bay_number}</span>
                          <span className="font-mono text-[10px] text-slate-400">({ch.connector_type})</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Rating: {ch.max_power_kw} kW</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            ch.status === 'Available'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : ch.status === 'Occupied' || ch.status === 'Charging'
                              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {ch.status}
                        </span>

                        <button
                          onClick={() => handleToggleCharger(selectedStationDetail.id, ch.id, ch.status)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                        >
                          {ch.status === 'Available' ? 'Mark Out of Service' : 'Restore Service'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Station Info Breakdown */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2.5">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Location & Operating Hours
                </h3>
                <p className="text-slate-300">{selectedStationDetail.address}</p>
                <p className="text-slate-400 text-[11px]">Hours: {selectedStationDetail.operating_hours || '24/7'}</p>
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                  {selectedStationDetail.amenities?.map(am => (
                    <span key={am} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Link to view station's bookings */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Filter Bookings for this Station</h4>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">Jump to All Bookings table scoped to this station.</p>
                </div>
                <Link
                  to={`/admin/bookings`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  View Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Station Modal */}
      <StationModal
        isOpen={stationModalOpen}
        station={editingStation}
        onClose={() => {
          setStationModalOpen(false);
          setEditingStation(null);
        }}
        onSave={handleSaveStation}
      />

      {/* Confirmation Modal for Active/Inactive toggle */}
      <AdminConfirmModal
        isOpen={confirmModalOpen}
        title={stationToToggle?.status === 'Active' ? 'Deactivate Charging Station' : 'Activate Charging Station'}
        message={`Are you sure you want to change the status of ${stationToToggle?.name}? Note: Historical bookings remain preserved.`}
        confirmLabel={stationToToggle?.status === 'Active' ? 'Deactivate Station' : 'Activate Station'}
        isDestructive={stationToToggle?.status === 'Active'}
        onConfirm={confirmStatusToggle}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};
