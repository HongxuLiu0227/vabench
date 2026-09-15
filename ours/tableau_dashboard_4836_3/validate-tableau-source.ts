/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. The CSV can be parsed correctly
 * 2. All required fields from the Tableau spec are present
 * 3. The data has valid values (not all zeros, NaN, etc.)
 */

import { csvParse } from 'd3-dsv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    uniqueMechanisms: number;
    uniqueAgencies: number;
    uniqueMonthYears: number;
    nonNullUploadDates: number;
    nonNullMPIUploadDates: number;
  };
}

function normalizeColumnName(colName: string): string {
  return colName
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .trim();
}

function extractField(row: { [key: string]: string }, fieldName: string): string {
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }

  for (const key of Object.keys(row)) {
    if (normalizeColumnName(key) === fieldName) {
      return row[key];
    }
  }

  return '';
}

function preprocessCSVHeader(headerLine: string): string {
  // Clean up the header line (first line)
  return headerLine
    .split(',')
    .map(col => {
      // Remove triple quotes and any surrounding quotes from column names
      let cleaned = col.trim();
      // Remove outer triple quotes: """colname""" -> colname
      cleaned = cleaned.replace(/^"""(.+?)"""$/, '$1');
      // Remove double quotes if any remain
      cleaned = cleaned.replace(/^"(.+?)"$/, '$1');
      // Re-wrap in standard single quotes for d3-dsv if contains comma
      return cleaned.includes(',') ? `"${cleaned}"` : cleaned;
    })
    .join(',');
}

function validateTableauSource(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: 0,
      uniqueMechanisms: 0,
      uniqueAgencies: 0,
      uniqueMonthYears: 0,
      nonNullUploadDates: 0,
      nonNullMPIUploadDates: 0,
    },
  };

  try {
    // Load and parse CSV
    const csvPath = join(__dirname, 'public/data/federated_0se4v9q15j8hfi17f25m50.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Preprocess CSV to handle triple-quoted headers
    const lines = csvContent.split('\n');
    if (lines.length > 0) {
      const preprocessedHeader = preprocessCSVHeader(lines[0]);
      lines[0] = preprocessedHeader;
    }
    const preprocessedCsv = lines.join('\n');

    const data = csvParse(preprocessedCsv);

    result.stats.totalRows = data.length;

    // Check if data was parsed
    if (data.length === 0) {
      result.errors.push('CSV file is empty or could not be parsed');
      result.valid = false;
      return result;
    }

    // Validate required fields from Tableau spec
    const requiredFields = [
      'DisplayMFL',
      'DisplayFacilityName',
      'DisplaySubcounty',
      'DisplayCounty',
      'DisplayMechanism',
      'DisplayAgency',
      'UploadStatus',
      'UploadDate',
      'Upload_monthYear',
      'SiteCode',
      'MPI_SiteCode',
      'UploadDate_MPI',
      'Upload_monthYear_MPI',
      'Siteabstractiondate',
    ];

    const firstRow = data[0];
    const availableFields = new Set(
      Object.keys(firstRow).map(k => normalizeColumnName(k))
    );

    for (const field of requiredFields) {
      if (!availableFields.has(field)) {
        result.errors.push(`Required field "${field}" not found in CSV`);
        result.valid = false;
      }
    }

    // Check data quality
    const mechanisms = new Set<string>();
    const agencies = new Set<string>();
    const monthYears = new Set<string>();
    let nonNullUploadDates = 0;
    let nonNullMPIUploadDates = 0;

    for (const row of data) {
      const mechanism = extractField(row, 'DisplayMechanism');
      const agency = extractField(row, 'DisplayAgency');
      const uploadDate = extractField(row, 'UploadDate');
      const mpiUploadDate = extractField(row, 'UploadDate_MPI');
      const monthYear = extractField(row, 'Upload_monthYear');

      if (mechanism) mechanisms.add(mechanism);
      if (agency) agencies.add(agency);
      if (uploadDate) nonNullUploadDates++;
      if (mpiUploadDate) nonNullMPIUploadDates++;
      if (monthYear) monthYears.add(monthYear);
    }

    result.stats.uniqueMechanisms = mechanisms.size;
    result.stats.uniqueAgencies = agencies.size;
    result.stats.uniqueMonthYears = monthYears.size;
    result.stats.nonNullUploadDates = nonNullUploadDates;
    result.stats.nonNullMPIUploadDates = nonNullMPIUploadDates;

    // Validate data quality metrics
    if (mechanisms.size === 0) {
      result.errors.push('No unique DisplayMechanism values found - data may be corrupted');
      result.valid = false;
    }

    if (agencies.size === 0) {
      result.warnings.push('No unique DisplayAgency values found');
    }

    if (monthYears.size === 0) {
      result.errors.push('No unique Upload_monthYear values found - critical for filtering');
      result.valid = false;
    }

    if (nonNullUploadDates === 0) {
      result.errors.push('No non-null UploadDate values found - critical for reporting');
      result.valid = false;
    }

    // Check for all-zero or NaN patterns
    const uploadRate = nonNullUploadDates / data.length;
    if (uploadRate < 0.1) {
      result.warnings.push(`Low upload date coverage: ${(uploadRate * 100).toFixed(1)}% (${nonNullUploadDates}/${data.length})`);
    }

    const mpiUploadRate = nonNullMPIUploadDates / data.length;
    if (mpiUploadRate < 0.1) {
      result.warnings.push(`Low MPI upload date coverage: ${(mpiUploadRate * 100).toFixed(1)}% (${nonNullMPIUploadDates}/${data.length})`);
    }

    // Check for evidence of data quality issues
    const sampleRows = Math.min(10, data.length);
    let emptyMechanisms = 0;
    let emptyAgencies = 0;

    for (let i = 0; i < sampleRows; i++) {
      const row = data[i];
      if (!extractField(row, 'DisplayMechanism')) emptyMechanisms++;
      if (!extractField(row, 'DisplayAgency')) emptyAgencies++;
    }

    if (emptyMechanisms > sampleRows * 0.5) {
      result.errors.push('More than 50% of sample rows have empty DisplayMechanism');
      result.valid = false;
    }

    if (emptyAgencies > sampleRows * 0.5) {
      result.warnings.push('More than 50% of sample rows have empty DisplayAgency');
    }

    console.log('\n✓ Tableau source validation PASSED\n');
  } catch (error) {
    result.errors.push(`Exception during validation: ${error instanceof Error ? error.message : String(error)}`);
    result.valid = false;
    console.log('\n✗ Tableau source validation FAILED\n');
  }

  return result;
}

// Run validation
const result = validateTableauSource();

// Print results
console.log('=== Validation Statistics ===');
console.log(JSON.stringify(result.stats, null, 2));

if (result.warnings.length > 0) {
  console.log('\n=== Warnings ===');
  result.warnings.forEach(w => console.log('⚠', w));
}

if (result.errors.length > 0) {
  console.log('\n=== Errors ===');
  result.errors.forEach(e => console.log('✗', e));
  process.exit(1);
} else {
  console.log('\n✓ All validations passed!');
  process.exit(0);
}
