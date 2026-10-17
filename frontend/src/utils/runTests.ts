import { runRangeCalculatorTests } from './rangeCalculator.test.ts';

console.log('====================================================');
console.log('   EV RANGE CALCULATION - 12 CRITICAL TEST CASES   ');
console.log('====================================================\n');

const results = runRangeCalculatorTests();
let passedCount = 0;

results.forEach((r, idx) => {
  const icon = r.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${idx + 1}/12] ${r.test}`);
  if (r.details) {
    console.log(`   └─ ${r.details}`);
  }
  if (r.passed) passedCount++;
});

console.log('\n----------------------------------------------------');
console.log(`Total: ${passedCount}/${results.length} tests passed.`);
console.log('====================================================');

if (passedCount !== results.length) {
  process.exit(1);
} else {
  process.exit(0);
}
