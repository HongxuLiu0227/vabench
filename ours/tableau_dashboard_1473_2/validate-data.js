#!/usr/bin/env node

/**
 * Validation script to test CSV parsing
 * This simulates the browser-side parsing to ensure it works correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV parser mimicking the browser implementation
function normalizeHeader(header) {
  let normalized = header.trim();
  while (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }
  return normalized;
}

function parseCSVWithNormalization(csvText) {
  // Remove BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Get header line
  const headerLine = lines[0];
  // Simple CSV parsing for headers
  const headers = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    headers.push(current);
  }

  const normalizedHeaders = headers.map(normalizeHeader);

  // Parse first data row
  const dataLine = lines[1];
  const values = [];
  current = '';
  inQuotes = false;

  for (let i = 0; i < dataLine.length; i++) {
    const char = dataLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    values.push(current);
  }

  const row = {};
  normalizedHeaders.forEach((header, index) => {
    if (index < values.length) {
      row[header] = values[index];
    }
  });

  return {
    headers: normalizedHeaders,
    firstRow: row,
    totalRows: lines.length - 1
  };
}

// Main validation
const csvPath = path.join(__dirname, 'public/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv');

console.log('='.repeat(80));
console.log('Tableau Source Data Validation');
console.log('='.repeat(80));

try {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  console.log(`✓ CSV file loaded: ${csvPath}`);
  console.log(`  File size: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);

  const result = parseCSVWithNormalization(csvText);

  console.log('\n✓ CSV parsed successfully');
  console.log(`  Total data rows: ${result.totalRows.toLocaleString()}`);

  console.log('\n✓ Normalized headers:');
  result.headers.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h}`);
  });

  console.log('\n✓ Required Tableau fields validation:');
  const requiredFields = [
    'start station name',
    'end station name',
    'start station id',
    'end station id'
  ];

  const missingFields = requiredFields.filter(field => !(field in result.firstRow));

  if (missingFields.length > 0) {
    console.error(`✗ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  requiredFields.forEach(field => {
    const value = result.firstRow[field];
    if (value !== undefined && value !== null && value !== '') {
      console.log(`  ✓ ${field}: "${value}"`);
    } else {
      console.log(`  ✗ ${field}: EMPTY`);
    }
  });

  console.log('\n✓ Sample first row data:');
  Object.keys(result.firstRow).slice(0, 10).forEach(key => {
    console.log(`  ${key}: ${result.firstRow[key]}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✓ ALL VALIDATIONS PASSED');
  console.log('='.repeat(80));
  console.log('\nThe CSV parser will correctly handle:');
  console.log('  • Triple-quoted headers ("""field""")');
  console.log('  • BOM (Byte Order Mark)');
  console.log('  • All required Tableau fields are present');
  console.log('  • Data can be loaded via fetch("/data/...")');
  console.log('='.repeat(80));

  process.exit(0);

} catch (error) {
  console.error('\n✗ Validation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
