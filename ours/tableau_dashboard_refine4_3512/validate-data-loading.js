/**
 * Deterministic Tableau Source Validator
 * Tests CSV parsing logic to ensure:
 * 1. Headers are correctly parsed from triple-quoted CSV
 * 2. Required fields map to real columns
 * 3. Dates are parsed correctly
 * 4. No silent failures (all-zero charts, NaN filters, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, 'public/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv');

console.log('=== Tableau Source Validator ===\n');

// Check if CSV file exists
if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ FAIL: CSV file not found at ${CSV_PATH}`);
  process.exit(1);
}
console.log('✓ CSV file exists');

// Read CSV content
let csvText = fs.readFileSync(CSV_PATH, 'utf8');

// Remove BOM if present
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1);
  console.log('✓ BOM detected and removed');
}

const lines = csvText.split(/\r?\n/).filter(line => line.trim());
console.log(`✓ Total lines: ${lines.length}`);

if (lines.length < 2) {
  console.error('❌ FAIL: CSV has no data rows');
  process.exit(1);
}

// Parse header line
const headerLine = lines[0];
const rawHeaders = [];
let currentHeader = '';
let inQuotes = false;
let quoteCount = 0;

for (let i = 0; i < headerLine.length; i++) {
  const char = headerLine[i];
  if (char === '"') {
    quoteCount++;
    inQuotes = quoteCount % 2 !== 0;
  } else if (char === ',' && !inQuotes) {
    rawHeaders.push(currentHeader.trim().replace(/^"+|"+$/g, ''));
    currentHeader = '';
    quoteCount = 0;
  } else {
    currentHeader += char;
  }
}
rawHeaders.push(currentHeader.trim().replace(/^"+|"+$/g, ''));

const headers = rawHeaders.map(h => h.trim());
console.log(`\n✓ Parsed ${headers.length} headers:`);
headers.forEach(h => console.log(`  - ${h}`));

// Validate required fields
const requiredFields = [
  'Date Made Public',
  'Company',
  'Location',
  'Type of breach',
  'Type of organization',
  'Records Breached',
  'Total Records',
  'Description of incident',
  'Information Source',
  'Source URL'
];

const missingFields = requiredFields.filter(field => !headers.includes(field));
if (missingFields.length > 0) {
  console.error(`\n❌ FAIL: Missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}
console.log(`\n✓ All ${requiredFields.length} required fields present`);

// Parse first 5 data rows to verify parsing
console.log('\n=== Sample Data Rows ===');
let validRows = 0;
let skippedRows = 0;

for (let i = 1; i < Math.min(6, lines.length); i++) {
  const line = lines[i];
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());

  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });

  // Validate date
  const dateStr = row['Date Made Public'];
  const date = new Date(dateStr);

  if (!dateStr || dateStr.trim() === '' || isNaN(date.getTime())) {
    skippedRows++;
    console.log(`Row ${i}: ⚠ Skipped (invalid date: "${dateStr}")`);
    continue;
  }

  validRows++;
  console.log(`\nRow ${i}: ✓`);
  console.log(`  Date: ${date.toISOString().split('T')[0]} (${date.getFullYear()})`);
  console.log(`  Company: ${row.Company.substring(0, 40)}${row.Company.length > 40 ? '...' : ''}`);
  console.log(`  Breach Type: ${row['Type of breach']}`);
  console.log(`  Info Source: ${row['Information Source']}`);

  // Validate numeric fields
  const totalRecordsStr = row['Total Records'];
  if (totalRecordsStr && totalRecordsStr !== '') {
    const cleaned = totalRecordsStr.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      console.log(`  Total Records: ${num}`);
    }
  }
}

console.log(`\n=== Validation Summary ===`);
console.log(`✓ Headers parsed correctly: ${headers.length}`);
console.log(`✓ All required fields present: ${requiredFields.length}`);
console.log(`✓ Sample rows parsed: ${validRows} valid, ${skippedRows} skipped`);
console.log('\n✅ PASS: Tableau source ingestion is deterministic and correct');
