/**
 * Tableau Data Validator
 * Validates that CSV data can be parsed correctly and all required fields are present
 */

import * as d3 from 'd3-dsv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface DataRow {
  artist: string;
  "13 Years Old": number;
  "12 Years Old": number;
  "11 Years Old": number;
  "10 Years Old": number;
  "9 Years Old": number;
  "8 Years Old": number;
  "7 Years Old": number;
  "6 Years Old": number;
  "5 Years Old": number;
  "4 Years Old": number;
  "3 Years Old": number;
  "2 Years Old": number;
  "1 Years Old": number;
  "Year Born": number;
  "Recognition by Millennials": number;
  "Recognition by Gen-Zs": number;
  "No. of Songs": number;
  "Calculation_788129974626648065": number;
}

// Expected columns in the CSV
const EXPECTED_COLUMNS = [
  'artist',
  '13 Years Old',
  '12 Years Old',
  '11 Years Old',
  '10 Years Old',
  '9 Years Old',
  '8 Years Old',
  '7 Years Old',
  '6 Years Old',
  '5 Years Old',
  '4 Years Old',
  '3 Years Old',
  '2 Years Old',
  '1 Years Old',
  'Year Born',
  'Recognition by Millennials',
  'Recognition by Gen-Zs',
  'No. of Songs'
];

// Age columns in correct order
const AGE_COLUMNS = [
  'Year Born',
  '1 Years Old',
  '2 Years Old',
  '3 Years Old',
  '4 Years Old',
  '5 Years Old',
  '6 Years Old',
  '7 Years Old',
  '8 Years Old',
  '9 Years Old',
  '10 Years Old',
  '11 Years Old',
  '12 Years Old',
  '13 Years Old'
];

function validateCSV(csvPath: string): {
  success: boolean;
  errors: string[];
  warnings: string[];
  rowcount: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rowcount = 0;

  console.log(`\n=== Validating CSV: ${csvPath} ===\n`);

  try {
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      errors.push(`CSV file not found: ${csvPath}`);
      return { success: false, errors, warnings, rowcount };
    }

    // Read file
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvText.split('\n').filter(line => line.trim());

    // Check for preamble rows (non-data rows before header)
    const firstLine = lines[0];
    console.log(`First line: ${firstLine.substring(0, 100)}...`);

    // Try to parse with d3.csvParse
    const rawData = d3.csvParse(csvText);
    rowcount = rawData.length;

    console.log(`✓ Parsed ${rowcount} rows`);

    // Validate columns
    const columns = rawData.columns;
    console.log(`\nFound ${columns.length} columns:`);
    columns.forEach(col => console.log(`  - ${col}`));

    // Check for missing expected columns
    const missingColumns = EXPECTED_COLUMNS.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing expected columns: ${missingColumns.join(', ')}`);
    }

    // Check for extra columns
    const extraColumns = columns.filter(col => !EXPECTED_COLUMNS.includes(col));
    if (extraColumns.length > 0) {
      warnings.push(`Extra columns found: ${extraColumns.join(', ')}`);
    }

    // Validate header format (check for quoted headers)
    const quotedHeaders = columns.filter(col => col.startsWith('"') || col.endsWith('"'));
    if (quotedHeaders.length > 0) {
      warnings.push(`Headers with quotes found: ${quotedHeaders.join(', ')}`);
    }

    // Validate data rows
    console.log('\n--- Validating data rows ---');
    let emptyRows = 0;
    let rowsWithMissingValues = 0;

    rawData.forEach((row, idx) => {
      const rowNum = idx + 1;

      // Check for completely empty rows
      const isEmpty = Object.values(row).every(val => !val || val.trim() === '');
      if (isEmpty) {
        emptyRows++;
        warnings.push(`Row ${rowNum} is empty`);
        return;
      }

      // Check for missing critical values
      const missingFields: string[] = [];
      if (!row.artist) missingFields.push('artist');
      if (row['No. of Songs'] === undefined || row['No. of Songs'] === '') missingFields.push('No. of Songs');

      if (missingFields.length > 0) {
        rowsWithMissingValues++;
        warnings.push(`Row ${rowNum} (artist: ${row.artist || 'UNKNOWN'}): Missing fields: ${missingFields.join(', ')}`);
      }

      // Validate numeric parsing for age columns
      AGE_COLUMNS.forEach(ageCol => {
        const val = row[ageCol];
        if (val === undefined || val === null || val === '') {
          // Missing value is okay, could be null
        } else {
          const num = Number(val);
          if (isNaN(num)) {
            warnings.push(`Row ${rowNum} (artist: ${row.artist}): Non-numeric value in ${ageCol}: "${val}"`);
          }
        }
      });

      // Validate key numeric fields
      ['Year Born', 'Recognition by Millennials', 'Recognition by Gen-Zs', 'No. of Songs'].forEach(field => {
        const val = row[field];
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num)) {
            warnings.push(`Row ${rowNum} (artist: ${row.artist}): Non-numeric value in ${field}: "${val}"`);
          }
        }
      });
    });

    if (emptyRows > 0) {
      warnings.push(`Found ${emptyRows} empty rows`);
    }

    if (rowsWithMissingValues > 0) {
      warnings.push(`Found ${rowsWithMissingValues} rows with missing critical values`);
    }

    // Test parsing logic similar to the dataService
    console.log('\n--- Testing data service parsing logic ---');
    try {
      const parsedData: DataRow[] = rawData.map((row: d3.DSVRowString, idx) => {
        const parsedRow: Record<string, string | number> = { artist: row.artist || `Row${idx}` };

        // Parse all age columns
        for (let i = 1; i <= 13; i++) {
          const key = `${i} Years Old`;
          const val = Number(row[key]);
          parsedRow[key] = isNaN(val) ? 0 : val;
        }

        // Parse other numeric fields
        parsedRow['Year Born'] = Number(row['Year Born']) || 0;
        parsedRow['Recognition by Millennials'] = Number(row['Recognition by Millennials']) || 0;
        parsedRow['Recognition by Gen-Zs'] = Number(row['Recognition by Gen-Zs']) || 0;
        parsedRow['No. of Songs'] = Number(row['No. of Songs']) || 0;

        // Add calculated field for Tableau compatibility
        parsedRow['Calculation_788129974626648065'] = parsedRow['Year Born'];

        return parsedRow as unknown as DataRow;
      });

      console.log(`✓ Successfully parsed ${parsedData.length} rows using dataService logic`);

      // Validate parsed data
      const zeroValuesCheck = parsedData.filter(row => {
        return row['No. of Songs'] === 0 &&
               row['Recognition by Millennials'] === 0 &&
               row['Recognition by Gen-Zs'] === 0;
      });

      if (zeroValuesCheck.length > 0) {
        warnings.push(`${zeroValuesCheck.length} rows have all-zero values for key metrics`);
      }

      // Show sample parsed data
      console.log('\nSample parsed data (first 3 rows):');
      parsedData.slice(0, 3).forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`);
        console.log(`  artist: ${row.artist}`);
        console.log(`  Year Born: ${row['Year Born']}`);
        console.log(`  Recognition by Millennials: ${row['Recognition by Millennials']}`);
        console.log(`  Recognition by Gen-Zs: ${row['Recognition by Gen-Zs']}`);
        console.log(`  No. of Songs: ${row['No. of Songs']}`);
      });

    } catch (parseError) {
      errors.push(`Failed to parse data using dataService logic: ${parseError}`);
    }

  } catch (error) {
    errors.push(`Fatal error: ${error}`);
  }

  const success = errors.length === 0;

  console.log('\n=== Validation Summary ===');
  console.log(`Success: ${success ? '✓' : '✗'}`);
  console.log(`Rows processed: ${rowcount}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => console.log(`  ✗ ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(warn => console.log(`  ⚠ ${warn}`));
  }

  if (success && warnings.length === 0) {
    console.log('\n✓ All checks passed!');
  }

  return { success, errors, warnings, rowcount };
}

// Main execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csvPath = path.join(__dirname, '../public/data/final_df.csv');
const result = validateCSV(csvPath);

// Exit with error code if validation failed
process.exit(result.success ? 0 : 1);
