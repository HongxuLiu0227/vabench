#!/usr/bin/env node

/**
 * Master Tableau Source Validation Script
 * Runs all validation checks to ensure deterministic and correct data ingestion
 */

const { execSync } = require('child_process');
const path = require('path');

function runValidator(scriptName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${description}`);
  console.log('='.repeat(60));

  const scriptPath = path.join(__dirname, scriptName);

  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n✗ ${description} FAILED`);
    return false;
  }
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Deterministic Tableau Source Validation Suite       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    csvParsing: runValidator('validate-csv-parsing.cjs', 'CSV Parsing Validation'),
    fieldMapping: runValidator('validate-tableau-fields.cjs', 'Tableau Field Mapping Validation'),
    dataQuality: runValidator('validate-data-quality.cjs', 'Data Quality Validation'),
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(r => r);

  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✓ PASSED' : '✗ FAILED';
    const paddedName = name.replace(/([A-Z])/g, ' $1').trim().padEnd(30);
    console.log(`${paddedName} ${status}`);
  });

  console.log('='.repeat(60));

  if (allPassed) {
    console.log('\n✓ ALL VALIDATIONS PASSED');
    console.log('✓ Tableau source ingestion is deterministic and correct');
    console.log('✓ Ready for QA/build stages\n');
    process.exit(0);
  } else {
    console.log('\n✗ SOME VALIDATIONS FAILED');
    console.log('✗ Please fix the issues before proceeding to QA/build\n');
    process.exit(1);
  }
}

main();
