#!/usr/bin/env node

/**
 * Master Pre-QA/Build Validation Script
 * Runs all validation checks before QA and build stages
 *
 * This ensures:
 * 1. CSV parsing is deterministic and correct
 * 2. Tableau fields map to real columns
 * 3. Data quality is good (no all-zero metrics, NaN dates, etc.)
 * 4. No build blockers exist
 * 5. Application builds successfully
 */

const { execSync } = require('child_process');
const path = require('path');

function runScript(scriptName, description) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`▶ ${description}`);
  console.log('='.repeat(70));

  const scriptPath = path.join(__dirname, scriptName);

  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return { passed: true, name: description };
  } catch (error) {
    return { passed: false, name: description };
  }
}

function runBuild() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('▶ Running Production Build');
  console.log('='.repeat(70));

  try {
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    return { passed: true, name: 'Production Build' };
  } catch (error) {
    return { passed: false, name: 'Production Build' };
  }
}

function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     Master Pre-QA/Build Validation Suite                         ║');
  console.log('║     Tableau Source Ingestion Determinism & Correctness          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  const results = [
    runScript('validate-csv-parsing.cjs', 'CSV Parsing Validation'),
    runScript('validate-tableau-fields.cjs', 'Tableau Field Mapping Validation'),
    runScript('validate-data-quality.cjs', 'Data Quality Validation'),
    runScript('validate-build-readiness.cjs', 'Build Readiness Validation'),
    runBuild(),
  ];

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n${'='.repeat(70)}`);
  console.log('FINAL VALIDATION REPORT');
  console.log('='.repeat(70));

  const allPassed = results.every(r => r.passed);

  results.forEach((result, index) => {
    const status = result.passed ? '✓ PASSED' : '✗ FAILED';
    const stepNumber = String(index + 1).padStart(2, '0');
    console.log(`[${stepNumber}] ${result.name.padEnd(45)} ${status}`);
  });

  console.log('='.repeat(70));
  console.log(`Total Duration: ${duration}s`);
  console.log('='.repeat(70));

  if (allPassed) {
    console.log('\n✅ SUCCESS: ALL VALIDATIONS PASSED\n');
    console.log('The following has been verified:');
    console.log('  ✓ CSV parsing is deterministic (handles quoted headers)');
    console.log('  ✓ Tableau fields map correctly to CSV columns');
    console.log('  ✓ Data quality is good (no all-zero metrics, NaN dates)');
    console.log('  ✓ No build blockers (import paths, missing files)');
    console.log('  ✓ Production build completes successfully');
    console.log('\n✅ Ready for QA and deployment stages\n');
    process.exit(0);
  } else {
    console.log('\n❌ FAILURE: SOME VALIDATIONS FAILED\n');

    const failed = results.filter(r => !r.passed);
    console.log('Failed validations:');
    failed.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}`);
    });

    console.log('\n⚠️  Please fix the issues above before proceeding to QA/build\n');
    process.exit(1);
  }
}

main();
