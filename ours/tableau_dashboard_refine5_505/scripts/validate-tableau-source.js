#!/usr/bin/env node

/**
 * Tableau Source Validator
 *
 * This script validates that the Tableau CSV data can be loaded and parsed correctly.
 * It checks for:
 * - CSV file accessibility
 * - Correct field mapping (no BOM issues)
 * - Valid data types
 * - Non-zero metrics
 * - Proper date parsing (preventing Jan 1970 issues)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(text) {
  console.log('');
  log('='.repeat(60), 'blue');
  log(text, 'bold');
  log('='.repeat(60), 'blue');
  console.log('');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function validateTableauSource() {
  const errors = [];
  const warnings = [];
  const summary = {
    totalRows: 0,
    yearsFound: 0,
    monthsFound: 0,
    subCategoriesFound: 0,
    totalSales: 0,
    totalProfit: 0,
  };

  logHeader('TABLEAU SOURCE VALIDATION');

  try {
    // Test 1: Check CSV file exists
    log('Checking CSV file existence...');
    const csvPath = path.join(process.cwd(), 'public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv');

    if (!fs.existsSync(csvPath)) {
      logError(`CSV file not found at: ${csvPath}`);
      errors.push(`CSV file not found at: ${csvPath}`);
      return { isValid: false, errors, warnings, summary };
    }

    logSuccess(`CSV file found at: ${csvPath}`);

    // Test 2: Read and validate CSV structure
    log('Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Check for BOM
    if (csvContent.charCodeAt(0) === 0xFEFF) {
      logWarning('CSV file contains BOM (Byte Order Mark) - will be stripped during parsing');
      warnings.push('CSV file contains BOM');
    }

    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    logSuccess(`Read ${lines.length} lines from CSV`);

    if (lines.length < 2) {
      logError('CSV file has no data rows');
      errors.push('CSV file has no data rows');
      return { isValid: false, errors, warnings, summary };
    }

    // Test 3: Validate headers
    log('Validating CSV headers...');
    const headerLine = lines[0];

    // Check for quoted headers
    const hasQuotedHeaders = headerLine.includes('"');
    if (hasQuotedHeaders) {
      logWarning('Headers contain quotes - will be normalized during parsing');
      warnings.push('Headers contain quotes');
    }

    // Expected headers (normalized)
    const expectedHeaders = [
      'Category', 'City', 'Country', 'Customer Name', 'Manufacturer',
      'Order Date', 'Order ID', 'Postal Code', 'Product Name', 'Region',
      'Segment', 'Ship Date', 'Ship Mode', 'State', 'Sub-Category',
      'Discount', 'Number of Records', 'Profit', 'Profit Ratio', 'Quantity', 'Sales'
    ];

    // Extract headers from CSV (simple parsing)
    const headers = parseCsvLine(headerLine);
    logSuccess(`Found ${headers.length} columns in CSV`);

    // Check for missing expected headers
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      logWarning(`Missing expected headers: ${missingHeaders.join(', ')}`);
      warnings.push(`Missing headers: ${missingHeaders.join(', ')}`);
    }

    // Check for BOM in first header
    if (headers[0].startsWith('\uFEFF') || headers[0].includes('﻿')) {
      logError('First header contains BOM character - this will cause field lookup failures!');
      errors.push('BOM character detected in first header');
      return { isValid: false, errors, warnings, summary };
    }

    // Test 4: Sample data rows
    log('Sampling data rows...');
    const sampleSize = Math.min(100, lines.length - 1);
    let validRows = 0;
    let invalidDates = 0;
    let zeroSales = 0;
    let totalSales = 0;

    for (let i = 1; i <= sampleSize; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length === headers.length) {
        validRows++;

        // Check Order Date
        const dateIndex = headers.indexOf('Order Date');
        if (dateIndex >= 0) {
          const dateStr = values[dateIndex];
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            invalidDates++;
          } else if (date.getFullYear() === 1970 && date.getMonth() === 0) {
            logWarning(`Row ${i}: Date parsing to Jan 1970 - likely invalid: ${dateStr}`);
            warnings.push(`Row ${i}: Date parsing to Jan 1970`);
          }
        }

        // Check Sales
        const salesIndex = headers.indexOf('Sales');
        if (salesIndex >= 0) {
          const salesStr = values[salesIndex];
          const sales = parseFloat(salesStr);
          if (!isNaN(sales)) {
            totalSales += sales;
            if (sales === 0) zeroSales++;
          }
        }
      }
    }

    summary.totalRows = lines.length - 1;
    summary.totalSales = totalSales;

    logSuccess(`Sampled ${validRows}/${sampleSize} valid rows`);
    log(`Invalid dates in sample: ${invalidDates}`, invalidDates > 0 ? 'yellow' : 'reset');
    log(`Zero sales in sample: ${zeroSales}`, zeroSales > sampleSize * 0.5 ? 'yellow' : 'reset');
    log(`Total sales in sample: $${totalSales.toFixed(2)}`, 'blue');

    if (invalidDates > sampleSize * 0.1) {
      logError(`Too many invalid dates: ${invalidDates}/${sampleSize}`);
      errors.push(`Too many invalid dates: ${invalidDates}/${sampleSize}`);
    }

    if (totalSales === 0 && validRows > 0) {
      logError('All sampled rows have zero sales');
      errors.push('All sampled rows have zero sales');
    }

    // Test 5: Check for preamble rows
    log('Checking for preamble rows...');
    const firstDataRow = parseCsvLine(lines[1]);
    const looksLikeData = firstDataRow.some(v => {
      // Check if it looks like a date
      return /^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{2}\/\d{2}\/\d{4}$/.test(v);
    });

    if (looksLikeData) {
      logSuccess('No preamble rows detected - first data row looks valid');
    } else {
      logWarning('Possible preamble rows detected');
      warnings.push('Possible preamble rows');
    }

    logHeader('VALIDATION RESULTS');

    if (errors.length > 0 || warnings.length > 0) {
      if (errors.length > 0) {
        log('ERRORS:', 'red');
        errors.forEach(err => logError(err));
        console.log('');
      }

      if (warnings.length > 0) {
        log('WARNINGS:', 'yellow');
        warnings.forEach(warn => logWarning(warn));
        console.log('');
      }

      log(`Valid: ${errors.length === 0 ? '✓ YES' : '✗ NO'}`, errors.length === 0 ? 'green' : 'red');
    } else {
      logSuccess('All validation checks passed!');
    }

    console.log('');
    log('SUMMARY:', 'blue');
    log(`  Total Rows: ${summary.totalRows}`);
    log(`  Sampled Rows: ${sampleSize}`);
    log(`  Valid Sampled Rows: ${validRows}`);
    log(`  Total Sales (sample): $${summary.totalSales.toFixed(2)}`);
    console.log('');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };

  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    errors.push(error.message);
    return { isValid: false, errors, warnings, summary };
  }
}

/**
 * Simple CSV line parser (handles quoted fields)
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

// Run validation
validateTableauSource().then(result => {
  process.exit(result.isValid ? 0 : 1);
}).catch(error => {
  logError(`Validation script failed: ${error.message}`);
  process.exit(1);
});
