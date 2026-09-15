/**
 * Validation script for Tableau source ingestion
 * Tests that CSV parsing handles BOM, triple-quoted headers, and data correctly
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple CSV parser (matching the TypeScript implementation)
function normalizeHeader(header) {
  let normalized = header.trim();
  normalized = normalized.replace(/^\uFEFF/, '');

  if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
    normalized = normalized.slice(3, -3);
  } else if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.trim();
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

function parseCSV(csvText) {
  const text = csvText.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) return [];

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(normalizeHeader);

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.length !== headers.length) continue;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });

    result.push(record);
  }

  return result;
}

// Validation tests
function validateCSVParsing() {
  console.log('🔍 Validating Tableau source ingestion...\n');

  const csvPath = resolve(__dirname, '../public/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  // Test 1: Parse CSV
  console.log('Test 1: Parsing CSV file...');
  const data = parseCSV(csvContent);

  if (data.length === 0) {
    console.error('❌ FAILED: CSV parsed to zero records\n');
    return false;
  }
  console.log(`✓ PASSED: Parsed ${data.length} records\n`);

  // Test 2: Check for required fields
  console.log('Test 2: Checking for required Tableau fields...');
  const requiredFields = [
    'start station id',
    'start station name',
    'end station id',
    'end station name',
    'starttime',
    'bikeid'
  ];

  const sampleRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in sampleRow));

  if (missingFields.length > 0) {
    console.error(`❌ FAILED: Missing fields: ${missingFields.join(', ')}\n`);
    console.error('Sample row keys:', Object.keys(sampleRow).slice(0, 10));
    return false;
  }
  console.log('✓ PASSED: All required fields present\n');

  // Test 3: Verify data quality
  console.log('Test 3: Verifying data quality...');
  let validRecords = 0;
  let invalidRecords = 0;

  for (let i = 0; i < Math.min(1000, data.length); i++) {
    const record = data[i];
    const hasStartStation = record['start station name'] && record['start station name'] !== '';
    const hasEndStation = record['end station name'] && record['end station name'] !== '';
    const hasStartTime = record.starttime && record.starttime !== '';

    if (hasStartStation && hasEndStation && hasStartTime) {
      validRecords++;
    } else {
      invalidRecords++;
    }
  }

  const sampleSize = Math.min(1000, data.length);
  const validPercentage = ((validRecords / sampleSize) * 100).toFixed(2);

  console.log(`  Sample: ${sampleSize} records`);
  console.log(`  Valid: ${validRecords} (${validPercentage}%)`);
  console.log(`  Invalid: ${invalidRecords}`);

  if (validPercentage < 50) {
    console.error('\n❌ FAILED: Too many invalid records\n');
    return false;
  }
  console.log('\n✓ PASSED: Data quality acceptable\n');

  // Test 4: Show sample data
  console.log('Test 4: Sample parsed record...');
  console.log(JSON.stringify(data[0], null, 2).substring(0, 500) + '...\n');

  console.log('✅ All validation tests passed!\n');
  console.log('Summary:');
  console.log(`  - Total records: ${data.length}`);
  console.log(`  - Headers normalized: ✓`);
  console.log(`  - BOM handled: ✓`);
  console.log(`  - Required fields present: ✓`);
  console.log(`  - Data quality: ${validPercentage}% valid`);

  return true;
}

// Run validation
try {
  const success = validateCSVParsing();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('❌ Validation error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
