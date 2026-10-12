import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  Thermometer,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { evoraApi } from '../services/api';

export const RangeAnxietyPage: React.FC = () => {
  const navigate = useNavigate();

  // Inputs
  const [currentBattery, setCurrentBattery] = useState(78);
  const [tripDistance, setTripDistance] = useState(148); // Pune to Mumbai default
  const [predictedRange, setPredictedRange] = useState(284);
  const [weather, setWeather] = useState('Sunny / Clear (32°C)');
  const [traffic, setTraffic] = useState('Moderate');
  const [drivingStyle, setDrivingStyle] = useState('Normal / Balanced');
  const [vehicleLoad, setVehicleLoad] = useState('Normal (2-3 Persons)');

  // Calculation Results
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(62);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tripFeasibility, setTripFeasibility] = useState('Feasible (Caution advised on highway & ghats)');
  const [remainingRange, setRemainingRange] = useState(136);
  const [safetyMargin, setSafetyMargin] = useState(91.8);
  const [chargingRecommended, setChargingRecommended] = useState(true);

  React.useEffect(() => {
    evoraApi.getTelemetry().then(tel => {
      if (tel) {
        if (tel.soc_percentage) setCurrentBattery(tel.soc_percentage);
        if (tel.estimated_range_km) setPredictedRange(tel.estimated_range_km);
      }
    }).catch(console.error);
  }, []);

  const handlePredictAnxiety = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await evoraApi.predictAnxiety({
        current_battery: currentBattery,
        trip_distance_km: tripDistance,
        predicted_range_km: predictedRange,
        weather,
        traffic,
        driving_style: drivingStyle,
        vehicle_load: vehicleLoad
      });

      if (res) {
        setRiskScore(typeof res.risk_score === 'number' ? res.risk_score : 62);
        const lvl = (res.risk_level === 'Low' || res.risk_level === 'Medium' || res.risk_level === 'High') ? res.risk_level : 'Medium';
        setRiskLevel(lvl);
        setTripFeasibility(res.trip_feasibility || 'Feasible');
        setRemainingRange(typeof res.remaining_range_km === 'number' ? res.remaining_range_km : 136);
        setSafetyMargin(typeof res.safety_margin_percent === 'number' ? res.safety_margin_percent : 91.8);
        setChargingRecommended(Boolean(res.charging_recommended));
      }
    } catch (err) {
      console.error('Error predicting anxiety:', err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
      case 'Medium':
        return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
      case 'High':
      default:
        return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' };
    }
  };

  const riskColors = getRiskColor(riskLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Route Headroom & Range Risk
            </h1>
            <Badge variant="blue" icon={ShieldCheck}>
              Corridor Buffer Analysis
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate your journey route, buffer headroom, and identify strategic charging stops
          </p>
        </div>

        <Badge variant="slate" icon={Info}>
          Default Corridor: Pune ➔ Mumbai (148 km)
        </Badge>
      </div>

      {/* Main Grid: Inputs Form & Risk Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>Trip Scenario Inputs</span>
            </h2>
            <span className="text-[11px] text-slate-400">7 Variables</span>
          </div>

          <form onSubmit={handlePredictAnxiety} className="space-y-4 text-xs">
            {/* 1. Current Battery */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Current Battery
                </label>
                <span className="font-extrabold text-white text-sm">{currentBattery}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={currentBattery}
                onChange={(e) => setCurrentBattery(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 2. Trip Distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Trip Distance (km)
                </label>
                <span className="font-extrabold text-white text-sm">{tripDistance} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="350"
                value={tripDistance}
                onChange={(e) => setTripDistance(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* 3. Predicted Range */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" /> Predicted Range (km)
                </label>
                <span className="font-extrabold text-white text-sm">{predictedRange} km</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                value={predictedRange}
                onChange={(e) => setPredictedRange(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* 4. Weather */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weather</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Sunny / Clear (32°C)">Sunny / Clear (32°C)</option>
                <option value="Heavy Rain / Monsoon">Heavy Rain / Monsoon (Road spray friction)</option>
                <option value="Extreme Heat (>38°C)">Extreme Heat (&gt;38°C)</option>
                <option value="Mild Evening (25°C)">Mild Evening (25°C)</option>
              </select>
            </div>

            {/* 5. Traffic */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Conditions</label>
              <select
                value={traffic}
                onChange={(e) => setTraffic(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Low / Smooth Expressway">Smooth Expressway Flow</option>
                <option value="Moderate">Moderate Highway Flow</option>
                <option value="Heavy Jam / Ghat Congestion">Heavy Jam / Toll Queue Delay</option>
              </select>
            </div>

            {/* 6. Driving Style */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Driving Style</label>
              <select
                value={drivingStyle}
                onChange={(e) => setDrivingStyle(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Eco / Gentle">Eco Mode (Under 80 km/h)</option>
                <option value="Normal / Balanced">Normal / Balanced (80-95 km/h)</option>
                <option value="Aggressive / Fast">Fast Highway Cruising (100-110 km/h)</option>
              </select>
            </div>

            {/* 7. Vehicle Load */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Load</label>
              <select
                value={vehicleLoad}
                onChange={(e) => setVehicleLoad(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Light (1 Person)">Light (Driver only)</option>
                <option value="Normal (2-3 Persons)">Normal (2-3 Persons)</option>
                <option value="Heavy (4-5 Persons + Luggage)">Heavy (Full luggage + 4 passengers)</option>
              </select>
            </div>

            {/* Button: Predict Range Anxiety */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Predict Range Anxiety</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results & Recommendation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Risk Score Banner */}
          <div className="bg-gradient-to-r from-[#131B2B] via-[#162338] to-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Range Anxiety Risk Assessment
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${riskColors.bg} ${riskColors.text} ${riskColors.border} border`}>
                Risk Level: {riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-slate-400 text-xs font-semibold block uppercase">
                  Risk Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black text-white">{riskScore}</span>
                  <span className="text-2xl font-bold text-slate-400">/ 100</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Moderate safety buffer over the Khandala Ghats
                </span>
              </div>

              {/* Visual Meter */}
              <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Severity Gauge</span>
                  <span className={`font-bold ${riskColors.text}`}>{riskLevel} Risk</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      riskLevel === 'Low' ? 'bg-emerald-500' : riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, Number(riskScore) || 0))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>0 (Safe)</span>
                  <span>50 (Moderate)</span>
                  <span>100 (Critical)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Detail Metric Cards: Trip Feasibility, Remaining Range, Safety Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Trip Feasibility */}
            <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Trip Feasibility
              </span>
              <div className="mt-2">
                <span className="text-sm font-bold text-white block leading-snug">
                  {tripFeasibility}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-2 block">
                {tripDistance} km destination
              </span>
            </div>

            {/* 2. Remaining Range */}
            <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Remaining Range
              </span>
              <div className="mt-2">
                <span className="text-3xl font-black text-white block">
                  {remainingRange} <span className="text-sm font-bold text-emerald-400">km</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Buffer upon arrival
              </span>
            </div>

            {/* 3. Safety Margin */}
            <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#243046] flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Safety Margin
              </span>
              <div className="mt-2">
                <span className="text-3xl font-black text-amber-400 block">
                  +{safetyMargin}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Relative headroom
              </span>
            </div>
          </div>

          {/* If charging recommended: Find Recommended Charger Action */}
          {chargingRecommended && (
            <div className="bg-[#152136] border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Recommended Mid-Trip Top-up</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      To safeguard against highway speed consumption or Ghat headwinds, taking a <strong>15-minute DC fast-charging top-up</strong> along the Mumbai-Pune Expressway is strongly advised.
                    </p>
                    <div className="mt-2 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Suggested Hub: Zeon Charging - Urse Food Mall (150 kW DC Fast, KM 38)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Direct navigation to Pune & Maharashtra charging catalog
                </span>
                <button
                  onClick={() => navigate('/chargers')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span>Find Recommended Charger</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
