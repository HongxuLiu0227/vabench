#!/usr/bin/env node

/**
 * Deterministic Tableau Source Validator
 * Validates that CSV parsing is correct and fields map properly
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser that mirrors the browser implementation
function normalizeHeader(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned.trim();
}

function parseCSVWithNormalization(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Find the actual header row
  const knownFields = ['game', 'platform', 'developer', 'genre', 'number_players'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const headers = lines[i].split(',');
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    const hasKnownFields = knownFields.some(field =>
      normalizedHeaders.some(h => h.toLowerCase().includes(field.toLowerCase()))
    );
    if (hasKnownFields) {
      headerRowIndex = i;
      break;
    }
  }

  const headerLine = lines[headerRowIndex];
  const dataLines = lines.slice(headerRowIndex + 1).filter(line => line.trim());

  const rawHeaders = headerLine.split(',');
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  console.log(`✓ Found header at row ${headerRowIndex + 1}`);
  console.log(`✓ Normalized headers:`, normalizedHeaders.slice(0, 5).join(', '), '...');

  // Parse first data row
  if (dataLines.length > 0) {
    const firstRow = dataLines[0].split(',');
    console.log(`✓ First data row has ${firstRow.length} fields`);

    // Check critical fields
    const gameIdx = normalizedHeaders.findIndex(h => h === 'game');
    const platformIdx = normalizedHeaders.findIndex(h => h === 'platform');
    const metascoreIdx = normalizedHeaders.findIndex(h => h === 'metascore');

    if (gameIdx >= 0 && firstRow[gameIdx]) {
      console.log(`✓ First game: ${firstRow[gameIdx]}`);
    } else {
      console.error('✗ Failed to find game field');
      process.exit(1);
    }

    if (platformIdx >= 0 && firstRow[platformIdx]) {
      console.log(`✓ First platform: ${firstRow[platformIdx]}`);
    } else {
      console.error('✗ Failed to find platform field');
      process.exit(1);
    }

    if (metascoreIdx >= 0 && firstRow[metascoreIdx]) {
      const metascore = Number(firstRow[metascoreIdx]);
      console.log(`✓ First metascore: ${metascore}`);
      if (isNaN(metascore)) {
        console.error('✗ Metascore is NaN');
        process.exit(1);
      }
    } else {
      console.error('✗ Failed to find metascore field');
      process.exit(1);
    }
  }

  return {
    headers: normalizedHeaders,
    dataLineCount: dataLines.length,
    headerRowIndex
  };
}

function main() {
  console.log('=== Deterministic Tableau Source Validator ===\n');

  const csvPath = path.join(__dirname, '..', 'public', 'data', 'metacritic_games_clean.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`✗ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading: ${csvPath}`);
  const csvText = fs.readFileSync(csvPath, 'utf-8');

  try {
    const result = parseCSVWithNormalization(csvText);

    console.log(`\n=== Validation Summary ===`);
    console.log(`✓ Total data rows: ${result.dataLineCount}`);
    console.log(`✓ Header row index: ${result.headerRowIndex + 1}`);
    console.log(`✓ All required fields found: game, platform, metascore`);
    console.log(`\n✓ CSV parsing validation PASSED`);
  } catch (error) {
    console.error(`\n✗ Validation FAILED: ${error.message}`);
    process.exit(1);
  }
}

main();
