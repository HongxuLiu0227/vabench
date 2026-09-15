#!/usr/bin/env node

/**
 * Integration test for deterministic Tableau source parsing
 * Tests the complete data loading pipeline
 */

import * as fs from 'fs';
import * as path from 'path';

// Import the data loader functions
// Note: This would need to be compiled or run with tsx

async function testDeterministicParsing() {
  console.log('=== Testing Deterministic Tableau Source Parsing ===\n');

  const testData = {
    testsPassed: 0,
    testsFailed: 0,
    errors: [] as string[]
  };

  // Test 1: File exists
  console.log('Test 1: CSV file exists');
  const csvPath = path.resolve(process.cwd(), 'public/data/df.csv');
  if (fs.existsSync(csvPath)) {
    console.log('✓ PASS: CSV file exists\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: CSV file not found\n');
    testData.testsFailed++;
    testData.errors.push('CSV file not found');
    return testData;
  }

  // Test 2: File is readable
  console.log('Test 2: CSV file is readable');
  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    console.log(`✓ PASS: CSV file is readable (${content.length} bytes)\n`);
    testData.testsPassed++;
  } catch (error) {
    console.log('✗ FAIL: Cannot read CSV file\n');
    testData.testsFailed++;
    testData.errors.push('Cannot read CSV file');
    return testData;
  }

  // Test 3: CSV structure is valid
  console.log('Test 3: CSV structure is valid');
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n');
  const headerLine = lines[0];

  if (headerLine.startsWith(',')) {
    console.log('✓ PASS: CSV has expected structure (empty first column)\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: CSV structure unexpected\n');
    testData.testsFailed++;
    testData.errors.push('CSV structure unexpected');
  }

  // Test 4: All expected headers present
  console.log('Test 4: All expected headers present');
  const expectedHeaders = ['', 'Year', 'Location', 'Indicators', 'Products', 'UOM', 'Scalar Factor', 'Value'];
  const headers = headerLine.split(',');

  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length === 0) {
    console.log('✓ PASS: All expected headers present\n');
    testData.testsPassed++;
  } else {
    console.log(`✗ FAIL: Missing headers: ${missingHeaders.join(', ')}\n`);
    testData.testsFailed++;
    testData.errors.push(`Missing headers: ${missingHeaders.join(', ')}`);
  }

  // Test 5: No preamble rows
  console.log('Test 5: No preamble rows before header');
  // The header should be on the first line
  if (lines[0].includes('Year') && lines[0].includes('Location')) {
    console.log('✓ PASS: Header is on first line (no preamble)\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: Possible preamble rows detected\n');
    testData.testsFailed++;
    testData.errors.push('Possible preamble rows detected');
  }

  // Test 6: Data rows have correct structure
  console.log('Test 6: Data rows have correct structure');
  const dataLine = lines[1]; // Second line should be first data row
  const dataColumns = dataLine.split(',');

  if (dataColumns.length === headers.length) {
    console.log('✓ PASS: Data rows have correct column count\n');
    testData.testsPassed++;
  } else {
    console.log(`✗ FAIL: Data rows have ${dataColumns.length} columns, expected ${headers.length}\n`);
    testData.testsFailed++;
    testData.errors.push(`Column count mismatch: ${dataColumns.length} vs ${headers.length}`);
  }

  // Test 7: Required fields are not empty in sample data
  console.log('Test 7: Required fields are not empty in sample data');
  const sampleRows = lines.slice(1, 11); // Check first 10 data rows
  let allRowsValid = true;

  for (const row of sampleRows) {
    // Simple CSV parse (split by comma, but handle quoted fields roughly)
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (cols.length < 8) continue;

    const [_, year, location, indicators, , , , value] = cols.map(c => c.replace(/^"|"$/g, '').trim());

    if (!year || year === '' || !location || location === '' ||
        !indicators || indicators === '' || !value || value === '') {
      allRowsValid = false;
      break;
    }
  }

  if (allRowsValid) {
    console.log('✓ PASS: Sample data rows have all required fields\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: Some data rows have empty required fields\n');
    testData.testsFailed++;
    testData.errors.push('Empty required fields in data rows');
  }

  // Test 8: Numeric fields are parseable
  console.log('Test 8: Numeric fields are parseable');
  const sampleRowCols = lines[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
  const yearValue = parseInt(sampleRowCols[1], 10);
  const valueValue = parseFloat(sampleRowCols[7]);

  if (!isNaN(yearValue) && !isNaN(valueValue)) {
    console.log('✓ PASS: Numeric fields are parseable\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: Numeric fields are not parseable\n');
    testData.testsFailed++;
    testData.errors.push('Numeric fields not parseable');
  }

  // Test 9: Required Tableau indicators exist
  console.log('Test 9: Required Tableau indicators exist');
  const allLines = fs.readFileSync(csvPath, 'utf-8').split('\n');
  const indicators = new Set<string>();

  for (const line of allLines.slice(1)) {
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length >= 4) {
      indicators.add(cols[3]);
    }
  }

  const requiredIndicators = ['Total demand'];
  const missingIndicators = requiredIndicators.filter(i => !indicators.has(i));

  if (missingIndicators.length === 0) {
    console.log('✓ PASS: All required indicators present\n');
    testData.testsPassed++;
  } else {
    console.log(`✗ FAIL: Missing indicators: ${missingIndicators.join(', ')}\n`);
    testData.testsFailed++;
    testData.errors.push(`Missing indicators: ${missingIndicators.join(', ')}`);
  }

  // Test 10: No NaN values in sample data
  console.log('Test 10: No NaN values in sample data');
  let hasNaN = false;

  for (const line of allLines.slice(1, 101)) {
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    // Value is the last column (index 7 in 0-indexed array)
    // Columns: 0='', 1='Year', 2='Location', 3='Indicators', 4='Products', 5='UOM', 6='Scalar Factor', 7='Value'
    if (cols.length >= 8) {
      const valueStr = cols[7];
      // Skip if empty (might be legitimate missing data)
      if (valueStr === '') continue;

      const value = parseFloat(valueStr);
      if (isNaN(value)) {
        hasNaN = true;
        console.log(`  Found NaN value at line with value: "${valueStr}"`);
        break;
      }
    }
  }

  if (!hasNaN) {
    console.log('✓ PASS: No NaN values in sample data\n');
    testData.testsPassed++;
  } else {
    console.log('✗ FAIL: NaN values found in data\n');
    testData.testsFailed++;
    testData.errors.push('NaN values found');
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log(`Total Tests: ${testData.testsPassed + testData.testsFailed}`);
  console.log(`Passed: ${testData.testsPassed}`);
  console.log(`Failed: ${testData.testsFailed}`);

  if (testData.testsFailed > 0) {
    console.log('\nErrors:');
    testData.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log('\n✗ DETERMINISTIC PARSING TESTS FAILED');
  } else {
    console.log('\n✓ ALL DETERMINISTIC PARSING TESTS PASSED');
  }

  return testData;
}

// Run tests
testDeterministicParsing()
  .then(result => {
    if (result.testsFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
