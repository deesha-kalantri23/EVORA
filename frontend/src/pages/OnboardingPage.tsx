import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Car,
  MapPin,
  BatteryCharging,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Onboarding state
  const [selectedVehicle, setSelectedVehicle] = useState('Tata Nexon EV Long Range (2025)');
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [preferredConnector, setPreferredConnector] = useState('CCS2 Dual Gun (Fast DC)');
  const [limitSoC, setLimitSoC] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState(true);

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Step Progress Bar */}
        <div className="bg-[#131B2B] border border-[#243046] rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              Onboarding Setup • Step {step} of {totalSteps}
            </span>
            <span className="font-bold text-emerald-400">
              {Math.round((step / totalSteps) * 100)}% Completed
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                <Zap className="w-9 h-9 fill-current" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome to EVORA
                </h2>
                <p className="text-sm text-emerald-400 font-bold">
                  Your Intelligent EV Companion
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto pt-2 leading-relaxed">
                  Experience intelligent battery telemetry, nationwide charging discovery, corridor route planning, and Indian tariff calculators designed for your seamless electric lifestyle.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-left text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Configured with Verified Datasets</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  EVORA integrates the Indian EV Charging Stations 2025 catalog and EVIoT predictive telemetry modeling to deliver calibrated range and battery health insights.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Add EV */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Step 2: Add Your Electric Vehicle</h3>
                </div>
                <p className="text-slate-400">Select your vehicle model to calibrate range prediction and battery specs</p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { id: 'Tata Nexon EV Long Range (2025)', name: 'Tata Nexon EV Long Range', spec: '40.5 kWh Pack • 465 km Rated • CCS2', default: true },
                  { id: 'MG ZS EV (50.3 kWh)', name: 'MG ZS EV Exclusive Pro', spec: '50.3 kWh Pack • 461 km Rated • CCS2', default: false },
                  { id: 'Mahindra XUV400 EL Pro', name: 'Mahindra XUV400 EL Pro', spec: '39.4 kWh Pack • 456 km Rated • CCS2', default: false },
                  { id: 'Tata Punch EV Long Range', name: 'Tata Punch EV Long Range', spec: '35.0 kWh Pack • 421 km Rated • CCS2', default: false }
                ].map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedVehicle(ev.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedVehicle === ev.id
                        ? 'bg-[#152338] border-emerald-500 shadow-md'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">{ev.name}</span>
                      <span className="text-[11px] text-slate-400">{ev.spec}</span>
                    </div>
                    {selectedVehicle === ev.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Select City */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Step 3: Select Primary City</h3>
                </div>
                <p className="text-slate-400">Sets your default charging discovery and local tariff calculations</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { city: 'Pune', desc: 'Default hub • Phoenix, Hinjawadi & Expressway corridor' },
                  { city: 'Mumbai', desc: 'BKC, Thane & Western Express Highway' },
                  { city: 'Bengaluru', desc: 'BESCOM fast charging & tech park hubs' },
                  { city: 'Delhi NCR', desc: 'Ring road fast chargers & DMRC stations' }
                ].map((c) => (
                  <div
                    key={c.city}
                    onClick={() => setSelectedCity(c.city)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedCity === c.city
                        ? 'bg-[#152338] border-emerald-500 shadow-md'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{c.city}</span>
                      {selectedCity === c.city && <span className="text-emerald-400 font-bold text-xs">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Charging Preferences */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Step 4: Charging Preferences</h3>
                </div>
                <p className="text-slate-400">Configure charging speed protocols and battery preservation rules</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Preferred Connector</label>
                  <select
                    value={preferredConnector}
                    onChange={(e) => setPreferredConnector(e.target.value)}
                    className="w-full bg-[#0F172A] text-slate-200 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="CCS2 Dual Gun (Fast DC)">CCS2 Dual Gun (Public Fast DC, 50-150 kW)</option>
                    <option value="Type 2 AC (7.2 kW Wallbox)">Type 2 AC (Home Smart Wallbox, 7.2 kW)</option>
                    <option value="Bharat DC-001 (15 kW)">Bharat DC-001 (Commercial Slow DC, 15 kW)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white block">Auto-Cap Daily Charge at 80%</span>
                    <span className="text-slate-400 text-[11px]">Recommended by EVIoT predictive model to preserve battery longevity.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={limitSoC}
                    onChange={(e) => setLimitSoC(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Location Permission */}
          {step === 5 && (
            <div className="space-y-5 text-xs text-center py-4">
              <div className="w-14 h-14 rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">Step 5: Location Permission</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                  Enable geo-location to detect nearby fast chargers in {selectedCity} and calculate corridor routes across Maharashtra.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 max-w-md mx-auto flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="font-bold text-white block">Allow Location Services</span>
                  <span className="text-slate-400 text-[11px]">Enables Pune corridor map & nearby stall distance</span>
                </div>
                <input
                  type="checkbox"
                  checked={locationAllowed}
                  onChange={(e) => setLocationAllowed(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Finish */}
          {step === 6 && (
            <div className="text-center py-4 space-y-5 text-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Your EVORA dashboard is ready.</h3>
                <p className="text-slate-400">
                  All vehicle parameters, charging corridors, and telemetry models have been initialized.
                </p>
              </div>

              {/* Ready Summary Card */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary EV</span>
                  <span className="font-bold text-white text-right">{selectedVehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">City Hub</span>
                  <span className="font-bold text-emerald-400">{selectedCity}, Maharashtra</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Connector</span>
                  <span className="font-bold text-white">{preferredConnector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Status</span>
                  <span className="font-bold text-emerald-400">{locationAllowed ? 'Enabled (Pune Focus)' : 'Manual'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Card Navigation Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>{step === 6 ? 'Navigate to Dashboard' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
