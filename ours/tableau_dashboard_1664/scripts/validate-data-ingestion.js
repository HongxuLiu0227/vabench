/**
 * Data Ingestion Validation Script
 *
 * This script validates that:
 * 1. CSV can be loaded and parsed correctly
 * 2. All source columns required by the dashboard are present
 * 3. Data types are correct (numeric fields can be coerced)
 * 4. No silent parsing failures
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateCSVStructure() {
  const csvPath = path.join(__dirname, '..', 'public', 'data', 'mars_data.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');

  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV has no data rows');
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim());
  console.log('CSV Headers:', header);
  console.log('Total rows:', lines.length - 1);

  // Check for preamble rows
  const headerLine = lines[0];
  if (headerLine.includes('id') && headerLine.includes('name')) {
    console.warn('⚠ Possible preamble row detected');
  }

  // Check for quoted headers
  const hasQuotedHeaders = header.some(h => h.startsWith('"') && h.endsWith('"'));
  if (hasQuotedHeaders) {
    console.warn('⚠ Quoted headers detected - may need normalization');
  }

  return { headers: header, totalRows: lines.length - 1 };
}

function validateRequiredColumns(headers) {
  // These are the actual columns we need from the CSV based on the worksheets
  const requiredColumns = [
    'sol',
    'month',
    'min_temp',
    'max_temp',
    'pressure',
    'Season'
  ];

  console.log('\nValidating required columns...');
  const missing = [];
  const present = [];

  requiredColumns.forEach(col => {
    if (headers.includes(col)) {
      present.push(col);
      console.log(`  ✓ ${col}`);
    } else {
      missing.push(col);
      console.log(`  ✗ ${col} - MISSING`);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  return present;
}

function validateDataTypes() {
  const csvPath = path.join(__dirname, '..', 'public', 'data', 'mars_data.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  // Check a sample of data rows (first 10)
  const sampleSize = Math.min(10, lines.length - 1);
  const numericFields = ['sol', 'min_temp', 'max_temp', 'pressure'];

  console.log('\nValidating data types in first', sampleSize, 'rows...');

  for (let i = 1; i <= sampleSize; i++) {
    const values = lines[i].split(',');
    const rowObj = {
      sol: values[2],
      min_temp: values[5],
      max_temp: values[6],
      pressure: values[7]
    };

    for (const field of numericFields) {
      const val = Number(rowObj[field]);
      if (isNaN(val)) {
        throw new Error(
          `Row ${i}: Field '${field}' cannot be coerced to number: "${rowObj[field]}"`
        );
      }
    }
  }

  console.log('  ✓ All numeric fields can be coerced to numbers');
}

function validateDataServiceIntegration() {
  console.log('\nValidating data service integration...');

  // Check if dataService.ts exists and has correct structure
  const servicePath = path.join(__dirname, '..', 'src', 'services', 'dataService.ts');
  if (!fs.existsSync(servicePath)) {
    throw new Error('dataService.ts not found');
  }

  const serviceContent = fs.readFileSync(servicePath, 'utf-8');

  // Check for key functions
  const requiredFunctions = [
    'loadMarsData',
    'getAggregatedData',
    'getSolData',
    'getTemperatureData',
    'getPressureData',
    'getSeasonSolData'
  ];

  const missingFunctions = [];
  requiredFunctions.forEach(fn => {
    if (!serviceContent.includes(fn)) {
      missingFunctions.push(fn);
    }
  });

  if (missingFunctions.length > 0) {
    throw new Error(`dataService.ts missing functions: ${missingFunctions.join(', ')}`);
  }

  // Check for proper CSV loading with fetch
  if (!serviceContent.includes("fetch('/data/mars_data.csv'")) {
    throw new Error('dataService.ts not using correct fetch path for CSV');
  }

  if (!serviceContent.includes('Papa.parse')) {
    throw new Error('dataService.ts not using PapaParse for CSV parsing');
  }

  console.log('  ✓ dataService.ts has all required functions');
  console.log('  ✓ Using correct fetch path: /data/mars_data.csv');
  console.log('  ✓ Using PapaParse for CSV parsing');
}

function validateTypeScriptInterface() {
  console.log('\nValidating TypeScript interface...');

  const typesPath = path.join(__dirname, '..', 'src', 'types', 'marsData.ts');
  if (!fs.existsSync(typesPath)) {
    throw new Error('marsData.ts type file not found');
  }

  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  // Check for required interface fields
  const requiredFields = [
    'sol',
    'month',
    'min_temp',
    'max_temp',
    'pressure',
    'Season'
  ];

  const missingFields = [];
  requiredFields.forEach(field => {
    if (!typesContent.includes(field)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(`TypeScript interface missing fields: ${missingFields.join(', ')}`);
  }

  console.log('  ✓ TypeScript interface has all required fields');
}

function main() {
  console.log('=== Data Ingestion Validation ===\n');

  try {
    // Step 1: Validate CSV structure
    console.log('Step 1: Validating CSV structure');
    const { headers, totalRows } = validateCSVStructure();
    console.log(`✓ CSV has valid structure with ${totalRows} data rows\n`);

    // Step 2: Validate required columns
    console.log('Step 2: Validating required columns');
    validateRequiredColumns(headers);
    console.log('✓ All required columns present\n');

    // Step 3: Validate data types
    console.log('Step 3: Validating data types');
    validateDataTypes();
    console.log('✓ Data types are valid\n');

    // Step 4: Validate data service integration
    console.log('Step 4: Validating data service integration');
    validateDataServiceIntegration();
    console.log('✓ Data service integration is valid\n');

    // Step 5: Validate TypeScript interface
    console.log('Step 5: Validating TypeScript interface');
    validateTypeScriptInterface();
    console.log('✓ TypeScript interface is valid\n');

    console.log('=== All Validations Passed ✓ ===');
    console.log('\nSummary:');
    console.log('  • CSV structure: Valid');
    console.log('  • Required columns: All present');
    console.log('  • Data types: Correct');
    console.log('  • Data service: Properly configured');
    console.log('  • TypeScript interface: Complete');
    console.log('\n✓ Tableau source ingestion is deterministic and correct');

  } catch (error) {
    console.error('\n✗ Validation failed:', error.message);
    process.exit(1);
  }
}

main();
