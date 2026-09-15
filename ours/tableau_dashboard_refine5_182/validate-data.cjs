#!/usr/bin/env node

/**
 * Deterministic Tableau Source Validator
 * Validates that CSV data can be loaded and parsed correctly
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'public/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv');

function normalizeHeaderName(header) {
  return header
    .replace(/^\uFEFF/, '') // Remove UTF-8 BOM
    .trim()
    .replace(/^"+|"+$/g, ''); // Remove surrounding quotes
}

function safeParseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = Number(String(value).trim());
  return isNaN(parsed) ? 0 : parsed;
}

function validateCSV() {
  console.log('🔍 Validating Tableau source data...');
  console.log(`📁 Path: ${DATA_PATH}`);

  if (!fs.existsSync(DATA_PATH)) {
    console.error('❌ CSV file not found!');
    process.exit(1);
  }

  const csvText = fs.readFileSync(DATA_PATH, 'utf-8');

  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    console.log('✅ UTF-8 BOM detected and handled');
  }

  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    console.error('❌ CSV file is empty!');
    process.exit(1);
  }

  console.log(`📊 Total lines: ${lines.length}`);

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => normalizeHeaderName(h.trim()));

  console.log('📋 Headers:', headers.slice(0, 10).join(', '), '...');

  // Required fields from Tableau spec
  const requiredFields = [
    'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
    'Customer ID', 'Customer Name', 'Segment', 'Country', 'City', 'State',
    'Postal Code', 'Region', 'Product ID', 'Category', 'Sub-Category',
    'Product Name', 'Sales', 'Quantity', 'Discount', 'Profit'
  ];

  const missingFields = requiredFields.filter(field => !headers.includes(field));

  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields.join(', '));
    process.exit(1);
  }

  console.log('✅ All required fields present');

  // Parse sample data rows (first 10 data rows)
  const sampleLines = lines.slice(1, 11);
  const sampleData = sampleLines.map((line, idx) => {
    const values = line.split(',');
    return {
      index: idx + 1,
      sales: safeParseNumber(values[headers.indexOf('Sales')]),
      profit: safeParseNumber(values[headers.indexOf('Profit')]),
      quantity: safeParseNumber(values[headers.indexOf('Quantity')]),
      discount: safeParseNumber(values[headers.indexOf('Discount')]),
      region: values[headers.indexOf('Region')] || '',
      date: values[headers.indexOf('Order Date')] || ''
    };
  });

  // Validate numeric fields
  const totalSales = sampleData.reduce((sum, row) => sum + row.sales, 0);
  const totalProfit = sampleData.reduce((sum, row) => sum + row.profit, 0);
  const totalQuantity = sampleData.reduce((sum, row) => sum + row.quantity, 0);

  console.log('\n📈 Sample data validation (first 10 rows):');
  console.log(`   Total Sales: $${totalSales.toFixed(2)}`);
  console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`   Total Quantity: ${totalQuantity}`);

  if (totalSales === 0) {
    console.error('❌ All Sales values are zero - data may not be parsed correctly!');
    process.exit(1);
  }

  console.log('✅ Non-zero sales values detected');

  // Check for date parsing issues
  const validDates = sampleData.filter(row => row.date && row.date.match(/^\d{4}-\d{2}-\d{2}$/));
  if (validDates.length === 0) {
    console.warn('⚠️  No valid dates found in expected format (YYYY-MM-DD)');
  } else {
    console.log(`✅ ${validDates.length} valid dates found`);
  }

  // Check for region distribution
  const regions = new Set(sampleData.map(row => row.region).filter(r => r));
  console.log(`✅ Regions found: ${Array.from(regions).join(', ')}`);

  console.log('\n✅ All validations passed!');
  console.log('📦 Data is ready for deterministic Tableau rendering');
}

validateCSV();
