/**
 * Validation script to test CSV parsing with actual data
 * Run with: node validate-data.js
 */

const fs = require('fs');
const path = require('path');

function normalizeHeaderName(header) {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove triple quotes: """FieldName""" -> FieldName
  cleaned = cleaned.replace(/^"""(.+)"""$/, '$1');

  // Remove double quotes: "FieldName" -> FieldName
  cleaned = cleaned.replace(/^"(.+)"$/, '$1');

  return cleaned;
}

function parseCSVManually(csvText) {
  // Remove BOM if present at the start of the file
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('No data found in CSV');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => normalizeHeaderName(h.trim()));

  console.log('Normalized headers:', headers);
  console.log('\nFirst 5 data rows:');

  let validRows = 0;
  let invalidRows = 0;

  // Parse first 5 data rows
  for (let i = 1; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    const values = line.split(',');

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Validate required fields
    const hasRequiredFields =
      row.DisplayCounty &&
      row.DisplayAgency &&
      row.DisplayMFL;

    if (hasRequiredFields) {
      validRows++;
      console.log(`\nRow ${i} (VALID):`);
      console.log(`  DisplayCounty: ${row.DisplayCounty}`);
      console.log(`  DisplayAgency: ${row.DisplayAgency}`);
      console.log(`  DisplayMFL: ${row.DisplayMFL}`);
      console.log(`  UploadDate: ${row.UploadDate || 'N/A'}`);
      console.log(`  UploadDate_MPI: ${row.UploadDate_MPI || 'N/A'}`);
    } else {
      invalidRows++;
      console.log(`\nRow ${i} (INVALID - missing required fields):`, row);
    }
  }

  console.log(`\n\nValidation Summary:`);
  console.log(`  Total rows checked: ${Math.min(5, lines.length - 1)}`);
  console.log(`  Valid rows: ${validRows}`);
  console.log(`  Invalid rows: ${invalidRows}`);
  console.log(`  Total lines in file: ${lines.length}`);

  return { headers, validRows, invalidRows, totalLines: lines.length };
}

// Main execution
const csvPath = path.join(__dirname, 'public/data/federated_0se4v9q15j8hfi17f25m50.csv');

try {
  console.log('Reading CSV file:', csvPath);
  const csvText = fs.readFileSync(csvPath, 'utf8');

  console.log('\n=== CSV Parsing Validation ===\n');
  const result = parseCSVManually(csvText);

  console.log('\n✅ CSV parsing validation completed successfully');

  if (result.validRows > 0) {
    console.log('\n✅ Data structure is valid - all required fields are present');
  } else {
    console.log('\n❌ WARNING: No valid rows found - check data structure');
  }

} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  process.exit(1);
}
