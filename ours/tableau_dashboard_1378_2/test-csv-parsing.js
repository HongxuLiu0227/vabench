/**
 * Test script to verify CSV parsing works correctly
 * Run with: node test-csv-parsing.js
 */

import * as d3 from 'd3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIELD_MAPPING = {
  drgDefinition: [
    '\uFEFF"""DRG Definition"""',  // BOM + 4 quotes (actual format found)
    '"""DRG Definition"""',         // 3 quotes
    '"DRG Definition"',             // 2 quotes
    'DRG Definition'                // No quotes
  ],
  providerId: ['"""Provider Id"""', '"Provider Id"', 'Provider Id'],
  providerName: ['"""Provider Name"""', '"Provider Name"', 'Provider Name'],
  providerState: ['"""Provider State"""', '"Provider State"', 'Provider State'],
  providerCity: ['"""Provider City"""', '"Provider City"', 'Provider City'],
  hospitalReferralRegion: [
    '"""Hospital Referral Region Description"""',
    '"Hospital Referral Region Description"',
    'Hospital Referral Region Description'
  ],
  totalDischarges: ['"""Total Discharges """', '"Total Discharges "', 'Total Discharges '],
  averageCoveredCharges: ['"""Average Covered Charges """', '"Average Covered Charges "', 'Average Covered Charges '],
  averageTotalPayments: ['"""Average Total Payments """', '"Average Total Payments "', 'Average Total Payments '],
  averageMedicarePayments: ['"""Average Medicare Payments"""', '"Average Medicare Payments"', 'Average Medicare Payments'],
  latitude: ['"""Provider Latitude"""', '"Provider Latitude"', 'Provider Latitude'],
  longitude: ['"""Provider Longitude"""', '"Provider Longitude"', 'Provider Longitude'],
};

function buildHeaderMapping(actualHeaders) {
  const mapping = new Map();

  for (const [fieldName, possibleHeaders] of Object.entries(FIELD_MAPPING)) {
    // Try exact match first
    for (const header of possibleHeaders) {
      if (actualHeaders.includes(header)) {
        mapping.set(fieldName, header);
        break;
      }
    }

    // If no exact match, try fuzzy matching
    if (!mapping.has(fieldName)) {
      const normalizedFieldName = fieldName.toLowerCase()
        .replace(/\s+/g, '');

      for (const actualHeader of actualHeaders) {
        // Normalize actual header: remove BOM, quotes, and spaces
        const normalizedActual = actualHeader
          .replace(/^\uFEFF/, '')  // Remove BOM
          .toLowerCase()
          .replace(/["\s]/g, '');

        // Check for match
        if (
          normalizedActual === normalizedFieldName ||
          actualHeader.includes(fieldName) ||
          normalizedActual.includes('drgdefinition') && fieldName === 'drgDefinition' ||
          normalizedActual.includes('providerid') && fieldName === 'providerId' ||
          normalizedActual.includes('providername') && fieldName === 'providerName' ||
          normalizedActual.includes('providerstate') && fieldName === 'providerState' ||
          normalizedActual.includes('providercity') && fieldName === 'providerCity' ||
          normalizedActual.includes('hospitalreferralregion') && fieldName === 'hospitalReferralRegion' ||
          normalizedActual.includes('totaldischarges') && fieldName === 'totalDischarges' ||
          normalizedActual.includes('averagecoveredcharges') && fieldName === 'averageCoveredCharges' ||
          normalizedActual.includes('averagetotalpayments') && fieldName === 'averageTotalPayments' ||
          normalizedActual.includes('averagemedicarepayments') && fieldName === 'averageMedicarePayments' ||
          normalizedActual.includes('providerlatitude') && fieldName === 'latitude' ||
          normalizedActual.includes('providerlongitude') && fieldName === 'longitude'
        ) {
          mapping.set(fieldName, actualHeader);
          console.log(`Fuzzy matched: ${fieldName} -> "${actualHeader}"`);
          break;
        }
      }
    }
  }

  return mapping;
}

function cleanFieldName(value) {
  if (!value) return '';
  return value.replace(/^"+|"+$/g, '').trim();
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

function main() {
  try {
    const csvPath = resolve('./public/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
    console.log('Testing CSV parsing:', csvPath);

    const csvText = readFileSync(csvPath, 'utf-8');
    const rawRows = d3.csvParse(csvText);

    console.log(`\nTotal rows parsed: ${rawRows.length}`);

    if (rawRows.length === 0) {
      console.error('ERROR: No rows parsed from CSV!');
      process.exit(1);
    }

    const actualHeaders = Object.keys(rawRows[0]);
    console.log('\nActual headers found:');
    actualHeaders.forEach(h => console.log(`  - "${h}"`));

    const headerMap = buildHeaderMapping(actualHeaders);
    console.log('\nHeader mapping:');
    for (const [field, header] of headerMap) {
      console.log(`  ${field} -> "${header}"`);
    }

    // Check for missing fields
    const requiredFields = ['drgDefinition', 'providerId', 'providerName', 'providerState', 'hospitalReferralRegion'];
    const missingFields = requiredFields.filter(f => !headerMap.has(f));

    if (missingFields.length > 0) {
      console.error('\nERROR: Missing required fields:', missingFields);
      process.exit(1);
    }

    // Test split fields computation
    console.log('\nTesting split fields computation:');
    const sampleRow = rawRows[0];
    const hospitalRegion = cleanFieldName(sampleRow[headerMap.get('hospitalReferralRegion')] || '');
    console.log(`  Hospital Referral Region: "${hospitalRegion}"`);

    // Extract second part (Split 2)
    const parts = hospitalRegion.split(' - ');
    const hospitalRegionSplit2 = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : hospitalRegion;
    console.log(`  Hospital Referral Region - Split 2: "${hospitalRegionSplit2}"`);

    const drg = cleanFieldName(sampleRow[headerMap.get('drgDefinition')] || '');
    console.log(`  DRG Definition: "${drg.substring(0, 50)}..."`);

    const drgParts = drg.split(' - ');
    const drgSplit2 = drgParts.length >= 2 ? drgParts.slice(1).join(' - ').trim() : drg;
    console.log(`  DRG Definition - Split 2: "${drgSplit2.substring(0, 50)}..."`);

    // Test parsing first few rows
    console.log('\nSample parsed rows:');
    for (let i = 0; i < Math.min(3, rawRows.length); i++) {
      const row = rawRows[i];
      const drg = cleanFieldName(row[headerMap.get('drgDefinition')] || '');
      const name = cleanFieldName(row[headerMap.get('providerName')] || '');
      const state = cleanFieldName(row[headerMap.get('providerState')] || '');
      const discharges = parseNumber(row[headerMap.get('totalDischarges')] || '0');
      const charges = parseNumber(row[headerMap.get('averageCoveredCharges')] || '0');
      const payments = parseNumber(row[headerMap.get('averageTotalPayments')] || '0');
      const lat = parseNumber(row[headerMap.get('latitude')] || '0');
      const lon = parseNumber(row[headerMap.get('longitude')] || '0');

      console.log(`\nRow ${i + 1}:`);
      console.log(`  DRG: ${drg.substring(0, 60)}...`);
      console.log(`  Provider: ${name}`);
      console.log(`  State: ${state}`);
      console.log(`  Discharges: ${discharges}`);
      console.log(`  Charges: $${charges.toLocaleString()}`);
      console.log(`  Payments: $${payments.toLocaleString()}`);
      console.log(`  Coordinates: (${lat}, ${lon})`);
    }

    console.log('\n✅ CSV parsing test PASSED!');
  } catch (error) {
    console.error('\n❌ CSV parsing test FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
