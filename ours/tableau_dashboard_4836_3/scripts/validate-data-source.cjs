#!/usr/bin/env node

/**
 * Data Source Validation Script
 *
 * This script validates that the Tableau data source is correctly configured:
 * 1. CSV headers are normalized (quotes, BOM removed)
 * 2. Required source columns are present
 * 3. Data can be extracted correctly
 * 4. Tableau calculated fields are documented (not expected in CSV)
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser for Node.js (no d3-dsv dependency needed)
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }

  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeColumnName(colName) {
  return colName
    .replace(/^\uFEFF/, '')
    .replace(/^"+|"+$/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
}

function preprocessCSVHeader(headerLine) {
  return headerLine.split(',').map(col => {
    let cleaned = col.trim();
    cleaned = cleaned.replace(/^"""(.+?)"""$/, '$1');
    cleaned = cleaned.replace(/^"(.+?)"$/, '$1');
    return cleaned.includes(',') ? `"${cleaned}"` : cleaned;
  }).join(',');
}

const REQUIRED_SOURCE_COLUMNS = [
  'DisplayMFL',
  'DisplayFacilityName',
  'DisplaySubcounty',
  'DisplayCounty',
  'DisplayMechanism',
  'DisplayAgency',
  'UploadStatus',
  'UploadDate',
  'Upload_monthYear',
  'SiteCode',
  'MPI_SiteCode',
  'UploadDate_MPI',
  'Upload_monthYear_MPI',
  'Siteabstractiondate',
];

const TABLEAU_CALCULATED_FIELDS = [
  'County Color (copy)',
  'County Denominator Expected Reports (copy)',
  'County Percent Uploads Proportions (copy)',
  'PArtner Color (copy)',
  'Partner Percent Uploaded (copy)',
];

async function main() {
  console.log('🔍 Validating Tableau Data Source...\n');

  const csvPath = path.join(__dirname, '../public/data/federated_0se4v9q15j8hfi17f25m50.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');

  // Preprocess and parse
  const lines = csvText.split('\n');
  const originalHeader = lines[0];
  const preprocessedHeader = preprocessCSVHeader(originalHeader);

  const preprocessedCSV = [preprocessedHeader, ...lines.slice(1)].join('\n');
  const data = parseCSV(preprocessedCSV);

  console.log('📊 Data Summary:');
  console.log(`   - Total rows: ${data.length}`);
  console.log(`   - Original header: ${originalHeader.substring(0, 100)}...`);
  console.log(`   - Normalized headers: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'none'}\n`);

  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const errors = [];
  const warnings = [];

  // Check for required source columns
  console.log('✅ Checking required source columns...');
  const missingColumns = REQUIRED_SOURCE_COLUMNS.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing required source columns: ${missingColumns.join(', ')}`);
  } else {
    console.log('   ✓ All required source columns present');
  }

  // Check header normalization
  console.log('🔧 Checking header normalization...');
  const dirtyHeaders = headers.filter(h => h !== normalizeColumnName(h));
  if (dirtyHeaders.length > 0) {
    errors.push(`CSV headers require normalization: ${dirtyHeaders.map(h => `"${h}"`).join(', ')}`);
  } else {
    console.log('   ✓ Headers are properly normalized');
  }

  // Verify data extraction
  console.log('🔍 Checking data extraction...');
  if (data.length > 0) {
    const firstRow = data[0];
    if (firstRow.DisplayMFL) console.log('   ✓ DisplayMFL can be extracted');
    else errors.push('Cannot extract DisplayMFL from first row');

    if (firstRow.DisplayMechanism) console.log('   ✓ DisplayMechanism can be extracted');
    else errors.push('Cannot extract DisplayMechanism from first row');

    if (firstRow.DisplayAgency) console.log('   ✓ DisplayAgency can be extracted');
    else errors.push('Cannot extract DisplayAgency from first row');
  }

  // Document Tableau calculated fields
  console.log('📝 Tableau Calculated Fields (not expected in CSV):');
  TABLEAU_CALCULATED_FIELDS.forEach(field => {
    console.log(`   - ${field}`);
    if (headers.includes(field)) {
      warnings.push(`Field "${field}" is a calculated field and should not be in source CSV`);
    }
  });
  console.log('   These are computed at runtime by dataService functions.\n');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (errors.length === 0) {
    console.log('✅ Data source validation PASSED');
    console.log('\nAll checks passed:');
    console.log('  ✓ CSV headers are normalized');
    console.log('  ✓ Required source columns are present');
    console.log('  ✓ Data can be extracted correctly');
    console.log('  ✓ Tableau calculated fields are documented');
    console.log('\nThe data loader should correctly parse the CSV file.');
    process.exit(0);
  } else {
    console.log('❌ Data source validation FAILED');
    console.log('\nErrors:');
    errors.forEach(err => console.log(`  - ${err}`));
    if (warnings.length > 0) {
      console.log('\nWarnings:');
      warnings.forEach(warn => console.log(`  - ${warn}`));
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
