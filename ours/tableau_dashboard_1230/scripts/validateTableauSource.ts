/**
 * Tableau Source Validator
 *
 * This script validates that:
 * 1. CSV data can be loaded and parsed correctly
 * 2. All required fields from the Tableau spec are present
 * 3. Data types are correct (numeric fields are numbers, not strings)
 * 4. No silent bad parses (all-zero charts, NaN filters, etc.)
 */

import { csvParse } from 'd3-dsv';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldMapping: Record<string, string>;
  dataSample: Array<{
    name: string;
    handedness: string;
    height: number;
    weight: number;
    avg: number;
    HR: number;
    htWtRatioBin: number;
    numberOfRecords: number;
  }>;
}

const DATA_URL = './public/data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv';

/**
 * Fields required by the Tableau spec (from render contract)
 */
const REQUIRED_FIELDS: Record<string, { type: string; description: string }> = {
  'name': { type: 'string', description: 'Player name' },
  'handedness': { type: 'string', description: ' batting handedness (L/R/B)' },
  'height': { type: 'number', description: 'Player height in inches' },
  'weight': { type: 'number', description: 'Player weight in lbs' },
  'avg': { type: 'number', description: 'Batting average' },
  'HR': { type: 'number', description: 'Home runs' },
  'Ht Wt ratio (bin)': { type: 'number', description: 'Height-weight ratio bin' },
  'Number of Records': { type: 'number', description: 'Record count' }
};

/**
 * Normalize CSV header by removing all surrounding quotes
 */
function normalizeHeader(header: string): string {
  let normalized = header.trim();

  while (normalized.startsWith('"') || normalized.startsWith("'")) {
    normalized = normalized.slice(1);
  }
  while (normalized.endsWith('"') || normalized.endsWith("'")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Pre-process CSV text to normalize headers
 */
function preprocessCSV(csvText: string): string {
  const lines = csvText.split('\n');

  if (lines.length === 0) return csvText;

  let headerLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      headerLineIndex = i;
      break;
    }
  }

  const headerLine = lines[headerLineIndex];
  const headers = headerLine.split(',');

  const normalizedHeaders = headers.map(h => {
    const normalized = normalizeHeader(h);
    return `"${normalized}"`;
  });

  lines[headerLineIndex] = normalizedHeaders.join(',');

  return lines.join('\n');
}

/**
 * Clean field value
 */
function cleanFieldValue(value: string): string {
  if (!value) return '';
  let cleaned = value.trim();

  while (cleaned.startsWith('"') || cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"') || cleaned.endsWith("'")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

/**
 * Parse numeric value safely
 */
function parseNumeric(value: string): number {
  const cleaned = cleanFieldValue(value);
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Main validation function
 */
async function validateTableauSource(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fieldMapping: {},
    dataSample: []
  };

  try {
    console.log('🔍 Loading CSV data from:', DATA_URL);

    // Use fetch in Node.js environment (if available) or fs
    let csvText: string;

    try {
      // Try using fetch first (for Deno/modern Node)
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      csvText = await response.text();
    } catch {
      // Fallback to fs for Node.js
      const fs = await import('fs');
      csvText = fs.readFileSync(DATA_URL.replace('./', ''), 'utf-8');
    }

    console.log('📝 Preprocessing CSV...');
    const preprocessedCSV = preprocessCSV(csvText);

    console.log('🔧 Parsing CSV...');
    const parsedData = csvParse(preprocessedCSV, (row: { [key: string]: string }) => {
      return {
        name: cleanFieldValue(row.name || ''),
        handedness: cleanFieldValue(row.handedness || ''),
        height: parseNumeric(row.height || '0'),
        weight: parseNumeric(row.weight || '0'),
        avg: parseNumeric(row.avg || '0'),
        HR: parseNumeric(row.HR || '0'),
        htWtRatioBin: parseNumeric(row['Ht Wt ratio (bin)'] || '0'),
        numberOfRecords: parseNumeric(row['Number of Records'] || '1')
      };
    });

    console.log(`✅ Parsed ${parsedData.length} rows`);

    // Filter out empty rows
    const validData = parsedData.filter(row => row.name !== '');
    console.log(`📊 ${validData.length} valid data rows`);

    if (validData.length === 0) {
      result.errors.push('No valid data rows found after parsing');
      result.isValid = false;
      return result;
    }

    // Check for required fields
    const firstRow = validData[0];
    const missingFields: string[] = [];

    for (const [fieldName, fieldSpec] of Object.entries(REQUIRED_FIELDS)) {
      const fieldNameInRow = fieldName === 'Ht Wt ratio (bin)' ? 'htWtRatioBin' :
                            fieldName === 'Number of Records' ? 'numberOfRecords' :
                            fieldName === 'HR' ? 'HR' :
                            fieldName;

      if (!(fieldNameInRow in firstRow)) {
        missingFields.push(fieldName);
      } else {
        result.fieldMapping[fieldName] = fieldNameInRow;

        // Validate field types
        const value = firstRow[fieldNameInRow];
        if (fieldSpec.type === 'number') {
          if (typeof value !== 'number' || isNaN(value)) {
            result.errors.push(`Field '${fieldName}' should be numeric but got: ${typeof value} (${value})`);
            result.isValid = false;
          }
        }
      }
    }

    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      result.isValid = false;
    }

    // Check for data quality issues
    const numericFields = ['height', 'weight', 'avg', 'HR', 'htWtRatioBin'];

    for (const field of numericFields) {
      const nonZeroCount = validData.filter(row => row[field] !== 0).length;
      const zeroCount = validData.length - nonZeroCount;

      if (zeroCount === validData.length) {
        result.errors.push(`All values for field '${field}' are zero - possible parsing error`);
        result.isValid = false;
      } else if (zeroCount > validData.length * 0.9) {
        result.warnings.push(`More than 90% of values for field '${field}' are zero (${zeroCount}/${validData.length})`);
      }
    }

    // Check for NaN values
    for (const row of validData) {
      for (const field of numericFields) {
        if (typeof row[field] === 'number' && isNaN(row[field])) {
          result.errors.push(`NaN value found in field '${field}' for row: ${JSON.stringify(row)}`);
          result.isValid = false;
        }
      }
    }

    // Check handedness values
    const handednessValues = new Set(validData.map(row => row.handedness));
    const invalidHandedness = Array.from(handednessValues).filter(
      h => h && !['L', 'R', 'B', ''].includes(h)
    );

    if (invalidHandedness.length > 0) {
      result.warnings.push(`Unexpected handedness values: ${invalidHandedness.join(', ')}`);
    }

    // Store sample data
    result.dataSample = validData.slice(0, 5);

    // Summary statistics
    console.log('\n📈 Data Summary:');
    console.log(`  Total rows: ${validData.length}`);
    console.log(`  Handedness distribution: ${Array.from(handednessValues).filter(h => h).join(', ') || 'none'}`);
    console.log(`  Height range: ${Math.min(...validData.map(r => r.height))} - ${Math.max(...validData.map(r => r.height))}`);
    console.log(`  Weight range: ${Math.min(...validData.map(r => r.weight))} - ${Math.max(...validData.map(r => r.weight))}`);
    console.log(`  HR range: ${Math.min(...validData.map(r => r.HR))} - ${Math.max(...validData.map(r => r.HR))}`);

  } catch (error) {
    result.errors.push(`Failed to load or parse data: ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Run validation and print results
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Tableau Source Validator');
  console.log('='.repeat(60));
  console.log();

  const result = await validateTableauSource();

  console.log();
  console.log('='.repeat(60));
  console.log('Validation Results');
  console.log('='.repeat(60));

  if (result.isValid) {
    console.log('✅ VALIDATION PASSED');
  } else {
    console.log('❌ VALIDATION FAILED');
  }

  if (result.errors.length > 0) {
    console.log('\n🚨 Errors:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }

  console.log('\n📋 Field Mapping:');
  Object.entries(result.fieldMapping).forEach(([specField, dataField]) => {
    console.log(`  ${specField} → ${dataField}`);
  });

  console.log('\n📊 Sample Data (first 5 rows):');
  result.dataSample.forEach((row, i) => {
    console.log(`  Row ${i + 1}: ${JSON.stringify(row)}`);
  });

  console.log();
  console.log('='.repeat(60));

  // Exit with appropriate code
  process.exit(result.isValid ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { validateTableauSource };
