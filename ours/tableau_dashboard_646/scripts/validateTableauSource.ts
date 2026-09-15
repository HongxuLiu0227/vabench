#!/usr/bin/env node
/**
 * Standalone Tableau Source Validator Script
 *
 * This script validates the CSV data source to ensure it meets all requirements
 * for deterministic Tableau dashboard rendering.
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Required field mappings
const REQUIRED_FIELDS = [
  { fieldName: 'Rank', expectedType: 'number' },
  { fieldName: 'Name', expectedType: 'string' },
  { fieldName: 'Platform', expectedType: 'string' },
  { fieldName: 'Year', expectedType: 'number' },
  { fieldName: 'Genre', expectedType: 'string' },
  { fieldName: 'Publisher', expectedType: 'string' },
  { fieldName: 'NA_Sales', expectedType: 'number' },
  { fieldName: 'EU_Sales', expectedType: 'number' },
  { fieldName: 'JP_Sales', expectedType: 'number' },
  { fieldName: 'Other_Sales', expectedType: 'number' },
  { fieldName: 'Global_Sales', expectedType: 'number' },
  { fieldName: 'Averaged_Sales', expectedType: 'number' },
];

const AGGREGATION_FIELDS = ['Global_Sales', 'Averaged_Sales', 'NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales'];
const DIMENSION_FIELDS = ['Genre', 'Publisher', 'Platform', 'Year'];

function normalizeHeader(header) {
  return header
    .replace(/^["']|["']$/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["'"]/g, '');
}

function detectHeaderLine(lines) {
  const knownFieldNames = ['Rank', 'Name', 'Platform', 'Year', 'Genre', 'Publisher', 'Global_Sales'];

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    const normalizedHeaders = line.split(',').map(h => normalizeHeader(h));

    const knownFieldCount = normalizedHeaders.filter(h =>
      knownFieldNames.some(field => h.includes(field))
    ).length;

    if (knownFieldCount >= 3) {
      return i;
    }
  }

  return 0;
}

function validateTableauSource(csvPath) {
  console.log('='.repeat(80));
  console.log('TABLEAU SOURCE VALIDATOR');
  console.log('='.repeat(80));

  const errors = [];
  const warnings = [];

  try {
    // Read CSV file
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());

    console.log(`\n📂 Loading CSV from: ${csvPath}`);
    console.log(`📊 Total lines: ${lines.length}`);

    // Detect header line
    const headerLineIndex = detectHeaderLine(lines);
    if (headerLineIndex > 0) {
      warnings.push(`Preamble detected: Skipping ${headerLineIndex} lines before header`);
    }

    // Parse CSV
    const csvToParse = lines.slice(headerLineIndex).join('\n');
    const parseResult = Papa.parse(csvToParse, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(err => {
        errors.push(`CSV parsing error at row ${err.row}: ${err.message}`);
      });
    }

    const data = parseResult.data;
    console.log(`✓ Parsed ${data.length} data rows\n`);

    // Check headers
    const rawHeaders = parseResult.meta.fields || [];
    const normalizedHeaders = rawHeaders.map(normalizeHeader);

    console.log('📋 Headers found:');
    rawHeaders.forEach(h => console.log(`  - ${h}`));
    console.log('');

    // Check for required fields
    const missingFields = [];
    const presentFields = new Set();

    REQUIRED_FIELDS.forEach(requiredField => {
      const found = normalizedHeaders.some(header => {
        const normalized = normalizeHeader(header);
        return normalized === requiredField.fieldName;
      });

      if (found) {
        presentFields.add(requiredField.fieldName);
      } else {
        missingFields.push(requiredField.fieldName);
      }
    });

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log(`✓ Required fields present: ${presentFields.size}/${REQUIRED_FIELDS.length}`);
    if (missingFields.length > 0) {
      console.log(`✗ Missing fields: ${missingFields.join(', ')}`);
    }

    // Calculate statistics
    const numericFieldStats = {};

    REQUIRED_FIELDS.filter(f => f.expectedType === 'number').forEach(field => {
      const values = data.map(row => row[field.fieldName]);

      const validValues = values
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));

      const nullCount = values.filter(v =>
        v === null || v === undefined || v === '' || isNaN(Number(v))
      ).length;

      if (validValues.length > 0) {
        numericFieldStats[field.fieldName] = {
          min: Math.min(...validValues),
          max: Math.max(...validValues),
          avg: validValues.reduce((a, b) => a + b, 0) / validValues.length,
          nullCount,
        };
      } else {
        numericFieldStats[field.fieldName] = {
          min: 0,
          max: 0,
          avg: 0,
          nullCount: values.length,
        };
      }
    });

    // Check for all-zero metrics
    AGGREGATION_FIELDS.forEach(field => {
      const allZero = data.every(row => {
        const val = Number(row[field]);
        return val === 0 || isNaN(val);
      });

      if (allZero && data.length > 0) {
        errors.push(`All values in field "${field}" are zero or NaN. This indicates a parsing error.`);
      }
    });

    // Validate Year field
    const yearValues = data.map(row => Number(row.Year)).filter(y => !isNaN(y));
    const badYears = yearValues.filter(y => y > 1000000000 || y < 1950 || y > 2030);
    if (badYears.length > 0) {
      warnings.push(`Found ${badYears.length} potentially invalid year values (Unix timestamps or out of range)`);
    }

    // Check dimension fields for empty values
    DIMENSION_FIELDS.forEach(field => {
      const emptyCount = data.filter(row =>
        !row[field] || row[field].toString().trim() === ''
      ).length;
      if (emptyCount > 0) {
        warnings.push(`Field "${field}" has ${emptyCount} empty values (${((emptyCount / data.length) * 100).toFixed(1)}%)`);
      }
    });

    // Display statistics
    console.log('\n📈 NUMERIC FIELD STATISTICS:');
    Object.entries(numericFieldStats).forEach(([field, stats]) => {
      console.log(`  ${field}:`);
      console.log(`    Min: ${stats.min.toFixed(2)}`);
      console.log(`    Max: ${stats.max.toFixed(2)}`);
      console.log(`    Avg: ${stats.avg.toFixed(2)}`);
      console.log(`    Nulls: ${stats.nullCount} (${((stats.nullCount / data.length) * 100).toFixed(1)}%)`);
    });

    // Display year range
    if (yearValues.length > 0) {
      const minYear = Math.min(...yearValues);
      const maxYear = Math.max(...yearValues);
      console.log(`\n📅 Year Range: ${minYear} - ${maxYear}`);
    }

    // Check for duplicates
    const names = data.map(row => row.Name).filter(n => n);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      warnings.push(`Duplicate game names detected: ${names.length - uniqueNames.size} duplicates`);
    }

    // Display warnings and errors
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(w => console.log(`  - ${w}`));
    }

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(e => console.log(`  - ${e}`));
      console.log('\n❌ VALIDATION FAILED\n');
      return false;
    } else {
      console.log('\n✅ VALIDATION PASSED\n');
      return true;
    }

  } catch (error) {
    console.error('\n❌ VALIDATION EXCEPTION:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Main execution
const csvPath = path.join(__dirname, '..', 'public', 'data', 'processed_data_All.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  process.exit(1);
}

const success = validateTableauSource(csvPath);
process.exit(success ? 0 : 1);
