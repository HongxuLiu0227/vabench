#!/usr/bin/env node

/**
 * Tableau Data Source Validator
 * Validates that CSV files can be loaded and parsed correctly
 */

const fs = require('fs');
const path = require('path');
const { csvParse } = require('d3-dsv');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DATA_FILES = [
  'JC-201701-citibike-tripdata.csv',
  'JC-201702-citibike-tripdata.csv',
  'JC-201703-citibike-tripdata.csv',
  'JC-201704-citibike-tripdata.csv',
  'JC-201705-citibike-tripdata.csv',
  'JC-201706-citibike-tripdata.csv',
  'JC-201707-citibike-tripdata.csv',
  'JC-201708 citibike-tripdata.csv',
  'JC-201709-citibike-tripdata.csv',
  'JC-201710-citibike-tripdata.csv',
  'JC-201711-citibike-tripdata.csv',
  'JC-201712-citibike-tripdata.csv',
];

function normalizeFieldName(key) {
  const lowerKey = key.toLowerCase().trim();

  if (lowerKey.includes('tripduration') || lowerKey.includes('trip duration')) {
    return 'tripduration';
  }
  if (lowerKey.includes('starttime') || lowerKey.includes('start time')) {
    return 'starttime';
  }
  if (lowerKey.includes('stoptime') || lowerKey.includes('stop time')) {
    return 'stoptime';
  }
  if (lowerKey.includes('start station id')) {
    return 'start station id';
  }
  if (lowerKey.includes('start station name')) {
    return 'start station name';
  }
  if (lowerKey.includes('start station latitude')) {
    return 'start station latitude';
  }
  if (lowerKey.includes('start station longitude')) {
    return 'start station longitude';
  }
  if (lowerKey.includes('end station id')) {
    return 'end station id';
  }
  if (lowerKey.includes('end station name')) {
    return 'end station name';
  }
  if (lowerKey.includes('end station latitude')) {
    return 'end station latitude';
  }
  if (lowerKey.includes('end station longitude')) {
    return 'end station longitude';
  }
  if (lowerKey.includes('bikeid') || lowerKey === 'bike id') {
    return 'bikeid';
  }
  if (lowerKey.includes('usertype') || lowerKey === 'user type') {
    return 'usertype';
  }
  if (lowerKey.includes('birth year')) {
    return 'birth year';
  }
  if (lowerKey.includes('gender')) {
    return 'gender';
  }

  return lowerKey;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '' || value === 'NULL' || value === 'null') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function validateFile(filePath) {
  const fileName = path.basename(filePath);

  try {
    const csvText = fs.readFileSync(filePath, 'utf-8');
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return { valid: false, error: 'Empty file' };
    }

    // Parse CSV
    const parsedData = csvParse(csvText);

    if (parsedData.length === 0) {
      return { valid: false, error: 'No data rows' };
    }

    // Check headers
    const sampleRow = parsedData[0];
    const normalizedFields = {};
    Object.keys(sampleRow).forEach(key => {
      const normalized = normalizeFieldName(key);
      normalizedFields[normalized] = sampleRow[key];
    });

    // Check for required Tableau fields
    const requiredFields = [
      'end station name',
      'end station latitude',
      'end station longitude',
      'start station name'
    ];

    const missingFields = requiredFields.filter(field => !(field in normalizedFields));

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        foundFields: Object.keys(normalizedFields)
      };
    }

    // Validate data quality
    let validRows = 0;
    let invalidCoords = 0;
    let missingStationNames = 0;

    parsedData.forEach(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const normKey = normalizeFieldName(key);
        normalized[normKey] = row[key];
      });

      const endLat = parseNumber(normalized['end station latitude']);
      const endLon = parseNumber(normalized['end station longitude']);
      const endName = (normalized['end station name'] || '').trim();

      if (endLat === 0 && endLon === 0) {
        invalidCoords++;
      } else if (!endName) {
        missingStationNames++;
      } else {
        validRows++;
      }
    });

    return {
      valid: true,
      totalRows: parsedData.length,
      validRows,
      invalidCoords,
      missingStationNames,
      fields: Object.keys(normalizedFields)
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function main() {
  console.log('='.repeat(70));
  console.log('Tableau Data Source Validator');
  console.log('='.repeat(70));
  console.log();

  let totalValid = 0;
  let totalInvalid = 0;
  const errors = [];

  DATA_FILES.forEach((fileName, index) => {
    const filePath = path.join(DATA_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${index + 1}. ${fileName} - FILE NOT FOUND`);
      totalInvalid++;
      errors.push({ file: fileName, error: 'File not found' });
      return;
    }

    const result = validateFile(filePath);

    if (result.valid) {
      console.log(`✓ ${index + 1}. ${fileName}`);
      console.log(`   Rows: ${result.totalRows.toLocaleString()}, Valid: ${result.validRows.toLocaleString()}, Invalid coords: ${result.invalidCoords.toLocaleString()}`);
      totalValid++;
    } else {
      console.log(`❌ ${index + 1}. ${fileName}`);
      console.log(`   Error: ${result.error}`);
      if (result.foundFields) {
        console.log(`   Found fields: ${result.foundFields.join(', ')}`);
      }
      totalInvalid++;
      errors.push({ file: fileName, error: result.error });
    }
    console.log();
  });

  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log(`Valid files: ${totalValid}/${DATA_FILES.length}`);
  console.log(`Invalid files: ${totalInvalid}/${DATA_FILES.length}`);

  if (totalInvalid > 0) {
    console.log();
    console.log('Errors:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
    process.exit(1);
  } else {
    console.log();
    console.log('✓ All data sources passed validation!');
    process.exit(0);
  }
}

main();
