/**
 * Quick CSV parsing test to verify normalization works
 */
import { readFileSync } from 'fs';
import * as d3Dsv from 'd3-dsv';

// Field normalization (matches dataService.ts)
const normalizeHeader = (header) => {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  cleaned = cleaned.trim();
  return cleaned;
};

console.log('Testing CSV parsing...\n');

const csvPath = 'public/data/Diabetes_Cleaned.csv';
let csvText = readFileSync(csvPath, 'utf-8');

// Remove BOM if present
if (csvText.charCodeAt(0) === 0xFEFF) {
  console.log('✅ BOM detected and removed');
  csvText = csvText.slice(1);
}

// Pre-process: remove triple quotes before parsing
// This handles the """field""" format
csvText = csvText.replace(/"""/g, '"');

console.log('✅ Pre-processed triple quotes');

// Parse CSV
const rawData = d3Dsv.csvParse(csvText);

if (!rawData || rawData.length === 0) {
  console.error('❌ CSV parsing failed');
  process.exit(1);
}

console.log(`✅ Parsed ${rawData.length} rows`);

// Extract and normalize headers
const firstRow = rawData[0];
const rawHeaders = Object.keys(firstRow);
const headerMap = {};

console.log('\n📋 All raw headers:');
rawHeaders.forEach((h, i) => console.log(`  ${i}: "${h}"`));

// Normalize ALL headers
rawHeaders.forEach(rawHeader => {
  const normalized = normalizeHeader(rawHeader);
  headerMap[rawHeader] = normalized;
});

console.log('\n📋 Normalized headers (first 10):');
Object.values(headerMap).slice(0, 10).forEach(h => console.log(`  "${h}"`));

const normalizedHeaders = Object.values(headerMap);
console.log(`\n✅ Total columns: ${normalizedHeaders.length}`);

// Check for required fields
const requiredFields = ['diag_1', 'diag_2', 'diag_3', 'readmitted'];
const missingFields = requiredFields.filter(field => !normalizedHeaders.includes(field));

if (missingFields.length > 0) {
  console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
} else {
  console.log(`✅ All required fields present: ${requiredFields.join(', ')}`);
}

// Check if headers have triple quotes
const hasTripleQuotes = rawHeaders.some(h => h.startsWith('"""'));
if (hasTripleQuotes) {
  console.log('⚠️  CSV contains triple-quoted headers (normalized in source code)');
}

// Sample data
console.log('\n📊 Sample data row (first 5 fields):');
const sampleFields = rawHeaders.slice(0, 5);
sampleFields.forEach(field => {
  console.log(`  ${headerMap[field]}: ${firstRow[field]}`);
});

console.log('\n✅ CSV parsing test PASSED');
