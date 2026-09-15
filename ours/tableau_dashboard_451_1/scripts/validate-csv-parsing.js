/**
 * Validation script to test CSV parsing with the actual data file.
 * This ensures that:
 * 1. Triple-quoted headers are handled correctly
 * 2. BOM is removed
 * 3. All required fields are accessible
 * 4. Data types are correct (numbers, dates)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'public/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv');

function cleanCSVData(text) {
  // Remove BOM if present
  let cleaned = text.replace(/^\uFEFF/, '');

  // Replace triple quotes with single quotes in headers
  cleaned = cleaned.replace(/"""/g, '"');

  return cleaned;
}

function parseCSVLine(line) {
  // Simple CSV parser for validation
  const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
  const values = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    let value = match[1];
    // Remove quotes and unescape
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/""/g, '"');
    }
    values.push(value);
  }

  return values;
}

function main() {
  console.log('🔍 Validating CSV parsing...\n');

  // Read CSV file
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  console.log(`✅ CSV file loaded: ${csvPath}`);
  console.log(`   File size: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);

  // Check for BOM
  const hasBOM = csvContent.charCodeAt(0) === 0xFEFF;
  console.log(`   BOM detected: ${hasBOM ? 'Yes (will be removed)' : 'No'}`);

  // Clean the data
  const cleaned = cleanCSVData(csvContent);
  console.log(`✅ CSV data cleaned (BOM removed, triple quotes normalized)`);

  // Parse header
  const lines = cleaned.split('\n').filter(line => line.trim());
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  console.log(`\n📋 Headers parsed: ${headers.length} columns`);
  console.log('   Sample headers:', headers.slice(0, 5).join(', '));

  // Required fields from Tableau spec
  const requiredFields = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Ship Mode',
    'Customer ID',
    'Customer Name',
    'Segment',
    'Country/Region',
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

  console.log(`\n✅ Checking required fields...`);
  const missingFields = [];
  const foundFields = [];

  for (const field of requiredFields) {
    if (headers.includes(field)) {
      foundFields.push(field);
    } else {
      missingFields.push(field);
    }
  }

  console.log(`   Found: ${foundFields.length}/${requiredFields.length} required fields`);

  if (missingFields.length > 0) {
    console.warn(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
  } else {
    console.log(`   ✅ All required fields present!`);
  }

  // Parse first data row
  if (lines.length > 1) {
    const firstDataRow = lines[1];
    const dataValues = parseCSVLine(firstDataRow);

    console.log(`\n📊 First data row validation:`);
    console.log(`   Total rows: ${lines.length - 1}`);

    // Check some key fields
    const salesIdx = headers.indexOf('Sales');
    const profitIdx = headers.indexOf('Profit');
    const orderDateIdx = headers.indexOf('Order Date');
    const regionIdx = headers.indexOf('Region');

    if (salesIdx >= 0) {
      const sales = parseFloat(dataValues[salesIdx]);
      console.log(`   Sales: ${sales} (${!isNaN(sales) ? '✅ valid number' : '❌ invalid'})`);
    }

    if (profitIdx >= 0) {
      const profit = parseFloat(dataValues[profitIdx]);
      console.log(`   Profit: ${profit} (${!isNaN(profit) ? '✅ valid number' : '❌ invalid'})`);
    }

    if (orderDateIdx >= 0) {
      const orderDate = new Date(dataValues[orderDateIdx]);
      console.log(`   Order Date: ${dataValues[orderDateIdx]} (${!isNaN(orderDate.getTime()) ? '✅ valid date' : '❌ invalid'})`);
    }

    if (regionIdx >= 0) {
      console.log(`   Region: ${dataValues[regionIdx]} ✅`);
    }
  }

  // Check for data quality issues
  console.log(`\n🔍 Data quality checks:`);

  let validSalesCount = 0;
  let validProfitCount = 0;
  let validDateCount = 0;
  let sampleSize = Math.min(100, lines.length - 1);

  for (let i = 1; i <= sampleSize; i++) {
    const values = parseCSVLine(lines[i]);
    const sales = parseFloat(values[headers.indexOf('Sales')] || '0');
    const profit = parseFloat(values[headers.indexOf('Profit')] || '0');
    const orderDate = new Date(values[headers.indexOf('Order Date')] || '');

    if (!isNaN(sales) && sales > 0) validSalesCount++;
    if (!isNaN(profit)) validProfitCount++;
    if (!isNaN(orderDate.getTime()) && orderDate.getFullYear() > 1970) validDateCount++;
  }

  console.log(`   Sampled ${sampleSize} rows:`);
  console.log(`   - Valid Sales (>0): ${validSalesCount}/${sampleSize} (${(validSalesCount/sampleSize*100).toFixed(1)}%)`);
  console.log(`   - Valid Profit: ${validProfitCount}/${sampleSize} (${(validProfitCount/sampleSize*100).toFixed(1)}%)`);
  console.log(`   - Valid Order Dates: ${validDateCount}/${sampleSize} (${(validDateCount/sampleSize*100).toFixed(1)}%)`);

  // Final verdict
  const allTestsPassed =
    missingFields.length === 0 &&
    validSalesCount > sampleSize * 0.8 &&
    validProfitCount > sampleSize * 0.8 &&
    validDateCount > sampleSize * 0.8;

  console.log(`\n${allTestsPassed ? '✅' : '❌'} CSV parsing validation ${allTestsPassed ? 'PASSED' : 'FAILED'}`);

  if (!allTestsPassed) {
    process.exit(1);
  }
}

main();
