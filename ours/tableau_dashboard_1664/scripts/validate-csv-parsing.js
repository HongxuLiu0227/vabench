/**
 * Deterministic CSV parsing validator for Mars data
 *
 * This script validates:
 * 1. CSV can be read and parsed correctly
 * 2. Headers are normalized (no quoted/dirty headers)
 * 3. Required Tableau fields resolve to real columns
 * 4. Data types are correctly coerced
 * 5. No silent bad parses that lead to all-zero charts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simulate PapaParse behavior for validation
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const header = lines[0].split(',');
  console.log('Raw headers:', header);

  // Check for quoted or dirty headers
  const cleanHeaders = header.map(h => {
    const cleaned = h.trim().replace(/^"|"$/g, '').replace(/^""|""$/g, '');
    return cleaned;
  });
  console.log('Cleaned headers:', cleanHeaders);

  // Parse first data row
  if (lines.length < 2) {
    throw new Error('CSV file has no data rows');
  }

  const firstDataRow = lines[1].split(',');
  console.log('First data row (raw):', firstDataRow);

  // Create object mapping
  const dataObj = {};
  header.forEach((h, i) => {
    dataObj[h] = firstDataRow[i];
  });
  console.log('First data object:', dataObj);

  // Validate required Tableau fields from spec
  const requiredFields = [
    'sol',
    'month',
    'min_temp',
    'max_temp',
    'pressure',
    'Season'
  ];

  const missingFields = [];
  const emptyFields = [];

  requiredFields.forEach(field => {
    if (!cleanHeaders.includes(field)) {
      missingFields.push(field);
    }
    if (dataObj[field] === undefined || dataObj[field] === null || dataObj[field] === '') {
      emptyFields.push(field);
    }
  });

  return {
    headers: cleanHeaders,
    firstData: dataObj,
    missingFields,
    emptyFields,
    totalRows: lines.length - 1 // Subtract header
  };
}

function main() {
  const csvPath = path.join(__dirname, '..', 'public', 'data', 'mars_data.csv');

  console.log('=== CSV Parsing Validation ===');
  console.log('Validating:', csvPath);
  console.log();

  try {
    const result = parseCSV(csvPath);

    console.log('✓ CSV parsed successfully');
    console.log(`  Total rows: ${result.totalRows}`);
    console.log(`  Headers found: ${result.headers.join(', ')}`);
    console.log();

    if (result.missingFields.length > 0) {
      console.error('✗ Missing required fields:', result.missingFields.join(', '));
      process.exit(1);
    }

    if (result.emptyFields.length > 0) {
      console.error('✗ Empty fields in first row:', result.emptyFields.join(', '));
      process.exit(1);
    }

    console.log('✓ All required Tableau fields present');
    console.log('✓ First data row has valid values');
    console.log();

    // Validate numeric fields can be coerced
    const numericFields = ['sol', 'min_temp', 'max_temp', 'pressure'];
    console.log('Validating numeric coercion...');
    numericFields.forEach(field => {
      const val = Number(result.firstData[field]);
      if (isNaN(val)) {
        console.error(`✗ Field '${field}' cannot be coerced to number: "${result.firstData[field]}"`);
        process.exit(1);
      }
      console.log(`  ✓ ${field}: ${val}`);
    });

    console.log();
    console.log('=== All Validations Passed ✓ ===');
    console.log('CSV is ready for deterministic Tableau source ingestion');

  } catch (error) {
    console.error('✗ Validation failed:', error.message);
    process.exit(1);
  }
}

main();
