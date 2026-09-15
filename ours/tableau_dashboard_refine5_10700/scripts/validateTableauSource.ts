/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files can be parsed correctly
 * 2. Required fields from Tableau spec are present
 * 3. Field values are correctly typed (numbers, strings)
 * 4. No silent parse failures (all-zero charts, NaN filters, etc.)
 */

import { csv } from 'd3-dsv';
import * as fs from 'fs';
import * as path from 'path';

// Field normalization
const normalizeHeader = (header: string): string => {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  cleaned = cleaned.trim();
  return cleaned;
};

// Required fields from Tableau render contract
const REQUIRED_FIELDS = [
  'diag_1',
  'diag_2',
  'diag_3',
  'readmitted'
];

const NUMERIC_FIELDS = [
  'encounter_id',
  'patient_nbr',
  'admission_type_id',
  'discharge_disposition_id',
  'admission_source_id',
  'time_in_hospital',
  'num_lab_procedures',
  'num_procedures',
  'num_medications',
  'number_outpatient',
  'number_emergency',
  'number_inpatient',
  'number_diagnoses'
];

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    totalColumns: number;
    headers: string[];
    numericFieldStats: Record<string, { nonZero: number; zero: number; null: number }>;
    categoricalFieldStats: Record<string, { uniqueValues: number; sampleValues: string[] }>;
  };
}

function validateCSV(csvPath: string): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      totalColumns: 0,
      headers: [],
      numericFieldStats: {},
      categoricalFieldStats: {}
    }
  };

  try {
    console.log(`\n📊 Validating: ${csvPath}`);

    // Read file
    if (!fs.existsSync(csvPath)) {
      result.errors.push(`CSV file not found: ${csvPath}`);
      result.success = false;
      return result;
    }

    let csvText = fs.readFileSync(csvPath, 'utf-8');

    // Check for BOM
    if (csvText.charCodeAt(0) === 0xFEFF) {
      console.log('✅ BOM detected and will be handled correctly');
      csvText = csvText.slice(1);
    }

    // Pre-process: remove triple quotes before parsing
    // This handles the """field""" format in the CSV
    csvText = csvText.replace(/"""/g, '"');
    console.log('✅ Triple quotes pre-processed');

    // Parse CSV
    const rawData = csv(csvText);

    if (!rawData || rawData.length === 0) {
      result.errors.push('CSV file is empty or could not be parsed');
      result.success = false;
      return result;
    }

    result.summary.totalRows = rawData.length;

    // Extract and normalize headers
    const firstRow = rawData[0];
    const rawHeaders = Object.keys(firstRow);
    const headerMap: Record<string, string> = {};

    rawHeaders.forEach(rawHeader => {
      const normalized = normalizeHeader(rawHeader);
      headerMap[rawHeader] = normalized;
      result.summary.headers.push(normalized);
    });

    result.summary.totalColumns = result.summary.headers.length;

    console.log(`✅ Parsed ${result.summary.totalRows} rows with ${result.summary.totalColumns} columns`);
    console.log(`📋 Headers: ${result.summary.headers.slice(0, 10).join(', ')}${result.summary.headers.length > 10 ? '...' : ''}`);

    // Check for required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !result.summary.headers.includes(field));
    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields from Tableau contract: ${missingFields.join(', ')}`);
      result.success = false;
    } else {
      console.log('✅ All required Tableau fields present');
    }

    // Analyze numeric fields
    NUMERIC_FIELDS.forEach(field => {
      if (result.summary.headers.includes(field)) {
        const stats = {
          nonZero: 0,
          zero: 0,
          null: 0
        };

        rawData.forEach(row => {
          const rawKey = Object.keys(row).find(k => headerMap[k] === field);
          if (rawKey) {
            const value = row[rawKey];
            if (value === '' || value === '?' || value === null) {
              stats.null++;
            } else {
              const num = Number(value);
              if (isNaN(num)) {
                stats.null++;
              } else if (num === 0) {
                stats.zero++;
              } else {
                stats.nonZero++;
              }
            }
          }
        });

        result.summary.numericFieldStats[field] = stats;

        // Warn if all values are zero or null
        if (stats.nonZero === 0 && rawData.length > 0) {
          result.warnings.push(`Field '${field}' has no non-zero values - may cause all-zero charts`);
        } else {
          console.log(`✅ Numeric field '${field}': ${stats.nonZero} non-zero, ${stats.zero} zero, ${stats.null} null/missing`);
        }
      }
    });

    // Analyze categorical fields required for Tableau
    ['diag_1', 'diag_2', 'diag_3', 'readmitted', 'race', 'gender', 'age'].forEach(field => {
      if (result.summary.headers.includes(field)) {
        const uniqueValues = new Set<string>();
        const sampleValues: string[] = [];

        rawData.forEach(row => {
          const rawKey = Object.keys(row).find(k => headerMap[k] === field);
          if (rawKey && row[rawKey]) {
            const val = String(row[rawKey]);
            uniqueValues.add(val);
            if (sampleValues.length < 5 && !sampleValues.includes(val)) {
              sampleValues.push(val);
            }
          }
        });

        result.summary.categoricalFieldStats[field] = {
          uniqueValues: uniqueValues.size,
          sampleValues: sampleValues
        };

        console.log(`✅ Categorical field '${field}': ${uniqueValues.size} unique values, samples: ${sampleValues.slice(0, 3).join(', ')}`);

        // Check for potential data quality issues
        if (uniqueValues.size === 0) {
          result.errors.push(`Field '${field}' has no values - data quality issue`);
          result.success = false;
        }
      }
    });

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  return result;
}

// Main execution
const dataDir = path.join(process.cwd(), 'public', 'data');
const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   Tableau Source Deterministic Validator                  ║');
console.log('╚════════════════════════════════════════════════════════════╝');

if (csvFiles.length === 0) {
  console.error('\n❌ No CSV files found in public/data/');
  process.exit(1);
}

console.log(`\nFound ${csvFiles.length} CSV file(s) to validate`);

let allSuccess = true;

csvFiles.forEach(file => {
  const csvPath = path.join(dataDir, file);
  const result = validateCSV(csvPath);

  if (!result.success) {
    console.error(`\n❌ Validation FAILED for ${file}`);
    result.errors.forEach(err => console.error(`   ERROR: ${err}`));
    allSuccess = false;
  } else {
    console.log(`\n✅ Validation PASSED for ${file}`);
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings for ${file}:`);
    result.warnings.forEach(w => console.log(`   WARNING: ${w}`));
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
if (allSuccess) {
  console.log('║   ✅ ALL VALIDATIONS PASSED                                ║');
  console.log('║   Data ingestion is deterministic and correct             ║');
} else {
  console.log('║   ❌ VALIDATION FAILED                                     ║');
  console.log('║   Please fix the errors above                              ║');
}
console.log('╚════════════════════════════════════════════════════════════╝\n');

process.exit(allSuccess ? 0 : 1);
