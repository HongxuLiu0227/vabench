// Validation script for CSV parsing
// This can be run with: npx tsx scripts/validateData.ts

import { csvParse } from 'd3-dsv';
import * as fs from 'fs';

interface RawRecord {
  [key: string]: string;
}

function findFieldKey(row: Record<string, string>, fieldName: string): string | undefined {
  const keys = Object.keys(row);

  // Try exact match first
  if (keys.includes(fieldName)) return fieldName;

  // Try with triple quotes
  const tripleQuoted = `"""${fieldName}"""`;
  if (keys.includes(tripleQuoted)) return tripleQuoted;

  // Try with single quotes
  const singleQuoted = `"${fieldName}"`;
  if (keys.includes(singleQuoted)) return singleQuoted;

  // Try normalized (strip all quotes and trim)
  const normalizedFieldName = fieldName.replace(/"/g, '').trim();
  for (const key of keys) {
    const normalizedKey = key.replace(/"/g, '').trim();
    if (normalizedKey === normalizedFieldName) {
      return key;
    }
  }

  return undefined;
}

function parseDiagnosis(drgDefinition: string): string {
  if (!drgDefinition) return 'Unknown';

  const parts = drgDefinition.split(' - ');
  if (parts.length > 1) {
    return parts[1].trim();
  }

  const match = drgDefinition.match(/^\d+\s*-\s*(.+)$/);
  if (match) {
    return match[1].trim();
  }

  return drgDefinition.trim();
}

async function validateCSV() {
  console.log('🔍 Starting CSV validation...\n');

  const csvPath = './public/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv';
  const csvText = fs.readFileSync(csvPath, 'utf8');

  // Step 1: Check BOM
  console.log('Step 1: Checking BOM');
  let text = csvText;
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
    console.log('  ✓ Removed UTF-8 BOM\n');
  } else {
    console.log('  ✓ No BOM detected\n');
  }

  // Step 2: Parse CSV
  console.log('Step 2: Parsing CSV with d3-dsv');
  const rawData = csvParse(text) as RawRecord[];
  console.log(`  ✓ Parsed ${rawData.length} rows\n`);

  // Step 3: Check fields
  console.log('Step 3: Analyzing fields');
  const firstRow = rawData[0];
  const fields = Object.keys(firstRow);
  console.log(`  ✓ Found ${fields.length} fields`);
  console.log('  Fields:', fields.slice(0, 5).join(', '), '...\n');

  // Step 4: Map expected fields
  console.log('Step 4: Mapping expected fields');
  const expectedFields = [
    'DRG Definition',
    'Total Discharges ',
    'Average Covered Charges ',
    'Average Total Payments ',
    'Average Medicare Payments'
  ];

  const fieldMapping: Record<string, string> = {};
  for (const field of expectedFields) {
    const key = findFieldKey(firstRow, field);
    if (key) {
      fieldMapping[field] = key;
      console.log(`  ✓ "${field}" -> "${key}"`);
    } else {
      console.log(`  ✗ "${field}" -> NOT FOUND`);
    }
  }
  console.log();

  // Step 5: Test data extraction
  console.log('Step 5: Testing data extraction');
  const sampleRow = rawData[0];
  const drgDef = sampleRow[fieldMapping['DRG Definition']] || '';
  const diagnosis = parseDiagnosis(drgDef);
  const discharges = parseFloat(sampleRow[fieldMapping['Total Discharges ']] || '0');
  const covered = parseFloat(sampleRow[fieldMapping['Average Covered Charges ']] || '0');

  console.log(`  DRG Definition: "${drgDef}"`);
  console.log(`  Extracted diagnosis: "${diagnosis}"`);
  console.log(`  Total Discharges: ${discharges}`);
  console.log(`  Average Covered Charges: ${covered}\n`);

  // Step 6: Test aggregation
  console.log('Step 6: Testing aggregation');
  const grouped = new Map<string, number>();

  // Process first 1000 rows for speed
  const testLimit = Math.min(1000, rawData.length);
  for (let i = 0; i < testLimit; i++) {
    const row = rawData[i];
    const drgDef = row[fieldMapping['DRG Definition']] || '';
    const diagnosis = parseDiagnosis(drgDef);

    if (!grouped.has(diagnosis)) {
      grouped.set(diagnosis, 0);
    }
    grouped.set(diagnosis, grouped.get(diagnosis)! + 1);
  }

  console.log(`  ✓ Processed ${testLimit} rows`);
  console.log(`  ✓ Found ${grouped.size} unique diagnoses in sample\n`);

  // Show top 5 diagnoses
  console.log('Top 5 diagnoses by count:');
  const sorted = Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  sorted.forEach(([diag, count]) => {
    console.log(`  ${count}x - ${diag.substring(0, 50)}${diag.length > 50 ? '...' : ''}`);
  });

  console.log('\n✅ CSV validation complete!');
}

validateCSV().catch(console.error);
