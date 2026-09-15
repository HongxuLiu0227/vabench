/**
 * Tableau Source Ingestion Validator
 *
 * This script validates that:
 * 1. CSV can be parsed correctly
 * 2. All required fields are present
 * 3. Data types are coerced correctly
 * 4. No silent bad parses occur
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    columnsFound: string[];
    requiredColumns: string[];
    missingColumns: string[];
    sampleData: Record<string, unknown>[];
  };
}

const REQUIRED_COLUMNS = [
  'Category',
  'City',
  'Country',
  'Customer Name',
  'Manufacturer',
  'Order Date',
  'Order ID',
  'Postal Code',
  'Product Name',
  'Region',
  'Segment',
  'Ship Date',
  'Ship Mode',
  'State',
  'Sub-Category',
  'Discount',
  'Number of Records',
  'Profit',
  'Profit Ratio',
  'Quantity',
  'Sales',
];

function normalizeHeader(header: string): string {
  // Remove BOM if present
  let normalized = header.replace(/^\uFEFF/, '');

  // Remove extra quotes
  normalized = normalized.replace(/^"+|"+$/g, '');

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

function detectAndSkipPreamble(lines: string[]): { headerIndex: number; lines: string[] } {
  // Look for the header row by checking for required column names
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const normalizedHeaders = lines[i].split(',').map(normalizeHeader);
    const matchCount = REQUIRED_COLUMNS.filter(req =>
      normalizedHeaders.some(h => h === req)
    ).length;

    // If we match most required columns, this is likely the header
    if (matchCount >= REQUIRED_COLUMNS.length * 0.8) {
      console.log(`✓ Detected header at line ${i + 1}`);
      return { headerIndex: i, lines: lines.slice(i) };
    }
  }

  // If no clear header found, assume first line
  console.log('⚠ Could not definitively detect header, assuming first line');
  return { headerIndex: 0, lines };
}

function validateCSV(csvPath: string): ValidationResult {
  const result: ValidationResult = {
    success: false,
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      validRows: 0,
      columnsFound: [],
      requiredColumns: REQUIRED_COLUMNS,
      missingColumns: [],
      sampleData: [],
    },
  };

  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Detect and skip preamble
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    console.log(`\n📄 Total lines in file: ${lines.length}`);

    const { headerIndex, lines: dataLines } = detectAndSkipPreamble(lines);

    if (headerIndex > 0) {
      result.warnings.push(`Skipped ${headerIndex} preamble rows before header`);
    }

    // Parse CSV with PapaParse
    const parseResult = Papa.parse(dataLines.join('\n'), {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: 'greedy',
      transformHeader: normalizeHeader,
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(err => {
        if (err.type === 'error') {
          result.errors.push(`Parse error at row ${err.row}: ${err.message}`);
        } else {
          result.warnings.push(`Parse warning at row ${err.row}: ${err.message}`);
        }
      });
    }

    // Check columns
    const columnsFound = Object.keys(parseResult.data[0] || {});
    result.summary.columnsFound = columnsFound;

    const missingColumns = REQUIRED_COLUMNS.filter(
      req => !columnsFound.includes(req)
    );
    result.summary.missingColumns = missingColumns;

    if (missingColumns.length > 0) {
      result.errors.push(
        `Missing required columns: ${missingColumns.join(', ')}`
      );
    }

    // Validate data rows
    const validRows: Record<string, unknown>[] = [];
    parseResult.data.forEach((row: Record<string, unknown>) => {
      result.summary.totalRows++;

      // Skip completely empty rows
      if (Object.values(row).every(v => !v || v === '')) {
        return;
      }

      // Check critical fields for parsing issues
      const rowErrors: string[] = [];

      // Check numeric fields
      const numericFields = ['Discount', 'Profit', 'Sales', 'Quantity', 'Profit Ratio'];
      numericFields.forEach(field => {
        const val = row[field];
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num)) {
            rowErrors.push(`Row ${idx + 1}: ${field} is not a valid number: "${val}"`);
          }
        }
      });

      // Check date fields
      const dateFields = ['Order Date', 'Ship Date'];
      dateFields.forEach(field => {
        const val = row[field];
        if (val && val !== '') {
          const date = new Date(val);
          if (isNaN(date.getTime())) {
            rowErrors.push(`Row ${idx + 1}: ${field} is not a valid date: "${val}"`);
          }
        }
      });

      if (rowErrors.length === 0) {
        validRows.push(row);
      } else {
        result.errors.push(...rowErrors);
      }
    });

    result.summary.validRows = validRows.length;

    // Sample first few rows
    result.summary.sampleData = validRows.slice(0, 3);

    // Check for common parsing issues
    if (validRows.length > 0) {
      const sample = validRows[0];

      // Check for all-zero measures
      const measures = ['Sales', 'Profit', 'Discount', 'Quantity'];
      const allZero = measures.every(m => Number(sample[m]) === 0);

      if (allZero) {
        result.errors.push(
          'Detected all-zero measures in first row - possible parsing issue'
        );
      }

      // Check for default dates (Jan 1970 = timestamp 0)
      const orderDate = new Date(sample['Order Date']);
      if (orderDate.getTime() === 0) {
        result.errors.push(
          'Detected Jan 1970 dates - possible date parsing issue'
        );
      }
    }

    // Final success check
    result.success = result.errors.length === 0 && missingColumns.length === 0;

  } catch (err) {
    result.errors.push(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

function main() {
  const csvPath = path.join(
    process.cwd(),
    'public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv'
  );

  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE INGESTION VALIDATOR');
  console.log('='.repeat(60));
  console.log(`\nValidating: ${csvPath}\n`);

  const result = validateCSV(csvPath);

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));

  console.log(`\n✓ Success: ${result.success ? 'YES ✓' : 'NO ✗'}`);

  if (result.warnings.length > 0) {
    console.log(`\n⚠ WARNINGS (${result.warnings.length}):`);
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log(`\n✗ ERRORS (${result.errors.length}):`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('\n' + '-'.repeat(60));
  console.log('SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Rows: ${result.summary.totalRows}`);
  console.log(`Valid Rows: ${result.summary.validRows}`);
  console.log(`Columns Found: ${result.summary.columnsFound.length}`);
  console.log(`Required Columns: ${result.summary.requiredColumns.length}`);
  console.log(`Missing Columns: ${result.summary.missingColumns.length || 'None'}`);

  if (result.summary.missingColumns.length > 0) {
    console.log(`  Missing: ${result.summary.missingColumns.join(', ')}`);
  }

  console.log('\nColumns Found:');
  result.summary.columnsFound.forEach(col => console.log(`  - ${col}`));

  console.log('\nSample Data (first 3 rows):');
  result.summary.sampleData.forEach((row, idx) => {
    console.log(`\n  Row ${idx + 1}:`);
    console.log(`    Category: ${row['Category']}`);
    console.log(`    Region: ${row['Region']}`);
    console.log(`    Sales: ${row['Sales']}`);
    console.log(`    Profit: ${row['Profit']}`);
    console.log(`    Discount: ${row['Discount']}`);
    console.log(`    Order Date: ${row['Order Date']}`);
  });

  console.log('\n' + '='.repeat(60));

  if (result.success) {
    console.log('✓ VALIDATION PASSED - Data ingestion is deterministic and correct');
    process.exit(0);
  } else {
    console.log('✗ VALIDATION FAILED - Issues found that need to be fixed');
    process.exit(1);
  }
}

main();
