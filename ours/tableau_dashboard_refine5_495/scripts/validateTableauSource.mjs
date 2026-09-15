#!/usr/bin/env node

/**
 * Tableau Source Validator
 *
 * Validates that:
 * 1. CSV file can be read and parsed
 * 2. Required fields exist and contain valid data
 * 3. No preamble rows before the header
 * 4. Headers are not corrupted with repeated quotes
 * 5. Numeric fields can be coerced to numbers
 * 6. Date fields are parseable
 * 7. Aggregation functions work correctly
 */

import { csvParse } from 'd3-dsv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_PATH = join(__dirname, '../public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Normalize column names by removing BOM, quotes, and whitespace
 * Same logic as dataLoader.ts
 */
function normalizeColumnName(name) {
  let cleaned = name.replace(/^\uFEFF/, ''); // Remove BOM
  cleaned = cleaned.replace(/^"|"$/g, ''); // Remove surrounding quotes
  return cleaned.trim();
}

function validateDataSource() {
  log(colors.blue, '🔍 Tableau Source Validator');
  log(colors.blue, '='.repeat(60));

  let failures = 0;
  let warnings = 0;

  try {
    // Read CSV data
    log(colors.blue, '\n1️⃣  Reading CSV from:', CSV_PATH);
    let csvText;
    try {
      csvText = readFileSync(CSV_PATH, 'utf-8');
      log(colors.green, '✓ CSV file read successfully');
    } catch (readError) {
      log(colors.red, '❌ FAIL: Cannot read CSV file:', readError.message);
      return 1;
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    log(colors.green, `✓ File contains ${lines.length} lines (including header)`);

    // Check for preamble rows
    log(colors.blue, '\n2️⃣  Checking for preamble rows...');

    const firstLine = lines[0];
    const secondLine = lines[1] || '';

    // Check if first line is the header
    if (firstLine.includes('Row ID') && firstLine.includes('Order Date') && firstLine.includes('Sales')) {
      log(colors.green, '✓ First line is the header (no preamble rows)');

      // Check for quoted/corrupted headers
      if (firstLine.startsWith('"') && firstLine.endsWith('"')) {
        log(colors.yellow, '⚠ WARNING: Header is wrapped in quotes - may indicate double-quoting issue');
        warnings++;
      }

      // Check for repeated quotes (e.g., ""Order Date"")
      const hasRepeatedQuotes = (firstLine.match(/""/g) || []).length > 0;
      if (hasRepeatedQuotes) {
        log(colors.yellow, '⚠ WARNING: Header contains repeated quotes (\\"\\"") - may need normalization');
        warnings++;
      }

      if (!hasRepeatedQuotes && !firstLine.startsWith('"')) {
        log(colors.green, '✓ Header appears clean (no quote issues)');
      }
    } else {
      // Check if second line might be the header
      if (secondLine.includes('Row ID') && secondLine.includes('Order Date')) {
        log(colors.red, '❌ FAIL: Header found on line 2 - preamble row detected on line 1');
        log(colors.red, `   Line 1: ${firstLine.substring(0, 100)}...`);
        failures++;
      } else {
        log(colors.red, '❌ FAIL: Cannot find expected header');
        failures++;
      }
    }

    // Parse CSV
    log(colors.blue, '\n3️⃣  Parsing CSV with d3-dsv...');
    let data;
    try {
      data = csvParse(csvText);
      log(colors.green, `✓ Parsed ${data.length} data rows`);
    } catch (parseError) {
      log(colors.red, '❌ FAIL: CSV parsing error:', parseError.message);
      return 1;
    }

    if (data.length === 0) {
      log(colors.red, '❌ FAIL: No data rows parsed');
      failures++;
      return 1;
    }

    // Check for expected row count (should be ~9994 based on file)
    if (data.length < 9000) {
      log(colors.yellow, `⚠ WARNING: Only ${data.length} rows parsed (expected ~9994)`);
      warnings++;
    } else {
      log(colors.green, `✓ Row count looks reasonable (${data.length} rows)`);
    }

    // Validate required fields
    log(colors.blue, '\n4️⃣  Validating required Tableau fields...');

    const requiredFields = [
      'Row ID',
      'Order ID',
      'Order Date',
      'Ship Date',
      'Sales',
      'Quantity',
      'Discount',
      'Profit',
      'Category',
      'Sub-Category',
      'Product Name',
      'Region',
      'State',
      'City'
    ];

    const columns = data.columns;
    const normalizedColumns = columns.map(normalizeColumnName);

    const missingFields = requiredFields.filter(field => !normalizedColumns.includes(field));

    if (missingFields.length > 0) {
      log(colors.red, '❌ FAIL: Missing required fields:', missingFields.join(', '));
      log(colors.red, '   Available columns (raw):', columns.join(', '));
      log(colors.red, '   Available columns (normalized):', normalizedColumns.join(', '));
      failures++;
    } else {
      log(colors.green, `✓ All ${requiredFields.length} required fields present (after normalization)`);
    }

    // Check for corrupted column names (quoted, repeated quotes, etc.)
    log(colors.blue, '\n5️⃣  Checking column name quality...');

    let columnIssues = 0;
    columns.forEach((col, idx) => {
      const normalized = normalizedColumns[idx];

      // Check for BOM character
      if (col.includes('\uFEFF')) {
        log(colors.yellow, `⚠ WARNING: Column contains BOM character: "${col}" → will normalize to "${normalized}"`);
        columnIssues++;
        warnings++;
      }
      // Check for quotes in column name
      else if (col.includes('"')) {
        log(colors.yellow, `⚠ WARNING: Column contains quotes: "${col}" → will normalize to "${normalized}"`);
        columnIssues++;
        warnings++;
      }
      // Check for leading/trailing whitespace
      else if (col !== col.trim()) {
        log(colors.yellow, `⚠ WARNING: Column has whitespace: "${col}" → will normalize to "${normalized}"`);
        columnIssues++;
        warnings++;
      }
    });

    if (columnIssues === 0) {
      log(colors.green, '✓ All column names are clean');
    } else {
      log(colors.blue, `ℹ️  Note: dataLoader will normalize ${columnIssues} column name(s) at runtime`);
    }

    // Validate data types
    log(colors.blue, '\n6️⃣  Validating data types...');

    // Check numeric fields
    const numericFields = ['Row ID', 'Sales', 'Quantity', 'Discount', 'Profit', 'Postal Code'];
    let numericIssues = 0;

    numericFields.forEach(field => {
      if (!normalizedColumns.includes(field)) return;

      // Find the actual column name (before normalization)
      const actualColIdx = normalizedColumns.findIndex(c => c === field);
      const actualColName = columns[actualColIdx];

      const sample = data.slice(0, 100); // Check first 100 rows
      let validCount = 0;
      let invalidCount = 0;

      sample.forEach(row => {
        const value = row[actualColName];
        const num = Number(value);
        if (isNaN(num) && value !== '' && value !== null && value !== undefined) {
          invalidCount++;
        } else if (value !== '' && value !== null && value !== undefined) {
          validCount++;
        }
      });

      if (invalidCount > 0) {
        log(colors.yellow, `⚠ WARNING: ${field}: ${invalidCount}/${sample.length} non-numeric values in sample`);
        numericIssues++;
        warnings++;
      } else {
        log(colors.green, `✓ ${field}: numeric values parse correctly`);
      }
    });

    // Check date fields
    const dateFields = ['Order Date', 'Ship Date'];
    let dateIssues = 0;

    dateFields.forEach(field => {
      if (!normalizedColumns.includes(field)) return;

      // Find the actual column name (before normalization)
      const actualColIdx = normalizedColumns.findIndex(c => c === field);
      const actualColName = columns[actualColIdx];

      const sample = data.slice(0, 100);
      let validCount = 0;
      let invalidCount = 0;

      sample.forEach(row => {
        const value = row[actualColName];
        if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          validCount++;
        } else if (value && value.trim()) {
          invalidCount++;
        }
      });

      if (invalidCount > 0) {
        log(colors.yellow, `⚠ WARNING: ${field}: ${invalidCount}/${sample.length} non-standard date formats in sample`);
        dateIssues++;
        warnings++;
      } else {
        log(colors.green, `✓ ${field}: dates are in YYYY-MM-DD format`);
      }
    });

    // Test aggregation logic
    log(colors.blue, '\n7️⃣  Testing aggregation functions...');

    try {
      // Helper to get value by normalized field name
      const getValue = (row, fieldName) => {
        const idx = normalizedColumns.findIndex(c => c === fieldName);
        return idx >= 0 ? row[columns[idx]] : undefined;
      };

      // Test scatterplot aggregation (by Product Name)
      const scatterAgg = new Map();
      data.forEach(d => {
        const key = getValue(d, 'Product Name');
        if (!key) return;

        if (!scatterAgg.has(key)) {
          scatterAgg.set(key, { sales: 0, profit: 0, quantity: 0 });
        }
        const agg = scatterAgg.get(key);
        agg.sales += Number(getValue(d, 'Sales')) || 0;
        agg.profit += Number(getValue(d, 'Profit')) || 0;
        agg.quantity += Number(getValue(d, 'Quantity')) || 0;
      });

      if (scatterAgg.size > 0) {
        log(colors.green, `✓ Scatterplot aggregation: ${scatterAgg.size} unique products`);

        // Check for non-zero aggregates
        const sampleAgg = Array.from(scatterAgg.values())[0];
        if (sampleAgg.sales > 0 || sampleAgg.profit !== 0 || sampleAgg.quantity > 0) {
          log(colors.green, '✓ Aggregation produces non-zero values');
        } else {
          log(colors.red, '❌ FAIL: Aggregation produces only zeros');
          failures++;
        }
      } else {
        log(colors.red, '❌ FAIL: No products found for aggregation');
        failures++;
      }

      // Test Sub-Category aggregation
      const subCatAgg = new Map();
      data.forEach(d => {
        const key = getValue(d, 'Sub-Category');
        if (!key) return;
        subCatAgg.set(key, (subCatAgg.get(key) || 0) + (Number(getValue(d, 'Sales')) || 0));
      });

      if (subCatAgg.size > 0) {
        log(colors.green, `✓ Sub-Category aggregation: ${subCatAgg.size} unique sub-categories`);

        // Check for non-zero aggregates
        const totalSales = Array.from(subCatAgg.values()).reduce((sum, v) => sum + v, 0);
        if (totalSales > 0) {
          log(colors.green, `✓ Total Sales: $${totalSales.toFixed(2)} (non-zero)`);
        } else {
          log(colors.red, '❌ FAIL: Total Sales is zero');
          failures++;
        }
      } else {
        log(colors.red, '❌ FAIL: No sub-categories found for aggregation');
        failures++;
      }

    } catch (aggError) {
      log(colors.red, '❌ FAIL: Aggregation error:', aggError.message);
      failures++;
    }

    // Final summary
    log(colors.blue, '\n' + '='.repeat(60));
    log(colors.blue, '📊 VALIDATION SUMMARY');

    if (failures === 0 && warnings === 0) {
      log(colors.green, '\n✅ ALL CHECKS PASSED - Data source is deterministic and correct!');
      return 0;
    } else if (failures === 0) {
      log(colors.yellow, `\n⚠️  PASSED with ${warnings} warning(s)`);
      log(colors.yellow, '   Review warnings above but data should work correctly');
      return 0;
    } else {
      log(colors.red, `\n❌ FAILED: ${failures} error(s), ${warnings} warning(s)`);
      log(colors.red, '   Fix errors before proceeding to build/QA stages');
      return 1;
    }

  } catch (error) {
    log(colors.red, '\n❌ VALIDATION ERROR:', error.message);
    log(colors.red, error.stack);
    return 1;
  }
}

// Run validation
const exitCode = validateDataSource();
process.exit(exitCode);
