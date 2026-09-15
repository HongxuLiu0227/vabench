/**
 * Simple CSV validation script to test parsing logic
 * Run with: node validate_csv.js
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'public/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv');

function normalizeHeader(header) {
  if (!header) return header;
  const trimmed = header.trim();
  let cleaned = trimmed.replace(/^"""+|"""+$/g, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned;
}

function parseCSVRobust(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  console.log(`Total lines in CSV: ${lines.length}`);

  const expectedColumns = ['tripduration', 'starttime', 'stoptime', 'usertype', 'gender', 'birth year'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    const normalizedLine = line.split(',').map(h => normalizeHeader(h).toLowerCase());
    const matchCount = expectedColumns.filter(col =>
      normalizedLine.some(h => h.includes(col))
    ).length;

    console.log(`Line ${i}: Found ${matchCount}/6 expected columns`);

    if (matchCount >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  console.log(`Header row detected at index: ${headerRowIndex}`);

  const headerLine = lines[headerRowIndex];
  const rawHeaders = headerLine.split(',').map(h => h.trim());
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  console.log('\nNormalized headers:');
  normalizedHeaders.forEach((h, i) => console.log(`  ${i}: "${h}"`));

  const dataLines = lines.slice(headerRowIndex + 1);
  console.log(`\nData rows: ${dataLines.length}`);

  return {
    headers: normalizedHeaders,
    dataRowCount: dataLines.length
  };
}

// Run validation
try {
  console.log('Reading CSV file...');
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');

  console.log('Parsing CSV...\n');
  const result = parseCSVRobust(csvText);

  console.log('\n✓ CSV parsing validation successful!');
  console.log('  Headers:', result.headers.length);
  console.log('  Data rows:', result.dataRowCount);

} catch (error) {
  console.error('\n✗ CSV parsing failed:', error.message);
  process.exit(1);
}
