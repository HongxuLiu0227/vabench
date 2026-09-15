/**
 * CSV Parsing Validation Script
 *
 * This script validates that the CSV data can be parsed correctly
 * and that required Tableau fields are present and properly typed.
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Define the expected fields from the Tableau spec
const REQUIRED_FIELDS = [
  'CompID',
  'CompDate',
  'Сountry',
  'City',
  'StyleID',
  'Style',
  'Distance',
  'ResTime',
  'SwimmerId',
  'NameSwimmer',
  'GenderSwimmer',
  'BirthDateSwimmers',
  'RankSwimmers',
  'CountrySwimmers',
  'DopingRec',
  'TrainerID',
  'NameTrainer',
  'GenderTrainer',
  'RankTrainer',
];

// Normalize header function (must match the one in dataLoader.ts)
function normalizeHeaderKey(key: string): string {
  let cleaned = key.trim();
  while (cleaned.startsWith('"') || cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"') || cleaned.endsWith("'")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

interface ValidationResult {
  success: boolean;
  totalRows: number;
  parsedRows: number;
  headers: string[];
  normalizedHeaders: string[];
  missingFields: string[];
  sampleRow: Record<string, unknown>;
  errors: string[];
}

function validateCSVParsing(csvPath: string): ValidationResult {
  const result: ValidationResult = {
    success: false,
    totalRows: 0,
    parsedRows: 0,
    headers: [],
    normalizedHeaders: [],
    missingFields: [],
    sampleRow: {},
    errors: [],
  };

  try {
    console.log(`\n🔍 Validating CSV parsing for: ${csvPath}\n`);

    // Read the CSV file
    if (!fs.existsSync(csvPath)) {
      result.errors.push(`CSV file not found: ${csvPath}`);
      return result;
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');

    // Parse with PapaParse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      preview: 100, // Only parse first 100 rows for validation
    });

    if (parseResult.errors.length > 0) {
      result.errors.push(...parseResult.errors.map(e => e.message));
    }

    result.totalRows = parseResult.data.length;
    result.headers = parseResult.meta?.fields || [];
    result.normalizedHeaders = result.headers.map(normalizeHeaderKey);

    console.log('📊 Raw headers from CSV:');
    result.headers.slice(0, 5).forEach(h => console.log(`  - "${h}"`));
    console.log(`  ... and ${result.headers.length - 5} more\n`);

    console.log('✨ Normalized headers:');
    result.normalizedHeaders.slice(0, 5).forEach(h => console.log(`  - "${h}"`));
    console.log(`  ... and ${result.normalizedHeaders.length - 5} more\n`);

    // Check for required fields
    result.missingFields = REQUIRED_FIELDS.filter(
      field => !result.normalizedHeaders.includes(field)
    );

    if (result.missingFields.length > 0) {
      result.errors.push(
        `Missing required fields: ${result.missingFields.join(', ')}`
      );
    }

    // Validate first row
    if (parseResult.data.length > 0) {
      const firstRow = parseResult.data[0] as Record<string, unknown>;

      // Normalize keys in the row
      const normalizedRow: Record<string, unknown> = {};
      for (const key in firstRow) {
        const normalizedKey = normalizeHeaderKey(key);
        normalizedRow[normalizedKey] = firstRow[key];
      }

      result.sampleRow = normalizedRow;
      result.parsedRows = parseResult.data.length;

      console.log('📝 Sample parsed row (first 10 fields):');
      const sampleFields = Object.keys(normalizedRow).slice(0, 10);
      sampleFields.forEach(field => {
        console.log(`  - ${field}: ${JSON.stringify(normalizedRow[field])}`);
      });
      console.log('');
    }

    // Check for critical data quality issues
    if (result.parsedRows === 0) {
      result.errors.push('No data rows were parsed from the CSV');
    }

    // Validate critical fields in sample row
    if (result.sampleRow['SwimmerId'] === undefined || result.sampleRow['SwimmerId'] === '') {
      result.errors.push('SwimmerId field is missing or empty in sample row');
    }

    if (result.sampleRow['RankSwimmers'] === undefined || result.sampleRow['RankSwimmers'] === '') {
      result.errors.push('RankSwimmers field is missing or empty in sample row');
    }

    if (result.sampleRow['CountrySwimmers'] === undefined || result.sampleRow['CountrySwimmers'] === '') {
      result.errors.push('CountrySwimmers field is missing or empty in sample row');
    }

    result.success = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

// Main execution
const csvPath = path.resolve(
  '/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_160/public/data/vSwimmingCompetitions (SWIMMING_Comp).csv'
);

const validationResult = validateCSVParsing(csvPath);

// Print results
console.log('═'.repeat(70));
console.log('VALIDATION RESULTS');
console.log('═'.repeat(70));

if (validationResult.success) {
  console.log('✅ CSV PARSING VALIDATION PASSED\n');
  console.log(`📈 Total rows parsed: ${validationResult.parsedRows}`);
  console.log(`📋 Total columns: ${validationResult.headers.length}`);
  console.log(`✨ All required fields present: ${REQUIRED_FIELDS.length} fields\n`);
  console.log('✨ Data is ready for Tableau visualization\n');
  process.exit(0);
} else {
  console.log('❌ CSV PARSING VALIDATION FAILED\n');
  console.log(`Errors encountered: ${validationResult.errors.length}\n`);
  validationResult.errors.forEach((error, idx) => {
    console.log(`${idx + 1}. ${error}`);
  });
  console.log('');
  process.exit(1);
}
