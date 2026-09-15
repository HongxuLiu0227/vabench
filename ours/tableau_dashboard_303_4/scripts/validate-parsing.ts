/**
 * CSV Parsing Validation Script
 * Tests that the CSV can be parsed and required fields are accessible
 */

import * as d3 from 'd3';
import * as fs from 'fs';
import * as path from 'path';

// Field names that match actual CSV headers
const REQUIRED_FIELDS = [
  'Accident_Index',
  'Accident_Severity',
  'Number_of_Vehicles',
  'Number_of_Casualties',
  'Day_of_Week',
  'Speed_limit',
  'Light_Conditions',
  'Weather_Conditions',
  'Road_Surface_Conditions',
  'Urban_or_Rural_Area',
  'Time',
  'Date'
];

async function validateCSVParsing() {
  console.log('='.repeat(80));
  console.log('CSV PARSING VALIDATION');
  console.log('='.repeat(80));

  const csvPath = path.resolve(process.cwd(), 'public/data/DfTRoadSafety_Accidents_2014.csv');

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`✅ CSV file exists: ${csvPath}`);

  // Read file size
  const stats = fs.statSync(csvPath);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Read and parse CSV
  console.log('\n📋 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV using d3.csvParse
  console.log('🔍 Parsing CSV with d3.csvParse...');
  const data = d3.csvParse(csvContent);

  if (!data || data.length === 0) {
    console.error('❌ CSV parsing failed or file is empty');
    process.exit(1);
  }

  console.log(`✅ Successfully parsed ${data.length} records`);

  // Check headers
  console.log('\n📝 Validating CSV headers...');
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow).sort();

  console.log(`   Available fields (${availableFields.length}):`);
  availableFields.forEach(field => {
    console.log(`   - ${field}`);
  });

  // Check for required fields
  console.log('\n🔎 Checking for required fields...');
  const missingFields: string[] = [];
  const presentFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (field in firstRow) {
      presentFields.push(field);
      console.log(`   ✅ ${field}`);
    } else {
      missingFields.push(field);
      console.log(`   ❌ ${field} - NOT FOUND`);
    }
  }

  if (missingFields.length > 0) {
    console.error(`\n❌ MISSING REQUIRED FIELDS: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n✅ All ${REQUIRED_FIELDS.length} required fields are present`);

  // Validate field values
  console.log('\n🧪 Validating field values in first 5 records...');

  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    console.log(`\n   Record ${i + 1}:`);

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      const value = row[field];
      const displayValue = value ? `"${String(value).substring(0, 30)}"` : '(empty)';
      console.log(`      ${field}: ${displayValue}`);
    }
  }

  // Check for data quality issues
  console.log('\n📊 Checking data quality...');

  let emptyAccidentIndex = 0;
  let zeroVehicles = 0;
  let invalidDayOfWeek = 0;
  let emptySpeedLimit = 0;

  for (const row of data) {
    if (!row['Accident_Index'] || row['Accident_Index'].trim() === '') {
      emptyAccidentIndex++;
    }
    if (!row['Number_of_Vehicles'] || row['Number_of_Vehicles'] === '0') {
      zeroVehicles++;
    }
    const dayOfWeek = parseInt(row['Day_of_Week'] || '0');
    if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      invalidDayOfWeek++;
    }
    if (!row['Speed_limit'] || row['Speed_limit'].trim() === '') {
      emptySpeedLimit++;
    }
  }

  console.log(`   Records with empty Accident_Index: ${emptyAccidentIndex} (${(emptyAccidentIndex / data.length * 100).toFixed(2)}%)`);
  console.log(`   Records with zero vehicles: ${zeroVehicles} (${(zeroVehicles / data.length * 100).toFixed(2)}%)`);
  console.log(`   Records with invalid Day_of_Week: ${invalidDayOfWeek} (${(invalidDayOfWeek / data.length * 100).toFixed(2)}%)`);
  console.log(`   Records with empty Speed_limit: ${emptySpeedLimit} (${(emptySpeedLimit / data.length * 100).toFixed(2)}%)`);

  // Check for special character handling
  console.log('\n🔣 Checking special character field access...');

  const specialFields = [
    'Local_Authority_(District)',
    'Local_Authority_(Highway)',
    'Pedestrian_Crossing-Human_Control',
    'Pedestrian_Crossing-Physical_Facilities',
    'Sex Of Casualty'
  ];

  for (const field of specialFields) {
    if (field in firstRow) {
      const value = firstRow[field];
      console.log(`   ✅ ${field}: "${value}"`);
    } else {
      console.log(`   ⚠️  ${field}: NOT FOUND (may not be critical)`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ CSV PARSING VALIDATION PASSED');
  console.log('='.repeat(80));
}

// Run validation
validateCSVParsing().catch(error => {
  console.error('\n❌ Validation failed:', error);
  process.exit(1);
});
