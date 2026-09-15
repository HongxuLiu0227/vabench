#!/usr/bin/env node

/**
 * Tableau Data Validation Script
 *
 * This script validates that the CSV data can be parsed correctly
 * and meets all Tableau requirements for rendering.
 *
 * Usage:
 *   node scripts/validate-data.js
 *
 * Exit codes:
 *   0 - Validation passed
 *   1 - Validation failed or error occurred
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSubSection(title) {
  console.log('\n' + '-'.repeat(60));
  log(title, 'blue');
  console.log('-'.repeat(60));
}

/**
 * Reads and parses the CSV file
 */
function parseCSV(filePath) {
  const csvText = fs.readFileSync(filePath, 'utf8');

  // Split into lines
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => {
    let header = h.trim();
    // Remove BOM
    header = header.replace(/^\uFEFF/, '');
    // Remove quotes
    header = header.replace(/^["']+|["']+$/g, '');
    return header;
  });

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing (splits by comma, doesn't handle quoted commas)
    const values = line.split(',');

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return { headers, data };
}

/**
 * Validates the data
 */
function validateData(headers, data) {
  const errors = [];
  const warnings = [];

  // Required fields
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
  ];

  // Check for missing fields
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate data rows
  let zeroSalesCount = 0;
  let zeroProfitCount = 0;
  let invalidDateCount = 0;
  let nanCount = 0;

  const categories = new Set();
  const subCategories = new Set();
  const products = new Set();

  let minDate = new Date(8640000000000000);
  let maxDate = new Date(-8640000000000000);
  let totalSales = 0;

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 for header and 0-index

    // Check Sales
    const sales = parseFloat(row['Sales']);
    if (isNaN(sales)) {
      nanCount++;
      errors.push(`Row ${rowNum}: Sales is NaN or invalid`);
    } else if (sales === 0) {
      zeroSalesCount++;
    } else {
      totalSales += sales;
    }

    // Check Profit
    const profit = parseFloat(row['Profit']);
    if (isNaN(profit)) {
      nanCount++;
    } else if (profit === 0) {
      zeroProfitCount++;
    }

    // Check Order Date
    const orderDate = new Date(row['Order Date']);
    if (isNaN(orderDate.getTime())) {
      invalidDateCount++;
    } else {
      if (orderDate < minDate) minDate = orderDate;
      if (orderDate > maxDate) maxDate = orderDate;
    }

    // Track unique values
    if (row['Category']) categories.add(row['Category']);
    if (row['Sub-Category']) subCategories.add(row['Sub-Category']);
    if (row['Product Name']) products.add(row['Product Name']);
  });

  // Check for suspicious patterns
  if (zeroSalesCount > data.length * 0.5) {
    warnings.push(
      `More than 50% of rows have zero Sales (${zeroSalesCount}/${data.length}). ` +
      'This might indicate a parsing issue.'
    );
  }

  if (invalidDateCount > data.length * 0.1) {
    errors.push(
      `More than 10% of rows have invalid dates (${invalidDateCount}/${data.length}). ` +
      'This will cause Jan 1970 timeline issues.'
    );
  }

  if (nanCount > 0) {
    errors.push(`Found ${nanCount} NaN values in numeric fields.`);
  }

  return {
    errors,
    warnings,
    stats: {
      totalRows: data.length,
      uniqueCategories: categories.size,
      uniqueSubCategories: subCategories.size,
      uniqueProducts: products.size,
      dateRange: {
        min: minDate.getTime() !== 8640000000000000 ? minDate.toISOString().split('T')[0] : 'N/A',
        max: maxDate.getTime() !== -8640000000000000 ? maxDate.toISOString().split('T')[0] : 'N/A',
      },
      totalSales,
    },
  };
}

/**
 * Main validation function
 */
function main() {
  logSection('📊 TABLEAU DATA VALIDATION');

  const csvPath = path.join(
    __dirname,
    '../public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv'
  );

  if (!fs.existsSync(csvPath)) {
    log(`❌ CSV file not found: ${csvPath}`, 'red');
    process.exit(1);
  }

  log(`📁 Validating: ${csvPath}`, 'blue');

  try {
    // Parse CSV
    logSubSection('Parsing CSV');
    const { headers, data } = parseCSV(csvPath);
    log(`✓ Found ${headers.length} columns`, 'green');
    log(`✓ Parsed ${data.length} data rows`, 'green');

    // Validate data
    logSubSection('Validating Data');
    const result = validateData(headers, data);

    // Display results
    if (result.errors.length === 0) {
      log('✅ PASSED: All validation checks passed', 'green');
    } else {
      log('❌ FAILED: Validation errors detected', 'red');
    }

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(err => log(`  ❌ ${err}`, 'red'));
    }

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warn => log(`  ⚠️  ${warn}`, 'yellow'));
    }

    // Display statistics
    logSubSection('Data Statistics');
    console.log(`Total rows: ${result.stats.totalRows}`);
    console.log(`Unique categories: ${result.stats.uniqueCategories}`);
    console.log(`Unique sub-categories: ${result.stats.uniqueSubCategories}`);
    console.log(`Unique products: ${result.stats.uniqueProducts}`);
    console.log(`Date range: ${result.stats.dateRange.min} to ${result.stats.dateRange.max}`);
    console.log(`Total sales: $${result.stats.totalSales.toLocaleString()}`);

    // Display sample headers
    logSubSection('Column Headers');
    console.log(headers.map((h, i) => `${i + 1}. ${h}`).join('\n'));

    // Display sample data
    logSubSection('Sample Data (first 3 rows)');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`\nRow ${i + 1}:`);
      console.log(`  Order ID: ${row['Order ID']}`);
      console.log(`  Order Date: ${row['Order Date']}`);
      console.log(`  Customer: ${row['Customer Name']}`);
      console.log(`  Category: ${row['Category']}`);
      console.log(`  Sub-Category: ${row['Sub-Category']}`);
      console.log(`  Sales: $${row['Sales']}`);
      console.log(`  Profit: $${row['Profit']}`);
    });

    console.log('\n' + '='.repeat(60));

    if (result.errors.length > 0) {
      log('\n❌ Validation failed', 'red');
      process.exit(1);
    } else {
      log('\n✅ Validation completed successfully', 'green');
      process.exit(0);
    }
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run validation
main();
