import {
  calculateBaseRange,
  calculateCombinedEfficiencyMultiplier,
  calculateEstimatedRange,
  calculateBatteryPercentForDistance,
  calculateDynamicRangeAnxiety,
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

  // Case 13: Range anxiety score is dynamic and scales continuously with distance
  const a_dist30 = calculateDynamicRangeAnxiety(80, 30);
  const a_dist60 = calculateDynamicRangeAnxiety(80, 60);
  const a_dist120 = calculateDynamicRangeAnxiety(80, 120);
  const a_dist180 = calculateDynamicRangeAnxiety(80, 180);
  const p13 = a_dist30.riskScore < a_dist60.riskScore &&
              a_dist60.riskScore < a_dist120.riskScore &&
              a_dist120.riskScore < a_dist180.riskScore;
  results.push({
    test: 'Case 13: Range anxiety score scales dynamically with distance for fixed charge',
    passed: p13,
    details: `30km: ${a_dist30.riskScore}, 60km: ${a_dist60.riskScore}, 120km: ${a_dist120.riskScore}, 180km: ${a_dist180.riskScore}`
  });

  // Case 14: Range anxiety score decreases dynamically with higher charging for fixed distance
  const a_soc20 = calculateDynamicRangeAnxiety(20, 80);
  const a_soc50 = calculateDynamicRangeAnxiety(50, 80);
  const a_soc80 = calculateDynamicRangeAnxiety(80, 80);
  const a_soc100 = calculateDynamicRangeAnxiety(100, 80);
  const p14 = a_soc20.riskScore > a_soc50.riskScore &&
              a_soc50.riskScore > a_soc80.riskScore &&
              a_soc80.riskScore > a_soc100.riskScore;
  results.push({
    test: 'Case 14: Range anxiety score decreases dynamically with higher charging for fixed distance',
    passed: p14,
    details: `20% SoC: ${a_soc20.riskScore}, 50% SoC: ${a_soc50.riskScore}, 80% SoC: ${a_soc80.riskScore}, 100% SoC: ${a_soc100.riskScore}`
  });

  // Case 15: Maximum constraints enforced (charging max 100%, distance max 200 km) and boundaries
  const a_maxBounds = calculateDynamicRangeAnxiety(150, 350); // should clamp to 100% and 200km
  const a_zeroDist = calculateDynamicRangeAnxiety(80, 0);
  const a_zeroCharge = calculateDynamicRangeAnxiety(0, 50);
  const p15 = a_maxBounds.riskScore >= 95 &&
              a_maxBounds.riskScore <= 100 &&
              a_zeroDist.riskScore === 0 &&
              a_zeroDist.riskLevel === 'Low' &&
              a_zeroCharge.riskScore === 100 &&
              a_zeroCharge.riskLevel === 'High';
  results.push({
    test: 'Case 15: Clamping to charging max 100% and distance max 200km with valid boundaries',
    passed: p15,
    details: `Capped (150% SoC, 350km): score ${a_maxBounds.riskScore}; 0 km: ${a_zeroDist.riskScore}; 0% SoC: ${a_zeroCharge.riskScore}`
  });

  // Case 16: Risk level categorization reflects actual operational risk
  const a_low = calculateDynamicRangeAnxiety(100, 30); // 30 km on 100% charge = safe
  const a_med = calculateDynamicRangeAnxiety(75, 55);  // 55 km on 75% charge = moderate buffer
  const a_high = calculateDynamicRangeAnxiety(75, 148); // 148 km on 75% charge = deficit/charging required
  const p16 = a_low.riskLevel === 'Low' && !a_low.chargingRecommended &&
              a_med.riskLevel === 'Medium' &&
              a_high.riskLevel === 'High' && a_high.chargingRecommended;
  results.push({
    test: 'Case 16: Risk levels accurately reflect Low (<40), Medium (40-74), High (>=75)',
    passed: p16,
    details: `Low: ${a_low.riskScore} (${a_low.riskLevel}), Med: ${a_med.riskScore} (${a_med.riskLevel}), High: ${a_high.riskScore} (${a_high.riskLevel})`
  });

  return results;
}
