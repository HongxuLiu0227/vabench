/**
 * Test script to verify CSV parsing works correctly
 * Run with: node scripts/test-csv-parser.js
 */

const fs = require('fs');
const path = require('path');

// Mock d3-dsv for Node.js environment
function csvParse(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      data.push(row);
    }
  }

  return {
    columns: headers,
    length: data.length,
    map: fn => data.map(fn),
    forEach: fn => data.forEach(fn),
    filter: fn => data.filter(fn),
    [Symbol.iterator]: function* () {
      for (const item of data) yield item;
    }
  };
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

// Import our normalizeHeader function
function normalizeHeader(header) {
  let normalized = header.trim();

  // Remove BOM if present
  normalized = normalized.replace(/^\uFEFF/, '');

  // Handle patterns like """field""" -> "field"
  while (normalized.startsWith('"""') || normalized.startsWith('"')) {
    if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
      normalized = normalized.slice(1, -1);
    } else if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    } else {
      break;
    }
  }

  // Handle remaining double quotes
  if (normalized.startsWith('""') && normalized.endsWith('""')) {
    normalized = normalized.slice(1, -1);
  }

  // Handle single quotes
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}

// Test with actual CSV file
const csvPath = path.join(__dirname, '../public/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv');

try {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = csvParse(csvText);

  console.log('Original columns:', parsed.columns);
  console.log('\nNormalized columns:');
  const normalized = parsed.columns.map(col => {
    const norm = normalizeHeader(col);
    console.log(`  "${col}" -> "${norm}"`);
    return norm;
  });

  console.log('\nFirst data row sample:');
  const firstRow = parsed.map(r => r)[0];
  Object.keys(firstRow).forEach(key => {
    const value = firstRow[key];
    const truncatedValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
    console.log(`  ${key}: ${truncatedValue}`);
  });

  console.log(`\nTotal rows: ${parsed.length}`);
  console.log('✓ CSV parsing test passed!');
} catch (error) {
  console.error('✗ CSV parsing test failed:', error.message);
  process.exit(1);
}
