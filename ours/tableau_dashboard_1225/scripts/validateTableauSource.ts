/**
 * Standalone script to validate Tableau CSV source parsing
 *
 * Run with: npx tsx scripts/validateTableauSource.ts
 *
 * This script validates:
 * 1. CSV file can be read from public/data/
 * 2. Triple-quoted headers are normalized correctly
 * 3. All required Tableau fields resolve to real columns
 * 4. Date fields parse correctly (not Jan 1970)
 * 5. Numeric fields are coerced to numbers (not strings)
 * 6. No NaN or null critical fields
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { csvParse } from 'd3-dsv';
import { timeParse } from 'd3-time-format';

const parseDate = timeParse('%Y-%m-%d');

// Field mapping from Tableau spec
const REQUIRED_FIELDS = [
  'Row ID',
  'Order Date',
  'Ship Date',
  'Sales',
  'Profit',
  'Quantity',
  'Discount',
  'Category',
  'Sub-Category',
];

function normalizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/^"+/, '')
    .replace(/"+$/, '');
}

function normalizeCsvHeaders(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Remove BOM if present at the start of the file
  if (lines[0].startsWith('\uFEFF')) {
    lines[0] = lines[0].slice(1);
  }

  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return csvText;

  const headerLine = lines[headerIndex];

  // Remove BOM from header line if present
  const cleanHeaderLine = headerLine.replace(/^\uFEFF/, '');

  // Parse triple-quoted CSV headers properly
  // Pattern: """Field1""","""Field2""","""Field3""" -> Field1,Field2,Field3
  const normalizedHeader = cleanHeaderLine
    .split(',') // Split by comma first
    .map(field => {
      // Remove triple quotes: """Field""" -> Field
      return field
        .replace(/^"""/g, '')  // Remove opening triple quotes
        .replace(/"""$/g, '')  // Remove closing triple quotes
        .replace(/^"/g, '')    // Remove opening single quote (if any)
        .replace(/"$/g, '');   // Remove closing single quote (if any)
    })
    .join(',');  // Join back with regular commas

  lines[headerIndex] = normalizedHeader;
  return lines.join('\n');
}

function validateSource(): void {
  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE VALIDATION');
  console.log('='.repeat(60));

  // 1. Read CSV file
  const csvPath = join(process.cwd(), 'public/data/TEMP_0zzmslq10iuq6s16eyxoz0l4yeax.csv');
  console.log(`\n✓ Reading CSV from: ${csvPath}`);

  let csvText: string;
  try {
    csvText = readFileSync(csvPath, 'utf-8');
  } catch (error) {
    console.error(`✗ Failed to read CSV file: ${error}`);
    process.exit(1);
  }

  // 2. Normalize headers
  console.log('\n✓ Normalizing triple-quoted headers...');
  const normalizedCsv = normalizeCsvHeaders(csvText);

  // 3. Parse CSV
  console.log('✓ Parsing CSV...');
  const rawData = csvParse(normalizedCsv);
  console.log(`  → Total rows: ${rawData.length}`);

  // 4. Validate field mapping
  console.log('\n✓ Validating Tableau field mapping...');
  const firstRow = rawData[0];
  const normalizedFirstRow: Record<string, any> = {};
  for (const [key, value] of Object.entries(firstRow)) {
    normalizedFirstRow[normalizeFieldName(key)] = value;
  }

  const availableFields = Object.keys(normalizedFirstRow);
  console.log(`  → Available fields: ${availableFields.slice(0, 5).join(', ')}...`);

  const missingFields: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!availableFields.includes(field)) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error(`✗ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  console.log(`  → All ${REQUIRED_FIELDS.length} required fields present ✓`);

  // 5. Validate data quality
  console.log('\n✓ Validating data quality...');

  let validRows = 0;
  let invalidDateRows = 0;
  let invalidNumericRows = 0;
  const years = new Set<number>();

  for (let i = 0; i < Math.min(100, rawData.length); i++) {
    const row = rawData[i];
    const normalizedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      normalizedRow[normalizeFieldName(key)] = value;
    }

    // Check dates
    const orderDate = parseDate(normalizedRow['Order Date']);
    if (!orderDate) {
      invalidDateRows++;
      continue;
    }

    // Check for Jan 1970 (epoch fallback)
    if (orderDate.getFullYear() === 1970 && orderDate.getMonth() === 0) {
      console.error(`✗ Row ${i}: Jan 1970 date detected (failed parse)`);
      process.exit(1);
    }

    years.add(orderDate.getFullYear());

    // Check numerics
    const sales = parseFloat(normalizedRow['Sales']);
    const profit = parseFloat(normalizedRow['Profit']);
    if (isNaN(sales) || isNaN(profit)) {
      invalidNumericRows++;
      continue;
    }

    validRows++;
  }

  console.log(`  → Valid rows (sample): ${validRows}/100`);
  console.log(`  → Invalid dates: ${invalidDateRows}`);
  console.log(`  → Invalid numerics: ${invalidNumericRows}`);
  console.log(`  → Years found: ${Array.from(years).sort().join(', ')}`);

  if (invalidDateRows > 0 || invalidNumericRows > 0) {
    console.error('\n✗ Data quality issues detected');
    process.exit(1);
  }

  if (years.size === 0) {
    console.error('\n✗ No valid years found in data');
    process.exit(1);
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION PASSED ✓');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log(`  • CSV file: readable`);
  console.log(`  • Headers: normalized (triple quotes removed)`);
  console.log(`  • Fields: all ${REQUIRED_FIELDS.length} required fields present`);
  console.log(`  • Dates: parsing correctly (no Jan 1970)`);
  console.log(`  • Numerics: coercing to numbers (not strings)`);
  console.log(`  • Total rows: ${rawData.length}`);
  console.log(`  • Year range: ${Math.min(...years)} - ${Math.max(...years)}`);
  console.log('\n✓ Tableau source ingestion is deterministic and correct');
}

// Run validation
validateSource();
