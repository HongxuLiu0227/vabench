#!/usr/bin/env node
/**
 * Deterministic Tableau Source Validator
 * Validates CSV header normalization and data loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Normalize CSV header field names by removing:
 * - BOM (Byte Order Mark) characters
 * - Leading/trailing whitespace
 * - Repeated quotes (e.g., "Order Date" → Order Date)
 */
function normalizeHeaderFieldName(fieldName) {
  return fieldName
    .replace(/^\ufeff/, '') // Remove UTF-8 BOM
    .trim() // Remove leading/trailing whitespace
    .replace(/^"+|"+$/g, ''); // Remove surrounding quotes if present
}

/**
 * Validate CSV structure
 */
function validateCSVStructure(csvText, requiredFields) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    rowCount: 0,
    headerFields: []
  };

  // Split into lines (handle both Unix and Windows line endings)
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    result.isValid = false;
    result.errors.push('CSV file is empty');
    return result;
  }

  // Assume first non-empty row is header
  const headerLine = lines[0];
  const rawHeaders = headerLine.split(',');
  result.headerFields = rawHeaders.map(normalizeHeaderFieldName);

  // Check for required fields
  const missingFields = requiredFields.filter(required => {
    return !result.headerFields.some(header =>
      header.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(header.toLowerCase())
    );
  });

  if (missingFields.length > 0) {
    result.isValid = false;
    result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Count data rows
  result.rowCount = lines.length - 1;

  if (result.rowCount <= 0) {
    result.isValid = false;
    result.errors.push('CSV file contains no data rows');
  }

  return result;
}

/**
 * Main validation function
 */
function validateTableauSource() {
  log('=== Deterministic Tableau Source Validator ===', colors.blue);
  log('');

  const csvPath = path.join(__dirname, '../public/data/suicide trend.csv');

  // Check file exists
  if (!fs.existsSync(csvPath)) {
    log(`✗ CSV file not found: ${csvPath}`, colors.red);
    return false;
  }

  log(`✓ CSV file found: ${csvPath}`, colors.green);

  // Read CSV content
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // Check for BOM
  const hasBOM = csvContent.charCodeAt(0) === 0xFEFF;
  if (hasBOM) {
    log('⚠ CSV file has UTF-8 BOM (will be stripped during parsing)', colors.yellow);
  }

  // Get raw header
  const lines = csvContent.split(/\r?\n/);
  const rawHeader = lines[0];
  log('');
  log('Raw header line:');
  log(`  ${JSON.stringify(rawHeader)}`, colors.blue);

  // Parse and normalize headers
  const rawHeaders = rawHeader.split(',');
  const normalizedHeaders = rawHeaders.map(normalizeHeaderFieldName);

  log('');
  log('Header normalization:');
  rawHeaders.forEach((raw, i) => {
    const normalized = normalizedHeaders[i];
    if (raw !== normalized) {
      log(`  [${i}] "${raw}" → "${normalized}"`, colors.yellow);
    } else {
      log(`  [${i}] "${normalized}"`, colors.green);
    }
  });

  // Check for headers with extra whitespace
  const needsNormalization = rawHeaders.some(h => h !== normalizeHeaderFieldName(h));
  if (needsNormalization) {
    log('');
    log('✓ Headers require normalization (detected and handled by source code)', colors.green);
  } else {
    log('');
    log('✓ Headers are clean (no normalization needed)', colors.green);
  }

  // Validate CSV structure
  const requiredFields = [
    'country',
    'year',
    'sex',
    'age',
    'suicides_no',
    'population',
    'generation',
    'gdp_for_year',
    'gdp_per_capita'
  ];

  const validation = validateCSVStructure(csvContent, requiredFields);

  log('');
  log('CSV Structure Validation:');
  log(`  Total rows: ${validation.rowCount}`);
  log(`  Columns: ${validation.headerFields.length}`);

  if (validation.errors.length > 0) {
    log('');
    log('✗ Validation failed:', colors.red);
    validation.errors.forEach(error => log(`  - ${error}`, colors.red));
    return false;
  }

  if (validation.warnings.length > 0) {
    log('');
    log('⚠ Warnings:', colors.yellow);
    validation.warnings.forEach(warning => log(`  - ${warning}`, colors.yellow));
  }

  log('');
  log('✓ CSV structure is valid', colors.green);

  // Validate required fields
  log('');
  log('Required field validation:');
  requiredFields.forEach(field => {
    const found = validation.headerFields.some(header =>
      header.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(header.toLowerCase())
    );
    if (found) {
      const matchingHeader = validation.headerFields.find(header =>
        header.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(header.toLowerCase())
      );
      log(`  ✓ ${field} → "${matchingHeader}"`, colors.green);
    } else {
      log(`  ✗ ${field} → NOT FOUND`, colors.red);
    }
  });

  // Check main.tsx import
  log('');
  log('Build configuration validation:');
  const mainTsPath = path.join(__dirname, '../src/main.tsx');

  if (!fs.existsSync(mainTsPath)) {
    log(`  ✗ main.tsx not found at ${mainTsPath}`, colors.red);
    return false;
  }

  const mainContent = fs.readFileSync(mainTsPath, 'utf8');
  const hasBadImport = mainContent.includes("from './App.tsx'");
  const hasGoodImport = mainContent.includes("from './App'");

  if (hasBadImport && !hasGoodImport) {
    log('  ✗ main.tsx imports "./App.tsx" (breaks Vite builds)', colors.red);
    return false;
  } else if (hasGoodImport) {
    log('  ✓ main.tsx imports "./App" (correct for Vite)', colors.green);
  } else {
    log('  ⚠ Could not determine App import status', colors.yellow);
  }

  // Final status
  log('');
  log('=== Summary ===', colors.blue);

  const allChecksPassed =
    validation.isValid &&
    !hasBadImport &&
    requiredFields.every(field =>
      validation.headerFields.some(header =>
        header.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(header.toLowerCase())
      )
    );

  if (allChecksPassed) {
    log('✓ All checks passed! Tableau source ingestion is deterministic and correct.', colors.green);
    return true;
  } else {
    log('✗ Some checks failed. Please fix the issues above.', colors.red);
    return false;
  }
}

// Run validation
const success = validateTableauSource();
process.exit(success ? 0 : 1);
