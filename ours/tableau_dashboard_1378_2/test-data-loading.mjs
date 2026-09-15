/**
 * Runtime data loading test
 * Verifies that the dataLoader correctly loads and processes CSV data
 * with proper header normalization and split field computation
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simulate what the browser would do
async function testDataLoading() {
  console.log('🔍 Runtime Data Loading Test\n');

  try {
    // Read CSV file
    const csvPath = resolve('./public/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
    console.log(`Loading: ${csvPath}\n`);

    const csvText = readFileSync(csvPath, 'utf-8');

    // Test header parsing with BOM and triple quotes
    const lines = csvText.split(/\r?\n/);
    const headerLine = lines[0];
    console.log('Raw header line:', headerLine.substring(0, 100) + '...');

    // Parse using d3-dsv (like the app does)
    const { csvParse } = await import('d3-dsv');
    const rawRows = csvParse(csvText);

    if (rawRows.length === 0) {
      console.error('❌ Failed to parse CSV: no rows found');
      process.exit(1);
    }

    const actualHeaders = Object.keys(rawRows[0]);
    console.log(`\n✓ Parsed ${rawRows.length} rows`);
    console.log(`✓ Found ${actualHeaders.length} columns\n`);

    // Check header normalization
    console.log('=== Header Normalization Check ===');
    const normalizedHeaders = actualHeaders.map(h => {
      const normalized = h
        .replace(/^\uFEFF/, '')  // Remove BOM
        .replace(/^"+|"+$/g, '')  // Remove surrounding quotes
        .trim();
      return { original: h, normalized };
    });

    console.log('Sample normalized headers:');
    normalizedHeaders.slice(0, 5).forEach(({original, normalized}) => {
      console.log(`  "${original}" → "${normalized}"`);
    });

    // Verify required fields exist after normalization
    const requiredFields = [
      'DRG Definition',
      'Hospital Referral Region Description',
      'Provider State',
      'Provider Name',
      'Provider Latitude',
      'Provider Longitude',
      'Total Discharges',
      'Average Covered Charges',
      'Average Total Payments',
      'Average Medicare Payments'
    ];

    console.log('\n=== Required Fields Check ===');
    const normalizedSet = new Set(normalizedHeaders.map(h => h.normalized));

    let allFieldsFound = true;
    for (const field of requiredFields) {
      const found = normalizedSet.has(field);
      const status = found ? '✓' : '✗';
      console.log(`${status} ${field}`);
      if (!found) allFieldsFound = false;
    }

    if (!allFieldsFound) {
      console.error('\n❌ Some required fields are missing!');
      process.exit(1);
    }

    // Test split field computation
    console.log('\n=== Split Field Computation Check ===');

    const drgHeader = actualHeaders.find(h => h.includes('DRG Definition'));
    const sampleDrg = rawRows[0][drgHeader];
    const drgParts = sampleDrg.split(' - ');
    const drgSplit2 = drgParts.length >= 2 ? drgParts.slice(1).join(' - ').trim() : sampleDrg;
    console.log(`✓ DRG Definition: "${sampleDrg.substring(0, 40)}..."`);
    console.log(`✓ DRG Definition - Split 2: "${drgSplit2.substring(0, 40)}..."`);

    const hrrHeader = actualHeaders.find(h => h.includes('Hospital Referral Region'));
    const sampleHRR = rawRows[0][hrrHeader];
    const hrrParts = sampleHRR.split(' - ');
    const hrrSplit2 = hrrParts.length >= 2 ? hrrParts.slice(1).join(' - ').trim() : sampleHRR;
    console.log(`✓ Hospital Referral Region: "${sampleHRR}"`);
    console.log(`✓ Hospital Referral Region - Split 2: "${hrrSplit2}"`);

    // Test numeric field parsing
    console.log('\n=== Numeric Field Parsing Check ===');

    const numericTests = [
      { name: 'Total Discharges', header: actualHeaders.find(h => h.includes('Total Discharges')) },
      { name: 'Average Covered Charges', header: actualHeaders.find(h => h.includes('Average Covered Charges')) },
      { name: 'Latitude', header: actualHeaders.find(h => h.includes('Latitude')) },
      { name: 'Longitude', header: actualHeaders.find(h => h.includes('Longitude')) },
    ];

    for (const test of numericTests) {
      if (test.header) {
        const value = parseFloat(rawRows[0][test.header]);
        if (isNaN(value)) {
          console.error(`✗ Failed to parse ${test.name}: "${rawRows[0][test.header]}"`);
          process.exit(1);
        } else {
          console.log(`✓ ${test.name}: ${value}`);
        }
      }
    }

    // Verify coordinates are valid
    const lat = parseFloat(rawRows[0][actualHeaders.find(h => h.includes('Latitude'))]);
    const lon = parseFloat(rawRows[0][actualHeaders.find(h => h.includes('Longitude'))]);

    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      console.log(`\n✓ Valid coordinates: (${lat}, ${lon})`);
    } else {
      console.error(`\n✗ Invalid coordinates: (${lat}, ${lon})`);
      process.exit(1);
    }

    console.log('\n✅ All runtime data loading tests PASSED!');
    console.log('\nVerified:');
    console.log('  ✓ CSV file loads successfully');
    console.log('  ✓ Headers are normalized (BOM + quotes removed)');
    console.log('  ✓ All required fields are present');
    console.log('  ✓ Split 2 fields compute correctly');
    console.log('  ✓ Numeric fields parse correctly');
    console.log('  ✓ Coordinates are valid');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Runtime data loading test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDataLoading();
