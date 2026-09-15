#!/usr/bin/env node
/**
 * Standalone CSV parsing validation script
 * Tests that the CSV can be parsed with proper header normalization and field mapping
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'public/data/federated_0se4v9q15j8hfi17f25m50.csv');

/**
 * Strip UTF-8 BOM from a string
 */
function stripBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Clean column headers by removing triple quotes and BOM
 */
function cleanColumnName(key) {
  let clean = stripBOM(key);
  clean = clean.replace(/^"""/, '').replace(/"""$/g, '');
  clean = clean.replace(/"/g, '');
  return clean;
}

/**
 * Parse CSV line with handling for quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Map CSV columns to Tableau field names
 */
function mapToTableauFields(row) {
  const mapped = { ...row };

  if (row.Siteabstractiondate && !mapped['SiteabstractionDate (copy)']) {
    mapped['SiteabstractionDate (copy)'] = row.Siteabstractiondate;
  }

  if (row.SiteCode && !mapped['Fixed Site (copy)']) {
    mapped['Fixed Site (copy)'] = row.SiteCode;
  }

  return mapped;
}

/**
 * Validate that all required Tableau fields are present
 */
function validateRequiredFields(row, rowNumber) {
  const requiredFields = [
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
    'SiteabstractionDate (copy)',
    'Fixed Site (copy)'
  ];

  const missing = requiredFields.filter(field => !(field in row) || row[field] === undefined || row[field] === '');

  if (missing.length > 0) {
    console.error(`❌ Row ${rowNumber}: Missing fields: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

// Main validation
console.log('🔍 Validating CSV parsing...\n');

try {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');

  // Check for BOM
  const hasBOM = csvContent.charCodeAt(0) === 0xFEFF;
  console.log(`BOM Detection: ${hasBOM ? '✅ BOM found and will be stripped' : 'ℹ️  No BOM detected'}`);

  // Parse header
  const lines = csvContent.split(/\r?\n/);
  const headerLine = stripBOM(lines[0]);
  const rawHeaders = parseCSVLine(headerLine);

  console.log(`\n📊 Raw headers (${rawHeaders.length} columns):`);
  rawHeaders.slice(0, 5).forEach(h => console.log(`   - ${h}`));
  console.log('   ...');

  // Clean headers
  const cleanHeaders = rawHeaders.map(cleanColumnName);
  console.log(`\n✨ Cleaned headers (${cleanHeaders.length} columns):`);
  cleanHeaders.slice(0, 5).forEach(h => console.log(`   - ${h}`));
  console.log('   ...');

  // Check for triple-quote normalization
  // Note: CSV parser handles the outer quotes as CSV delimiters
  // The content ""DisplayMFL"" becomes "DisplayMFL" after CSV parsing
  // Then our cleaner strips the remaining quotes
  const needsQuoteCleaning = rawHeaders.some(h => h.includes('"'));
  console.log(`\n🧹 Header quote cleaning needed: ${needsQuoteCleaning ? '✅ Yes (quotes stripped after CSV parsing)' : 'ℹ️  No'}`);

  // Show raw header bytes vs final cleaned header
  console.log('\n📋 Header transformation example:');
  console.log(`   Raw (from file): """DisplayMFL"""`);
  console.log(`   After CSV parse: "${rawHeaders[0]}"`);
  console.log(`   After cleaning: "${cleanHeaders[0]}"`);

  // Parse first data row
  if (lines.length > 1) {
    const firstDataRow = parseCSVLine(lines[1]);
    const row = {};
    cleanHeaders.forEach((header, i) => {
      row[header] = firstDataRow[i];
    });

    // Apply Tableau field mappings
    const mappedRow = mapToTableauFields(row);

    console.log('\n🔗 Tableau field mappings:');
    console.log(`   SiteabstractionDate (copy) → ${mappedRow['SiteabstractionDate (copy)']}`);
    console.log(`   Fixed Site (copy) → ${mappedRow['Fixed Site (copy)']}`);

    // Validate required fields
    console.log('\n✅ Validating required Tableau fields...');
    const isValid = validateRequiredFields(mappedRow, 1);

    if (isValid) {
      console.log('\n🎉 SUCCESS: All required fields present!');
      console.log(`\n📈 Dataset info:`);
      console.log(`   - Total rows: ${lines.length - 1}`);
      console.log(`   - Total columns: ${cleanHeaders.length}`);
      console.log(`   - Header normalization: ✅`);
      console.log(`   - Tableau field mapping: ✅`);
      console.log(`   - Required fields validation: ✅`);
    } else {
      console.log('\n❌ FAILED: Missing required fields');
      process.exit(1);
    }
  }

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
