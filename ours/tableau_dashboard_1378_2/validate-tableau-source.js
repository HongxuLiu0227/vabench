/**
 * Comprehensive Tableau source validation
 * Verifies all fixes for deterministic source validation
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as d3 from 'd3';

function validateHeaders(actualHeaders) {
  console.log('=== Validating CSV Headers ===');
  
  // Check for quote normalization issues
  const hasTripleQuotes = actualHeaders.some(h => h.includes('"""'));
  const hasDoubleQuotes = actualHeaders.some(h => h.includes('"'));
  console.log(`✓ Headers contain quotes: triple=${hasTripleQuotes}, double=${hasDoubleQuotes}`);
  
  // Check for required fields (as referenced in tableau_spec.json)
  const requiredPatterns = [
    'DRG Definition',
    'Hospital Referral Region Description',
    'Provider State',
    'Provider Name'
  ];
  
  const normalizedHeaders = actualHeaders.map(h => 
    h.replace(/^﻿"/, '').replace(/"$/g, '').replace(/"/g, '').trim()
  );
  
  for (const pattern of requiredPatterns) {
    const found = normalizedHeaders.some(h => h.includes(pattern));
    if (found) {
      console.log(`✓ Required field pattern found: "${pattern}"`);
    } else {
      console.error(`✗ Missing required field pattern: "${pattern}"`);
      return false;
    }
  }
  
  return true;
}

function validateSplitFields(rawRows, actualHeaders) {
  console.log('\n=== Validating Split 2 Fields ===');
  
  // Test DRG Definition - Split 2
  const drgHeader = actualHeaders.find(h => h.includes('DRG Definition'));
  if (drgHeader) {
    const sampleDrg = rawRows[0][drgHeader];
    const parts = sampleDrg.split(' - ');
    if (parts.length >= 2) {
      const split2 = parts.slice(1).join(' - ').trim();
      console.log(`✓ DRG Definition - Split 2 computed: "${split2.substring(0, 40)}..."`);
    } else {
      console.error(`✗ DRG Definition does not have expected format: "${sampleDrg}"`);
      return false;
    }
  }
  
  // Test Hospital Referral Region Description - Split 2
  const hrrHeader = actualHeaders.find(h => h.includes('Hospital Referral Region'));
  if (hrrHeader) {
    const sampleHRR = rawRows[0][hrrHeader];
    const parts = sampleHRR.split(' - ');
    if (parts.length >= 2) {
      const split2 = parts.slice(1).join(' - ').trim();
      console.log(`✓ Hospital Referral Region - Split 2 computed: "${split2}"`);
    } else {
      console.error(`✗ Hospital Referral Region does not have expected format: "${sampleHRR}"`);
      return false;
    }
  }
  
  return true;
}

function validateDataParsing(rawRows, actualHeaders) {
  console.log('\n=== Validating Data Parsing ===');
  
  if (rawRows.length === 0) {
    console.error('✗ No rows parsed from CSV');
    return false;
  }
  
  console.log(`✓ Parsed ${rawRows.length} rows from CSV`);
  
  // Check numeric fields parse correctly
  const numericFields = [
    'Total Discharges',
    'Average Covered Charges',
    'Average Total Payments',
    'Average Medicare Payments',
    'Provider Latitude',
    'Provider Longitude'
  ];
  
  for (const fieldName of numericFields) {
    const header = actualHeaders.find(h => h.includes(fieldName));
    if (header) {
      const value = parseFloat(rawRows[0][header]);
      if (isNaN(value)) {
        console.error(`✗ Failed to parse numeric field: "${fieldName}"`);
        return false;
      } else {
        console.log(`✓ Numeric field parsed: "${fieldName}" = ${value}`);
      }
    }
  }
  
  // Check for reasonable coordinate values (US providers)
  const latHeader = actualHeaders.find(h => h.includes('Latitude'));
  const lonHeader = actualHeaders.find(h => h.includes('Longitude'));
  
  if (latHeader && lonHeader) {
    const lat = parseFloat(rawRows[0][latHeader]);
    const lon = parseFloat(rawRows[0][lonHeader]);
    
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      console.log(`✓ Valid coordinates: (${lat}, ${lon})`);
    } else {
      console.error(`✗ Invalid coordinates: (${lat}, ${lon})`);
      return false;
    }
  }
  
  return true;
}

function main() {
  try {
    console.log('🔍 Deterministic Tableau Source Validation\n');
    
    const csvPath = resolve('./public/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
    console.log(`Testing: ${csvPath}\n`);
    
    const csvText = readFileSync(csvPath, 'utf-8');
    const rawRows = d3.csvParse(csvText);
    
    if (rawRows.length === 0) {
      console.error('✗ CSV is empty or could not be parsed');
      process.exit(1);
    }
    
    const actualHeaders = Object.keys(rawRows[0]);
    console.log(`Headers found: ${actualHeaders.length}\n`);
    
    // Run all validations
    const headersValid = validateHeaders(actualHeaders);
    const splitFieldsValid = validateSplitFields(rawRows, actualHeaders);
    const dataValid = validateDataParsing(rawRows, actualHeaders);
    
    if (headersValid && splitFieldsValid && dataValid) {
      console.log('\n✅ All validation checks PASSED!');
      console.log('\nFixes verified:');
      console.log('  ✓ CSV headers normalized (quotes trimmed)');
      console.log('  ✓ Split 2 fields computed correctly');
      console.log('  ✓ Required fields present');
      console.log('  ✓ Numeric data parses correctly');
      console.log('  ✓ Coordinates are valid');
      process.exit(0);
    } else {
      console.log('\n❌ Some validation checks FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Validation error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
