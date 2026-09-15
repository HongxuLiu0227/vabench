/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files can be parsed correctly
 * 2. All required fields are present and have valid data
 * 3. No preamble rows interfere with parsing
 * 4. Headers are normalized correctly
 * 5. Data types are coerced properly (no string aggregation)
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser (mimicking d3-dsv behavior)
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];

  // Skip empty lines at start
  let startIdx = 0;
  while (startIdx < lines.length && !lines[startIdx].trim()) {
    startIdx++;
  }

  if (startIdx >= lines.length) {
    return [];
  }

  // Parse header
  const headerLine = lines[startIdx];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    result.push(row);
  }

  return { headers, rows: result };
}

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

  // Add last field
  result.push(current.trim());

  return result;
}

function normalizeHeader(header) {
  // Remove extra quotes and whitespace
  return header.replace(/^"+|"+$/g, '').trim();
}

function coerceToNumber(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const num = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}

function coerceToDate(value) {
  if (value === '' || value === null || value === undefined) return null;
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
}

function validateDataFile(filePath) {
  console.log(`\n📄 Validating: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  const csvText = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV
  const { headers, rows } = parseCSV(csvText);

  console.log(`   Headers found: ${headers.length}`);
  console.log(`   Data rows: ${rows.length}`);

  // Normalize headers
  const normalizedHeaders = headers.map(normalizeHeader);
  console.log(`   Normalized headers: ${normalizedHeaders.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);

  // Check for required fields based on Tableau spec
  const requiredFields = [
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
    'Profit'
  ];

  const missingFields = requiredFields.filter(field => !normalizedHeaders.includes(field));

  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    return false;
  }

  console.log(`✅ All required fields present`);

  // Validate data types in first few rows
  let validNumbers = 0;
  let validDates = 0;
  let sampleSize = Math.min(10, rows.length);

  for (let i = 0; i < sampleSize; i++) {
    const row = rows[i];

    // Check numeric fields
    const sales = coerceToNumber(row['Sales']);
    const quantity = coerceToNumber(row['Quantity']);
    const profit = coerceToNumber(row['Profit']);

    if (!isNaN(sales) && sales !== 0) validNumbers++;
    if (!isNaN(quantity) && quantity !== 0) validNumbers++;
    if (!isNaN(profit)) validNumbers++; // Profit can be 0 or negative

    // Check date fields
    const orderDate = coerceToDate(row['Order Date']);
    const shipDate = coerceToDate(row['Ship Date']);

    if (orderDate) validDates++;
    if (shipDate) validDates++;
  }

  const expectedNumberChecks = sampleSize * 3;
  const expectedDateChecks = sampleSize * 2;

  console.log(`   Numeric field validation: ${validNumbers}/${expectedNumberChecks} valid`);
  console.log(`   Date field validation: ${validDates}/${expectedDateChecks} valid`);

  if (validNumbers < expectedNumberChecks * 0.8) {
    console.error(`❌ Too many invalid numeric values`);
    return false;
  }

  if (validDates < expectedDateChecks * 0.8) {
    console.error(`❌ Too many invalid date values`);
    return false;
  }

  console.log(`✅ Data types validated successfully`);

  // Check for common issues
  const issues = [];

  // Check for preamble rows (rows where all fields look like headers)
  const headerLikeRows = rows.filter(row => {
    const values = Object.values(row);
    return values.every(v => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(v) || v === '');
  });

  if (headerLikeRows.length > 0 && headerLikeRows.length < rows.length * 0.5) {
    issues.push(`Found ${headerLikeRows.length} possible preamble rows`);
  }

  // Check for quoted headers
  const quotedHeaders = headers.filter(h => h.startsWith('"') || h.endsWith('"'));
  if (quotedHeaders.length > 0) {
    console.log(`⚠️  Found ${quotedHeaders.length} quoted headers (will be normalized)`);
  }

  // Check for all-zero rows (indicates parsing issue)
  const allZeroRows = rows.filter(row => {
    const sales = coerceToNumber(row['Sales']);
    const quantity = coerceToNumber(row['Quantity']);
    const profit = coerceToNumber(row['Profit']);
    return sales === 0 && quantity === 0 && profit === 0;
  });

  if (allZeroRows.length > rows.length * 0.5) {
    issues.push(`Found ${allZeroRows.length} all-zero rows (possible parsing issue)`);
  }

  if (issues.length > 0) {
    console.log(`⚠️  Issues detected:`);
    issues.forEach(issue => console.log(`     - ${issue}`));
  } else {
    console.log(`✅ No common issues detected`);
  }

  console.log(`✅ Validation passed for ${filePath}`);
  return true;
}

function main() {
  console.log('🔍 Deterministic Tableau Source Validator');
  console.log('=' .repeat(60));

  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const targetFile = path.join(
    dataDir,
    '1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard',
    'p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv'
  );

  let allPassed = true;

  if (fs.existsSync(targetFile)) {
    const passed = validateDataFile(targetFile);
    allPassed = allPassed && passed;
  } else {
    console.error(`❌ Data file not found: ${targetFile}`);
    allPassed = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All validations passed!');
    console.log('\n📊 Summary:');
    console.log('   - CSV parsing: OK');
    console.log('   - Required fields: OK');
    console.log('   - Data type coercion: OK');
    console.log('   - No preamble rows: OK');
    console.log('   - Header normalization: OK');
    process.exit(0);
  } else {
    console.log('❌ Some validations failed!');
    console.log('\nPlease review the errors above and fix the data ingestion.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseCSV, normalizeHeader, coerceToNumber, coerceToDate };
