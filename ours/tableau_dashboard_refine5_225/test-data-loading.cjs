#!/usr/bin/env node

/**
 * Simple test script to verify CSV data loading works correctly
 * Run with: node test-data-loading.js
 */

const fs = require('fs');
const path = require('path');

// Test CSV parsing by reading the file directly
const csvPath = path.join(__dirname, 'public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv');

console.log('=== Testing CSV Data Loading ===\n');

try {
  // Read the file
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // Check for BOM
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    console.log('✅ UTF-8 BOM detected (will be removed during parsing)');
  } else {
    console.log('ℹ️  No UTF-8 BOM found');
  }

  // Split into lines
  const lines = csvContent.split(/\r?\n/);
  console.log(`✅ Total lines in file: ${lines.length}`);

  // Get headers
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());
  console.log(`✅ Number of columns: ${headers.length}`);
  console.log('   Columns:', headers.join(', '));

  // Check required fields
  const requiredFields = ['Order Date', 'Ship Date', 'Sales', 'Profit', 'Quantity', 'Discount', 'Sub-Category', 'Product Name'];
  const missingFields = requiredFields.filter(field => !headers.some(h => h.toLowerCase() === field.toLowerCase()));

  if (missingFields.length > 0) {
    console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
  } else {
    console.log('✅ All required fields present');
  }

  // Sample some data rows
  console.log('\n--- Sample Data Rows ---');
  for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
    const line = lines[i];
    if (line.trim()) {
      const values = line.split(','); // Simple split (doesn't handle quoted commas)
      console.log(`Row ${i}: ${values.slice(0, 5).join(', ')}...`);
    }
  }

  // Count total data rows
  const dataRows = lines.slice(1).filter(line => line.trim());
  console.log(`\n✅ Total data rows: ${dataRows.length}`);

  // Check for date format
  console.log('\n--- Date Format Check ---');
  const sampleRow = lines[1].split(',');
  const dateIndex = headers.findIndex(h => h.toLowerCase() === 'order date');
  if (dateIndex >= 0 && sampleRow[dateIndex]) {
    const dateValue = sampleRow[dateIndex].replace(/^"|"$/g, '');
    console.log(`Sample Order Date: ${dateValue}`);
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      console.log('✅ Date parsing works');
    } else {
      console.log('❌ Date parsing failed');
    }
  }

  console.log('\n=== Test Complete ===');

} catch (error) {
  console.error('❌ Error reading CSV:', error.message);
  process.exit(1);
}
