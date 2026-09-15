#!/usr/bin/env node

/**
 * Standalone validation script for Tableau source ingestion
 * Run with: npx tsx scripts/validate-tableau-source.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3-dsv';

interface DataRow {
  '': number;
  Year: string;
  Location: string;
  Indicators: string;
  Products: string;
  UOM: string;
  'Scalar Factor': string;
  Value: string;
}

function validateTableauSource() {
  console.log('=== Tableau Source Validation ===\n');

  const csvPath = path.resolve(process.cwd(), 'public/data/df.csv');

  // Check file exists
  if (!fs.existsSync(csvPath)) {
    console.error('✗ CSV file not found:', csvPath);
    process.exit(1);
  }
  console.log('✓ CSV file found:', csvPath);

  // Read and parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rawData = d3.csvParse(csvContent);

  console.log(`✓ Parsed ${rawData.length} rows from CSV\n`);

  // Validate header
  const headers = Object.keys(rawData[0] || {});
  console.log('Headers found:', headers);

  const expectedHeaders = ['', 'Year', 'Location', 'Indicators', 'Products', 'UOM', 'Scalar Factor', 'Value'];
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    console.warn('Missing headers:', missingHeaders);
  } else {
    console.log('✓ All expected headers present\n');
  }

  // Check data quality
  console.log('Data Quality Checks:');

  // Check for empty required fields
  let emptyYears = 0;
  let emptyLocations = 0;
  let emptyIndicators = 0;
  let emptyValues = 0;
  let zeroValues = 0;

  rawData.forEach((row: any, i) => {
    if (!row.Year || row.Year === '') emptyYears++;
    if (!row.Location || row.Location === '') emptyLocations++;
    if (!row.Indicators || row.Indicators === '') emptyIndicators++;
    if (!row.Value || row.Value === '') emptyValues++;
    if (parseFloat(row.Value) === 0) zeroValues++;
  });

  console.log(`  Empty Years: ${emptyYears}`);
  console.log(`  Empty Locations: ${emptyLocations}`);
  console.log(`  Empty Indicators: ${emptyIndicators}`);
  console.log(`  Empty Values: ${emptyValues}`);
  console.log(`  Zero Values: ${zeroValues}`);

  if (emptyYears > 0 || emptyLocations > 0 || emptyIndicators > 0 || emptyValues > 0) {
    console.error('\n✗ Data quality issues found!');
    process.exit(1);
  } else {
    console.log('✓ No empty required fields\n');
  }

  // Check unique values
  const years = new Set(rawData.map((r: any) => r.Year));
  const locations = new Set(rawData.map((r: any) => r.Location));
  const indicators = new Set(rawData.map((r: any) => r.Indicators));

  console.log('Unique Values:');
  console.log(`  Years (${years.size}):`, Array.from(years).sort().join(', '));
  console.log(`  Locations (${locations.size}):`, Array.from(locations).sort().join(', '));
  console.log(`  Indicators (${indicators.size}):`, Array.from(indicators).sort().join(', '));

  // Validate required fields from Tableau contract
  console.log('\nTableau Contract Validation:');

  const requiredYears = ['2014', '2015', '2016', '2017'];
  const missingYears = requiredYears.filter(y => !years.has(y));
  if (missingYears.length > 0) {
    console.warn('  Missing years:', missingYears.join(', '));
  } else {
    console.log('  ✓ All required years present');
  }

  const requiredIndicators = ['Total demand'];
  const missingIndicators = requiredIndicators.filter(i => !indicators.has(i));
  if (missingIndicators.length > 0) {
    console.error('  ✗ Missing indicators:', missingIndicators.join(', '));
    process.exit(1);
  } else {
    console.log('  ✓ Required indicators present');
  }

  // Check for non-zero values
  const nonZeroCount = rawData.filter((r: any) => parseFloat(r.Value) !== 0).length;
  console.log(`  Non-zero values: ${nonZeroCount}/${rawData.length}`);

  if (nonZeroCount === 0) {
    console.error('\n✗ All values are zero - charts will be empty!');
    process.exit(1);
  }

  // Sample data inspection
  console.log('\nSample Data (first 3 rows):');
  rawData.slice(0, 3).forEach((row: any, i: number) => {
    console.log(`  Row ${i + 1}:`, {
      Year: row.Year,
      Location: row.Location,
      Indicator: row.Indicators,
      Value: row.Value
    });
  });

  console.log('\n=== Validation Complete ===');
  console.log('✓ All checks passed!');
}

// Run validation
validateTableauSource();
