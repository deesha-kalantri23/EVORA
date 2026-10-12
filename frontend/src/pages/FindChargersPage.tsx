import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { IndiaMapLeaflet } from '../components/IndiaMapLeaflet';
import { Badge } from '../components/Badge';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { ChargingStation } from '../types';
import { evoraApi } from '../services/api';
import { INITIAL_STATIONS } from '../data/mockData';

export const FindChargersPage: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [cityFilter, setCityFilter] = useState('Pune');
  const [operatorFilter, setOperatorFilter] = useState('All');
  const [connectorFilter, setConnectorFilter] = useState('All');
  const [minPower, setMinPower] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [filterOptions, setFilterOptions] = useState<{
    cities: string[];
    operators: string[];
    connectors: string[];
    power_ratings_kw: number[];
  }>({
    cities: ["Pune", "Mumbai", "Bengaluru", "Delhi NCR"],
    operators: ["Tata Power", "Jio-bp pulse", "Statiq", "Zeon Charging", "Ather Grid", "ChargeZone"],
    connectors: ["CCS2", "Type 2 AC", "Bharat DC-001", "CHAdeMO"],
    power_ratings_kw: [0, 22, 50, 60, 120]
  });

  useEffect(() => {
    evoraApi.getStationFilters().then(res => {
      if (res && res.cities) {
        setFilterOptions({
          cities: res.cities,
          operators: res.operators,
          connectors: res.connectors,
          power_ratings_kw: [0, ...(res.power_ratings_kw || [22, 50, 60, 120])]
        });
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      const data = await evoraApi.getStations({
        city: cityFilter === 'All' ? undefined : cityFilter,
        operator: operatorFilter === 'All' ? undefined : operatorFilter,
        connector_type: connectorFilter === 'All' ? undefined : connectorFilter,
        min_power: minPower > 0 ? minPower : undefined,
        search: searchTerm || undefined
      });
      setStations(Array.isArray(data) ? data : []);
    }
    fetchFiltered();
  }, [cityFilter, operatorFilter, connectorFilter, minPower, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="find_charger" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Indian EV Charging Network</h2>
            <Badge variant="emerald">Dataset: India 2025</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover verified public and highway chargers. Default location: <strong>Pune, Maharashtra</strong>
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#131B2B] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'both' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Map Only
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            List Only
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search station name, area or highway..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* City */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Cities</option>
              {filterOptions.cities.map(c => (
                <option key={c} value={c}>City: {c}</option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Operators</option>
              {filterOptions.operators.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Connector */}
          <div>
            <select
              value={connectorFilter}
              onChange={(e) => setConnectorFilter(e.target.value)}
              className="w-full bg-[#0B0F17] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Connectors</option>
              {filterOptions.connectors.map(conn => (
                <option key={conn} value={conn}>{conn}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Power Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Min Power:
          </span>
          {filterOptions.power_ratings_kw.map((kw) => (
            <button
              key={kw}
              onClick={() => setMinPower(kw)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                minPower === kw
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-[#243046]'
              }`}
            >
              {kw === 0 ? 'Any Power' : `≥ ${kw} kW`}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400">
            Showing <strong className="text-white">{stations.length}</strong> stations
          </span>
        </div>
      </div>

      {/* Main Container: Map and/or List */}
      <div className={`grid gap-6 ${
        viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
      }`}>
        {/* Leaflet Map */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className={`${viewMode === 'both' ? 'lg:col-span-7' : 'w-full'} min-h-[480px]`}>
            <IndiaMapLeaflet stations={stations} height="520px" />
          </div>
        )}

        {/* Stations List Cards */}
        {(viewMode === 'both' || viewMode === 'list') && (
          <div className={`${
            viewMode === 'both' ? 'lg:col-span-5 h-[520px]' : 'w-full'
          } overflow-y-auto space-y-3.5 pr-1`}>
            {stations.length === 0 ? (
              <div className="p-8 text-center bg-[#131B2B] rounded-3xl border border-slate-800 text-slate-400">
                No charging stations matched your filter criteria. Try selecting &quot;All Operators&quot; or resetting min power.
              </div>
            ) : (
              stations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => navigate(`/chargers/${st.id}`)}
                  className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] hover:border-emerald-500/50 cursor-pointer transition-all space-y-3 group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {st.operator}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{st.city}, {st.state}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors mt-1">
                        {st.name}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-extrabold text-white flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        {st.power_kw} kW
                      </span>
                      <span className="text-[10px] text-slate-400">₹{st.tariff_inr_per_kwh}/kWh (Demo)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{st.address}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {st.connector_types.map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-[#0F172A] text-slate-300 border border-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{st.ports_available_demo}/{st.ports_total} Available (Demo)</span>
                    </span>

                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
