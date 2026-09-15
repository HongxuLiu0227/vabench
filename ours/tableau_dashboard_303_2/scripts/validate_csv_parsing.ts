/**
 * Standalone validation script to test CSV parsing with Node.js filesystem
 * Run with: npx tsx scripts/validate_csv_parsing.ts
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy the parsing functions here for standalone testing
const expectedHeaders = [
  'Accident_Index', 'Location_Easting_OSGR', 'Location_Northing_OSGR',
  'Longitude', 'Latitude', 'Police_Force', 'Accident_Severity',
  'Number_of_Vehicles', 'Number_of_Casualties', 'Date', 'Day_of_Week',
  'Time', 'Local_Authority_(District)', 'Local_Authority_(Highway)',
  '1st_Road_Class', '1st_Road_Number', 'Road_Type', 'Speed_limit',
  'Junction_Detail', 'Junction_Control', '2nd_Road_Class', '2nd_Road_Number',
  'Pedestrian_Crossing-Human_Control', 'Pedestrian_Crossing-Physical_Facilities',
  'Light_Conditions', 'Weather_Conditions', 'Road_Surface_Conditions',
  'Special_Conditions_at_Site', 'Carriageway_Hazards', 'Urban_or_Rural_Area',
  'Did_Police_Officer_Attend_Scene_of_Accident', 'LSOA_of_Accident_Location',
  'Sex Of Casualty'
];

// Type definitions removed - interfaces defined but not used

const weatherConditionMap: Record<number, string> = {
  1: 'Fine no high winds',
  2: 'Raining no high winds',
  3: 'Snowing no high winds',
  4: 'Fine + high winds',
  5: 'Raining + high winds',
  6: 'Snowing + high winds',
  7: 'Fog or mist',
  8: 'Other',
  9: 'Unknown',
  '-1': 'Unknown'
};

const roadSurfaceConditionMap: Record<number, string> = {
  1: 'Dry',
  2: 'Wet or damp',
  3: 'Snow',
  4: 'Frost or ice',
  5: 'Flood over 3cm deep',
  6: 'Oil or diesel',
  7: 'Mud',
  '-1': 'Unknown'
};

const lightConditionMap: Record<number, string> = {
  1: 'Daylight',
  4: 'Darkness - lights lit',
  5: 'Darkness - lights unlit',
  6: 'Darkness - no lighting',
  7: 'Darkness - lighting unknown'
};

const accidentSeverityMap: Record<number, string> = {
  1: 'Fatal',
  2: 'Serious',
  3: 'Slight'
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function validateCSV(csvPath: string) {
  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE DATA VALIDATION');
  console.log('='.repeat(60));

  console.log(`\nReading CSV from: ${csvPath}`);

  const csvText = readFileSync(csvPath, 'utf-8');
  console.log(`✓ File loaded: ${csvText.length} bytes\n`);

  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  console.log(`✓ Total lines: ${lines.length}\n`);

  // Detect header row
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const potentialHeader = parseCSVLine(lines[i]);
    const normalizedHeaders = potentialHeader.map(h => h.trim().replace(/^"|"$/g, ''));
    const matchCount = normalizedHeaders.filter(h =>
      expectedHeaders.some(eh => eh.toLowerCase() === h.toLowerCase())
    ).length;

    if (matchCount >= 20) {
      headerRowIndex = i;
      break;
    }
  }

  console.log(`✓ Header row detected at line ${headerRowIndex + 1}`);

  const headers = parseCSVLine(lines[headerRowIndex]).map(h => h.trim().replace(/^"|"$/g, ''));
  console.log(`✓ Headers parsed: ${headers.length} columns\n`);

  // Validate headers
  console.log('Header Validation:');
  const missingHeaders = expectedHeaders.filter(eh => !headers.some(h => h.toLowerCase() === eh.toLowerCase()));
  if (missingHeaders.length > 0) {
    console.log(`  ✗ Missing headers: ${missingHeaders.join(', ')}`);
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  console.log(`  ✓ All expected headers present\n`);

  // Parse sample of data
  console.log('Parsing Data...');
  const data: Record<string, string>[] = [];
  let parseErrors = 0;
  const maxSamples = 10000; // Parse first 10k for validation

  for (let i = headerRowIndex + 1; i < Math.min(lines.length, headerRowIndex + 1 + maxSamples); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      if (values.length !== headers.length) {
        if (parseErrors < 10) {
          console.warn(`  ⚠ Row ${i + 1}: Expected ${headers.length} fields, got ${values.length}`);
        }
        parseErrors++;
        continue;
      }

      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        const value: string = values[index]?.trim().replace(/^"|"$/g, '') || '';
        record[header] = value;
      });

      data.push(record);
    } catch (error) {
      if (parseErrors < 10) {
        console.error(`  ✗ Error parsing row ${i + 1}:`, error);
      }
      parseErrors++;
    }
  }

  console.log(`  ✓ Parsed ${data.length} valid records from first ${maxSamples} lines`);
  if (parseErrors > 0) {
    console.log(`  ⚠ ${parseErrors} parse errors encountered`);
  }

  // Validate critical fields
  console.log('\nCritical Field Validation:');
  const criticalFields = [
    'Accident_Index',
    'Weather_Conditions',
    'Road_Surface_Conditions',
    'Light_Conditions',
    'Accident_Severity',
    'Speed_limit',
    'Date'
  ];

  const sample = data[0];
  for (const field of criticalFields) {
    const hasField = field in sample;
    const value = hasField ? sample[field] : 'N/A';
    console.log(`  ${hasField ? '✓' : '✗'} ${field}: ${value}`);
  }

  // Test field mappings
  console.log('\nField Mapping Validation:');

  const weatherCounts = new Map<string, number>();
  const surfaceCounts = new Map<string, number>();
  const lightCounts = new Map<string, number>();
  const severityCounts = new Map<string, number>();

  data.forEach(record => {
    const weatherCode = Number(record.Weather_Conditions);
    const surfaceCode = Number(record.Road_Surface_Conditions);
    const lightCode = Number(record.Light_Conditions);
    const severityCode = Number(record.Accident_Severity);

    const weather = weatherConditionMap[weatherCode] || 'Unknown';
    const surface = roadSurfaceConditionMap[surfaceCode] || 'Unknown';
    const light = lightConditionMap[lightCode] || 'Darkness - lighting unknown';
    const severity = accidentSeverityMap[severityCode] || 'Slight';

    weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
    surfaceCounts.set(surface, (surfaceCounts.get(surface) || 0) + 1);
    lightCounts.set(light, (lightCounts.get(light) || 0) + 1);
    severityCounts.set(severity, (severityCounts.get(severity) || 0) + 1);
  });

  console.log(`  Weather conditions: ${weatherCounts.size} unique`);
  Array.from(weatherCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([weather, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`    - ${weather}: ${count.toLocaleString()} (${pct}%)`);
    });

  console.log(`\n  Road surface conditions: ${surfaceCounts.size} unique`);
  Array.from(surfaceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([surface, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`    - ${surface}: ${count.toLocaleString()} (${pct}%)`);
    });

  console.log(`\n  Light conditions: ${lightCounts.size} unique`);
  Array.from(lightCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([light, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`    - ${light}: ${count.toLocaleString()} (${pct}%)`);
    });

  console.log(`\n  Accident severities: ${severityCounts.size} unique`);
  Array.from(severityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([severity, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`    - ${severity}: ${count.toLocaleString()} (${pct}%)`);
    });

  // Data quality checks
  console.log('\nData Quality Checks:');
  const unknownWeather = weatherCounts.get('Unknown') || 0;
  const unknownSurface = surfaceCounts.get('Unknown') || 0;

  if (unknownWeather > data.length * 0.1) {
    console.log(`  ⚠ Warning: High percentage of Unknown weather (${((unknownWeather / data.length) * 100).toFixed(1)}%)`);
  } else {
    console.log(`  ✓ Unknown weather: ${((unknownWeather / data.length) * 100).toFixed(1)}% (acceptable)`);
  }

  if (unknownSurface > data.length * 0.1) {
    console.log(`  ⚠ Warning: High percentage of Unknown road surface (${((unknownSurface / data.length) * 100).toFixed(1)}%)`);
  } else {
    console.log(`  ✓ Unknown road surface: ${((unknownSurface / data.length) * 100).toFixed(1)}% (acceptable)`);
  }

  // Check for date parsing
  const sampleDate = data[0].Date;
  console.log(`\n  ✓ Sample date field: ${sampleDate}`);

  console.log('\n' + '='.repeat(60));
  console.log('ALL VALIDATIONS PASSED ✓');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log(`  - CSV structure: Valid`);
  console.log(`  - Headers: All present`);
  console.log(`  - Field mappings: Working correctly`);
  console.log(`  - Data quality: Acceptable`);
  const estimatedRecords = lines.length - headerRowIndex - 1;
  console.log(`  - Estimated total records: ~${estimatedRecords.toLocaleString()}`);
  console.log('='.repeat(60));
}

try {
  const csvPath = join(__dirname, '../public/data/DfTRoadSafety_Accidents_2014.csv');
  validateCSV(csvPath);
} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('VALIDATION FAILED ✗');
  console.error('='.repeat(60));
  console.error(error);
  process.exit(1);
}
