#!/usr/bin/env node

/**
 * Quick CSV parsing test
 * Run with: node test-csv-parsing.js
 */

import * as d3Dsv from 'd3-dsv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_PATH = join(__dirname, 'public/data/JC-201701-citibike-tripdata.csv');

function normalizeHeaders(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    // Strip BOM, then triple quotes: """field""" -> field, then double quotes
    const normalizedKey = key.replace(/^\uFEFF/, '')  // Strip BOM
                              .replace(/^"{3}(.+)"{3}$/, '$1')  // Strip triple quotes
                              .replace(/^"(.+)"$/, '$1');  // Strip double quotes
    normalized[normalizedKey] = value;
  }
  return normalized;
}

try {
  console.log('Testing CSV parsing...');
  console.log('CSV path:', CSV_PATH);

  const csvText = readFileSync(CSV_PATH, 'utf-8');
  console.log('✓ CSV file loaded');

  const rawData = d3Dsv.csvParse(csvText);
  console.log('✓ CSV parsed, rows:', rawData.length);

  if (rawData.length === 0) {
    console.error('✗ ERROR: No data rows found');
    process.exit(1);
  }

  // Check first row keys
  const firstRow = rawData[0];
  const rawKeys = Object.keys(firstRow);
  console.log('\nRaw CSV keys (first 5):', rawKeys.slice(0, 5));

  // Normalize headers
  const normalizedRow = normalizeHeaders(firstRow);
  const normalizedKeys = Object.keys(normalizedRow);
  console.log('Normalized keys (first 5):', normalizedKeys.slice(0, 5));

  // Check for expected fields
  const expectedFields = [
    'tripduration',
    'starttime',
    'stoptime',
    'start station name',
    'end station name',
  ];

  console.log('\nChecking for expected fields:');
  let allFieldsPresent = true;
  for (const field of expectedFields) {
    const present = field in normalizedRow;
    console.log(`  ${present ? '✓' : '✗'} ${field}: ${present ? 'FOUND' : 'MISSING'}`);
    if (!present) allFieldsPresent = false;
  }

  if (!allFieldsPresent) {
    console.error('\n✗ ERROR: Some expected fields are missing');
    console.error('Available fields:', normalizedKeys);
    process.exit(1);
  }

  // Test field values
  console.log('\nTesting field values:');
  console.log('  tripduration:', normalizedRow['tripduration']);
  console.log('  starttime:', normalizedRow['starttime']);
  console.log('  start station name:', normalizedRow['start station name']);
  console.log('  end station name:', normalizedRow['end station name']);

  // Test numeric parsing
  const tripdur = Number(normalizedRow['tripduration']);
  console.log('\nNumeric parsing test:');
  console.log('  tripduration as number:', tripdur, isNaN(tripdur) ? '✗ NaN' : '✓ Valid');

  if (isNaN(tripdur)) {
    console.error('\n✗ ERROR: Numeric field parsing resulted in NaN');
    process.exit(1);
  }

  // Test date parsing
  const startTime = new Date(normalizedRow['starttime']);
  const stopTime = new Date(normalizedRow['stoptime']);
  console.log('\nDate parsing test:');
  console.log('  starttime:', startTime.toISOString());
  console.log('  stoptime:', stopTime.toISOString());
  console.log('  Year > 2000?', startTime.getFullYear() > 2000 ? '✓ Yes' : '✗ No');

  if (startTime.getFullYear() <= 2000) {
    console.error('\n✗ WARNING: Date parsing may have failed (year <= 2000)');
  }

  console.log('\n✓ ALL TESTS PASSED!');
  console.log('\nCSV parsing is working correctly.');
  console.log('The dataLoader should now be able to parse the CSV file successfully.');

} catch (error) {
  console.error('\n✗ TEST FAILED:', error.message);
  if (error.code === 'ENOENT') {
    console.error('  CSV file not found at:', CSV_PATH);
  }
  process.exit(1);
}
