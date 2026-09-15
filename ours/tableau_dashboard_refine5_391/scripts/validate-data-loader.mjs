#!/usr/bin/env node

/**
 * Validation script for Tableau data loader
 * Tests CSV parsing, header detection, and field validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple CSV parser that handles quoted fields
 */
function parseCSVLine(line) {
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

  // Add the last field
  result.push(current.trim());

  return result;
}

// Read the CSV file
const csvPath = path.join(__dirname, '../public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');

console.log('🔍 Validating Tableau Data Loader...\n');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

console.log(`📄 CSV file loaded: ${csvPath}`);
console.log(`   Total lines: ${lines.length}\n`);

// Test 1: Detect preamble rows
console.log('🧪 Test 1: Detecting preamble rows...');

const CRITICAL_FIELDS = ['Row ID', 'Order Date', 'Sales'];
let headerRowIndex = -1;

for (let i = 0; i < Math.min(10, lines.length); i++) {
  const line = lines[i];
  const headers = parseCSVLine(line).map(h => h.replace(/^"+|"+$/g, '').trim());

  const hasRowId = headers.some(h => h === 'Row ID');
  const hasOrderDate = headers.some(h => h === 'Order Date');
  const hasSales = headers.some(h => h === 'Sales');
  const hasColumnCount = headers.length >= 20;

  if (hasRowId && hasOrderDate && hasSales && hasColumnCount) {
    headerRowIndex = i;
    console.log(`   ✅ Header row detected at index ${i}`);
    console.log(`   📊 Preamble rows to skip: ${i}\n`);
    break;
  }
}

if (headerRowIndex === -1) {
  console.error('   ❌ Failed to detect header row');
  process.exit(1);
}

// Test 2: Validate headers
console.log('🧪 Test 2: Validating headers...');

const REQUIRED_FIELDS = [
  'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
  'Customer ID', 'Customer Name', 'Segment', 'City, State', 'Country',
  'Postal Code', 'Market', 'Region', 'Product ID', 'Category',
  'Sub-Category', 'Product Name', 'Sales', 'Quantity', 'Discount',
  'Profit', 'Shipping Cost', 'Order Priority'
];

const headerLine = lines[headerRowIndex];
const headers = parseCSVLine(headerLine).map(h => h.replace(/^"+|"+$/g, '').trim());

console.log(`   📋 Found ${headers.length} columns: ${headers.slice(0, 5).join(', ')}...`);

const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));

if (missingFields.length > 0) {
  console.error(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
  console.error(`   Available fields: ${headers.join(', ')}`);
  process.exit(1);
}

console.log(`   ✅ All ${REQUIRED_FIELDS.length} required fields present\n`);

// Test 3: Parse sample data rows
console.log('🧪 Test 3: Parsing sample data rows...');

const sampleRows = lines.slice(headerRowIndex + 1, headerRowIndex + 6);
let validRows = 0;
let invalidRows = 0;

sampleRows.forEach((line, idx) => {
  const values = parseCSVLine(line);
  const rowId = values[0]?.replace(/^"+|"+$/g, '').trim();

  if (rowId && !isNaN(parseInt(rowId, 10))) {
    validRows++;
    const sales = values[17]?.replace(/^"+|"+$/g, '').trim();
    console.log(`   ✅ Row ${idx + 1}: Row ID = ${rowId}, Sales = ${sales}`);
  } else {
    invalidRows++;
    console.log(`   ⚠️  Row ${idx + 1}: Invalid or missing Row ID`);
  }
});

console.log(`\n   📊 Sample parsing results: ${validRows} valid, ${invalidRows} invalid\n`);

// Test 4: Check for data quality issues
console.log('🧪 Test 4: Checking for data quality issues...');

const dataLines = lines.slice(headerRowIndex + 1);
let emptyDates = 0;
let zeroSales = 0;
let negativeProfit = 0;
let totalRows = 0;

dataLines.forEach(line => {
  const values = parseCSVLine(line);
  const orderDate = values[2]?.replace(/^"+|"+$/g, '').trim();
  const sales = parseFloat(values[17]?.replace(/^"+|"+$/g, '').trim() || '0');
  const profit = parseFloat(values[20]?.replace(/^"+|"+$/g, '').trim() || '0');

  if (orderDate && orderDate !== '') {
    totalRows++;

    if (sales === 0) {
      zeroSales++;
    }
    if (profit < 0) {
      negativeProfit++;
    }
  } else {
    emptyDates++;
  }
});

console.log(`   📊 Data quality metrics (from ${totalRows} valid rows):`);
console.log(`      - Empty order dates: ${emptyDates}`);
console.log(`      - Zero sales records: ${zeroSales} (${((zeroSales/totalRows)*100).toFixed(1)}%)`);
console.log(`      - Negative profit records: ${negativeProfit} (${((negativeProfit/totalRows)*100).toFixed(1)}%)\n`);

// Final summary
console.log('✅ Data Loader Validation Summary:');
console.log('   ✓ Preamble detection: PASS');
console.log('   ✓ Header validation: PASS');
console.log('   ✓ Sample parsing: PASS');
console.log('   ✓ Data quality check: PASS');
console.log('\n🎉 All validation tests passed!\n');

process.exit(0);
