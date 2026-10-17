import React, { useState, useEffect } from 'react';
import { X, Zap, Building2, MapPin, IndianRupee, Layers } from 'lucide-react';
import { AdminStation, StationStatus } from '../../types/admin';

interface StationModalProps {
  isOpen: boolean;
  station: AdminStation | null;
  onClose: () => void;
  onSave: (data: Partial<AdminStation>) => void;
  isLoading?: boolean;
}

export const StationModal: React.FC<StationModalProps> = ({
  isOpen,
  station,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    operator: 'Tata Power',
    city: 'Pune',
    state: 'Maharashtra',
    address: '',
    latitude: 18.5204,
    longitude: 73.8567,
    power_kw: 60.0,
    ports_total: 4,
    ports_available: 2,
    tariff_inr_per_kwh: 19.5,
    status: 'Active' as StationStatus,
    operating_hours: '24/7 Always Open',
    amenities: 'Restrooms, Cafeteria, Wi-Fi',
    connector_types: 'CCS2, Type 2 AC'
  });

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name,
        operator: station.operator,
        city: station.city,
        state: station.state,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        power_kw: station.power_kw,
        ports_total: station.ports_total,
        ports_available: station.ports_available,
        tariff_inr_per_kwh: station.tariff_inr_per_kwh,
        status: station.status,
        operating_hours: station.operating_hours || '24/7 Always Open',
        amenities: station.amenities ? station.amenities.join(', ') : '',
        connector_types: station.connector_types ? station.connector_types.join(', ') : 'CCS2, Type 2 AC'
      });
    } else {
      setFormData({
        name: '',
        operator: 'Tata Power',
        city: 'Pune',
        state: 'Maharashtra',
        address: '',
        latitude: 18.5204,
        longitude: 73.8567,
        power_kw: 60.0,
        ports_total: 4,
        ports_available: 2,
        tariff_inr_per_kwh: 19.5,
        status: 'Active',
        operating_hours: '24/7 Always Open',
        amenities: 'Restrooms, Cafeteria, Wi-Fi',
        connector_types: 'CCS2, Type 2 AC'
      });
    }
  }, [station, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      operator: formData.operator,
      city: formData.city,
      state: formData.state,
      address: formData.address,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      power_kw: Number(formData.power_kw),
      ports_total: Number(formData.ports_total),
      ports_available: Number(formData.ports_available),
      tariff_inr_per_kwh: Number(formData.tariff_inr_per_kwh),
      status: formData.status,
      operating_hours: formData.operating_hours,
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      connector_types: formData.connector_types.split(',').map(s => s.trim()).filter(Boolean),
      rating: station?.rating || 4.7,
      reviews_count: station?.reviews_count || 10
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {station ? 'Edit Charging Station' : 'Add New Charging Station'}
              </h2>
              <p className="text-xs text-slate-400">
                {station ? `Updating ${station.id}` : 'Create a new charging facility record'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Station Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Tata Power EZ Charge - Phoenix Marketcity"
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Charge Point Operator (CPO) <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              >
                <option value="Tata Power">Tata Power</option>
                <option value="Jio-bp pulse">Jio-bp pulse</option>
                <option value="Statiq">Statiq</option>
                <option value="Zeon Charging">Zeon Charging</option>
                <option value="Relux Electric">Relux Electric</option>
                <option value="Ather Grid">Ather Grid</option>
                <option value="Magenta ChargeGrid">Magenta ChargeGrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StationStatus })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active (Online for bookings)</option>
                <option value="Inactive">Inactive (Suspended)</option>
                <option value="Maintenance">Maintenance (Temporary offline)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. S No 207, Viman Nagar Road, Pune, Maharashtra 411014"
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Power (kW)</label>
              <input
                type="number"
                required
                value={formData.power_kw}
                onChange={(e) => setFormData({ ...formData, power_kw: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Ports</label>
              <input
                type="number"
                required
                value={formData.ports_total}
                onChange={(e) => setFormData({ ...formData, ports_total: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Available Ports</label>
              <input
                type="number"
                required
                value={formData.ports_available}
                onChange={(e) => setFormData({ ...formData, ports_available: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tariff (₹/kWh)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.tariff_inr_per_kwh}
                onChange={(e) => setFormData({ ...formData, tariff_inr_per_kwh: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Connector Types (comma-separated)
              </label>
              <input
                type="text"
                value={formData.connector_types}
                onChange={(e) => setFormData({ ...formData, connector_types: e.target.value })}
                placeholder="CCS2, Type 2 AC, CHAdeMO"
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Mall Parking, Cafeteria, Restrooms, EV Lounge"
                className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1E293B] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 border-t border-[#1E293B] -mx-5 -mb-5 bg-[#0F172A] flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{station ? 'Save Station Changes' : 'Create Station'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
