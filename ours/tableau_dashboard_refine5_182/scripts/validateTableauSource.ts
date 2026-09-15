/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that the CSV data is being parsed correctly and
 * that all required Tableau fields from the spec contract resolve to real columns.
 *
 * Run with: npx tsx scripts/validateTableauSource.ts
 */

import { csvParse } from 'd3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(
  process.cwd(),
  'public/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv'
);

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    headerCount: number;
    numericFieldsStats: Record<string, { nonZeroCount: number; sum: number; min: number; max: number }>;
  };
}

/**
 * Normalizes header name by removing BOM, quotes, and whitespace
 */
function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove UTF-8 BOM
    .trim()
    .replace(/^"+|"+$/g, ''); // Remove surrounding quotes
}

/**
 * Safely parses a numeric value
 */
function safeParseNumber(value: string | undefined | null): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = Number(String(value).trim());
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates that all required Tableau fields from the spec are present
 */
function validateTableauFields(headers: string[]): string[] {
  const errors: string[] = [];

  // Required fields based on tableau_spec.json worksheets
  const requiredFields = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Ship Mode',
    'Customer ID',
    'Customer Name',
    'Segment',
    'Country',
    'City',
    'State',
    'Postal Code',
    'Region',
    'Product ID',
    'Category',
    'Sub-Category',
    'Product Name',
    'Sales',
    'Quantity',
    'Discount',
    'Profit',
  ];

  const normalizedHeaders = new Set(headers.map(normalizeHeaderName));

  for (const field of requiredFields) {
    const normalized = normalizeHeaderName(field);
    if (!normalizedHeaders.has(normalized)) {
      errors.push(`Missing required field: "${field}" (normalized: "${normalized}")`);
    }
  }

  return errors;
}

/**
 * Validates numeric fields to ensure they have meaningful data
 */
function validateNumericFields(
  data: Record<string, string>[],
  headers: string[]
): Record<string, { nonZeroCount: number; sum: number; min: number; max: number }> {
  const numericFields = ['Sales', 'Quantity', 'Discount', 'Profit', 'Row ID', 'Postal Code'];
  const stats: Record<string, { nonZeroCount: number; sum: number; min: number; max: number }> = {};

  // Build a mapping from normalized field name to actual header name
  const headerMap = new Map<string, string>();
  for (const header of headers) {
    const normalized = normalizeHeaderName(header);
    headerMap.set(normalized, header);
  }

  for (const field of numericFields) {
    let nonZeroCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    // Get the actual header name (with or without BOM)
    const actualHeader = headerMap.get(normalizeHeaderName(field)) || field;

    for (const row of data) {
      const value = safeParseNumber(row[actualHeader]);
      sum += value;

      if (value !== 0) {
        nonZeroCount++;
      }

      if (value < min) min = value;
      if (value > max) max = value;
    }

    stats[field] = {
      nonZeroCount,
      sum,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }

  return stats;
}

/**
 * Main validation function
 */
function validateTableauSource(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: 0,
      headerCount: 0,
      numericFieldsStats: {},
    },
  };

  try {
    console.log('🔍 Reading CSV file...');
    const csvText = readFileSync(DATA_PATH, 'utf-8');

    // Check for and report BOM
    if (csvText.charCodeAt(0) === 0xFEFF) {
      console.log('ℹ️  UTF-8 BOM detected at start of file');
    }

    console.log('📊 Parsing CSV...');
    const data = csvParse(csvText);

    result.stats.totalRows = data.length;
    result.stats.headerCount = Object.keys(data[0] || {}).length;

    console.log(`   Total rows: ${result.stats.totalRows}`);
    console.log(`   Header count: ${result.stats.headerCount}`);

    if (data.length === 0) {
      result.errors.push('CSV file is empty or could not be parsed');
      result.isValid = false;
      return result;
    }

    // Get headers
    const headers = Object.keys(data[0]);
    console.log('📋 Headers:', headers);

    // Validate required Tableau fields
    console.log('\n🔑 Validating required Tableau fields...');
    const fieldErrors = validateTableauFields(headers);
    result.errors.push(...fieldErrors);

    if (fieldErrors.length > 0) {
      result.isValid = false;
    } else {
      console.log('✅ All required Tableau fields are present');
    }

    // Validate numeric fields
    console.log('\n🔢 Validating numeric fields...');
    result.stats.numericFieldsStats = validateNumericFields(data, headers);

    for (const [field, stats] of Object.entries(result.stats.numericFieldsStats)) {
      console.log(`   ${field}:`);
      console.log(`      Non-zero count: ${stats.nonZeroCount}/${result.stats.totalRows}`);
      console.log(`      Sum: ${stats.sum.toFixed(2)}`);
      console.log(`      Min: ${stats.min}, Max: ${stats.max}`);

      // Warning if all values are zero
      if (stats.nonZeroCount === 0 && field !== 'Discount') {
        result.warnings.push(`Field "${field}" has all zero values - may indicate parsing issue`);
      }

      // Error if sum is NaN or Infinity
      if (!isFinite(stats.sum)) {
        result.errors.push(`Field "${field}" has invalid sum: ${stats.sum}`);
        result.isValid = false;
      }
    }

    // Check for common data quality issues
    console.log('\n🔍 Checking for data quality issues...');

    // Check for Jan 1970 dates (epoch zero - indicates date parsing failure)
    let jan1970Count = 0;
    let invalidDateCount = 0;
    for (const row of data) {
      const orderDateStr = row['Order Date'];
      if (!orderDateStr || orderDateStr.trim() === '') {
        invalidDateCount++;
        continue;
      }
      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) {
        invalidDateCount++;
      } else if (orderDate.getFullYear() === 1970 && orderDate.getMonth() === 0 && orderDate.getDate() === 1) {
        jan1970Count++;
      }
    }
    if (jan1970Count > 0) {
      result.warnings.push(`Found ${jan1970Count} rows with Order Date in Jan 1970 - indicates date parsing failure`);
    }
    if (invalidDateCount > 0) {
      result.warnings.push(`Found ${invalidDateCount} rows with invalid Order Date`);
    }

    // Check for empty critical fields
    let emptyRegionCount = 0;
    let emptyProductNameCount = 0;
    for (const row of data) {
      if (!row['Region'] || row['Region'].trim() === '') emptyRegionCount++;
      if (!row['Product Name'] || row['Product Name'].trim() === '') emptyProductNameCount++;
    }
    if (emptyRegionCount > 0) {
      result.warnings.push(`Found ${emptyRegionCount} rows with empty Region field`);
    }
    if (emptyProductNameCount > 0) {
      result.warnings.push(`Found ${emptyProductNameCount} rows with empty Product Name field`);
    }

  } catch (error) {
    result.errors.push(`Validation failed with error: ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
}

// Run validation
console.log('='.repeat(70));
console.log('Tableau Source Validator');
console.log('='.repeat(70));
console.log();

const result = validateTableauSource();

console.log('\n' + '='.repeat(70));
console.log('Validation Results');
console.log('='.repeat(70));

if (result.isValid) {
  console.log('✅ VALIDATION PASSED\n');
} else {
  console.log('❌ VALIDATION FAILED\n');
}

if (result.errors.length > 0) {
  console.log('Errors:');
  result.errors.forEach(err => console.log(`  ❌ ${err}`));
  console.log();
}

if (result.warnings.length > 0) {
  console.log('Warnings:');
  result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
  console.log();
}

console.log('Summary Statistics:');
console.log(`  Total rows: ${result.stats.totalRows}`);
console.log(`  Header count: ${result.stats.headerCount}`);
console.log(`  Errors: ${result.errors.length}`);
console.log(`  Warnings: ${result.warnings.length}`);

console.log('\n' + '='.repeat(70));

// Exit with appropriate code
process.exit(result.isValid ? 0 : 1);
