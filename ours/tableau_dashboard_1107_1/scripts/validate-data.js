#!/usr/bin/env node

/**
 * Standalone data validation script
 * Tests CSV parsing and data quality without running the full app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV parser for validation
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Normalize headers
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => {
    let cleaned = h.trim();
    cleaned = cleaned.replace(/^"{3,}/, '').replace(/"{3,}$/, '');
    cleaned = cleaned.replace(/^"{1,}/, '').replace(/"{1,}$/, '');
    return cleaned;
  });

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });
      data.push(row);
    }
  }

  return { headers, data };
};

// Main validation
const main = () => {
  console.log('🔍 Starting data validation...\n');

  // Check data directory
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    console.error('❌ Data directory not found:', dataDir);
    process.exit(1);
  }

  // List data files
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  console.log(`📁 Found ${files.length} CSV files:`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log();

  // Validate each file
  let allValid = true;
  let tripDataFound = false;

  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    console.log(`\n📄 Validating: ${file}`);

    try {
      const csvText = fs.readFileSync(filePath, 'utf-8');
      const { headers, data } = parseCSV(csvText);

      console.log(`   ✓ Parsed ${data.length} data rows`);
      console.log(`   ✓ Found ${headers.length} columns`);
      console.log(`   📋 Headers: ${headers.slice(0, 6).join(', ')}${headers.length > 6 ? '...' : ''}`);

      // Check if this is trip data
      const isTripData = headers.includes('TripID') && headers.includes('starttime');
      const isStationData = headers.includes('stationid');

      if (isTripData) {
        tripDataFound = true;
        console.log(`   🎯 Type: Trip data (main dataset)`);

        // Check for required fields
        const requiredFields = ['TripID', 'starttime', 'stoptime', 'usertype', 'gender'];
        const missing = requiredFields.filter(f => !headers.includes(f));

        if (missing.length > 0) {
          console.log(`   ⚠️  Missing required fields: ${missing.join(', ')}`);
          allValid = false;
        } else {
          console.log(`   ✓ All required fields present`);
        }

        // Validate first row
        if (data.length > 0) {
          const firstRow = data[0];

          // Check date parsing
          const startTime = new Date(firstRow.starttime);
          const validDate = !isNaN(startTime.getTime());
          if (!validDate) {
            console.log(`   ⚠️  First row has invalid date format: ${firstRow.starttime}`);
            allValid = false;
          } else {
            console.log(`   ✓ Date parsing works (sample year: ${startTime.getFullYear()})`);
          }

          // Show sample data
          console.log(`   📊 Sample record:`);
          console.log(`      TripID: ${firstRow.TripID}`);
          console.log(`      StartTime: ${firstRow.starttime}`);
          console.log(`      UserType: ${firstRow.usertype}`);
          console.log(`      Gender: ${firstRow.gender}`);
        }
      } else if (isStationData) {
        console.log(`   📍 Type: Station data (supplementary dataset)`);
        console.log(`   ℹ️  Skipping trip-specific validation`);
      } else {
        console.log(`   ❓ Type: Unknown dataset format`);
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      allValid = false;
    }
  });

  if (!tripDataFound) {
    console.log('\n⚠️  Warning: No trip data CSV found in data directory');
    allValid = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allValid) {
    console.log('✅ All validations passed!');
    console.log('📦 CSV headers are properly normalized and data is accessible.');
  } else {
    console.log('❌ Some validations failed. Please check the warnings above.');
    process.exit(1);
  }
};

main();
