/**
 * Tableau Source Validator
 *
 * This script validates that the CSV data source can be parsed correctly
 * and that all required Tableau fields are present.
 *
 * Run with: npx tsx scripts/validate-tableau-source.ts
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_PATH = path.join(process.cwd(), 'public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');

interface OrderRow {
  [key: string]: string;
}

const REQUIRED_FIELDS = [
  'Row ID',
  'Order ID',
  'Order Date',
  'Ship Date',
  'Ship Mode',
  'Customer ID',
  'Customer Name',
  'Segment',
  'City, State',
  'Country',
  'Postal Code',
  'Market',
  'Region',
  'Product ID',
  'Category',
  'Sub-Category',
  'Product Name',
  'Sales',
  'Quantity',
  'Discount',
  'Profit',
  'Shipping Cost',
  'Order Priority',
];

function findHeaderRow(lines: string[]): number {
  // Expected column names that should appear in the header, in order
  // We check the first few columns to ensure we find the real header
  const expectedFirstColumns = ['Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse the line properly handling quoted fields
    const parseResult = Papa.parse<string[]>(line, {
      skipEmptyLines: false,
    });

    if (parseResult.errors.length > 0 || !parseResult.data[0]) {
      continue;
    }

    const columns = parseResult.data[0].map(col => normalizeHeader(col).trim());

    // Check if the first few columns match the expected pattern
    // We require at least 3 of the first 5 expected columns to match
    let matchCount = 0;
    for (let j = 0; j < Math.min(expectedFirstColumns.length, columns.length); j++) {
      if (columns[j] === expectedFirstColumns[j]) {
        matchCount++;
      }
    }

    // Require at least 3 matching columns to identify this as the header
    if (matchCount >= 3) {
      console.log(`Found header at row ${i + 1} (0-indexed: ${i}) with ${matchCount} matching columns`);
      return i;
    }
  }

  // Fallback: return 5th row (index 4) as that's where the header is in this dataset
  console.warn('Could not reliably detect header row, using fallback to row 5');
  return Math.min(4, lines.length - 1);
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/"+/g, '"')
    .trim();
}

async function validateTableauSource(): Promise<void> {
  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE VALIDATOR');
  console.log('='.repeat(60));
  console.log(`\nValidating: ${DATA_PATH}\n`);

  // Check if file exists
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ FAILED: File not found at ${DATA_PATH}`);
    process.exit(1);
  }
  console.log('✅ File exists');

  // Read file
  const csvText = fs.readFileSync(DATA_PATH, 'utf-8');
  const lines = csvText.split('\n');
  console.log(`✅ File loaded (${lines.length} lines)`);

  // Find header row
  const headerRowIndex = findHeaderRow(lines);
  console.log(`✅ Header row detected at index ${headerRowIndex} (line ${headerRowIndex + 1})`);

  if (headerRowIndex > 0) {
    console.log(`ℹ️  Skipped ${headerRowIndex} preamble rows`);
  }

  // Extract and normalize headers
  const headerLine = lines[headerRowIndex];
  const headerParseResult = Papa.parse<string[]>(headerLine, {
    skipEmptyLines: false,
  });
  const normalizedHeaders = headerParseResult.data[0].map(h => normalizeHeader(h));
  console.log(`✅ Headers normalized (${normalizedHeaders.length} columns)`);

  // Check for required fields
  const missingFields = REQUIRED_FIELDS.filter(field => !normalizedHeaders.includes(field));

  if (missingFields.length > 0) {
    console.error(`\n❌ FAILED: Missing required fields:`);
    missingFields.forEach(field => console.error(`   - ${field}`));
    console.error(`\nAvailable fields:`);
    normalizedHeaders.forEach(h => console.error(`   - ${h}`));
    process.exit(1);
  }
  console.log(`✅ All ${REQUIRED_FIELDS.length} required fields present`);

  // Parse data
  const dataLines = lines.slice(headerRowIndex + 1).filter(line => line.trim());

  // Reconstruct CSV with properly quoted headers
  const quotedHeaders = normalizedHeaders.map(h =>
    h.includes(',') ? `"${h}"` : h
  );
  const normalizedCsv = [quotedHeaders.join(','), ...dataLines].join('\n');

  const parseResult = Papa.parse<OrderRow>(normalizedCsv, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    console.error(`\n❌ FAILED: Parse errors detected:`);
    parseResult.errors.forEach(err => console.error(`   - ${err.message}`));
    process.exit(1);
  }
  console.log(`✅ Data parsed successfully (${parseResult.data.length} rows)`);

  // Validate data quality
  console.log('\n' + '='.repeat(60));
  console.log('DATA QUALITY CHECKS');
  console.log('='.repeat(60));

  const sampleRow = parseResult.data[0];
  let passedChecks = 0;
  let totalChecks = 0;

  // Check numeric fields can be parsed
  const numericFields = ['Sales', 'Quantity', 'Discount', 'Profit', 'Shipping Cost'];
  totalChecks++;
  const allNumericParsable = numericFields.every(field => {
    const value = sampleRow[field];
    return !isNaN(parseFloat(value));
  });
  if (allNumericParsable) {
    console.log('✅ Numeric fields are parsable');
    passedChecks++;
  } else {
    console.log('❌ Some numeric fields could not be parsed');
  }

  // Check for non-zero values
  totalChecks++;
  const rowsWithSales = parseResult.data.filter(row => parseFloat(row['Sales']) > 0);
  if (rowsWithSales.length > 0) {
    console.log(`✅ Found ${rowsWithSales.length} rows with non-zero sales`);
    passedChecks++;
  } else {
    console.log('❌ No rows with non-zero sales found');
  }

  // Check region diversity
  totalChecks++;
  const regions = new Set(parseResult.data.map(row => row['Region']));
  if (regions.size > 1) {
    console.log(`✅ Found ${regions.size} unique regions: ${Array.from(regions).join(', ')}`);
    passedChecks++;
  } else {
    console.log('❌ Only one region found in data');
  }

  // Check date format
  totalChecks++;
  const rowsWithValidDates = parseResult.data.filter(row => {
    const date = row['Order Date'];
    return date && date !== '' && date !== '1970-01-01';
  });
  if (rowsWithValidDates.length > parseResult.data.length * 0.9) {
    console.log(`✅ ${rowsWithValidDates.length} rows have valid dates`);
    passedChecks++;
  } else {
    console.log(`⚠️  Only ${rowsWithValidDates.length} rows have valid dates`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Passed: ${passedChecks}/${totalChecks} checks`);

  if (passedChecks === totalChecks) {
    console.log('\n✅ ALL VALIDATIONS PASSED\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME VALIDATIONS FAILED\n');
    process.exit(1);
  }
}

// Run validation
validateTableauSource().catch(error => {
  console.error('\n❌ Validation failed with error:', error.message);
  process.exit(1);
});
