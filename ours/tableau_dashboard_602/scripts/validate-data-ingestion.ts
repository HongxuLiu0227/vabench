#!/usr/bin/env tsx
/**
 * Tableau Source Ingestion Validator
 *
 * This script validates that:
 * 1. CSV data can be loaded from the public/data directory
 * 2. Headers are correctly parsed (no preamble rows)
 * 3. Required fields exist and contain valid data
 * 4. Data types are correctly coerced
 * 5. No silent parse failures (NaN, null, undefined)
 */

import { csvParse } from 'd3-dsv';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'public/data/1InsuranceRates.csv');

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    fields: string[];
    ageRange: { min: number; max: number };
    genders: string[];
    premiumRange: { min: number; max: number };
  };
}

function validateCSVContent(csvText: string): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      validRows: 0,
      fields: [],
      ageRange: { min: Infinity, max: -Infinity },
      genders: [],
      premiumRange: { min: Infinity, max: -Infinity },
    },
  };

  // Parse CSV
  let parsedData;
  try {
    parsedData = csvParse(csvText);
  } catch (error) {
    result.success = false;
    result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }

  // Check for preamble rows (non-standard headers)
  const expectedHeaders = ['Age', 'Gender', 'Set 1', '6-month premium'];
  const actualHeaders = parsedData.columns;

  if (actualHeaders.length !== expectedHeaders.length) {
    result.errors.push(
      `Header count mismatch: expected ${expectedHeaders.length} columns, got ${actualHeaders.length}`
    );
  }

  // Check for quoted/dirty headers
  const cleanHeaders = actualHeaders.map((h) => h.replace(/^["']+|["']+$/g, '').trim());
  const headerIssues: string[] = [];

  expectedHeaders.forEach((expected, idx) => {
    const actual = actualHeaders[idx];
    const clean = cleanHeaders[idx];

    if (actual !== expected) {
      if (clean === expected) {
        headerIssues.push(
          `Header "${actual}" appears to be quoted or has extra whitespace (normalized to "${expected}")`
        );
      } else {
        result.errors.push(
          `Header mismatch at position ${idx}: expected "${expected}", got "${actual}"`
        );
      }
    }
  });

  if (headerIssues.length > 0) {
    headerIssues.forEach((issue) => result.warnings.push(issue));
  }

  result.summary.fields = actualHeaders;

  // Normalize headers (same logic as the runtime loader)
  const normalizeHeader = (header: string): string => {
    return header
      .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
      .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
      .trim(); // Remove leading/trailing whitespace
  };

  const normalizeRowHeaders = (row: any): Record<string, string> => {
    const normalized: Record<string, string> = {};
    Object.keys(row).forEach((key) => {
      const normalizedKey = normalizeHeader(key);
      normalized[normalizedKey] = row[key];
    });
    return normalized;
  };

  // Validate data rows
  const data = parsedData.map((d: any) => {
    // Normalize headers to match runtime behavior
    const normalizedRow = normalizeRowHeaders(d);

    const age = Number(normalizedRow.Age);
    const gender = normalizedRow.Gender?.trim();
    const set1 = normalizedRow['Set 1']?.trim();
    const premium = Number(normalizedRow['6-month premium']);

    return {
      age,
      gender,
      set1,
      premium,
      rawAge: normalizedRow.Age,
      rawGender: normalizedRow.Gender,
      rawSet1: normalizedRow['Set 1'],
      rawPremium: normalizedRow['6-month premium'],
    };
  });

  result.summary.totalRows = data.length;

  const validRows: typeof data = [];
  const ages = new Set<number>();
  const genders = new Set<string>();

  data.forEach((row, idx) => {
    const rowErrors: string[] = [];

    // Check Age
    if (isNaN(row.age)) {
      rowErrors.push(`Age is NaN for row ${idx + 1} (raw value: "${row.rawAge}")`);
    } else if (row.age < 0 || row.age > 150) {
      rowErrors.push(`Age out of reasonable range for row ${idx + 1}: ${row.age}`);
    } else {
      result.summary.ageRange.min = Math.min(result.summary.ageRange.min, row.age);
      result.summary.ageRange.max = Math.max(result.summary.ageRange.max, row.age);
      ages.add(row.age);
    }

    // Check Gender
    if (!row.gender) {
      rowErrors.push(`Gender is missing for row ${idx + 1}`);
    } else if (row.gender !== 'Male' && row.gender !== 'Female') {
      result.warnings.push(
        `Unexpected gender value "${row.gender}" in row ${idx + 1} (expected "Male" or "Female")`
      );
      genders.add(row.gender);
    } else {
      genders.add(row.gender);
    }

    // Check Set 1
    if (!row.set1) {
      rowErrors.push(`Set 1 is missing for row ${idx + 1}`);
    }

    // Check Premium
    if (isNaN(row.premium)) {
      rowErrors.push(`Premium is NaN for row ${idx + 1} (raw value: "${row.rawPremium}")`);
    } else if (row.premium < 0) {
      rowErrors.push(`Premium is negative for row ${idx + 1}: ${row.premium}`);
    } else {
      result.summary.premiumRange.min = Math.min(result.summary.premiumRange.min, row.premium);
      result.summary.premiumRange.max = Math.max(result.summary.premiumRange.max, row.premium);
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((err) => result.errors.push(err));
    } else {
      validRows.push(row);
    }
  });

  result.summary.validRows = validRows.length;
  result.summary.genders = Array.from(genders).sort();

  // Check for silent failures
  if (result.summary.totalRows > 0 && result.summary.validRows === 0) {
    result.errors.push('CRITICAL: All rows failed validation - this would cause empty charts');
    result.success = false;
  } else if (result.summary.validRows < result.summary.totalRows) {
    result.warnings.push(
      `${result.summary.totalRows - result.summary.validRows} of ${
        result.summary.totalRows
      } rows failed validation`
    );
  }

  // Check for data quality issues that would cause bad visualizations
  if (result.summary.validRows > 0) {
    // Check for all-zero premiums
    const allZeroPremiums = validRows.every((row) => row.premium === 0);
    if (allZeroPremiums) {
      result.errors.push('CRITICAL: All premiums are zero - charts will render as flat lines');
      result.success = false;
    }

    // Check for Jan 1970 timestamps (epoch 0)
    const hasEpochTimestamps = validRows.some(
      (row) => row.age === 0 || row.premium === 0
    );
    if (hasEpochTimestamps) {
      result.warnings.push(
        'Some values may be uninitialized (zero values detected)'
      );
    }

    // Check for reasonable data distribution
    if (result.summary.ageRange.min === result.summary.ageRange.max) {
      result.errors.push('CRITICAL: All ages are the same - charts will have no variation');
      result.success = false;
    }

    if (result.summary.premiumRange.min === result.summary.premiumRange.max) {
      result.errors.push('CRITICAL: All premiums are the same - charts will have no variation');
      result.success = false;
    }
  }

  // Final success determination
  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

function main() {
  console.log('='.repeat(80));
  console.log('Tableau Source Ingestion Validator');
  console.log('='.repeat(80));
  console.log(`\nValidating: ${DATA_PATH}\n`);

  let csvText: string;
  try {
    csvText = readFileSync(DATA_PATH, 'utf-8');
  } catch (error) {
    console.error('❌ FAILED: Could not read CSV file');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Path: ${DATA_PATH}`);
    process.exit(1);
  }

  console.log(`📄 File size: ${csvText.length} bytes`);
  console.log(`📄 Line count: ${csvText.split('\n').length}\n`);

  const result = validateCSVContent(csvText);

  // Print results
  console.log('-'.repeat(80));
  console.log('VALIDATION RESULTS');
  console.log('-'.repeat(80));

  if (result.success) {
    console.log('✅ PASSED: CSV validation successful\n');
  } else {
    console.log('❌ FAILED: CSV validation failed\n');
  }

  // Print summary
  console.log('Summary:');
  console.log(`  Total rows: ${result.summary.totalRows}`);
  console.log(`  Valid rows: ${result.summary.validRows}`);
  console.log(`  Fields: ${result.summary.fields.join(', ')}`);
  console.log(`  Age range: ${result.summary.ageRange.min} - ${result.summary.ageRange.max}`);
  console.log(`  Premium range: $${result.summary.premiumRange.min.toLocaleString()} - $${result.summary.premiumRange.max.toLocaleString()}`);
  console.log(`  Genders: ${result.summary.genders.join(', ')}`);

  // Print warnings
  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning, idx) => {
      console.log(`  ${idx + 1}. ${warning}`);
    });
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  if (result.success) {
    console.log('✅ Deterministic Tableau source validation PASSED');
    console.log('='.repeat(80));
    process.exit(0);
  } else {
    console.log('❌ Deterministic Tableau source validation FAILED');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

main();
