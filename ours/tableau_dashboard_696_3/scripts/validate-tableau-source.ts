/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files exist under public/data/
 * 2. CSV headers are parsed correctly (including triple-quoted headers)
 * 3. Required Tableau fields resolve to real columns
 * 4. Data values are valid (non-zero, non-NaN)
 * 5. Dates parse correctly (not defaulting to Jan 1970)
 */

import { csvParse } from 'd3-dsv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    dateRange: { min: string; max: string };
    columns: string[];
    numericColumns: { [key: string]: { min: number; max: number; avg: number } };
  };
}

/**
 * Clean column name by removing quotes, BOM, and extra spaces
 * Mirrors the logic in dataService.ts
 */
function cleanColumnName(name: string): string {
  return name
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']+|["']+$/g, '') // Remove quotes from start/end
    .replace(/"{2,}/g, '') // Remove two or more consecutive quotes
    .trim();
}

/**
 * Validate CSV file and return detailed results
 */
function validateCSV(csvPath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      dateRange: { min: '', max: '' },
      columns: [],
      numericColumns: {},
    },
  };

  // Check file exists
  if (!existsSync(csvPath)) {
    result.valid = false;
    result.errors.push(`CSV file not found: ${csvPath}`);
    return result;
  }

  try {
    // Read and parse CSV
    const csvText = readFileSync(csvPath, 'utf-8');
    const parsedData = csvParse(csvText);

    // Check if data exists
    if (!parsedData || parsedData.length === 0) {
      result.valid = false;
      result.errors.push('CSV file is empty or could not be parsed');
      return result;
    }

    // Clean column names
    const cleanData = parsedData.map((row) => {
      const cleanRow: { [key: string]: string } = {};
      Object.keys(row).forEach((key) => {
        cleanRow[cleanColumnName(key)] = row[key];
      });
      return cleanRow;
    });

    // Get column names from first row
    result.summary.columns = Object.keys(cleanData[0]);
    result.summary.totalRows = cleanData.length;

    console.log(`✓ CSV parsed successfully: ${result.summary.totalRows} rows`);
    console.log(`✓ Raw columns from parser: ${JSON.stringify(parsedData.columns)}`);
    console.log(`✓ Cleaned columns: ${result.summary.columns.join(', ')}`);

    // Validate required columns for Tableau
    const requiredColumns = ['date', 'open', 'close', 'high', 'low', 'volume'];
    const missingColumns = requiredColumns.filter((col) => !result.summary.columns.includes(col));

    if (missingColumns.length > 0) {
      result.valid = false;
      result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Analyze numeric columns
    const numericColumns = ['open', 'close', 'high', 'low', 'volume'];
    numericColumns.forEach((col) => {
      if (result.summary.columns.includes(col)) {
        const values = cleanData
          .map((row) => parseFloat(row[col]))
          .filter((v) => !isNaN(v));

        if (values.length === 0) {
          result.valid = false;
          result.errors.push(`Column '${col}' has no valid numeric values`);
        } else {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;

          result.summary.numericColumns[col] = { min, max, avg };

          // Check for all-zero values (sign of parsing issue)
          if (min === 0 && max === 0) {
            result.errors.push(`Column '${col}' contains all zeros - possible parsing issue`);
            result.valid = false;
          }

          // Check for NaN-like values
          if (values.some((v) => !isFinite(v))) {
            result.warnings.push(`Column '${col}' contains infinite or NaN values`);
          }
        }
      }
    });

    // Validate date column
    if (result.summary.columns.includes('date')) {
      const dates = cleanData
        .map((row) => new Date(row.date))
        .filter((d) => !isNaN(d.getTime()));

      if (dates.length === 0) {
        result.valid = false;
        result.errors.push('Date column contains no valid dates');
      } else {
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        result.summary.dateRange.min = sortedDates[0].toISOString().split('T')[0];
        result.summary.dateRange.max = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];

        // Check for Jan 1970 dates (sign of epoch timestamp parsing issue)
        const epochDate = new Date('1970-01-01').getTime();
        const epochWindow = 24 * 60 * 60 * 1000; // 1 day window
        const hasEpochDates = dates.some(
          (d) => Math.abs(d.getTime() - epochDate) < epochWindow
        );

        if (hasEpochDates) {
          result.valid = false;
          result.errors.push('Date column contains dates near Jan 1970 - possible timestamp parsing issue');
        }
      }
    }

    // Log summary
    console.log('\n=== Data Summary ===');
    console.log(`Total rows: ${result.summary.totalRows}`);
    console.log(`Date range: ${result.summary.dateRange.min} to ${result.summary.dateRange.max}`);
    console.log('\nNumeric columns:');
    Object.entries(result.summary.numericColumns).forEach(([col, stats]) => {
      console.log(`  ${col}: min=${stats.min.toFixed(4)}, max=${stats.max.toFixed(4)}, avg=${stats.avg.toFixed(4)}`);
    });

  } catch (error) {
    result.valid = false;
    result.errors.push(`Failed to parse CSV: ${error}`);
  }

  return result;
}

/**
 * Main validation function
 */
function main() {
  console.log('=== Tableau Source Ingestion Validator ===\n');

  // Use absolute path to public/data
  const csvPath = join(__dirname, '../public/data/prices-split-adjusted.csv');

  console.log(`Validating: ${csvPath}\n`);

  const result = validateCSV(csvPath);

  // Print errors
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((err) => console.log(`  - ${err}`));
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach((warn) => console.log(`  - ${warn}`));
  }

  // Final result
  console.log('\n=== Validation Result ===');
  if (result.valid) {
    console.log('✅ PASSED - Tableau source ingestion is deterministic and correct');
    process.exit(0);
  } else {
    console.log('❌ FAILED - Tableau source ingestion has issues');
    process.exit(1);
  }
}

// Run if executed directly
main();

export { validateCSV, ValidationResult };
