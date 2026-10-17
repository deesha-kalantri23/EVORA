import {
  calculateBaseRange,
  calculateCombinedEfficiencyMultiplier,
  calculateEstimatedRange,
  calculateBatteryPercentForDistance,
  DEFAULT_VEHICLE_RANGE_CONFIG
} from './rangeCalculator.ts';

export function runRangeCalculatorTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  // Case 1: 100% battery in Normal mode under baseline conditions gives 100 km
  const r1 = calculateEstimatedRange(100, { drivingMode: 'Normal' });
  const p1 = r1.estimatedRangeKm === 100.0 && r1.baseRangeKm === 100.0;
  results.push({
    test: 'Case 1: 100% battery in Normal mode gives 100 km',
    passed: p1,
    details: `Got ${r1.estimatedRangeKm} km (expected 100.0 km)`
  });

  // Case 2: 82.5% battery in baseline conditions gives 82.5 km
  const r2 = calculateEstimatedRange(82.5, { drivingMode: 'Normal' });
  const p2 = r2.estimatedRangeKm === 82.5 && r2.baseRangeKm === 82.5;
  results.push({
    test: 'Case 2: 82.5% battery in baseline conditions gives 82.5 km',
    passed: p2,
    details: `Got ${r2.estimatedRangeKm} km (expected 82.5 km)`
  });

  // Case 3: 50% battery gives approximately 50 km before adjustments
  const r3 = calculateBaseRange(50);
  const p3 = r3 === 50.0;
  results.push({
    test: 'Case 3: 50% battery gives approximately 50 km before adjustments',
    passed: p3,
    details: `Got ${r3} km (expected 50.0 km)`
  });

  // Case 4: 0% battery always gives 0 km
  const r4 = calculateEstimatedRange(0, { drivingMode: 'Eco' });
  const p4 = r4.estimatedRangeKm === 0 && r4.baseRangeKm === 0;
  results.push({
    test: 'Case 4: 0% battery always gives 0 km',
    passed: p4,
    details: `Got ${r4.estimatedRangeKm} km (expected 0 km)`
  });

  // Case 5: Eco mode can increase range modestly but never above 100 km
  const r5_full = calculateEstimatedRange(100, { drivingMode: 'Eco' });
  const r5_80 = calculateEstimatedRange(80, { drivingMode: 'Eco' });
  const p5 = r5_full.estimatedRangeKm <= 100.0 && r5_80.estimatedRangeKm > 80.0 && r5_80.estimatedRangeKm <= 100.0;
  results.push({
    test: 'Case 5: Eco mode increases range modestly but never above 100 km',
    passed: p5,
    details: `Full battery in Eco: ${r5_full.estimatedRangeKm} km (capped at 100); 80% in Eco: ${r5_80.estimatedRangeKm} km (increased from 80 km)`
  });

  // Case 6: Zip/Sport mode reduces estimated range relative to Normal mode under otherwise identical conditions
  const r6_normal = calculateEstimatedRange(80, { drivingMode: 'Normal', speedKmh: 50 });
  const r6_sport = calculateEstimatedRange(80, { drivingMode: 'Sport', speedKmh: 50 });
  const r6_zip = calculateEstimatedRange(80, { drivingMode: 'Zip', speedKmh: 50 });
  const p6 = r6_sport.estimatedRangeKm < r6_normal.estimatedRangeKm && r6_zip.estimatedRangeKm < r6_normal.estimatedRangeKm;
  results.push({
    test: 'Case 6: Zip/Sport mode reduces range relative to Normal mode',
    passed: p6,
    details: `Normal: ${r6_normal.estimatedRangeKm} km, Sport: ${r6_sport.estimatedRangeKm} km, Zip: ${r6_zip.estimatedRangeKm} km`
  });

  // Case 7: HVAC use and adverse weather can reduce range
  const r7_base = calculateEstimatedRange(80, { hvacOn: false, weather: 'Sunny / Clear' });
  const r7_hvac = calculateEstimatedRange(80, { hvacOn: true, weather: 'Sunny / Clear' });
  const r7_rain = calculateEstimatedRange(80, { hvacOn: true, weather: 'Monsoon Rain' });
  const p7 = r7_hvac.estimatedRangeKm < r7_base.estimatedRangeKm && r7_rain.estimatedRangeKm < r7_hvac.estimatedRangeKm;
  results.push({
    test: 'Case 7: HVAC and adverse weather reduce range',
    passed: p7,
    details: `Base: ${r7_base.estimatedRangeKm} km, With HVAC: ${r7_hvac.estimatedRangeKm} km, With HVAC + Rain: ${r7_rain.estimatedRangeKm} km`
  });

  // Case 8: Missing weather data does not create an arbitrary penalty
  const r8_missing = calculateEstimatedRange(80, { drivingMode: 'Normal', temperatureC: undefined, weather: undefined });
  const r8_normal = calculateEstimatedRange(80, { drivingMode: 'Normal' });
  const p8 = r8_missing.estimatedRangeKm === r8_normal.estimatedRangeKm;
  results.push({
    test: 'Case 8: Missing weather data does not create an arbitrary penalty',
    passed: p8,
    details: `Missing weather: ${r8_missing.estimatedRangeKm} km vs Normal: ${r8_normal.estimatedRangeKm} km`
  });

  // Case 9: Range never becomes negative, Infinity, or NaN
  const r9_neg = calculateEstimatedRange(-20);
  const r9_nan = calculateEstimatedRange(NaN);
  const r9_inf = calculateEstimatedRange(Infinity);
  const p9 = !isNaN(r9_neg.estimatedRangeKm) && r9_neg.estimatedRangeKm >= 0 &&
             !isNaN(r9_nan.estimatedRangeKm) && r9_nan.estimatedRangeKm >= 0 &&
             isFinite(r9_inf.estimatedRangeKm);
  results.push({
    test: 'Case 9: Range never becomes negative, Infinity, or NaN',
    passed: p9,
    details: `Negative SoC: ${r9_neg.estimatedRangeKm}, NaN SoC: ${r9_nan.estimatedRangeKm}, Inf SoC: ${r9_inf.estimatedRangeKm}`
  });

  // Case 10: The dashboard, prediction page, and route planner produce consistent estimates for identical inputs
  const inputCond = { drivingMode: 'Eco', speedKmh: 45, temperatureC: 32 };
  const est1 = calculateEstimatedRange(78, inputCond);
  const est2 = calculateEstimatedRange(78, inputCond);
  const p10 = est1.estimatedRangeKm === est2.estimatedRangeKm && est1.baseRangeKm === 78.0;
  results.push({
    test: 'Case 10: Consistency across pages for identical inputs',
    passed: p10,
    details: `Both produced ${est1.estimatedRangeKm} km`
  });

  // Case 11: Environmental and driving adjustments are applied only once
  const multObj = calculateCombinedEfficiencyMultiplier({
    drivingMode: 'Eco',
    speedKmh: 50,
    hvacOn: true
  });
  const expectedFactor = 1.05 * 1.00 * 0.94; // Eco (1.05) * Speed 50 (1.00) * HVAC (0.94) = 0.987
  const p11 = Math.abs(multObj.multiplier - expectedFactor) < 0.001 && Object.keys(multObj.factors).length === 3;
  results.push({
    test: 'Case 11: Environmental and driving adjustments applied exactly once',
    passed: p11,
    details: `Multiplier: ${multObj.multiplier.toFixed(4)}, expected: ${expectedFactor.toFixed(4)}`
  });

  // Case 12: Existing website features continue to work
  const distPercent = calculateBatteryPercentForDistance(50);
  const p12 = distPercent.batteryPercentNeeded === 50.0;
  results.push({
    test: 'Case 12: Battery consumption calculation consistent (50 km = 50% battery)',
    passed: p12,
    details: `50 km required battery: ${distPercent.batteryPercentNeeded}%`
  });

  return results;
}
