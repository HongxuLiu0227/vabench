#!/usr/bin/env node

/**
 * Tableau Data Validation Script (with proper CSV parsing)
 *
 * This script validates that the CSV data can be parsed correctly
 * and meets all Tableau requirements for rendering.
 *
 * Usage:
 *   node scripts/validate-data-proper.js
 *
 * Exit codes:
 *   0 - Validation passed
 *   1 - Validation failed or error occurred
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

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
 * Normalizes CSV headers
 */
function normalizeHeader(header) {
  let normalized = header;
  normalized = normalized.replace(/^\uFEFF/, '');
  normalized = normalized.replace(/^["']+|["']+$/g, '');
  normalized = normalized.trim();
  return normalized;
}

/**
 * Validates the data
 */
function validateData(data) {
  const errors = [];
  const warnings = [];

  if (!data || data.length === 0) {
    return {
      errors: ['Data is empty or null'],
      warnings: [],
      stats: {
        totalRows: 0,
        uniqueCategories: 0,
        uniqueSubCategories: 0,
        uniqueProducts: 0,
        dateRange: { min: 'N/A', max: 'N/A' },
        salesRange: { min: 0, max: 0, total: 0 },
      },
    };
  }

  // Check for required fields
  const firstRow = data[0];
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

  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate data rows
  let zeroSalesCount = 0;
  let zeroProfitCount = 0;
  let invalidDateCount = 0;
  let nanCount = 0;
  let epochCount = 0;

  const categories = new Set();
  const subCategories = new Set();
  const products = new Set();

  let minDate = new Date(8640000000000000);
  let maxDate = new Date(-8640000000000000);
  let totalSales = 0;
  let minSales = Infinity;
  let maxSales = -Infinity;

  data.forEach((row, index) => {
    const rowNum = index + 2;

    // Check Sales
    const sales = parseFloat(row['Sales']);
    if (isNaN(sales)) {
      nanCount++;
      errors.push(`Row ${rowNum}: Sales is NaN or invalid (value: "${row['Sales']}")`);
    } else if (sales === 0) {
      zeroSalesCount++;
    } else {
      totalSales += sales;
      if (sales < minSales) minSales = sales;
      if (sales > maxSales) maxSales = sales;
    }

    // Check Profit
    const profit = parseFloat(row['Profit']);
    if (isNaN(profit)) {
      nanCount++;
      errors.push(`Row ${rowNum}: Profit is NaN or invalid (value: "${row['Profit']}")`);
    } else if (profit === 0) {
      zeroProfitCount++;
    }

    // Check Order Date
    const orderDate = new Date(row['Order Date']);
    if (isNaN(orderDate.getTime())) {
      invalidDateCount++;
      errors.push(`Row ${rowNum}: Invalid Order Date "${row['Order Date']}"`);
    } else if (orderDate.getTime() === 0) {
      epochCount++;
      errors.push(`Row ${rowNum}: Order Date parsed as epoch (Jan 1, 1970)`);
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

  if (epochCount > 0) {
    errors.push(
      `${epochCount} rows have Order Date parsed as epoch (Jan 1, 1970). ` +
      'This indicates date parsing failure.'
    );
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
      salesRange: {
        min: minSales !== Infinity ? minSales : 0,
        max: maxSales !== -Infinity ? maxSales : 0,
        total: totalSales,
      },
    },
  };
}

/**
 * Main validation function
 */
function main() {
  logSection('📊 TABLEAU DATA VALIDATION (Proper CSV Parsing)');

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
    // Read CSV file
    const csvText = fs.readFileSync(csvPath, 'utf8');

    // Parse with PapaParse
    logSubSection('Parsing CSV with PapaParse');
    const parseResult = Papa.parse(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
    });

    if (parseResult.errors.length > 0) {
      log(`⚠️  CSV parsing warnings:`, 'yellow');
      parseResult.errors.forEach(err => {
        log(`  Row ${err.row}: ${err.message}`, 'yellow');
      });
    }

    const { data } = parseResult;
    log(`✓ Found ${parseResult.meta.fields.length} columns`, 'green');
    log(`✓ Parsed ${data.length} data rows`, 'green');

    // Display headers
    logSubSection('Column Headers');
    console.log(parseResult.meta.fields.map((h, i) => `${i + 1}. ${h}`).join('\n'));

    // Validate data
    logSubSection('Validating Data');
    const result = validateData(data);

    // Display results
    if (result.errors.length === 0) {
      log('✅ PASSED: All validation checks passed', 'green');
    } else {
      log('❌ FAILED: Validation errors detected', 'red');
    }

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.slice(0, 20).forEach(err => log(`  ❌ ${err}`, 'red'));
      if (result.errors.length > 20) {
        log(`  ... and ${result.errors.length - 20} more errors`, 'red');
      }
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
    console.log(`Sales range: $${result.stats.salesRange.min.toFixed(2)} to $${result.stats.salesRange.max.toFixed(2)}`);
    console.log(`Total sales: $${result.stats.salesRange.total.toLocaleString()}`);

    // Display sample data
    logSubSection('Sample Data (first 3 rows)');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`\nRow ${i + 1}:`);
      console.log(`  Order ID: ${row['Order ID']}`);
      console.log(`  Order Date: ${row['Order Date']}`);
      console.log(`  Customer: ${row['Customer Name']}`);
      console.log(`  Category: ${row['Category']}`);
      console.log(`  Sub-Category: ${row['Sub-Category']}`);
      console.log(`  Product: ${row['Product Name'].substring(0, 50)}...`);
      console.log(`  Sales: $${parseFloat(row['Sales']).toFixed(2)}`);
      console.log(`  Profit: $${parseFloat(row['Profit']).toFixed(2)}`);
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
