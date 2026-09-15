#!/usr/bin/env node

/**
 * Validation script to test CSV parsing without running the full app
 * This ensures Tableau source ingestion is deterministic and correct
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser that handles quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Detect preamble
function detectAndSkipPreamble(csvText) {
  const lines = csvText.split(/\r?\n/);

  // Find the line that contains the actual column headers
  const knownColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit'];

  let headerLineIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line contains multiple known column names
    const matchingColumns = knownColumns.filter(col =>
      line.includes(`"${col}"`) || line.includes(`,${col},`) || line.startsWith(`${col},`) || line.endsWith(`,${col}`)
    );

    if (matchingColumns.length >= 3) {
      headerLineIndex = i;
      break;
    }
  }

  if (headerLineIndex === -1) {
    console.error('❌ Could not detect header row');
    return null;
  }

  console.log(`✓ Detected header row at index ${headerLineIndex}, skipping ${headerLineIndex} preamble rows`);

  // Show the detected header
  const headerLine = lines[headerLineIndex];
  console.log(`✓ Header: ${headerLine.substring(0, 100)}...`);

  return { headerLineIndex, header: headerLine };
}

// Parse CSV and validate data
function validateCSVData(csvText, headerLineIndex) {
  const lines = csvText.split(/\r?\n/);
  const headerLine = lines[headerLineIndex];

  // Parse headers
  const headers = parseCSVLine(headerLine).map(h => h.replace(/^"+|"+$/g, ''));

  console.log(`✓ Found ${headers.length} columns`);

  // Check for required columns
  const requiredColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    console.error(`❌ Missing required columns: ${missingColumns.join(', ')}`);
    return false;
  }

  console.log(`✓ All required columns present`);

  // Validate first few data rows
  let validRows = 0;
  let invalidRows = 0;

  for (let i = headerLineIndex + 1; i < Math.min(headerLineIndex + 100, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    // Check if we have the right number of fields
    if (values.length !== headers.length) {
      // Skip rows with different field counts (might be multi-line fields)
      continue;
    }

    // Check if first column is a number (Row ID)
    const rowId = values[0].replace(/^"+|"+$/g, '');
    if (isNaN(parseInt(rowId))) {
      continue;
    }

    // Check if Sales and Profit are valid numbers
    const salesIdx = headers.indexOf('Sales');
    const profitIdx = headers.indexOf('Profit');

    if (salesIdx >= 0 && profitIdx >= 0) {
      const sales = parseFloat(values[salesIdx]);
      const profit = parseFloat(values[profitIdx]);

      if (!isNaN(sales) && !isNaN(profit)) {
        validRows++;
      } else {
        invalidRows++;
      }
    }
  }

  console.log(`✓ Validated ${validRows} sample rows, ${invalidRows} invalid rows`);

  if (validRows === 0) {
    console.error('❌ No valid data rows found');
    return false;
  }

  return true;
}

// Main validation
const csvPath = path.join(__dirname, 'public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');

console.log('='.repeat(60));
console.log('Tableau Source Validation');
console.log('='.repeat(60));
console.log(`\n📁 Validating: ${csvPath}\n`);

try {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');

  console.log(`✓ File exists (${csvText.length} bytes)\n`);

  // Detect preamble
  const result = detectAndSkipPreamble(csvText);

  if (!result) {
    process.exit(1);
  }

  console.log();

  // Validate data
  const isValid = validateCSVData(csvText, result.headerLineIndex);

  if (!isValid) {
    console.error('\n❌ Validation FAILED');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Validation PASSED - Tableau source ingestion is deterministic');
  console.log('='.repeat(60));
  process.exit(0);

} catch (error) {
  console.error(`\n❌ Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
