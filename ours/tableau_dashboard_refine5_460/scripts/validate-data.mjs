#!/usr/bin/env node

/**
 * Standalone script to validate Tableau source data ingestion
 * Uses d3-dsv for proper CSV parsing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { csvParse } from 'd3-dsv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate date format
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
}

// Validate number
function isValidNumber(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = Number(value);
  return !isNaN(num);
}

// Normalize header
function normalizeHeader(header) {
  return header
    .replace(/^\ufeff/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

// Main validation function
function validateData(csvPath) {
  console.log(`\n=== Validating Tableau Source Data ===`);
  console.log(`File: ${csvPath}\n`);

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ ERROR: File not found: ${csvPath}`);
    return false;
  }

  // Read file
  let csvText;
  try {
    csvText = fs.readFileSync(csvPath, 'utf-8');
  } catch (error) {
    console.error(`❌ ERROR: Failed to read file: ${error.message}`);
    return false;
  }

  // Check if empty
  if (!csvText || csvText.trim().length === 0) {
    console.error(`❌ ERROR: CSV file is empty`);
    return false;
  }

  // Parse CSV using d3-dsv
  let data;
  try {
    data = csvParse(csvText);
  } catch (error) {
    console.error(`❌ ERROR: Failed to parse CSV: ${error.message}`);
    return false;
  }

  if (!data || data.length === 0) {
    console.error(`❌ ERROR: CSV parsing returned no data`);
    return false;
  }

  // Normalize headers from first row
  const firstRow = data[0];
  const headers = Object.keys(firstRow).map(normalizeHeader);

  console.log(`✓ Parsed CSV successfully`);
  console.log(`  - Headers: ${headers.length}`);
  console.log(`  - Data rows: ${data.length}`);

  // Check required headers
  const requiredHeaders = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Ship Mode',
    'Customer ID',
    'Customer Name',
    'Segment',
    'Country',
    'City',
    'State',
    'Postal Code',
    'Region',
    'Product ID',
    'Category',
    'Sub-Category',
    'Product Name',
    'Sales',
    'Quantity',
    'Discount',
    'Profit',
  ];

  const normalizedHeaders = headers.map(normalizeHeader);
  const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));

  if (missingHeaders.length > 0) {
    console.error(`\n❌ ERROR: Missing required headers: ${missingHeaders.join(', ')}`);
    console.error(`Available headers: ${normalizedHeaders.join(', ')}`);
    return false;
  }

  console.log(`✓ All required headers present`);

  // Normalize each row
  const normalizedRows = data.map(row => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeHeader(key);
      normalized[normalizedKey] = value;
    }
    return normalized;
  });

  // Validate data rows
  let validRows = 0;
  let invalidRows = 0;
  let invalidDates = 0;
  let invalidNumbers = 0;
  const salesValues = [];
  const dates = [];

  normalizedRows.forEach((row, index) => {
    let rowValid = true;

    // Validate Order Date
    if (!isValidDate(row['Order Date'])) {
      invalidDates++;
      rowValid = false;
    } else {
      dates.push(row['Order Date']);
    }

    // Validate Sales
    if (!isValidNumber(row['Sales'])) {
      invalidNumbers++;
      rowValid = false;
    } else {
      salesValues.push(Number(row['Sales']));
    }

    // Validate Profit
    if (!isValidNumber(row['Profit'])) {
      invalidNumbers++;
      rowValid = false;
    }

    // Validate Quantity
    if (!isValidNumber(row['Quantity'])) {
      invalidNumbers++;
      rowValid = false;
    }

    if (rowValid) {
      validRows++;
    } else {
      invalidRows++;
    }
  });

  console.log(`\n✓ Data validation complete:`);
  console.log(`  - Valid rows: ${validRows}`);
  console.log(`  - Invalid rows: ${invalidRows}`);
  console.log(`  - Invalid dates: ${invalidDates}`);
  console.log(`  - Invalid numbers: ${invalidNumbers}`);

  if (invalidRows > 0) {
    console.error(`\n❌ ERROR: ${invalidRows} rows have validation errors`);
    return false;
  }

  // Check for data quality issues
  if (salesValues.length > 0) {
    const allZero = salesValues.every(v => v === 0);
    if (allZero) {
      console.error(`\n❌ ERROR: All Sales values are zero`);
      return false;
    }

    const minSales = Math.min(...salesValues);
    const maxSales = Math.max(...salesValues);
    console.log(`\n✓ Sales range: ${minSales.toFixed(2)} to ${maxSales.toFixed(2)}`);
  }

  if (dates.length > 0) {
    dates.sort();
    console.log(`✓ Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
  }

  console.log(`\n✅ SUCCESS: All validations passed!`);
  console.log(`\nThe CSV file is properly formatted and ready for Tableau ingestion.\n`);
  return true;
}

// Run validation
const csvPath = path.join(__dirname, '../public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');
const success = validateData(csvPath);

process.exit(success ? 0 : 1);
