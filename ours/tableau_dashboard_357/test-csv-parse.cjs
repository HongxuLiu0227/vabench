/**
 * Test script to verify CSV parsing
 */
const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, 'public/data/TEMP_0ufyovf1yz1z5e10183zt00hd8o2.csv');
const csvText = fs.readFileSync(csvPath, 'utf8');

// Normalize header function (same as in dataLoader.ts)
function normalizeHeader(header) {
  let normalized = header.trim();

  // Remove BOM if present
  normalized = normalized.replace(/^\uFEFF/, '');

  // Remove quotes from both ends repeatedly until no more quotes
  while (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  // Replace remaining double-double-quotes with single quotes
  normalized = normalized.replace(/""/g, '"');

  return normalized;
}

// Test parsing
const lines = csvText.split(/\r?\n/).filter(line => line.trim());
console.log(`Total lines in CSV: ${lines.length}`);

const headerLine = lines[0];
const rawHeaders = headerLine.split(',');
const headers = rawHeaders.map(h => normalizeHeader(h));

console.log('Normalized headers:', headers);
console.log('Expected headers: ["F1", "F2", "F3", "F4", "F5"]');
console.log('Headers match expected:', JSON.stringify(headers) === JSON.stringify(['F1', 'F2', 'F3', 'F4', 'F5']));

// Parse first 3 data rows
console.log('\nFirst 3 data rows:');
for (let i = 1; i <= 3; i++) {
  const values = lines[i].split(',');
  console.log(`Row ${i}:`, values);
  const f1 = parseFloat(values[0]);
  const f2 = parseFloat(values[1]);
  const f3 = parseFloat(values[2]);
  const f4 = parseFloat(values[3]);
  const f5 = values[4]?.trim().replace(/^"|"$/g, '');
  console.log(`  Parsed: F1=${f1}, F2=${f2}, F3=${f3}, F4=${f4}, F5=${f5}`);
  console.log(`  Valid: ${!isNaN(f1) && !isNaN(f2) && !isNaN(f3) && !isNaN(f4)}`);
}

console.log('\n✅ CSV parsing test completed');
