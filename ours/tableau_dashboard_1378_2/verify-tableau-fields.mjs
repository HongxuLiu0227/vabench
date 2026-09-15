/**
 * Verify all Tableau spec fields resolve to runtime data
 * This checks that the fields referenced in tableau_spec.json
 * can be properly loaded from the CSV with header normalization
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { csvParse } from 'd3-dsv';

// Fields referenced in tableau_spec.json that need to resolve
const TABLEAU_SPEC_FIELDS = [
  // Base fields
  'DRG Definition',
  'Provider Id',
  'Provider Name',
  'Provider State',
  'Provider Street Address',
  'Provider City',
  'Provider Zip Code',
  'Hospital Referral Region Description',
  'Total Discharges ',
  'Average Covered Charges ',
  'Average Total Payments ',
  'Average Medicare Payments',
  'Provider Latitude',
  'Provider Longitude',
  'Census Region',
  'Census Region Division',
  'Federal Region',
  'Economic Analysis Region',

  // Computed/split fields (referenced in tooltips)
  'DRG Definition - Split 2',
  'Hospital Referral Region Description - Split 2',

  // Sepsis filter field
  'Sepsis',
];

function normalizeHeader(header) {
  return header
    .replace(/^\uFEFF/, '')  // Remove BOM
    .replace(/^"+|"+$/g, '')  // Remove surrounding quotes
    .trim();
}

function findHeader(actualHeaders, targetPattern) {
  // Try exact match first
  const exactMatch = actualHeaders.find(h => normalizeHeader(h) === targetPattern);
  if (exactMatch) return exactMatch;

  // Try partial match
  const partialMatch = actualHeaders.find(h =>
    normalizeHeader(h).includes(targetPattern.trim()) ||
    targetPattern.includes(normalizeHeader(h))
  );
  return partialMatch;
}

function main() {
  console.log('🔍 Tableau Spec Field Resolution Verification\n');

  try {
    // Load CSV
    const csvPath = resolve('./public/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
    const csvText = readFileSync(csvPath, 'utf-8');
    const rawRows = csvParse(csvText);

    if (rawRows.length === 0) {
      console.error('❌ Failed to parse CSV');
      process.exit(1);
    }

    const actualHeaders = Object.keys(rawRows[0]);
    console.log(`Loaded ${rawRows.length} rows with ${actualHeaders.length} columns\n`);

    // Check each field from Tableau spec
    console.log('=== Checking Tableau Spec Fields ===\n');

    const results = [];
    let allResolved = true;

    for (const field of TABLEAU_SPEC_FIELDS) {
      let found = false;
      let computed = false;
      let value = null;

      // Check if it's a computed field
      if (field === 'DRG Definition - Split 2') {
        const drgHeader = findHeader(actualHeaders, 'DRG Definition');
        if (drgHeader) {
          const sampleDrg = rawRows[0][drgHeader];
          const parts = sampleDrg.split(' - ');
          value = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : 'N/A';
          computed = true;
          found = true;
        }
      } else if (field === 'Hospital Referral Region Description - Split 2') {
        const hrrHeader = findHeader(actualHeaders, 'Hospital Referral Region');
        if (hrrHeader) {
          const sampleHRR = rawRows[0][hrrHeader];
          const parts = sampleHRR.split(' - ');
          value = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : 'N/A';
          computed = true;
          found = true;
        }
      } else if (field === 'Sepsis') {
        // Sepsis is a computed filter field
        const drgHeader = findHeader(actualHeaders, 'DRG Definition');
        if (drgHeader) {
          const sampleDrg = rawRows[0][drgHeader];
          // Sepsis DRG codes from data.ts
          const sepsisCodes = [
            '870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS',
            '871 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W MCC',
            '872 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W/O MCC',
          ];
          value = sepsisCodes.some(code => sampleDrg.includes(code)) ? 'true/false (filter)' : 'computed';
          computed = true;
          found = true;
        }
      } else {
        // Regular field - find in CSV
        const header = findHeader(actualHeaders, field);
        if (header) {
          found = true;
          value = rawRows[0][header];
          // Truncate long values
          if (String(value).length > 30) {
            value = String(value).substring(0, 30) + '...';
          }
        }
      }

      const status = found ? '✓' : '✗';
      const type = computed ? '[COMPUTED]' : '[DIRECT]  ';
      const displayValue = found ? `"${value}"` : 'MISSING';

      console.log(`${status} ${type} ${field.padEnd(50)} → ${displayValue}`);

      results.push({ field, found, computed, value });
      if (!found) allResolved = false;
    }

    console.log('\n=== Summary ===\n');

    const foundCount = results.filter(r => r.found).length;
    const totalCount = results.length;
    const computedCount = results.filter(r => r.computed).length;

    console.log(`Resolved ${foundCount}/${totalCount} fields (${computedCount} computed)`);

    if (allResolved) {
      console.log('\n✅ All Tableau spec fields resolve correctly!\n');
      console.log('Verified field mappings:');
      console.log('  • Base CSV columns: accessed with normalized headers');
      console.log('  • Split 2 fields: computed from base columns');
      console.log('  • Sepsis filter: computed from DRG Definition');
      process.exit(0);
    } else {
      console.error('\n❌ Some Tableau spec fields could not be resolved!\n');
      console.error('Missing fields:');
      results.filter(r => !r.found).forEach(r => {
        console.error(`  ✗ ${r.field}`);
      });
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
