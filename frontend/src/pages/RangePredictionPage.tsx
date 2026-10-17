import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Zap,
  Wind,
  Users,
  Thermometer,
  ShieldCheck,
  Gauge,
  Activity,
  TrendingUp,
  MapPin,
  Mountain,
  Car,
  ChevronRight,
  Info,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Badge } from '../components/Badge';
import { evoraApi } from '../services/api';
import { calculateEstimatedRange } from '../utils/rangeCalculator';

// 1. Chart: Range vs Battery Level (100% Battery = 100 km Baseline)
const RANGE_VS_BATTERY_DATA = [
  { soc: 10, rangeKm: 10 },
  { soc: 20, rangeKm: 20 },
  { soc: 30, rangeKm: 30 },
  { soc: 40, rangeKm: 40 },
  { soc: 50, rangeKm: 50 },
  { soc: 60, rangeKm: 60 },
  { soc: 70, rangeKm: 70 },
  { soc: 78, rangeKm: 78 }, // Target 78% SoC
  { soc: 90, rangeKm: 90 },
  { soc: 100, rangeKm: 100 } // 100 km at 100% full charge
];

// 2. Chart: Range by Driving Style (at current 78% SoC, 100km max scale)
const RANGE_BY_STYLE_DATA = [
  { drivingMode: 'Eco (Regen 3)', rangeKm: 86, consumption: 12.8 },
  { drivingMode: 'Normal / City', rangeKm: 78, consumption: 14.0 },
  { drivingMode: 'Aggressive / Sport', rangeKm: 66, consumption: 16.5 }
];

// 3. Chart: Energy Consumption Breakdown (kWh/100 km)
const CONSUMPTION_BREAKDOWN_DATA = [
  { name: 'Traction Motor', value: 9.8, color: '#00D26A' },
  { name: 'HVAC Climate Control', value: 2.4, color: '#38BDF8' },
  { name: 'Thermal BMS Cooling', value: 1.1, color: '#F59E0B' },
  { name: 'Auxiliary Electronics', value: 0.5, color: '#A855F7' }
];

export const RangePredictionPage: React.FC = () => {
  // Form input states
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [temperature, setTemperature] = useState(32);
  const [weather, setWeather] = useState('Sunny / Clear');
  const [drivingStyle, setDrivingStyle] = useState('Normal / Balanced');
  const [averageSpeed, setAverageSpeed] = useState(45);
  const [vehicleLoad, setVehicleLoad] = useState('Normal (2-3 Persons)');
  const [roadType, setRoadType] = useState('City / Urban');
  const [traffic, setTraffic] = useState('Moderate');
  const [elevation, setElevation] = useState('Flat Terrain');
  const [liveWeather, setLiveWeather] = useState<any>(null);

  // Prediction states (100% SoC = 100 km average benchmark)
  const [loading, setLoading] = useState(false);
  const [predictedRange, setPredictedRange] = useState(78);
  const [confidence, setConfidence] = useState(94);
  const [energyConsumption, setEnergyConsumption] = useState(14.0);

  const syncWeatherFromBackend = async () => {
    try {
      const tel = await evoraApi.getTelemetry();
      if (tel) {
        if (tel.soc_percentage) setBatteryLevel(Math.round(tel.soc_percentage));
        if (tel.live_weather) {
          setLiveWeather(tel.live_weather);
          if (tel.live_weather.temperature_c) setTemperature(Math.round(tel.live_weather.temperature_c));
          if (tel.live_weather.condition) setWeather(tel.live_weather.condition);
        } else if (tel.battery_temperature_c) {
          setTemperature(Math.round(tel.battery_temperature_c));
        }
      }
    } catch (err) {
      console.error('Error syncing weather:', err);
    }
  };

  React.useEffect(() => {
    syncWeatherFromBackend();
  }, []);

  // Dynamic calculation when any input changes
  const dynamicResult = useMemo(() => {
    const mode = drivingStyle.includes('Eco') ? 'Eco' : drivingStyle.includes('Sport') ? 'Sport' : 'Normal';
    const isHvacOn = temperature > 28 || temperature < 15;
    return calculateEstimatedRange(batteryLevel, {
      mode,
      speedKmh: averageSpeed,
      ambientTempC: temperature,
      weatherCondition: weather,
      hvacOn: isHvacOn,
      vehicleLoad,
      roadType,
      traffic,
      elevation
    });
  }, [batteryLevel, drivingStyle, averageSpeed, temperature, weather, vehicleLoad, roadType, traffic, elevation]);

  useEffect(() => {
    setPredictedRange(dynamicResult.estimatedRangeKm);
    setEnergyConsumption(Number(dynamicResult.consumptionKwhPer100Km.toFixed(1)));
  }, [dynamicResult]);

  // Dynamic Chart 2 data according to current battery level
  const rangeByStyleData = useMemo(() => {
    const isHvacOn = temperature > 28 || temperature < 15;
    const ecoR = calculateEstimatedRange(batteryLevel, {
      mode: 'Eco',
      speedKmh: 45,
      ambientTempC: temperature,
      hvacOn: isHvacOn
    }).estimatedRangeKm;
    const normR = calculateEstimatedRange(batteryLevel, {
      mode: 'Normal',
      speedKmh: 45,
      ambientTempC: temperature,
      hvacOn: isHvacOn
    }).estimatedRangeKm;
    const sportR = calculateEstimatedRange(batteryLevel, {
      mode: 'Sport',
      speedKmh: 45,
      ambientTempC: temperature,
      hvacOn: isHvacOn
    }).estimatedRangeKm;

    return [
      { drivingMode: 'Eco Mode', rangeKm: ecoR, consumption: 13.3 },
      { drivingMode: 'Normal Mode', rangeKm: normR, consumption: 14.0 },
      { drivingMode: 'Zip / Sport', rangeKm: sportR, consumption: 15.6 }
    ];
  }, [batteryLevel, temperature]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await evoraApi.predictRange({
        battery_level: batteryLevel,
        temperature_c: temperature,
        weather,
        driving_style: drivingStyle,
        average_speed_kmh: averageSpeed,
        vehicle_load: vehicleLoad,
        road_type: roadType,
        traffic,
        elevation
      });

      if (result) {
        setPredictedRange(result.predicted_range_km ?? dynamicResult.estimatedRangeKm);
        setConfidence(result.confidence_percentage ?? 94);
        setEnergyConsumption(result.energy_consumption_kwh_per_100km ?? Number(dynamicResult.consumptionKwhPer100Km.toFixed(1)));
      }
    } catch (err) {
      console.error('Error predicting range:', err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Range Estimation & Trip Modeling
            </h1>
            <Badge variant="emerald" icon={Activity}>
              Trained Model Inferences
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predict real-world range by analyzing multi-variable conditions & live Open-Meteo weather
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {liveWeather && (
            <button
              onClick={syncWeatherFromBackend}
              className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Click to re-sync with latest Open-Meteo live observation"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Live: {liveWeather.city} ({liveWeather.temperature_c}°C, {liveWeather.condition})</span>
            </button>
          )}
          <Badge variant="slate" icon={Info}>
            Vehicle: Tata Nexon EV (40.5 kWh Pack)
          </Badge>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) and Prediction Results & Charts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <span>Prediction Parameters</span>
            </h2>
            <span className="text-[11px] text-slate-400">9 Variables</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            {/* 1. Battery Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Battery Level
                </label>
                <span className="font-extrabold text-white text-sm">{batteryLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 2. Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Ambient Temperature
                </label>
                <span className="font-extrabold text-white text-sm">{temperature} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="48"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 3. Weather */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weather Condition</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Sunny / Clear">Sunny / Clear</option>
                <option value="Hot / Dry Heat">Hot / Dry Heat (&gt;35°C)</option>
                <option value="Monsoon / Rainy">Monsoon / Rainy (Road Spray)</option>
                <option value="Mild / Overcast">Mild / Overcast</option>
              </select>
            </div>

            {/* 4. Driving Style */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Driving Style</label>
              <select
                value={drivingStyle}
                onChange={(e) => setDrivingStyle(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Eco / Gentle">Eco / Gentle (Maximum Regen)</option>
                <option value="Normal / Balanced">Normal / Balanced</option>
                <option value="Aggressive / Sport">Aggressive / Sport (Rapid Acceleration)</option>
              </select>
            </div>

            {/* 5. Average Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" /> Average Speed
                </label>
                <span className="font-extrabold text-white text-sm">{averageSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={averageSpeed}
                onChange={(e) => setAverageSpeed(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* 6. Vehicle Load */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Load</label>
              <select
                value={vehicleLoad}
                onChange={(e) => setVehicleLoad(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Light (1 Person)">Light (Driver only, 75 kg)</option>
                <option value="Normal (2-3 Persons)">Normal (2-3 Persons, 180 kg)</option>
                <option value="Heavy (4-5 Persons + Luggage)">Heavy (Full cabin + Luggage, 340 kg)</option>
              </select>
            </div>

            {/* 7. Road Type & 8. Traffic in 2-col row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Road Type</label>
                <select
                  value={roadType}
                  onChange={(e) => setRoadType(e.target.value)}
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-2.5 py-2 border border-[#243046] cursor-pointer text-xs"
                >
                  <option value="City / Urban">City / Urban</option>
                  <option value="Highway / Expressway">Highway</option>
                  <option value="Mixed Corridor">Mixed</option>
                  <option value="Hilly / Ghats">Ghats / Hilly</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Traffic</label>
                <select
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-2.5 py-2 border border-[#243046] cursor-pointer text-xs"
                >
                  <option value="Low / Smooth">Smooth Flow</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy / Congested">Heavy Jam</option>
                </select>
              </div>
            </div>

            {/* 9. Elevation */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Terrain Elevation</label>
              <select
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Flat Terrain">Flat Terrain (0 to +20m)</option>
                <option value="Mild Incline">Rolling Hills (+150m)</option>
                <option value="Steep Ghats">Steep Ghats (e.g. Khandala / Bhor Ghat, +550m)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Predict Range</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & 3 Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Banner */}
          <div className="bg-[#131B2B] border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Model Calculation
              </span>
              <Badge variant="emerald">EVIoT Predictor</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Predicted Range</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-4xl font-black text-white">{predictedRange}</span>
                  <span className="text-base font-bold text-emerald-400">km</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">100 km avg @ 100% full charge</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Confidence</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-4xl font-black text-white">{confidence}%</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block">High reliability</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Consumption</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{energyConsumption}</span>
                  <span className="text-xs font-bold text-slate-400">kWh/100km</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">~7.2 km/kWh</span>
              </div>
            </div>
          </div>

          {/* 3 Required Charts */}
          <div className="space-y-6">
            {/* Chart 1: Range vs Battery */}
            <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-white">Chart 1: Range vs Battery Level (SoC)</h3>
                  <p className="text-xs text-slate-400">Expected distance across charge percentages</p>
                </div>
                <Badge variant="blue">Linear Discharge</Badge>
              </div>

              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={RANGE_VS_BATTERY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="soc" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} km`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val} km`, 'Predicted Range']}
                      labelFormatter={(lbl) => `Battery SoC: ${lbl}%`}
                    />
                    <Line type="monotone" dataKey="rangeKm" stroke="#00D26A" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Range by Driving Style & Chart 3: Energy Consumption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart 2: Range by Driving Style */}
              <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs text-white">Chart 2: Range by Driving Style</h3>
                  <p className="text-[11px] text-slate-400">Impact of throttle & regen level</p>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rangeByStyleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="drivingMode" stroke="#64748B" fontSize={9} />
                      <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} km`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                        formatter={(val: any) => [`${val} km`, 'Range']}
                      />
                      <Bar dataKey="rangeKm" fill="#00D26A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Energy Consumption Breakdown */}
              <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs text-white">Chart 3: Energy Consumption Share</h3>
                  <p className="text-[11px] text-slate-400">13.8 kWh/100 km breakdown</p>
                </div>

                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CONSUMPTION_BREAKDOWN_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {CONSUMPTION_BREAKDOWN_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                        formatter={(val: any) => [`${val} kWh/100km`, 'Usage']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation of Inputs that Affect Range */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Which Inputs Affect Your EV Range & Why?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Speed & Aerodynamics</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Aerodynamic drag increases quadratically with speed. Driving at 100 km/h consumes ~28% more energy than driving at 75 km/h.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Ambient Temp & HVAC</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Extreme ambient heat in India (&gt;35°C) requires continuous compressor cooling and BMS battery chilling, which draws 1.5 - 2.5 kW.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Elevation & Terrain</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Climbing mountain ghats (e.g. Pune to Lonavala) requires substantial kinetic work. However, downhill regeneration recovers up to 55% on descent.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Driving Style & Load</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Smooth, progressive throttle application avoids heavy peak current spikes. Extra cabin weight (4 passengers) reduces range by ~4-6%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
