#!/usr/bin/env node

/**
 * Test script to verify CSV parsing is working correctly
 * This script tests the data parsing logic without running the full app
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser (mimicking d3-dsv behavior)
function csvParse(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const header = parseCSVLine(lines[0]);
  const result = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === header.length) {
      const row = {};
      header.forEach((key, idx) => {
        row[key] = values[idx];
      });
      result.push(row);
    }
  }

  result.columns = header;
  return result;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',') {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Don't forget the last field
  result.push(current);

  return result;
}

// Normalize headers (same logic as in dataService.ts)
function normalizeHeaders(rawData) {
  if (!rawData.length) return rawData;

  const firstRow = rawData[0];
  const columnMapping = {};
  const cleanColumns = [];

  Object.keys(firstRow).forEach(dirtyHeader => {
    let cleanHeader = dirtyHeader.replace(/^"+|"+$/g, '');
    if (cleanHeader === 'F1' || dirtyHeader.includes('F1')) {
      cleanHeader = 'F1';
    }
    columnMapping[dirtyHeader] = cleanHeader;
    cleanColumns.push(cleanHeader);
  });

  const normalizedData = rawData.map(row => {
    const newRow = {};
    Object.keys(row).forEach(dirtyKey => {
      const cleanKey = columnMapping[dirtyKey] || dirtyKey;
      newRow[cleanKey] = row[dirtyKey];
    });
    return newRow;
  });

  normalizedData.columns = cleanColumns;
  return normalizedData;
}

// Get field value with fallbacks
function getFieldValue(row, fieldName) {
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }

  const quotedKey = `"${fieldName}"`;
  if (row[quotedKey] !== undefined) {
    return row[quotedKey];
  }

  const tripleQuotedKey = `"""${fieldName}"""`;
  if (row[tripleQuotedKey] !== undefined) {
    return row[tripleQuotedKey];
  }

  const allKeys = Object.keys(row);
  const matchedKey = allKeys.find(
    k => k.replace(/^"+|"+$/g, '').toLowerCase() === fieldName.toLowerCase()
  );

  return matchedKey ? row[matchedKey] : '';
}

// Main test
async function testDataParsing() {
  console.log('🔍 Testing CSV data parsing...\n');

  const csvPath = path.join(__dirname, 'public', 'data', 'metacritic_games_clean.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  console.log('📄 Parsing CSV file...');
  const rawData = csvParse(csvText);
  console.log(`✅ Parsed ${rawData.length} rows\n`);

  // Show raw headers
  console.log('📋 Raw headers from CSV:');
  console.log('  ', rawData.columns.slice(0, 5).join(', '), '...\n');

  // Normalize headers
  console.log('🔧 Normalizing headers...');
  const normalizedData = normalizeHeaders(rawData);
  console.log('✅ Headers normalized');
  console.log('📋 Normalized headers:');
  console.log('  ', normalizedData.columns.slice(0, 5).join(', '), '...\n');

  // Test field access
  console.log('🧪 Testing field access on first data row:');
  const firstRow = normalizedData[1]; // Skip header-like row if present

  const testFields = ['game', 'platform', 'positive_critics', 'metascore'];
  testFields.forEach(field => {
    const value = getFieldValue(firstRow, field);
    console.log(`  ${field}: "${value}"`);
  });
  console.log('');

  // Validate data
  console.log('✅ Validating data quality...');

  let validRows = 0;
  let invalidDateRows = 0;
  let emptyGameRows = 0;

  for (let i = 1; i < Math.min(100, normalizedData.length); i++) {
    const row = normalizedData[i];
    const game = getFieldValue(row, 'game');
    const platform = getFieldValue(row, 'platform');
    const releaseDate = new Date(getFieldValue(row, 'release_date'));

    const validGame = game && game.length > 0;
    const validPlatform = platform && platform.length > 0;
    const validDate = releaseDate instanceof Date &&
                      !isNaN(releaseDate.getTime()) &&
                      releaseDate.getFullYear() > 1900 &&
                      releaseDate.getFullYear() < 2100;

    if (validGame && validPlatform && validDate) {
      validRows++;
    } else {
      if (!validDate) invalidDateRows++;
      if (!validGame) emptyGameRows++;
    }
  }

  console.log(`  Valid rows (first 100): ${validRows}/100`);
  console.log(`  Invalid dates: ${invalidDateRows}`);
  console.log(`  Empty game names: ${emptyGameRows}\n`);

  // Test aggregations
  console.log('📊 Testing data aggregation...');

  const platformCounts = {};
  for (let i = 1; i < Math.min(1000, normalizedData.length); i++) {
    const row = normalizedData[i];
    const platform = getFieldValue(row, 'platform');
    if (platform) {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    }
  }

  console.log('  Platforms found (sample):');
  Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([platform, count]) => {
      console.log(`    ${platform}: ${count} games`);
    });
  console.log('');

  // Summary
  console.log('✅ Data parsing test completed successfully!\n');
  console.log('Summary:');
  console.log(`  Total rows: ${rawData.length}`);
  console.log(`  Columns: ${normalizedData.columns.length}`);
  console.log(`  Valid rows (sample): ${validRows}%`);
  console.log(`  Platforms: ${Object.keys(platformCounts).length}`);
}

// Run the test
testDataParsing().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
