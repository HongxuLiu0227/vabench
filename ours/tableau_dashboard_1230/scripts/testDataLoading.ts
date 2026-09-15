/**
 * Simple test script to verify CSV data loading
 */

import { readFileSync } from 'fs';
import { csvParse } from 'd3-dsv';

const CSV_PATH = './public/data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv';

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

  // Find first non-empty line as header
  let headerLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      headerLineIndex = i;
      break;
    }
  }

  const headerLine = lines[headerLineIndex];
  const headers = headerLine.split(',');

  console.log('Original headers:', headers);

  const normalizedHeaders = headers.map(h => {
    const normalized = normalizeHeader(h);
    return `"${normalized}"`;
  });

  console.log('Normalized headers:', normalizedHeaders);

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
 * Main test function
 */
function testDataLoading() {
  console.log('='.repeat(60));
  console.log('CSV Data Loading Test');
  console.log('='.repeat(60));
  console.log();

  try {
    // Read CSV file
    console.log(`📂 Reading CSV from: ${CSV_PATH}`);
    const csvText = readFileSync(CSV_PATH, 'utf-8');

    // Show first few lines
    const lines = csvText.split('\n').slice(0, 3);
    console.log('\n📄 First 3 lines of raw CSV:');
    lines.forEach((line, i) => console.log(`  ${i + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`));

    // Preprocess CSV
    console.log('\n🔧 Preprocessing CSV...');
    const preprocessedCSV = preprocessCSV(csvText);

    // Parse CSV
    console.log('\n📊 Parsing CSV...');
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
    console.log(`✅ ${validData.length} valid data rows (non-empty names)`);

    if (validData.length === 0) {
      console.error('❌ ERROR: No valid data rows found!');
      process.exit(1);
    }

    // Show sample data
    console.log('\n📋 Sample data (first 5 rows):');
    validData.slice(0, 5).forEach((row, i) => {
      console.log(`  Row ${i + 1}:`);
      console.log(`    name: ${row.name}`);
      console.log(`    handedness: ${row.handedness}`);
      console.log(`    height: ${row.height} (type: ${typeof row.height})`);
      console.log(`    weight: ${row.weight} (type: ${typeof row.weight})`);
      console.log(`    avg: ${row.avg} (type: ${typeof row.avg})`);
      console.log(`    HR: ${row.HR} (type: ${typeof row.HR})`);
    });

    // Verify required fields
    console.log('\n🔍 Verifying required fields...');
    const requiredFields = ['name', 'handedness', 'height', 'weight', 'avg', 'HR'];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const fieldName = field === 'Ht Wt ratio (bin)' ? 'htWtRatioBin' :
                        field === 'Number of Records' ? 'numberOfRecords' :
                        field;

      if (!(fieldName in validData[0])) {
        missingFields.push(field);
      } else {
        console.log(`  ✅ ${field}: present (mapped to ${fieldName})`);
      }
    }

    if (missingFields.length > 0) {
      console.error(`  ❌ Missing fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }

    // Check for data quality issues
    console.log('\n🔍 Checking data quality...');

    // Check for non-numeric values in numeric fields
    const numericFields = ['height', 'weight', 'avg', 'HR'];
    for (const field of numericFields) {
      const nonZeroCount = validData.filter(row => row[field] !== 0).length;
      const zeroCount = validData.length - nonZeroCount;

      console.log(`  ${field}: ${nonZeroCount} non-zero values, ${zeroCount} zero values`);

      if (zeroCount === validData.length) {
        console.error(`    ❌ ERROR: All values are zero! Possible parsing error.`);
        process.exit(1);
      }
    }

    // Check handedness values
    const handednessValues = new Set(validData.map(row => row.handedness));
    console.log(`  Handedness values: ${Array.from(handednessValues).filter(h => h).join(', ') || 'none'}`);

    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`  Total rows: ${validData.length}`);
    console.log(`  Height range: ${Math.min(...validData.map(r => r.height))} - ${Math.max(...validData.map(r => r.height))}`);
    console.log(`  Weight range: ${Math.min(...validData.map(r => r.weight))} - ${Math.max(...validData.map(r => r.weight))}`);
    console.log(`  HR range: ${Math.min(...validData.map(r => r.HR))} - ${Math.max(...validData.map(r => r.HR))}`);
    console.log(`  Avg HR: ${validData.reduce((sum, r) => sum + r.HR, 0) / validData.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    console.error(error instanceof Error ? error.stack : '');
    process.exit(1);
  }
}

// Run the test
testDataLoading();
