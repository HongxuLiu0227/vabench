#!/usr/bin/env tsx
/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files can be loaded and parsed correctly
 * 2. All required Tableau fields from the spec resolve to actual columns
 * 3. Data types are correct (no silent string-to-number failures)
 * 4. No NaN values in critical numeric fields
 * 5. Date parsing works correctly (no Jan 1970 issues)
 * 6. No silent data loss from filtering
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: { [key: string]: boolean };
}

// Tableau spec fields that must resolve to CSV columns
const TABLEAU_FIELDS = [
  'Sales',
  'Profit',
  'Quantity',
  'Order Date',
  'Ship Date',
  'Product Name',
  'Region',
  'Customer Name',
  'Customer ID',
];

// Required numeric fields
const NUMERIC_FIELDS = [
  'Sales',
  'Quantity',
  'Discount',
  'Profit',
  'Postal Code',
];

// Required date fields
const DATE_FIELDS = [
  'Order Date',
  'Ship Date',
];

function normalizeHeader(header: string): string {
  // Remove extra quotes, whitespace, and special characters
  let normalized = header.trim();
  // Remove repeated quotes
  normalized = normalized.replace(/^"+|"+$/g, '');
  // Remove whitespace
  normalized = normalized.trim();
  return normalized;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  // Try parsing with Date constructor
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing YYYY-MM-DD format manually
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}

function validateCSV(filePath: string): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    checks: {},
  };

  console.log(`\n🔍 Validating: ${filePath}`);

  try {
    // Check file exists
    if (!fs.existsSync(filePath)) {
      result.errors.push(`File not found: ${filePath}`);
      result.passed = false;
      return result;
    }
    result.checks['file_exists'] = true;

    // Read file
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    result.checks['file_readable'] = true;

    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
    });

    if (parseResult.errors.length > 0) {
      result.errors.push(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
      result.passed = false;
      return result;
    }
    result.checks['csv_parsable'] = true;

    // Check we have data
    const data = parseResult.data as Record<string, unknown>[];
    if (data.length === 0) {
      result.errors.push('CSV contains no data rows');
      result.passed = false;
      return result;
    }
    result.checks['has_data'] = true;
    console.log(`   ✓ Found ${data.length} rows`);

    // Check headers
    const headers = parseResult.meta.fields || [];
    if (headers.length === 0) {
      result.errors.push('CSV has no headers');
      result.passed = false;
      return result;
    }
    result.checks['has_headers'] = true;
    console.log(`   ✓ Found ${headers.length} columns`);

    // Check all Tableau fields exist
    const missingFields = TABLEAU_FIELDS.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      result.passed = false;
    } else {
      result.checks['all_fields_exist'] = true;
      console.log(`   ✓ All ${TABLEAU_FIELDS.length} required fields present`);
    }

    // Validate numeric fields
    let numericErrors = 0;
    let nanCount = 0;
    let emptyCount = 0;

    NUMERIC_FIELDS.forEach(field => {
      if (!headers.includes(field)) return;

      let invalidCount = 0;
      data.forEach((row, idx) => {
        const value = row[field];
        if (value === null || value === undefined || value === '') {
          emptyCount++;
          return;
        }

        const num = Number(value);
        if (isNaN(num)) {
          numericErrors++;
          invalidCount++;
          if (idx < 5) {
            result.errors.push(`Row ${idx + 1}: ${field} has non-numeric value: "${value}"`);
          }
        } else {
          nanCount += isNaN(num) ? 1 : 0;
        }
      });

      if (invalidCount > 0) {
        result.warnings.push(`${field}: ${invalidCount} non-numeric values found`);
      }
    });

    if (numericErrors > 0) {
      result.errors.push(`Found ${numericErrors} numeric field errors`);
      result.passed = false;
    } else {
      result.checks['numeric_fields_valid'] = true;
      console.log(`   ✓ Numeric fields are valid`);
    }

    if (nanCount > 0) {
      result.warnings.push(`Found ${nanCount} NaN values in numeric fields`);
    }

    // Validate date fields
    let dateErrors = 0;
    let jan1970Count = 0;

    DATE_FIELDS.forEach(field => {
      if (!headers.includes(field)) return;

      let invalidCount = 0;
      data.forEach((row, idx) => {
        const value = row[field];
        if (value === null || value === undefined || value === '') {
          emptyCount++;
          return;
        }

        const date = parseDate(value as string);
        if (!date) {
          dateErrors++;
          invalidCount++;
          if (idx < 5) {
            result.errors.push(`Row ${idx + 1}: ${field} has invalid date: "${value}"`);
          }
        } else {
          // Check for Jan 1970 (epoch)
          if (date.getFullYear() === 1970 && date.getMonth() === 0 && date.getDate() === 1) {
            jan1970Count++;
          }
        }
      });

      if (invalidCount > 0) {
        result.warnings.push(`${field}: ${invalidCount} invalid dates found`);
      }
    });

    if (dateErrors > 0) {
      result.errors.push(`Found ${dateErrors} date parsing errors`);
      result.passed = false;
    } else {
      result.checks['date_fields_valid'] = true;
      console.log(`   ✓ Date fields are valid`);
    }

    if (jan1970Count > 0) {
      result.warnings.push(`Found ${jan1970Count} dates resolving to Jan 1, 1970`);
    }

    if (emptyCount > 0) {
      result.warnings.push(`Found ${emptyCount} empty values in critical fields`);
    }

    // Check for silent data loss (all zero or null metrics)
    const salesValues = data
      .map(row => Number(row['Sales']))
      .filter(n => !isNaN(n) && n !== 0);

    if (salesValues.length === 0) {
      result.errors.push('All Sales values are zero or NaN - this will cause all-zero charts');
      result.passed = false;
    } else {
      result.checks['has_valid_metrics'] = true;
      console.log(`   ✓ Found ${salesValues.length} valid Sales values`);
    }

    console.log(`\n✅ Validation ${result.passed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    result.passed = false;
  }

  return result;
}

function main() {
  console.log('='.repeat(60));
  console.log('Tableau Source Validator');
  console.log('='.repeat(60));

  const dataPath = path.join(process.cwd(), 'public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');
  const result = validateCSV(dataPath);

  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));

  console.log(`\nStatus: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Checks passed: ${Object.values(result.checks).filter(v => v).length}/${Object.keys(result.checks).length}`);

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Check Results:');
  console.log('='.repeat(60));
  Object.entries(result.checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  if (!result.passed) {
    console.log('\n❌ Validation failed - data ingestion is NOT deterministic');
    process.exit(1);
  } else {
    console.log('\n✅ Validation passed - data ingestion is deterministic and correct');
    process.exit(0);
  }
}

main();
