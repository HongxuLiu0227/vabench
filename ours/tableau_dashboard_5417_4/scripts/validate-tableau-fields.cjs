#!/usr/bin/env node

/**
 * Tableau Field Mapping Validator
 * Validates that all required Tableau fields map to real CSV columns
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser
function normalizeHeader(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned.trim();
}

function parseCSVHeaders(csvPath) {
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

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
  const rawHeaders = headerLine.split(',');
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  return normalizedHeaders;
}

// Extract field names from Tableau spec
function extractTableauFields(spec) {
  const fields = new Set();

  // From worksheets
  spec.worksheets.forEach(ws => {
    // Rows and cols
    if (ws.rows?.raw) {
      const match = ws.rows.raw.match(/\[none:([\w_]+):nk\]/) ||
                    ws.rows.raw.match(/\[avg:([\w_]+):qk\]/) ||
                    ws.rows.raw.match(/\[tmn:([\w_]+):qk\]/);
      if (match) fields.add(match[1]);
    }

    if (ws.cols?.raw) {
      const match = ws.cols.raw.match(/\[none:([\w_]+):nk\]/) ||
                    ws.cols.raw.match(/\[avg:([\w_]+):qk\]/) ||
                    ws.cols.raw.match(/\[tmn:([\w_]+):qk\]/);
      if (match) fields.add(match[1]);
    }

    // Filter members
    if (ws.filter_members) {
      ws.filter_members.forEach(fm => {
        const match = fm.match(/\[sum:([\w_]+):qk\]/);
        if (match) fields.add(match[1]);
      });
    }

    // Series fields
    if (ws.series_field) {
      const match = ws.series_field.match(/\[none:([\w_]+):nk\]/);
      if (match) fields.add(match[1]);
    }

    // Highlight fields
    if (ws.interaction?.highlight_fields) {
      ws.interaction.highlight_fields.forEach(hf => {
        const match = hf.match(/\[none:([\w_]+):nk\]/) ||
                      hf.match(/\[sum:([\w_]+):qk\]/);
        if (match) fields.add(match[1]);
      });
    }
  });

  return Array.from(fields);
}

function main() {
  console.log('=== Tableau Field Mapping Validator ===\n');

  const csvPath = path.join(__dirname, '..', 'public', 'data', 'metacritic_games_clean.csv');
  const specPath = path.join(__dirname, '..', 'docs', 'tableau_spec.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`✗ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(specPath)) {
    console.error(`✗ Spec file not found: ${specPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV headers from: ${csvPath}`);
  const csvHeaders = parseCSVHeaders(csvPath);
  console.log(`✓ Found ${csvHeaders.length} columns in CSV\n`);

  console.log(`Reading Tableau spec from: ${specPath}`);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const tableauFields = extractTableauFields(spec);
  console.log(`✓ Extracted ${tableauFields.length} unique fields from Tableau spec\n`);

  // Check each Tableau field
  console.log('=== Field Mapping Validation ===\n');

  const missingFields = [];
  const foundFields = [];

  tableauFields.forEach(field => {
    // Check if field exists in CSV (case-insensitive)
    const csvIndex = csvHeaders.findIndex(h =>
      h.toLowerCase() === field.toLowerCase()
    );

    if (csvIndex >= 0) {
      foundFields.push({
        tableau: field,
        csv: csvHeaders[csvIndex],
        index: csvIndex
      });
      console.log(`✓ ${field.padEnd(25)} → ${csvHeaders[csvIndex]} (col ${csvIndex})`);
    } else {
      missingFields.push(field);
      console.log(`✗ ${field.padEnd(25)} → NOT FOUND`);
    }
  });

  console.log(`\n=== Validation Summary ===`);
  console.log(`✓ Mapped fields: ${foundFields.length}/${tableauFields.length}`);
  console.log(`✓ Missing fields: ${missingFields.length}`);

  if (missingFields.length > 0) {
    console.log(`\n✗ Missing fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  // Verify critical computed fields
  console.log(`\n=== Computed Field Validation ===`);

  // Check that we can derive positive_critics, neutral_critics, negative_critics
  const criticFields = ['positive_critics', 'neutral_critics', 'negative_critics'];
  const allCriticFieldsPresent = criticFields.every(f =>
    csvHeaders.some(h => h.toLowerCase() === f.toLowerCase())
  );

  if (allCriticFieldsPresent) {
    console.log('✓ All critic metrics fields present');
  } else {
    console.log('✗ Missing critic metrics fields');
    process.exit(1);
  }

  // Check that we can derive positive_users, neutral_users, negative_users
  const userFields = ['positive_users', 'neutral_users', 'negative_users'];
  const allUserFieldsPresent = userFields.every(f =>
    csvHeaders.some(h => h.toLowerCase() === f.toLowerCase())
  );

  if (allUserFieldsPresent) {
    console.log('✓ All user metrics fields present');
  } else {
    console.log('✗ Missing user metrics fields');
    process.exit(1);
  }

  // Check metascore for time series
  if (csvHeaders.some(h => h.toLowerCase() === 'metascore')) {
    console.log('✓ Metascore field present for time series');
  } else {
    console.log('✗ Missing metascore field');
    process.exit(1);
  }

  // Check release_date for time grouping
  if (csvHeaders.some(h => h.toLowerCase() === 'release_date')) {
    console.log('✓ Release date field present for time grouping');
  } else {
    console.log('✗ Missing release_date field');
    process.exit(1);
  }

  console.log(`\n✓ All Tableau field mappings validated successfully`);
}

main();
