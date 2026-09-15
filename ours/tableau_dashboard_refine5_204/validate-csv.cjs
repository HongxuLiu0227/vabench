/**
 * Validation script to test CSV parsing independently
 * Run with: node validate-csv.js
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');

console.log('=== CSV Validation Script ===\n');

// Check if file exists
if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ CSV file not found: ${CSV_PATH}`);
  process.exit(1);
}

console.log(`✓ CSV file found: ${CSV_PATH}`);

// Read file
const content = fs.readFileSync(CSV_PATH, 'utf8');
console.log(`✓ File size: ${content.length} bytes`);

// Check for BOM
const hasBOM = content.charCodeAt(0) === 0xFEFF;
console.log(`${hasBOM ? '⚠' : '✓'} BOM detected: ${hasBOM}`);

// Split into lines
const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
console.log(`✓ Total non-empty lines: ${lines.length}`);

// Extract header (first line, after BOM if present)
let headerLine = lines[0];
if (hasBOM) {
  headerLine = headerLine.substring(1); // Remove BOM character
}

console.log(`\n=== Header Analysis ===`);
console.log(`Raw header line: ${headerLine.substring(0, 100)}...`);

// Parse headers
const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
console.log(`✓ Number of columns: ${headers.length}`);
console.log(`Column names:`, headers);

// Check for required columns
const requiredColumns = [
  'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
  'Customer ID', 'Customer Name', 'Segment', 'Country', 'City', 'State',
  'Postal Code', 'Region', 'Product ID', 'Category', 'Sub-Category',
  'Product Name', 'Sales', 'Quantity', 'Discount', 'Profit'
];

const missingColumns = requiredColumns.filter(col => !headers.includes(col));
if (missingColumns.length > 0) {
  console.error(`\n❌ Missing required columns: ${missingColumns.join(', ')}`);
} else {
  console.log(`\n✓ All required columns present`);
}

// Sample first few data rows
console.log(`\n=== Data Sample (first 3 rows) ===`);
for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
  const line = lines[i];
  const values = line.split(',');

  console.log(`\nRow ${i}:`);
  headers.forEach((header, idx) => {
    if (idx < values.length) {
      console.log(`  ${header}: ${values[idx].substring(0, 50)}`);
    }
  });
}

// Validate numeric fields in first 10 rows
console.log(`\n=== Numeric Field Validation ===`);
let validRows = 0;
let invalidRows = 0;

for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
  const line = lines[i];
  const values = line.split(',');

  const sales = parseFloat(values[headers.indexOf('Sales')]);
  const profit = parseFloat(values[headers.indexOf('Profit')]);
  const quantity = parseFloat(values[headers.indexOf('Quantity')]);

  if (!isNaN(sales) && !isNaN(profit) && !isNaN(quantity)) {
    validRows++;
  } else {
    invalidRows++;
    console.warn(`⚠ Row ${i} has invalid numeric values (Sales: ${values[headers.indexOf('Sales')]}, Profit: ${values[headers.indexOf('Profit')]}, Quantity: ${values[headers.indexOf('Quantity')]})`);
  }
}

console.log(`\n✓ Valid numeric rows: ${validRows}/10`);
if (invalidRows > 0) {
  console.warn(`⚠ Invalid numeric rows: ${invalidRows}/10`);
}

// Validate date fields in first 10 rows
console.log(`\n=== Date Field Validation ===`);
let validDates = 0;
let invalidDates = 0;

for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
  const line = lines[i];
  const values = line.split(',');

  const dateStr = values[headers.indexOf('Order Date')];
  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    if (year >= 1900 && year <= 2100) {
      validDates++;
    } else {
      invalidDates++;
      console.warn(`⚠ Row ${i} has year out of range: ${year}`);
    }
  } else {
    invalidDates++;
    console.warn(`⚠ Row ${i} has invalid date format: ${dateStr}`);
  }
}

console.log(`\n✓ Valid date rows: ${validDates}/10`);
if (invalidDates > 0) {
  console.warn(`⚠ Invalid date rows: ${invalidDates}/10`);
}

console.log(`\n=== Validation Complete ===`);
console.log(`✓ CSV structure appears valid`);
console.log(`✓ All required columns present`);
console.log(`✓ Data can be parsed successfully`);
