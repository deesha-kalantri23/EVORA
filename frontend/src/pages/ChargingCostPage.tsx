import React, { useState } from 'react';
import {
  Coins,
  TrendingDown,
  Fuel,
  Zap,
  Clock,
  BatteryCharging,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/cn';

import { evoraApi } from '../services/api';

export const ChargingCostPage: React.FC = () => {
  const navigate = useNavigate();
  // Inputs
  const [currentBattery, setCurrentBattery] = useState(25);
  const [targetBattery, setTargetBattery] = useState(80);
  const [batteryCapacity, setBatteryCapacity] = useState(40.5); // Tata Nexon EV Long Range
  const [chargingType, setChargingType] = useState<'ac' | 'dc' | 'ultrafast'>('dc');
  const [tariff, setTariff] = useState(18.5); // INR per kWh

  React.useEffect(() => {
    evoraApi.getTelemetry().then(t => {
      if (t) {
        if (t.soc_percentage) setCurrentBattery(t.soc_percentage < 80 ? t.soc_percentage : 25);
        if (t.nominal_capacity_kwh) setBatteryCapacity(t.nominal_capacity_kwh);
      }
    }).catch(console.error);
  }, []);

  // Calculations
  const batteryDeltaPercent = Math.max(0, targetBattery - currentBattery);
  const energyRequiredKwh = +(((batteryDeltaPercent / 100) * batteryCapacity).toFixed(2));
  const estimatedCostInr = +(energyRequiredKwh * tariff).toFixed(2);

  // Time calculations based on charging speed
  let speedKw = 7.2;
  if (chargingType === 'dc') speedKw = 45;
  if (chargingType === 'ultrafast') speedKw = 60;

  const estimatedTimeHours = energyRequiredKwh / speedKw;
  const timeHours = Math.floor(estimatedTimeHours);
  const timeMinutes = Math.round((estimatedTimeHours - timeHours) * 60);

  // Tariff preset comparison values
  const acHomeTariff = 7.50; // INR / kWh
  const dcFastTariff = 18.50; // INR / kWh
  const offPeakTariff = 5.20; // INR / kWh

  const acHomeCost = +(energyRequiredKwh * acHomeTariff).toFixed(2);
  const dcFastCost = +(energyRequiredKwh * dcFastTariff).toFixed(2);
  const offPeakCost = +(energyRequiredKwh * offPeakTariff).toFixed(2);

  const acTimeMin = Math.round((energyRequiredKwh / 7.2) * 60);
  const dcTimeMin = Math.round((energyRequiredKwh / 45) * 60);

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="calculate_cost" />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Charging Cost Calculator
            </h1>
            <Badge variant="emerald">
              Demo Tariff
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Calculate energy requirement, estimated charging cost in Indian Rupees (₹), and comparison across tariffs
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/chargers')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Zap className="w-4 h-4" />
            <span>Find Nearby Charger</span>
          </button>

          <Badge variant="slate" icon={Info}>
            Tata Nexon EV (40.5 kWh)
          </Badge>
        </div>
      </div>

      {/* Main Grid: Form Inputs (5 cols) & Calculated Outcome (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Calculation Parameters</span>
            </h2>
            <span className="text-[11px] text-slate-400">Indian Units (₹, kWh)</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Current Battery */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Current Battery
                </label>
                <span className="font-extrabold text-white text-sm">{currentBattery}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={currentBattery}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCurrentBattery(val);
                  if (val >= targetBattery) setTargetBattery(Math.min(100, val + 10));
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 2. Target Battery */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Target Battery
                </label>
                <span className="font-extrabold text-white text-sm">{targetBattery}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={targetBattery}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTargetBattery(val);
                  if (val <= currentBattery) setCurrentBattery(Math.max(5, val - 10));
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 3. Battery Capacity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Battery Capacity (kWh)</label>
              <input
                type="number"
                step="0.5"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(parseFloat(e.target.value) || 40.5)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3.5 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            {/* 4. Charging Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Charging Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChargingType('ac');
                    setTariff(7.50);
                  }}
                  className={`py-2 px-2 rounded-xl font-bold transition-all text-center ${
                    chargingType === 'ac'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  AC Home (7.2kW)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChargingType('dc');
                    setTariff(18.50);
                  }}
                  className={`py-2 px-2 rounded-xl font-bold transition-all text-center ${
                    chargingType === 'dc'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  DC Fast (50kW)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChargingType('ultrafast');
                    setTariff(21.00);
                  }}
                  className={`py-2 px-2 rounded-xl font-bold transition-all text-center ${
                    chargingType === 'ultrafast'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Ultra Fast (120kW+)
                </button>
              </div>
            </div>

            {/* 5. Tariff */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Tariff Rate (₹ / kWh)</label>
                <span className="text-[10px] text-amber-400 font-bold">Demo Tariff</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={tariff}
                  onChange={(e) => setTariff(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl pl-8 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main 3 Calculated Outputs: Energy Required, Estimated Cost, Estimated Time */}
          <div className="bg-gradient-to-r from-[#131B2B] via-[#162338] to-[#131B2B] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                Calculation Output
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentBattery}% ➔ {targetBattery}% (+{batteryDeltaPercent}%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Output 1: Energy Required */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-center sm:text-left">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Energy Required</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{energyRequiredKwh}</span>
                  <span className="text-sm font-bold text-emerald-400">kWh</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">To reach {targetBattery}%</span>
              </div>

              {/* Output 2: Estimated Cost */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-center sm:text-left">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Estimated Cost</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-3xl font-black text-emerald-400">₹{estimatedCostInr}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">At ₹{tariff}/kWh (Demo Tariff)</span>
              </div>

              {/* Output 3: Estimated Time */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-center sm:text-left">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Estimated Time</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                  <span className="text-3xl font-black text-white">
                    {timeHours > 0 ? `${timeHours}h ${timeMinutes}m` : `${timeMinutes}m`}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 mt-1 block">{speedKw} kW charge rate</span>
              </div>
            </div>
          </div>

          {/* Compare Section: AC vs DC Fast vs Off-Peak */}
          <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">Tariff Rate Comparison</h3>
                <p className="text-xs text-slate-400">Compare cost and duration for this exact {energyRequiredKwh} kWh charge session</p>
              </div>
              <Badge variant="emerald">Cost Breakdown</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* AC Home */}
              <div className={`p-4 rounded-2xl border transition-all ${
                chargingType === 'ac'
                  ? 'bg-[#152338] border-emerald-500 shadow-md'
                  : 'bg-[#0F172A] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">AC Home Wallbox</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    ₹7.50/unit
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-400 block">{formatINR(acHomeCost)}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Duration: ~{Math.floor(acTimeMin / 60)}h {acTimeMin % 60}m
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">MSEDCL domestic slab</span>
                </div>
              </div>

              {/* DC Fast */}
              <div className={`p-4 rounded-2xl border transition-all ${
                chargingType === 'dc'
                  ? 'bg-[#152338] border-emerald-500 shadow-md'
                  : 'bg-[#0F172A] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">DC Fast Public</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    ₹18.50/unit
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white block">{formatINR(dcFastCost)}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Duration: ~{dcTimeMin} minutes
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Tata Power / Jio-bp pulse</span>
                </div>
              </div>

              {/* Off-Peak Nighttime */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Off-Peak (Night)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    ₹5.20/unit
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-400 block">{formatINR(offPeakCost)}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Duration: ~{Math.floor(acTimeMin / 60)}h {acTimeMin % 60}m
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">23:00 - 06:00 ToD tariff</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>All tariffs are calibrated based on Maharashtra electricity regulatory commission & public network rates.</span>
              </span>
              <span className="font-bold text-emerald-400">Demo Tariff Label Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
