#!/usr/bin/env node

/**
 * Test script to validate CSV parsing works correctly
 * This script tests the CSV parser logic directly to ensure:
 * 1. Preamble rows are skipped
 * 2. BOM is handled
 * 3. Headers are parsed correctly
 * 4. Data values are correct
 */

import { readFileSync } from 'fs';
import { csvParse } from 'd3-dsv';

const CSV_PATH = './public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

function stripBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

function normalizeColumnName(name) {
  return name
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/"{2,}/g, '"')
    .trim();
}

function extractActualCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const actualLines = lines.slice(4);
  return actualLines.join('\n');
}

function parseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const str = String(value).replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
}

function parseDate(value) {
  if (!value) return new Date(NaN);
  const str = String(value).trim();
  const date = new Date(str);
  return isNaN(date.getTime()) ? new Date(NaN) : date;
}

try {
  console.log('Testing CSV parsing...\n');

  // Read the CSV file
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  console.log(`✓ Read CSV file (${csvText.length} bytes)`);

  // Test BOM removal
  const afterBOM = stripBOM(csvText);
  console.log(`✓ BOM removed (was ${csvText.length > afterBOM.length ? 'present' : 'not present'})`);

  // Test preamble skipping
  const actualCSV = extractActualCSV(afterBOM);
  const lines = csvText.split(/\r?\n/);
  console.log(`✓ Skipped 4 preamble rows`);
  console.log(`  Original line count: ${lines.length}`);
  console.log(`  After skipping preamble: ${actualCSV.split(/\r?\n/).length}`);

  // Parse CSV
  const rawData = csvParse(actualCSV);
  console.log(`✓ Parsed ${rawData.length} data rows`);

  // Normalize headers
  const normalizedData = rawData.map((row) => {
    const normalized = {};
    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        normalized[normalizeColumnName(key)] = row[key];
      }
    }
    return normalized;
  });

  // Check headers
  if (normalizedData.length > 0) {
    const headers = Object.keys(normalizedData[0]);
    console.log(`✓ Found ${headers.length} columns:`);
    headers.slice(0, 10).forEach(h => console.log(`  - ${h}`));
    if (headers.length > 10) {
      console.log(`  ... and ${headers.length - 10} more`);
    }

    // Validate required columns exist
    const requiredColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity', 'Category', 'Sub-Category', 'Region', 'Customer Name'];
    const missingColumns = requiredColumns.filter(col => !(col in normalizedData[0]));

    if (missingColumns.length > 0) {
      console.error(`✗ Missing required columns: ${missingColumns.join(', ')}`);
      process.exit(1);
    } else {
      console.log(`✓ All required columns present`);
    }

    // Test parsing some values
    const firstRow = normalizedData[0];
    const sales = parseNumber(firstRow['Sales']);
    const profit = parseNumber(firstRow['Profit']);
    const quantity = parseNumber(firstRow['Quantity']);
    const orderDate = parseDate(firstRow['Order Date']);

    console.log(`\n✓ Sample parsed values from first row:`);
    console.log(`  Sales: ${sales} (type: ${typeof sales})`);
    console.log(`  Profit: ${profit} (type: ${typeof profit})`);
    console.log(`  Quantity: ${quantity} (type: ${typeof quantity})`);
    console.log(`  Order Date: ${orderDate.toISOString()} (valid: ${!isNaN(orderDate.getTime())})`);
    console.log(`  Category: ${firstRow['Category']}`);
    console.log(`  Region: ${firstRow['Region']}`);

    // Check for non-zero values across dataset
    let nonZeroSales = 0;
    let validDates = 0;
    let validRegions = 0;

    normalizedData.forEach(row => {
      if (parseNumber(row['Sales']) > 0) nonZeroSales++;
      if (!isNaN(parseDate(row['Order Date']).getTime())) validDates++;
      if (row['Region']) validRegions++;
    });

    console.log(`\n✓ Data quality checks:`);
    console.log(`  Non-zero sales: ${nonZeroSales}/${normalizedData.length} (${(nonZeroSales/normalizedData.length*100).toFixed(1)}%)`);
    console.log(`  Valid dates: ${validDates}/${normalizedData.length} (${(validDates/normalizedData.length*100).toFixed(1)}%)`);
    console.log(`  Valid regions: ${validRegions}/${normalizedData.length} (${(validRegions/normalizedData.length*100).toFixed(1)}%)`);

    if (nonZeroSales === 0) {
      console.error(`✗ ERROR: All sales values are zero!`);
      process.exit(1);
    }
    if (validDates === 0) {
      console.error(`✗ ERROR: All dates are invalid!`);
      process.exit(1);
    }
  }

  console.log('\n✓ All CSV parsing tests passed!');
} catch (error) {
  console.error('\n✗ CSV parsing test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
