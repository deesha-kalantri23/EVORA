/**
 * Central EV Range Calculation Utility for EVORA Platform
 *
 * Core Range Rule:
 * - 100% battery = 100 km baseline for the primary vehicle profile
 * - 80% battery = 80 km baseline before environmental/driving adjustments
 * - 50% battery = 50 km baseline
 * - 0% battery = always exactly 0 km
 *
 * Formula:
 * Base Range (km) = Battery Percentage * (baselineFullChargeKm / 100)
 * Estimated Range = clamp(Base Range * Combined Efficiency Multiplier, 0, baselineFullChargeKm)
 */

export interface VehicleRangeConfig {
  id?: string;
  name?: string;
  fullChargeRangeKm: number; // Baseline full-charge range (default: 100 km)
  nominalBatteryCapacityKwh: number; // e.g. 40.5 kWh
}

export const DEFAULT_VEHICLE_RANGE_CONFIG: VehicleRangeConfig = {
  id: 'v-nexon-01',
  name: 'Tata Nexon EV Long Range',
  fullChargeRangeKm: 100.0,
  nominalBatteryCapacityKwh: 40.5
};

export interface DrivingConditions {
  drivingMode?: 'Eco' | 'Normal' | 'Sport' | 'Zip' | string;
  mode?: string;
  speedKmh?: number;
  hvacOn?: boolean;
  temperatureC?: number;
  ambientTempC?: number;
  weather?: string;
  weatherCondition?: string;
  vehicleLoad?: 'Light' | 'Normal' | 'Heavy' | string;
  traffic?: 'Light' | 'Moderate' | 'Heavy' | string;
  terrain?: 'Flat' | 'Hilly' | 'Ghats' | string;
  roadType?: string;
  elevation?: string;
  batteryTemperatureC?: number;
}

/**
 * Centralized, plausible adjustment multipliers.
 * Keep small and calibrated: shifts range by a few km under normal conditions.
 */
export const RANGE_ADJUSTMENT_CONFIG = {
  drivingMode: {
    eco: 1.05,       // +5% range bonus
    normal: 1.00,    // baseline 1.0
    sport: 0.90,     // -10% penalty for aggressive acceleration
    zip: 0.90        // -10% for Zip mode
  },
  speed: {
    lowThreshold: 30,       // < 30 km/h: stop-and-go penalty
    lowFactor: 0.97,        // -3%
    optimalMin: 30,         // 30 - 65 km/h: steady efficient cruising (1.00)
    optimalMax: 65,
    highSpeedPenaltyPerKmh: 0.0025, // For each km/h above 65 km/h
    maxHighSpeedPenalty: 0.15       // Maximum high speed reduction 15%
  },
  hvac: {
    on: 0.94,        // -6% for AC/heater
    off: 1.00
  },
  weather: {
    adverseKeywords: ['rain', 'monsoon', 'drizzle', 'storm', 'wet', 'thunder'],
    adverseFactor: 0.96 // -4% for wet road rolling resistance & wipers
  },
  temperature: {
    coldThreshold: 15,      // < 15°C cold battery/ambient: -4%
    coldFactor: 0.96,
    hotThreshold: 35,       // > 35°C high thermal ambient: -4%
    hotFactor: 0.96,
    optimal: 1.00
  },
  vehicleLoad: {
    lightKeywords: ['light', '1 person', 'solo'],
    lightFactor: 1.02,      // +2%
    heavyKeywords: ['heavy', 'full', '4-5', 'luggage'],
    heavyFactor: 0.96       // -4%
  },
  traffic: {
    heavyKeywords: ['heavy', 'jam', 'congested', 'standstill'],
    heavyFactor: 0.96,      // -4%
    lightKeywords: ['light', 'clear', 'highway free'],
    lightFactor: 1.01       // +1%
  },
  terrain: {
    hillyKeywords: ['hilly', 'ghat', 'steep', 'mountain', 'elevation'],
    hillyFactor: 0.93       // -7% for uphill gravitational demand
  }
};

/**
 * Calculates the unadjusted baseline range strictly from battery SoC percentage.
 * Example: 82.5% SoC -> 82.5 km (for 100 km baseline)
 */
export function calculateBaseRange(
  batteryPercentage: number | null | undefined,
  config: VehicleRangeConfig = DEFAULT_VEHICLE_RANGE_CONFIG
): number {
  if (batteryPercentage == null || isNaN(batteryPercentage)) {
    return NaN;
  }
  if (batteryPercentage <= 0) {
    return 0;
  }
  const clampedSoc = Math.min(100, Math.max(0, batteryPercentage));
  return (clampedSoc / 100.0) * config.fullChargeRangeKm;
}

/**
 * Computes the combined efficiency multiplier based on driving conditions.
 * Ensures no factor is applied twice. If weather/conditions data is missing,
 * no penalty is applied (defaults to 1.0).
 */
export function calculateCombinedEfficiencyMultiplier(conditions?: DrivingConditions): {
  multiplier: number;
  factors: Record<string, number>;
} {
  if (!conditions) {
    return { multiplier: 1.0, factors: {} };
  }

  const factors: Record<string, number> = {};
  let combined = 1.0;

  // 1. Driving Mode Factor
  const activeMode = conditions.drivingMode || conditions.mode;
  if (activeMode) {
    const mode = activeMode.toLowerCase();
    if (mode.includes('eco')) {
      factors.drivingMode = RANGE_ADJUSTMENT_CONFIG.drivingMode.eco;
    } else if (mode.includes('sport') || mode.includes('aggressive')) {
      factors.drivingMode = RANGE_ADJUSTMENT_CONFIG.drivingMode.sport;
    } else if (mode.includes('zip')) {
      factors.drivingMode = RANGE_ADJUSTMENT_CONFIG.drivingMode.zip;
    } else {
      factors.drivingMode = RANGE_ADJUSTMENT_CONFIG.drivingMode.normal;
    }
    combined *= factors.drivingMode;
  }

  // 2. Speed Factor
  if (typeof conditions.speedKmh === 'number' && !isNaN(conditions.speedKmh) && conditions.speedKmh > 0) {
    const spd = conditions.speedKmh;
    if (spd < RANGE_ADJUSTMENT_CONFIG.speed.lowThreshold) {
      factors.speed = RANGE_ADJUSTMENT_CONFIG.speed.lowFactor;
    } else if (spd > RANGE_ADJUSTMENT_CONFIG.speed.optimalMax) {
      const penalty = Math.min(
        RANGE_ADJUSTMENT_CONFIG.speed.maxHighSpeedPenalty,
        (spd - RANGE_ADJUSTMENT_CONFIG.speed.optimalMax) * RANGE_ADJUSTMENT_CONFIG.speed.highSpeedPenaltyPerKmh
      );
      factors.speed = Math.max(0.70, 1.0 - penalty);
    } else {
      factors.speed = 1.0;
    }
    combined *= factors.speed;
  }

  // 3. HVAC Climate Control Factor
  if (conditions.hvacOn !== undefined) {
    factors.hvac = conditions.hvacOn
      ? RANGE_ADJUSTMENT_CONFIG.hvac.on
      : RANGE_ADJUSTMENT_CONFIG.hvac.off;
    combined *= factors.hvac;
  }

  // 4. Ambient Temperature Factor (only when explicitly provided)
  const tempVal = conditions.temperatureC ?? conditions.ambientTempC;
  if (typeof tempVal === 'number' && !isNaN(tempVal)) {
    const t = tempVal;
    if (t < RANGE_ADJUSTMENT_CONFIG.temperature.coldThreshold) {
      factors.temperature = RANGE_ADJUSTMENT_CONFIG.temperature.coldFactor;
    } else if (t > RANGE_ADJUSTMENT_CONFIG.temperature.hotThreshold) {
      factors.temperature = RANGE_ADJUSTMENT_CONFIG.temperature.hotFactor;
    } else {
      factors.temperature = RANGE_ADJUSTMENT_CONFIG.temperature.optimal;
    }
    combined *= factors.temperature;
  }

  // 5. Weather Conditions (only when provided and adverse)
  const weatherVal = conditions.weather || conditions.weatherCondition;
  if (weatherVal && typeof weatherVal === 'string') {
    const w = weatherVal.toLowerCase();
    const isAdverse = RANGE_ADJUSTMENT_CONFIG.weather.adverseKeywords.some(kw => w.includes(kw));
    if (isAdverse) {
      factors.weather = RANGE_ADJUSTMENT_CONFIG.weather.adverseFactor;
      combined *= factors.weather;
    }
  }

  // 6. Vehicle Load Factor
  if (conditions.vehicleLoad && typeof conditions.vehicleLoad === 'string') {
    const vl = conditions.vehicleLoad.toLowerCase();
    if (RANGE_ADJUSTMENT_CONFIG.vehicleLoad.lightKeywords.some(kw => vl.includes(kw))) {
      factors.vehicleLoad = RANGE_ADJUSTMENT_CONFIG.vehicleLoad.lightFactor;
    } else if (RANGE_ADJUSTMENT_CONFIG.vehicleLoad.heavyKeywords.some(kw => vl.includes(kw))) {
      factors.vehicleLoad = RANGE_ADJUSTMENT_CONFIG.vehicleLoad.heavyFactor;
    }
    if (factors.vehicleLoad) {
      combined *= factors.vehicleLoad;
    }
  }

  // 7. Traffic Factor
  if (conditions.traffic && typeof conditions.traffic === 'string') {
    const tr = conditions.traffic.toLowerCase();
    if (RANGE_ADJUSTMENT_CONFIG.traffic.heavyKeywords.some(kw => tr.includes(kw))) {
      factors.traffic = RANGE_ADJUSTMENT_CONFIG.traffic.heavyFactor;
    } else if (RANGE_ADJUSTMENT_CONFIG.traffic.lightKeywords.some(kw => tr.includes(kw))) {
      factors.traffic = RANGE_ADJUSTMENT_CONFIG.traffic.lightFactor;
    }
    if (factors.traffic) {
      combined *= factors.traffic;
    }
  }

  // 8. Terrain / Elevation Factor
  const terrainVal = conditions.terrain || conditions.roadType || conditions.elevation;
  if (terrainVal && typeof terrainVal === 'string') {
    const terr = terrainVal.toLowerCase();
    if (RANGE_ADJUSTMENT_CONFIG.terrain.hillyKeywords.some(kw => terr.includes(kw))) {
      factors.terrain = RANGE_ADJUSTMENT_CONFIG.terrain.hillyFactor;
      combined *= factors.terrain;
    }
  }

  return { multiplier: combined, factors };
}

export interface RangeEstimateResult {
  estimatedRangeKm: number;
  baseRangeKm: number;
  combinedMultiplier: number;
  combinedEfficiencyMultiplier: number;
  energyAvailableKwh: number;
  consumptionKwhPer100Km: number;
  efficiencyRateKmPerKwh: number;
  isMissingData: boolean;
  formattedRangeKm: string;
}

/**
 * Master shared range calculation utility.
 *
 * Rules enforced:
 * - 0% battery always gives 0 km.
 * - Result is clamped between 0 and fullChargeRangeKm (100 km for this EV profile).
 * - Never returns negative, NaN, or Infinity.
 * - Missing battery percentage returns an unavailable state.
 */
export function calculateEstimatedRange(
  batteryPercentage: number | null | undefined,
  conditions?: DrivingConditions,
  config: VehicleRangeConfig = DEFAULT_VEHICLE_RANGE_CONFIG
): RangeEstimateResult {
  const nominalKwh = config.nominalBatteryCapacityKwh || 40.5;
  const fullRange = config.fullChargeRangeKm || 100.0;

  if (batteryPercentage == null || isNaN(batteryPercentage)) {
    return {
      estimatedRangeKm: 0,
      baseRangeKm: 0,
      combinedMultiplier: 1.0,
      combinedEfficiencyMultiplier: 1.0,
      energyAvailableKwh: 0,
      consumptionKwhPer100Km: 14.0,
      efficiencyRateKmPerKwh: 2.5,
      isMissingData: true,
      formattedRangeKm: '--'
    };
  }

  if (batteryPercentage <= 0) {
    return {
      estimatedRangeKm: 0,
      baseRangeKm: 0,
      combinedMultiplier: 1.0,
      combinedEfficiencyMultiplier: 1.0,
      energyAvailableKwh: 0,
      consumptionKwhPer100Km: 14.0,
      efficiencyRateKmPerKwh: 0.0,
      isMissingData: false,
      formattedRangeKm: '0.0'
    };
  }

  const baseRange = calculateBaseRange(batteryPercentage, config);
  const { multiplier } = calculateCombinedEfficiencyMultiplier(conditions);

  // Apply multiplier to base range
  const rawEstimate = baseRange * multiplier;

  // Cap between 0 and fullChargeRangeKm (100 km for this profile)
  const clampedRange = Math.min(fullRange, Math.max(0, rawEstimate));

  // Round to 1 decimal place cleanly
  const finalRange = Math.round(clampedRange * 10) / 10;
  const energyAvailable = Math.round(((Math.min(100, Math.max(0, batteryPercentage)) / 100) * nominalKwh) * 10) / 10;
  const consumptionKwhPer100Km = Number((14.0 / Math.max(0.5, multiplier)).toFixed(1));
  const efficiencyRateKmPerKwh = Number((finalRange / Math.max(0.1, energyAvailable)).toFixed(1));

  return {
    estimatedRangeKm: finalRange,
    baseRangeKm: Math.round(baseRange * 10) / 10,
    combinedMultiplier: Math.round(multiplier * 1000) / 1000,
    combinedEfficiencyMultiplier: Math.round(multiplier * 1000) / 1000,
    energyAvailableKwh: energyAvailable,
    consumptionKwhPer100Km,
    efficiencyRateKmPerKwh,
    isMissingData: false,
    formattedRangeKm: finalRange.toFixed(1)
  };
}

export interface DistanceBatteryRequirement {
  batteryPercentNeeded: number;
  energyKwhNeeded: number;
  effectiveFullRangeKm: number;
  isReachableWithoutCharging: (currentSoc: number, minReservePercent?: number) => boolean;
  estimatedStopsNeeded: (currentSoc: number, minReservePercent?: number) => number;
}

/**
 * Calculates battery percentage and energy required for a given distance,
 * taking into account environmental and driving conditions.
 */
export function calculateBatteryPercentForDistance(
  distanceKm: number,
  conditions?: DrivingConditions,
  config: VehicleRangeConfig = DEFAULT_VEHICLE_RANGE_CONFIG
): DistanceBatteryRequirement {
  if (distanceKm <= 0) {
    return {
      batteryPercentNeeded: 0,
      energyKwhNeeded: 0,
      effectiveFullRangeKm: config.fullChargeRangeKm,
      isReachableWithoutCharging: () => true,
      estimatedStopsNeeded: () => 0
    };
  }
  const { multiplier } = calculateCombinedEfficiencyMultiplier(conditions);
  const effectiveFullRange = Math.max(10, config.fullChargeRangeKm * multiplier);
  const percentNeeded = Math.round(((distanceKm / effectiveFullRange) * 100.0) * 10) / 10;
  const energyKwhNeeded = Math.round(((percentNeeded / 100.0) * config.nominalBatteryCapacityKwh) * 10) / 10;

  return {
    batteryPercentNeeded: percentNeeded,
    energyKwhNeeded,
    effectiveFullRangeKm: Math.round(effectiveFullRange * 10) / 10,
    isReachableWithoutCharging: (currentSoc: number, minReservePercent = 15) => {
      return (currentSoc - percentNeeded) >= minReservePercent;
    },
    estimatedStopsNeeded: (currentSoc: number, minReservePercent = 15) => {
      const net = currentSoc - percentNeeded;
      if (net >= minReservePercent) return 0;
      return Math.max(1, Math.ceil((minReservePercent - net) / 45));
    }
  };
}
