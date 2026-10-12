import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Navigation,
  CalendarCheck,
  BatteryCharging,
  History,
  Calculator,
  ChevronRight
} from 'lucide-react';

export type JourneyStep =
  | 'find_charger'
  | 'view_station'
  | 'plan_route'
  | 'book_slot'
  | 'monitor_charging'
  | 'view_history'
  | 'calculate_cost';

interface ChargingJourneyBarProps {
  currentStep: JourneyStep;
  stationId?: string;
}

const JOURNEY_STEPS: {
  id: JourneyStep;
  label: string;
  shortLabel: string;
  icon: any;
  getPath: (stationId?: string) => string;
}[] = [
  {
    id: 'find_charger',
    label: '1. Find Charger',
    shortLabel: 'Find',
    icon: Compass,
    getPath: () => '/chargers'
  },
  {
    id: 'view_station',
    label: '2. View Station',
    shortLabel: 'Station',
    icon: MapPin,
    getPath: (sid) => (sid ? `/chargers/${sid}` : '/chargers/pune-tp-01')
  },
  {
    id: 'plan_route',
    label: '3. Plan Route',
    shortLabel: 'Route',
    icon: Navigation,
    getPath: () => '/route'
  },
  {
    id: 'book_slot',
    label: '4. Book Slot',
    shortLabel: 'Book',
    icon: CalendarCheck,
    getPath: () => '/bookings'
  },
  {
    id: 'monitor_charging',
    label: '5. Monitor Charging',
    shortLabel: 'Monitor',
    icon: BatteryCharging,
    getPath: () => '/charging'
  },
  {
    id: 'view_history',
    label: '6. View History',
    shortLabel: 'History',
    icon: History,
    getPath: () => '/charging-history'
  },
  {
    id: 'calculate_cost',
    label: '7. Calculate Cost',
    shortLabel: 'Cost',
    icon: Calculator,
    getPath: () => '/charging-cost'
  }
];

export const ChargingJourneyBar: React.FC<ChargingJourneyBarProps> = ({ currentStep, stationId }) => {
  const navigate = useNavigate();

  const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-[#131B2B]/90 backdrop-blur-md border border-[#243046] rounded-2xl p-2.5 sm:p-3 shadow-md mb-6 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max gap-1 sm:gap-2">
        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider px-2 hidden lg:inline-block">
          Charging Journey
        </span>

        {JOURNEY_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isPassed = idx < currentIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => navigate(step.getPath(stationId))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : isPassed
                    ? 'bg-[#0F172A] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : isPassed ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </button>

              {idx < JOURNEY_STEPS.length - 1 && (
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${idx < currentIndex ? 'text-emerald-500/60' : 'text-slate-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
