/**
 * Test CSV Parsing
 *
 * This script tests the CSV parsing logic directly against the data files
 * to ensure headers are normalized correctly and all fields can be resolved.
 */

import { readFileSync } from 'fs';
import { csvParse } from 'd3-dsv';

const DATA_DIR = './public/data';

/**
 * Normalize CSV header by removing all quotes, BOM, and trimming whitespace
 */
function normalizeHeader(header) {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark) if present
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/^"+|"+$/g, '') // Remove again for nested quotes
    .trim();
}

/**
 * Test CSV file parsing
 */
function testCsvFile(filename) {
  console.log(`\n=== Testing ${filename} ===\n`);

  try {
    const csvText = readFileSync(`${DATA_DIR}/${filename}`, 'utf-8');
    const data = csvParse(csvText);

    if (data.length === 0) {
      console.log('✗ File is empty');
      return false;
    }

    console.log(`✓ Loaded ${data.length} rows`);

    // Check headers
    const rawHeaders = Object.keys(data[0]);
    console.log(`\nRaw headers (${rawHeaders.length}):`);
    rawHeaders.forEach(h => console.log(`  "${h}"`));

    // Normalize headers
    const normalizedHeaders = rawHeaders.map(normalizeHeader);
    console.log(`\nNormalized headers:`);
    normalizedHeaders.forEach(h => console.log(`  ${h}`));

    // Check for required trip fields
    const requiredTripFields = [
      'tripid',
      'tripduration',
      'starttime',
      'stoptime',
      'start station id',
      'start station name',
      'start station latitude',
      'start station longitude',
      'end station id',
      'end station name',
      'end station latitude',
      'end station longitude',
      'bikeid',
      'usertype',
      'birth year',
      'gender',
    ];

    const availableFields = new Set(normalizedHeaders.map(h => h.toLowerCase()));
    const missingFields = requiredTripFields.filter(f => !availableFields.has(f.toLowerCase()));

    if (missingFields.length > 0) {
      console.log(`\n✗ Missing required fields: ${missingFields.join(', ')}`);
      return false;
    } else {
      console.log(`\n✓ All ${requiredTripFields.length} required trip fields present`);
    }

    // Test accessing a few values from the first row
    console.log('\nSample data from first row:');
    const firstRow = data[0];

    // First, let's see what keys d3-dsv actually created
    console.log('\nActual keys in parsed row (first 5):');
    Object.keys(firstRow).slice(0, 5).forEach(k => {
      console.log(`  "${k}" -> "${firstRow[k]}"`);
    });

    // Now test accessing with actual keys
    const tests = [
      { field: 'TripID', actualKey: rawHeaders[0] },
      { field: 'tripduration', actualKey: rawHeaders[1] },
      { field: 'starttime', actualKey: rawHeaders[2] },
      { field: 'usertype', actualKey: rawHeaders[13] },
    ];

    let allAccessible = true;
    for (const test of tests) {
      const value = firstRow[test.actualKey];
      if (value !== undefined) {
        console.log(`  ✓ ${test.field}: "${value}" (accessed via actual key "${test.actualKey}")`);
      } else {
        console.log(`  ✗ ${test.field}: Could not access via "${test.actualKey}"`);
        allAccessible = false;
      }
    }

    return allAccessible;

  } catch (error) {
    console.error(`✗ Error reading ${filename}:`, error.message);
    return false;
  }
}

// Run tests
console.log('==========================================');
console.log('CSV Parsing Validation Test');
console.log('==========================================');

const files = [
  'TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv',
  'TEMP_0lftzi414zrmhq1bx5w7b05n83gh.csv',
];

let allPassed = true;
for (const file of files) {
  const passed = testCsvFile(file);
  allPassed = allPassed && passed;
}

console.log('\n==========================================');
if (allPassed) {
  console.log('✓ All CSV parsing tests passed!');
  console.log('==========================================\n');
  process.exit(0);
} else {
  console.log('✗ Some CSV parsing tests failed');
  console.log('==========================================\n');
  process.exit(1);
}
