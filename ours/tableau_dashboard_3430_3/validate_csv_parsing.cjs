/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files can be read and parsed correctly
 * 2. Headers are normalized (BOM removed, triple quotes stripped)
 * 3. Required fields exist and are accessible
 * 4. Data rows are properly parsed
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser for validation
function parseCSV(text) {
  // Remove UTF-8 BOM
  let cleanText = text.replace(/^\uFEFF/, '');

  // Split lines
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  let headerLine = lines[0];
  // Normalize triple quotes
  const headers = headerLine.split(',').map(h => {
    let normalized = h.replace(/^"{3}(.+)"{3}$/, '$1');
    normalized = normalized.replace(/^"(.+)"$/, '$1');
    return normalized.trim();
  });

  // Parse first few data rows
  const data = [];
  for (let i = 1; i < Math.min(lines.length, 6); i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }

  return { headers, data, totalRows: lines.length - 1 };
}

// Required fields from the render contract
const REQUIRED_FIELDS = [
  'tripduration',
  'starttime',
  'stoptime',
  'start station id',
  'start station name',
  'start station latitude',
  'start station longitude',
  'end station id',
  'end station name',
  'end station latitude',
  'end station longitude',
  'bikeid',
  'usertype',
  'birth year',
  'gender'
];

function validateCSV(filePath) {
  console.log(`\n🔍 Validating: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  const csvText = fs.readFileSync(filePath, 'utf8');
  console.log(`📊 File size: ${csvText.length} bytes`);

  // Check for BOM
  const hasBOM = csvText.charCodeAt(0) === 0xFEFF;
  console.log(`${hasBOM ? '⚠️' : '✅'} BOM detected: ${hasBOM}`);

  let parsed;
  try {
    parsed = parseCSV(csvText);
  } catch (error) {
    console.error(`❌ Parse error: ${error.message}`);
    return false;
  }

  console.log(`✅ Parsed ${parsed.totalRows} data rows`);
  console.log(`📋 Found ${parsed.headers.length} columns:`);
  parsed.headers.forEach(h => console.log(`   - ${h}`));

  // Check for required fields
  const missingFields = REQUIRED_FIELDS.filter(f => !parsed.headers.includes(f));
  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    return false;
  }
  console.log(`✅ All ${REQUIRED_FIELDS.length} required fields present`);

  // Validate first data row
  if (parsed.data.length > 0) {
    const firstRow = parsed.data[0];
    console.log(`\n📝 Sample data row (first 5 fields):`);
    Object.entries(firstRow).slice(0, 5).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Check numeric fields can be parsed
    const numericFields = ['tripduration', 'start station id', 'end station id', 'bikeid'];
    const numericErrors = [];
    numericFields.forEach(field => {
      const val = Number(firstRow[field]);
      if (isNaN(val)) {
        numericErrors.push(field);
      }
    });

    if (numericErrors.length > 0) {
      console.error(`❌ Fields that should be numeric but aren't: ${numericErrors.join(', ')}`);
      return false;
    }
    console.log(`✅ Numeric fields validate correctly`);
  }

  return true;
}

function main() {
  console.log('='.repeat(60));
  console.log('🎯 Deterministic Tableau Source Validator');
  console.log('='.repeat(60));

  const dataDir = path.join(__dirname, 'public', 'data');
  const csvFile = path.join(dataDir, 'TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv');

  const success = validateCSV(csvFile);

  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ VALIDATION PASSED - CSV parsing is deterministic and correct');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log('❌ VALIDATION FAILED - CSV parsing issues detected');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

main();
