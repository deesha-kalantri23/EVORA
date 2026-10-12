import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChargingStation } from '../types';
import { Zap, Navigation, Clock, Layers, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IndiaMapProps {
  stations: ChargingStation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onSelectStation?: (station: ChargingStation) => void;
  routeCoordinates?: [number, number][];
  startPoint?: { name: string; position: [number, number] };
  destinationPoint?: { name: string; position: [number, number] };
}

// Helper to auto-recenter and fit bounds when corridor coordinates change
const MapBoundsUpdater: React.FC<{
  center: [number, number];
  zoom: number;
  routeCoordinates?: [number, number][];
}> = ({ center, zoom, routeCoordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch (err) {
        console.error('Failed to fit bounds:', err);
      }
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, routeCoordinates, map]);
  return null;
};


export type MapLayerType = 'google_roadmap' | 'google_satellite' | 'google_terrain';

const MAP_TILES: Record<MapLayerType, { name: string; url: string; subdomains: string[] }> = {
  google_roadmap: {
    name: 'Google Roadmap',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  },
  google_satellite: {
    name: 'Google Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  },
  google_terrain: {
    name: 'Google Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  }
};

// Custom modern SVG marker icon for Leaflet EV chargers
const createCustomMarker = (power: number) => {
  const isFast = power >= 50;
  const color = isFast ? '#00D26A' : '#38BDF8';
  return L.divIcon({
    className: 'custom-ev-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #0F172A;
        border: 2px solid ${color};
        color: ${color};
        border-radius: 9999px;
        width: 34px;
        height: 34px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${color}40;
        cursor: pointer;
        font-weight: 700;
        font-size: 11px;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });
};

const createWaypointMarker = (type: 'start' | 'destination') => {
  const color = type === 'start' ? '#10B981' : '#F43F5E';
  return L.divIcon({
    className: 'custom-waypoint-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${color};
        color: #FFFFFF;
        border: 2px solid #FFFFFF;
        border-radius: 9999px;
        width: 28px;
        height: 28px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        cursor: pointer;
      ">
        <div style="width: 8px; height: 8px; background-color: #FFFFFF; border-radius: 9999px;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -15]
  });
};

export const IndiaMapLeaflet: React.FC<IndiaMapProps> = ({
  stations,
  center = [18.5204, 73.8567], // Default Pune, Maharashtra
  zoom = 12,
  height = "420px",
  onSelectStation,
  routeCoordinates,
  startPoint,
  destinationPoint
}) => {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google_roadmap');

  const currentTileConfig = MAP_TILES[activeLayer];

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-[#243046] shadow-md relative group">
      {/* Map Layer Switcher & Google Maps Indicator */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        <div className="bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl flex items-center gap-1 shadow-lg text-[11px]">
          {(['google_roadmap', 'google_satellite', 'google_terrain'] as MapLayerType[]).map((layerKey) => (
            <button
              key={layerKey}
              onClick={() => setActiveLayer(layerKey)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeLayer === layerKey
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {MAP_TILES[layerKey].name.replace('Google ', '')}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-[10px] text-emerald-400 font-bold shadow-lg">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Maps API</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <MapBoundsUpdater center={center} zoom={zoom} routeCoordinates={routeCoordinates} />
        <TileLayer
          key={activeLayer}
          url={currentTileConfig.url}
          subdomains={currentTileConfig.subdomains}
          maxZoom={20}
        />

        {/* Route Polyline if provided */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#00D26A',
              weight: 5,
              opacity: 0.9,
              dashArray: '8, 8'
            }}
          />
        )}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker position={startPoint.position} icon={createWaypointMarker('start')}>
            <Popup>
              <div className="p-1 text-slate-800 text-xs font-bold">
                Origin: {startPoint.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Point Marker */}
        {destinationPoint && (
          <Marker position={destinationPoint.position} icon={createWaypointMarker('destination')}>
            <Popup>
              <div className="p-1 text-slate-800 text-xs font-bold">
                Destination: {destinationPoint.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Stations Markers */}
        {(stations || []).map((st) => (
          <Marker
            key={st.id}
            position={[st.latitude, st.longitude]}
            icon={createCustomMarker(st.power_kw)}
            eventHandlers={{
              click: () => onSelectStation && onSelectStation(st)
            }}
          >
            <Popup className="evora-leaflet-popup">
              <div className="p-1 min-w-[220px] text-slate-800">
                <div className="flex items-center justify-between gap-2 border-b pb-1 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {st.operator}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {st.power_kw} kW
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">{st.name}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{st.address}</p>

                <div className="mt-2 text-xs flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{st.ports_available_demo}/{st.ports_total} Available (Demo)</span>
                  </span>
                  <span className="font-semibold text-slate-900">₹{st.tariff_inr_per_kwh}/kWh</span>
                </div>

                <div className="mt-3 pt-2 border-t flex gap-2">
                  <button
                    onClick={() => navigate(`/chargers/${st.id}`)}
                    className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center transition-colors"
                  >
                    View Station
                  </button>
                  <button
                    onClick={() => navigate('/route')}
                    className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Navigate Route"
                  >
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-xl text-xs flex items-center gap-3 sm:gap-4 text-slate-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Fast DC (&ge; 50kW)</span>
        </div>
        {routeCoordinates && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-400 rounded-sm" />
            <span>Optimal Corridor</span>
          </div>
        )}
        <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline">
          {startPoint?.name && destinationPoint?.name
            ? `${startPoint.name.split(' ')[0]} ➔ ${destinationPoint.name.split(' ')[0]}`
            : 'Maharashtra EV Corridor'}
        </span>
      </div>
    </div>
  );
};
