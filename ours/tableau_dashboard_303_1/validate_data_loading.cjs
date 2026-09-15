#!/usr/bin/env node
/**
 * Deterministic Tableau Source Validator
 * Tests that the data loader can parse the CSV files correctly
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'public/data/DfTRoadSafety_Accidents_2014.csv');

console.log('='.repeat(70));
console.log('Deterministic Tableau Source Validator');
console.log('='.repeat(70));

// Check if data file exists
if (!fs.existsSync(DATA_PATH)) {
  console.error(`❌ FAIL: Data file not found: ${DATA_PATH}`);
  process.exit(1);
}

console.log(`✓ Found data file: ${DATA_PATH}`);

// Read and parse CSV
let csvContent = fs.readFileSync(DATA_PATH, 'utf8');

// Normalize line endings
csvContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const lines = csvContent.split('\n').filter(line => line.trim());

if (lines.length === 0) {
  console.error('❌ FAIL: CSV file is empty');
  process.exit(1);
}

console.log(`✓ CSV has ${lines.length} lines (including header)`);

// Parse header
const headerLine = lines[0];
const headers = headerLine.split(',').map(h => h.trim().replace(/["\r\n\t]/g, ''));

console.log(`✓ Found ${headers.length} columns`);

// Check for critical fields
const criticalFields = [
  'Accident_Index',
  'Date',
  'Time',
  'Day_of_Week',
  'Accident_Severity',
  'Number_of_Casualties',
  'Light_Conditions'
];

const missingFields = criticalFields.filter(field => !headers.includes(field));
if (missingFields.length > 0) {
  console.error(`❌ FAIL: Missing critical fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

console.log(`✓ All critical fields present: ${criticalFields.join(', ')}`);

// Parse sample data rows (check more rows for better validation)
const sampleSize = Math.min(1000, lines.length - 1);
const sampleRows = lines.slice(1, sampleSize + 1);
let validDateCount = 0;
let validNumericFieldCount = 0;

const numericFields = [
  'Day_of_Week',
  'Accident_Severity',
  'Number_of_Casualties',
  'Light_Conditions'
];

for (let i = 0; i < sampleRows.length; i++) {
  const values = sampleRows[i].split(',');

  if (values.length !== headers.length) {
    console.warn(`⚠ Warning: Row ${i + 1} has ${values.length} values, expected ${headers.length}`);
    continue;
  }

  const record = {};
  headers.forEach((header, idx) => {
    record[header] = values[idx] ? values[idx].trim() : '';
  });

  // Validate date parsing
  if (record.Date) {
    const dateStr = record.Date;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) &&
          dayNum >= 1 && dayNum <= 31 &&
          monthNum >= 1 && monthNum <= 12 &&
          yearNum >= 1900 && yearNum <= 2100) {
        validDateCount++;
      }
    }
  }

  // Validate numeric fields
  let allNumericValid = true;
  for (const field of numericFields) {
    const value = record[field];
    if (value !== '') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        allNumericValid = false;
      }
    }
  }
  if (allNumericValid) {
    validNumericFieldCount++;
  }
}

// Calculate parse ratios
const dateParseRatio = validDateCount / sampleRows.length;
const numericParseRatio = validNumericFieldCount / sampleRows.length;

console.log(`\nDate Parsing Validation:`);
console.log(`  Valid dates: ${validDateCount}/${sampleRows.length} (${(dateParseRatio * 100).toFixed(1)}%)`);

if (dateParseRatio < 0.95) {
  console.error(`❌ FAIL: Date field 'Date' has low parse ratio ${(dateParseRatio).toFixed(2)}`);
  process.exit(1);
}

console.log(`✓ Date parsing ratio is acceptable (≥ 95%)`);

console.log(`\nNumeric Field Validation:`);
console.log(`  Valid numeric rows: ${validNumericFieldCount}/${sampleRows.length} (${(numericParseRatio * 100).toFixed(1)}%)`);

if (numericParseRatio < 0.95) {
  console.error(`❌ FAIL: Numeric fields have low parse ratio ${(numericParseRatio).toFixed(2)}`);
  process.exit(1);
}

console.log(`✓ Numeric field parsing ratio is acceptable (≥ 95%)`);

// Summary
console.log(`\n${'='.repeat(70)}`);
console.log(`✓ SUCCESS: All validations passed!`);
console.log(`  - Data file exists and is readable`);
console.log(`  - All critical fields are present`);
console.log(`  - Date parsing ratio: ${(dateParseRatio * 100).toFixed(1)}%`);
console.log(`  - Numeric field parsing ratio: ${(numericParseRatio * 100).toFixed(1)}%`);
console.log(`  - Sample rows validated: ${sampleRows.length}`);
console.log('='.repeat(70));

process.exit(0);
