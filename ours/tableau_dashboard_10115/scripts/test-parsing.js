#!/usr/bin/env node

/**
 * Manual CSV Parsing Test
 * Run this script to verify CSV parsing is deterministic and correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../public/data/suicide trend.csv');

// Simple CSV parser (mimics d3.csvParse behavior)
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());

  // Normalize fields (remove BOM, quotes, whitespace)
  return fields.map(f =>
    f.replace(/^\ufeff/, '').replace(/^"+|"+$/g, '').trim()
  );
}

function main() {
  console.log('=== CSV Parsing Test ===\n');

  // Check file exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim());

  console.log(`Total lines in file: ${lines.length}`);

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  console.log('\n=== Header Fields ===');
  headers.forEach((h, i) => console.log(`  ${i + 1}. "${h}"`));

  // Check for required fields
  const requiredFields = [
    'country',
    'year',
    'sex',
    'age',
    'suicides_no',
    'population',
    'generation',
    'gdp_for_year',
    'gdp_per_capita'
  ];

  console.log('\n=== Required Field Check ===');
  requiredFields.forEach(field => {
    const found = headers.some(h =>
      h.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(h.toLowerCase())
    );
    console.log(`  ${found ? '✓' : '✗'} ${field}`);
  });

  // Parse first data row
  console.log('\n=== First Data Row (Thailand) ===');
  for (let i = 1; i < Math.min(lines.length, 100); i++) {
    const row = parseCSVLine(lines[i]);
    if (row[0] === 'Thailand') {
      headers.forEach((h, idx) => {
        if (idx < row.length) {
          console.log(`  ${h}: ${row[idx]}`);
        }
      });
      break;
    }
  }

  // Count Thailand rows
  let thailandCount = 0;
  let yearRange = { min: Infinity, max: -Infinity };
  let totalSuicides = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row[0] === 'Thailand') {
      thailandCount++;
      const year = parseInt(row[1], 10);
      if (!isNaN(year)) {
        if (year < yearRange.min) yearRange.min = year;
        if (year > yearRange.max) yearRange.max = year;
      }
      const suicides = parseInt(row[4], 10);
      if (!isNaN(suicides)) {
        totalSuicides += suicides;
      }
    }
  }

  console.log('\n=== Thailand Data Summary ===');
  console.log(`  Total rows: ${thailandCount}`);
  console.log(`  Year range: ${yearRange.min} - ${yearRange.max}`);
  console.log(`  Total suicides: ${totalSuicides.toLocaleString()}`);

  console.log('\n✓ CSV parsing test completed successfully');
}

main();
