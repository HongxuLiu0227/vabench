#!/usr/bin/env node
/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files exist in public/data/
 * 2. Headers are correctly parsed (no dirty quotes)
 * 3. Required Tableau spec fields are present
 * 4. Data rows can be parsed correctly
 * 5. Date fields are valid (not Jan 1970 for all rows)
 * 6. Numeric fields are valid (not NaN)
 *
 * Run with: node scripts/validate-tableau-source.cjs
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, GREEN);
}

function logError(message) {
  log(`✗ ${message}`, RED);
}

function logWarning(message) {
  log(`⚠ ${message}`, YELLOW);
}

function logInfo(message) {
  log(`ℹ ${message}`, BLUE);
}

// Parse CSV (simple implementation)
function csvParse(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      data.push(row);
    }
  }

  return { columns: headers, data };
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
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function normalizeHeader(header) {
  let normalized = header.trim();
  normalized = normalized.replace(/^\uFEFF/, '');
  normalized = normalized.replace(/\r+$/, '');

  while (normalized.startsWith('"""') || normalized.startsWith('"')) {
    if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
      normalized = normalized.slice(1, -1);
    } else if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    } else {
      break;
    }
  }

  if (normalized.startsWith('""') && normalized.endsWith('""')) {
    normalized = normalized.slice(1, -1);
  }

  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}

// Main validation
async function validateTableauSource() {
  logInfo('\n=== Deterministic Tableau Source Validator ===\n');

  let hasErrors = false;
  let hasWarnings = false;

  // 1. Check CSV file exists
  const csvPath = path.join(__dirname, '../public/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv');
  logInfo('Step 1: Checking CSV file exists...');

  if (!fs.existsSync(csvPath)) {
    logError(`CSV file not found: ${csvPath}`);
    return false;
  }
  logSuccess(`CSV file found: ${csvPath}`);

  // 2. Read and parse CSV
  logInfo('\nStep 2: Reading and parsing CSV...');
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = csvParse(csvText);

  if (parsed.columns.length === 0) {
    logError('No columns found in CSV');
    return false;
  }
  logSuccess(`Found ${parsed.columns.length} columns`);

  // 3. Normalize headers
  logInfo('\nStep 3: Normalizing headers...');
  const normalizedColumns = parsed.columns.map(col => normalizeHeader(col));
  logSuccess('Headers normalized successfully');
  logInfo('  Normalized columns: ' + normalizedColumns.slice(0, 5).join(', ') + '...');

  // 4. Check required fields
  logInfo('\nStep 4: Validating required Tableau fields...');
  const requiredFields = [
    'stoptime',
    'starttime',
    'tripduration',
    'start station id',
    'start station name'
  ];

  const availableFields = new Set(normalizedColumns.map(c => c.toLowerCase()));
  const missingFields = requiredFields.filter(f => !availableFields.has(f.toLowerCase()));

  if (missingFields.length > 0) {
    logError(`Missing required fields: ${missingFields.join(', ')}`);
    hasErrors = true;
  } else {
    logSuccess('All required fields present');
  }

  // 5. Validate data rows
  logInfo('\nStep 5: Validating data rows...');

  if (parsed.data.length === 0) {
    logError('No data rows found in CSV');
    return false;
  }
  logSuccess(`Found ${parsed.data.length} data rows`);

  // 6. Check date field validity
  logInfo('\nStep 6: Validating date fields...');
  let invalidDates = 0;
  let epochDates = 0;
  const sampleRows = parsed.data.slice(0, Math.min(100, parsed.data.length));

  sampleRows.forEach((row, idx) => {
    const stoptime = new Date(row[parsed.columns[normalizedColumns.indexOf('stoptime')]]);
    if (isNaN(stoptime.getTime())) {
      invalidDates++;
    } else if (stoptime.getFullYear() === 1970) {
      epochDates++;
    }
  });

  if (invalidDates > 0) {
    logError(`Found ${invalidDates} invalid dates in sample`);
    hasErrors = true;
  } else {
    logSuccess('No invalid dates found in sample');
  }

  if (epochDates > 5) {
    logWarning(`Found ${epochDates} dates from Jan 1970 (may indicate parsing issue)`);
    hasWarnings = true;
  } else {
    logSuccess('Dates are not defaulting to Jan 1970');
  }

  // 7. Check numeric field validity
  logInfo('\nStep 7: Validating numeric fields...');
  let invalidNumbers = 0;

  sampleRows.forEach((row) => {
    const tripdur = row[parsed.columns[normalizedColumns.indexOf('tripduration')]];
    if (isNaN(Number(tripdur))) {
      invalidNumbers++;
    }
  });

  if (invalidNumbers > 0) {
    logError(`Found ${invalidNumbers} invalid numeric values in sample`);
    hasErrors = true;
  } else {
    logSuccess('Numeric fields are valid');
  }

  // 8. Check data variety (not all zeros/same values)
  logInfo('\nStep 8: Checking data variety...');
  const stoptimes = sampleRows
    .map(row => new Date(row[parsed.columns[normalizedColumns.indexOf('stoptime')]]).getFullYear())
    .filter(y => !isNaN(y));

  const uniqueYears = new Set(stoptimes);

  if (uniqueYears.size === 0) {
    logError('No valid years found in data');
    hasErrors = true;
  } else if (uniqueYears.size === 1) {
    logWarning(`Data only contains 1 year: ${Array.from(uniqueYears)[0]}`);
    hasWarnings = true;
  } else {
    logSuccess(`Data contains ${uniqueYears.size} different years: ${Array.from(uniqueYears).sort().join(', ')}`);
  }

  // Summary
  logInfo('\n=== Validation Summary ===\n');

  if (hasErrors) {
    logError('Validation FAILED - Errors found that must be fixed');
    return false;
  } else if (hasWarnings) {
    logWarning('Validation PASSED with warnings');
    return true;
  } else {
    logSuccess('Validation PASSED - All checks successful');
    return true;
  }
}

// Run validation
validateTableauSource()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logError(`Validation error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
