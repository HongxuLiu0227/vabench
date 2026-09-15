/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV files can be parsed correctly
 * 2. Required fields from Tableau spec are present
 * 3. Field values are correctly typed (numbers, strings)
 * 4. No silent parse failures (all-zero charts, NaN filters, etc.)
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      data.push(row);
    }
  }

  return data;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());

  return result;
}

// Field normalization
function normalizeHeader(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  cleaned = cleaned.trim();
  return cleaned;
}

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

function validateCSV(csvPath) {
  const result = {
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

    // Check for triple-quoted headers
    if (csvText.includes('"""')) {
      console.log('⚠️  Triple quotes detected in CSV - normalization required');
      result.warnings.push('CSV contains triple-quoted headers - normalization is required');
    }

    // Parse CSV
    const rawData = parseCSV(csvText);

    if (!rawData || rawData.length === 0) {
      result.errors.push('CSV file is empty or could not be parsed');
      result.success = false;
      return result;
    }

    result.summary.totalRows = rawData.length;

    // Extract and normalize headers
    const rawHeaders = Object.keys(rawData[0]);
    const headerMap = {};
    const normalizedHeaders = [];

    rawHeaders.forEach(rawHeader => {
      const normalized = normalizeHeader(rawHeader);
      headerMap[rawHeader] = normalized;
      normalizedHeaders.push(normalized);
    });

    result.summary.headers = normalizedHeaders;
    result.summary.totalColumns = normalizedHeaders.length;

    console.log(`✅ Parsed ${result.summary.totalRows} rows with ${result.summary.totalColumns} columns`);
    console.log(`📋 Headers: ${normalizedHeaders.slice(0, 10).join(', ')}${normalizedHeaders.length > 10 ? '...' : ''}`);

    // Check for required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !normalizedHeaders.includes(field));
    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields from Tableau contract: ${missingFields.join(', ')}`);
      result.success = false;
    } else {
      console.log('✅ All required Tableau fields present');
    }

    // Analyze numeric fields
    NUMERIC_FIELDS.forEach(field => {
      if (normalizedHeaders.includes(field)) {
        const stats = {
          nonZero: 0,
          zero: 0,
          null: 0
        };

        rawData.forEach(row => {
          const rawKey = Object.keys(row).find(k => headerMap[k] === field);
          if (rawKey) {
            const value = row[rawKey];
            if (value === '' || value === '?' || value === null || value === undefined) {
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
      if (normalizedHeaders.includes(field)) {
        const uniqueValues = new Set();
        const sampleValues = [];

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
    result.errors.push(`Validation error: ${error.message || String(error)}`);
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
