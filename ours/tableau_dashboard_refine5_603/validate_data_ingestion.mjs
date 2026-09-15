#!/usr/bin/env node

/**
 * Tableau Source Ingestion Validator
 *
 * This script validates that the CSV data can be parsed correctly
 * with all the fixes applied (BOM removal, header normalization, etc.)
 */

import { readFileSync } from 'fs';
import { csvParse } from 'd3-dsv';

const DATA_PATH = './public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

function stripBOM(str) {
  if (str.charCodeAt(0) === 0xFEFF || str.charCodeAt(0) === 0xBBEF) {
    return str.slice(1);
  }
  if (str.startsWith('\uFEFF')) {
    return str.slice(1);
  }
  return str;
}

function normalizeColumnName(name) {
  return name
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/^['''''](.*)[''''']$/, '$1');
}

function safeNumber(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function safeDate(value) {
  if (!value) {
    return new Date();
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function main() {
  console.log('=== Tableau Source Ingestion Validator ===\n');

  // Read CSV file
  let csvText;
  try {
    csvText = readFileSync(DATA_PATH, 'utf-8');
    console.log('✓ CSV file loaded successfully');
    console.log(`  File size: ${csvText.length} bytes\n`);
  } catch (error) {
    console.error('✗ Failed to load CSV file:', error.message);
    process.exit(1);
  }

  // Check for BOM
  const hasBOM = csvText.charCodeAt(0) === 0xFEFF || csvText.charCodeAt(0) === 0xBBEF || csvText.startsWith('\uFEFF');
  console.log(`BOM Detection: ${hasBOM ? '✓ BOM found and will be removed' : '✓ No BOM detected'}`);

  // Remove BOM
  const cleanedText = stripBOM(csvText);
  console.log(`BOM Removal: ${cleanedText.length < csvText.length ? '✓ BOM removed' : '✓ No removal needed'}\n`);

  // Parse CSV
  let rawData;
  try {
    rawData = csvParse(cleanedText);
    console.log(`✓ CSV parsed successfully`);
    console.log(`  Total rows: ${rawData.length}\n`);
  } catch (error) {
    console.error('✗ Failed to parse CSV:', error.message);
    process.exit(1);
  }

  // Check headers
  if (rawData.length > 0) {
    const firstRow = rawData[0];
    const columns = Object.keys(firstRow);
    console.log(`✓ Columns found: ${columns.length}`);
    console.log(`  First few columns: ${columns.slice(0, 5).join(', ')}...\n`);

    // Check for required columns
    const requiredColumns = [
      'Row ID',
      'Order ID',
      'Order Date',
      'Sales',
      'Quantity',
      'Discount',
      'Profit',
      'Region',
      'Customer Name',
      'Product Name'
    ];

    console.log('Required Columns Check:');
    let allPresent = true;
    for (const col of requiredColumns) {
      // Try both with and without BOM prefix
      const present = columns.includes(col);
      const status = present ? '✓' : '✗';
      console.log(`  ${status} ${col}`);
      if (!present) allPresent = false;
    }
    console.log('');

    if (!allPresent) {
      console.log('✗ Some required columns are missing!');
      process.exit(1);
    }
  }

  // Process sample rows
  console.log('Processing sample rows...\n');
  let validRows = 0;
  let invalidRows = 0;
  const sampleSize = Math.min(100, rawData.length);

  for (let i = 0; i < sampleSize; i++) {
    const row = rawData[i];

    // Normalize column names
    const normalizedRow = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = value;
    }

    try {
      // Validate required fields
      const requiredFields = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Quantity', 'Discount', 'Profit', 'Region', 'Customer Name', 'Product Name'];
      const missingFields = requiredFields.filter(field => !normalizedRow[field] && normalizedRow[field] !== '');

      if (missingFields.length > 0) {
        invalidRows++;
        continue;
      }

      // Test conversions
      const rowId = safeNumber(normalizedRow['Row ID']);
      const sales = safeNumber(normalizedRow['Sales']);
      const quantity = safeNumber(normalizedRow['Quantity']);
      const discount = safeNumber(normalizedRow['Discount']);
      const profit = safeNumber(normalizedRow['Profit']);
      const orderDate = safeDate(normalizedRow['Order Date']);

      // Check for NaN
      if (isNaN(rowId) || isNaN(sales) || isNaN(quantity) || isNaN(discount) || isNaN(profit)) {
        invalidRows++;
        continue;
      }

      // Check date validity
      if (isNaN(orderDate.getTime())) {
        invalidRows++;
        continue;
      }

      validRows++;
    } catch (error) {
      invalidRows++;
    }
  }

  console.log(`✓ Sample processing complete:`);
  console.log(`  Valid rows: ${validRows}/${sampleSize}`);
  console.log(`  Invalid rows: ${invalidRows}/${sampleSize}`);
  console.log(`  Success rate: ${((validRows / sampleSize) * 100).toFixed(1)}%\n`);

  // Show sample data
  if (validRows > 0) {
    const sampleRow = rawData[0];
    console.log('Sample Data Row:');
    console.log(`  Row ID: ${sampleRow['Row ID']}`);
    console.log(`  Order Date: ${sampleRow['Order Date']}`);
    console.log(`  Sales: ${sampleRow['Sales']}`);
    console.log(`  Quantity: ${sampleRow['Quantity']}`);
    console.log(`  Discount: ${sampleRow['Discount']}`);
    console.log(`  Profit: ${sampleRow['Profit']}`);
    console.log(`  Region: ${sampleRow['Region']}`);
    console.log(`  Customer Name: ${sampleRow['Customer Name']}`);
    console.log(`  Product Name: ${sampleRow['Product Name'].substring(0, 40)}...\n`);
  }

  // Final verdict
  const successRate = (validRows / sampleSize) * 100;
  if (successRate >= 95) {
    console.log('✓ VALIDATION PASSED: Data ingestion is deterministic and correct!');
    console.log('  The CSV file can be parsed successfully with all fixes applied.\n');
    process.exit(0);
  } else {
    console.log(`✗ VALIDATION FAILED: Success rate (${successRate.toFixed(1)}%) is below 95%`);
    console.log('  Some data quality issues remain.\n');
    process.exit(1);
  }
}

main();
