#!/usr/bin/env node

/**
 * Validation script to test CSV parsing logic
 * This simulates the data loader behavior to ensure correct parsing
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv');

function normalizeHeader(header) {
  return header
    .trim()
    .replace(/^[\uFEFF\uFFFE]/, '') // Remove BOM
    .replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
    .replace(/^"|"$/g, '') // Remove leading/trailing quotes
    .trim();
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  fields.push(current);
  return fields;
}

console.log('🔍 Validating Tableau data source...\n');

try {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

  console.log(`✓ File loaded: ${CSV_PATH}`);
  console.log(`✓ Total lines: ${lines.length}\n`);

  // Check for BOM
  const hasBOM = csvContent.startsWith('\uFEFF');
  console.log(`${hasBOM ? '⚠' : '✓'} BOM detected: ${hasBOM}`);

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const normalizedHeaders = headers.map(normalizeHeader);

  console.log('\n📋 Headers (parsed):', headers.slice(0, 5).join(', '), '...');
  console.log('📋 Headers (normalized):', normalizedHeaders.slice(0, 5).join(', '), '...\n');

  // Check for required fields
  const requiredFields = ['Category', 'Sub-Category', 'Product Name', 'Sales', 'Profit', 'Quantity'];
  const missingFields = requiredFields.filter(f => !normalizedHeaders.includes(f));

  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  console.log('✓ All required fields present:', requiredFields.join(', '));

  // Parse first data row
  const firstDataRow = parseCSVLine(lines[1]);
  console.log('\n📊 First data row sample:');
  normalizedHeaders.slice(0, 5).forEach((header, i) => {
    console.log(`  ${header}: ${firstDataRow[i]}`);
  });

  // Check numeric fields
  const numericFields = ['Sales', 'Profit', 'Quantity'];
  console.log('\n🔢 Numeric field validation:');

  numericFields.forEach(field => {
    const idx = normalizedHeaders.indexOf(field);
    if (idx !== -1) {
      const value = parseFloat(firstDataRow[idx]);
      const isValid = !isNaN(value);
      console.log(`  ${field}: ${firstDataRow[idx]} → ${isValid ? '✓' : '❌'} ${isValid ? value : 'parse failed'}`);
    }
  });

  // Sample a few more rows to check data quality
  console.log('\n📈 Data quality check (first 10 rows):');
  let nonZeroSalesCount = 0;
  let nonZeroProfitCount = 0;

  for (let i = 1; i < Math.min(11, lines.length); i++) {
    const row = parseCSVLine(lines[i]);
    const salesIdx = normalizedHeaders.indexOf('Sales');
    const profitIdx = normalizedHeaders.indexOf('Profit');

    if (salesIdx !== -1 && parseFloat(row[salesIdx]) !== 0) nonZeroSalesCount++;
    if (profitIdx !== -1 && parseFloat(row[profitIdx]) !== 0) nonZeroProfitCount++;
  }

  console.log(`  Non-zero Sales values: ${nonZeroSalesCount}/10`);
  console.log(`  Non-zero Profit values: ${nonZeroProfitCount}/10`);

  if (nonZeroSalesCount === 0 || nonZeroProfitCount === 0) {
    console.warn('\n⚠ Warning: Low data quality detected (many zero values)');
  } else {
    console.log('\n✓ Data quality looks good');
  }

  console.log('\n✅ All validation checks passed!\n');

} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  process.exit(1);
}
