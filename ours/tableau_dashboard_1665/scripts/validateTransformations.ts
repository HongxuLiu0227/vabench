/**
 * Tableau Data Transformation Validator
 * Validates that all data transformation functions work correctly
 */

import * as d3 from 'd3-dsv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

interface PRecognizabilityData {
  artist: string;
  measureName: string;
  value: number;
}

interface ScatterDataPoint {
  artist: string;
  noOfSongs: number;
  recognizability: number;
  measureName: string;
}

interface ComparisonDataPoint {
  measureName: string;
  value: number;
  artist?: string;
}

// Replicate dataService functions
function loadData(csvPath: string): DataRow[] {
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const rawData = d3.csvParse(csvText);

  const parsedData: DataRow[] = rawData.map((row: d3.DSVRowString) => {
    const parsedRow: Record<string, string | number> = { artist: row.artist || '' };

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

  return parsedData;
}

function transformLineChartData(data: DataRow[]): PRecognizabilityData[] {
  const ageColumns = [
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

  const result: PRecognizabilityData[] = [];

  data.forEach((row) => {
    ageColumns.forEach((ageCol) => {
      result.push({
        artist: row.artist,
        measureName: ageCol,
        value: row[ageCol as keyof DataRow] as number
      });
    });
  });

  return result;
}

function transformMeanLineChartData(
  data: DataRow[],
  selectedArtist: string | null
): { measureName: string; value: number }[] {
  const ageColumns = [
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

  const filteredData = selectedArtist
    ? data.filter((row) => row.artist === selectedArtist)
    : data;

  return ageColumns.map((ageCol) => {
    const sum = filteredData.reduce(
      (acc, row) => acc + (row[ageCol as keyof DataRow] as number),
      0
    );
    return {
      measureName: ageCol,
      value: sum / filteredData.length
    };
  });
}

function transformScatterData(data: DataRow[]): ScatterDataPoint[] {
  const result: ScatterDataPoint[] = [];

  data.forEach((row) => {
    result.push({
      artist: row.artist,
      noOfSongs: row['No. of Songs'],
      recognizability: row['Recognition by Millennials'],
      measureName: 'Recognition by Millennials'
    });
    result.push({
      artist: row.artist,
      noOfSongs: row['No. of Songs'],
      recognizability: row['Recognition by Gen-Zs'],
      measureName: 'Recognition by Gen-Zs'
    });
  });

  return result;
}

function transformComparisonData(
  data: DataRow[],
  selectedArtist: string | null
): ComparisonDataPoint[] {
  const filteredData = selectedArtist
    ? data.filter((row) => row.artist === selectedArtist)
    : data;

  const millennialsSum = filteredData.reduce(
    (acc, row) => acc + row['Recognition by Millennials'],
    0
  );
  const genZSum = filteredData.reduce(
    (acc, row) => acc + row['Recognition by Gen-Zs'],
    0
  );

  return [
    {
      measureName: 'Recognition by Millennials',
      value: millennialsSum / filteredData.length,
      artist: selectedArtist || undefined
    },
    {
      measureName: 'Recognition by Gen-Zs',
      value: genZSum / filteredData.length,
      artist: selectedArtist || undefined
    }
  ];
}

function getSortedArtists(data: DataRow[]): string[] {
  return [...data]
    .sort((a, b) => b['No. of Songs'] - a['No. of Songs'])
    .map((row) => row.artist);
}

function validateTransformations(csvPath: string): boolean {
  console.log('\n=== Validating Data Transformations ===\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Load data
    console.log('1. Loading data...');
    const data = loadData(csvPath);
    console.log(`   ✓ Loaded ${data.length} rows`);

    if (data.length === 0) {
      errors.push('No data loaded');
      return false;
    }

    // Test 1: Check that all numeric fields are valid
    console.log('\n2. Checking numeric field validity...');
    let invalidNumericCount = 0;
    data.forEach((row, idx) => {
      ['No. of Songs', 'Recognition by Millennials', 'Recognition by Gen-Zs'].forEach(field => {
        const val = row[field as keyof DataRow];
        if (typeof val !== 'number' || isNaN(val)) {
          invalidNumericCount++;
          console.log(`   ✗ Row ${idx + 1} (${row.artist}): ${field} is not a valid number: ${val}`);
        }
      });
    });

    if (invalidNumericCount === 0) {
      console.log(`   ✓ All numeric fields are valid`);
    } else {
      errors.push(`${invalidNumericCount} invalid numeric fields found`);
    }

    // Test 2: transformLineChartData
    console.log('\n3. Testing transformLineChartData...');
    try {
      const lineData = transformLineChartData(data);
      console.log(`   ✓ Transformed to ${lineData.length} records`);

      // Verify structure
      const expectedRecords = data.length * 14; // 14 age columns per artist
      if (lineData.length !== expectedRecords) {
        errors.push(`Expected ${expectedRecords} line chart records, got ${lineData.length}`);
      } else {
        console.log(`   ✓ Record count is correct (${data.length} artists × 14 age columns)`);

        // Sample check
        const firstRecord = lineData[0];
        if (!firstRecord.artist || !firstRecord.measureName || typeof firstRecord.value !== 'number') {
          errors.push('Line chart data has invalid structure');
        } else {
          console.log(`   ✓ Sample record: ${firstRecord.artist} - ${firstRecord.measureName} = ${firstRecord.value}`);
        }
      }

      // Check for NaN values
      const nanCount = lineData.filter(r => isNaN(r.value) || r.value === null || r.value === undefined).length;
      if (nanCount > 0) {
        warnings.push(`${nanCount} records have NaN/null/undefined values`);
      } else {
        console.log(`   ✓ No NaN values found`);
      }

    } catch (e) {
      errors.push(`transformLineChartData failed: ${e}`);
    }

    // Test 3: transformMeanLineChartData
    console.log('\n4. Testing transformMeanLineChartData...');
    try {
      const meanData = transformMeanLineChartData(data, null);
      console.log(`   ✓ Transformed to ${meanData.length} records`);

      if (meanData.length !== 14) {
        errors.push(`Expected 14 mean records, got ${meanData.length}`);
      } else {
        console.log(`   ✓ Record count is correct (14 age columns)`);

        // Check values are in reasonable range (0-1 for recognizability)
        const outOfRange = meanData.filter(r => r.value < 0 || r.value > 1);
        if (outOfRange.length > 0) {
          warnings.push(`${outOfRange.length} mean values are outside 0-1 range`);
        } else {
          console.log(`   ✓ All values in valid range [0, 1]`);
        }

        // Sample
        console.log(`   ✓ Sample: ${meanData[0].measureName} = ${meanData[0].value.toFixed(4)}`);
      }

      // Test with selected artist
      const meanDataFiltered = transformMeanLineChartData(data, 'Celine Dion');
      if (meanDataFiltered.length !== 14) {
        errors.push(`Filtered mean data has wrong length: ${meanDataFiltered.length}`);
      } else {
        console.log(`   ✓ Artist-filtered data works correctly`);
      }

    } catch (e) {
      errors.push(`transformMeanLineChartData failed: ${e}`);
    }

    // Test 4: transformScatterData
    console.log('\n5. Testing transformScatterData...');
    try {
      const scatterData = transformScatterData(data);
      console.log(`   ✓ Transformed to ${scatterData.length} records`);

      const expectedRecords = data.length * 2; // 2 measures per artist
      if (scatterData.length !== expectedRecords) {
        errors.push(`Expected ${expectedRecords} scatter records, got ${scatterData.length}`);
      } else {
        console.log(`   ✓ Record count is correct (${data.length} artists × 2 measures)`);
      }

      // Verify structure
      const sampleMillennials = scatterData.find(r => r.measureName === 'Recognition by Millennials');
      const sampleGenZ = scatterData.find(r => r.measureName === 'Recognition by Gen-Zs');

      if (!sampleMillennials || !sampleGenZ) {
        errors.push('Scatter data missing expected measures');
      } else {
        console.log(`   ✓ Both measures present`);
        console.log(`   ✓ Sample: ${sampleMillennials.artist} has ${sampleMillennials.noOfSongs} songs, recognizability ${sampleMillennials.recognizability.toFixed(4)}`);
      }

      // Check for invalid values
      const invalidNoOfSongs = scatterData.filter(r => r.noOfSongs < 0 || !Number.isInteger(r.noOfSongs));
      if (invalidNoOfSongs.length > 0) {
        warnings.push(`${invalidNoOfSongs.length} records have invalid No. of Songs`);
      } else {
        console.log(`   ✓ All No. of Songs values are valid`);
      }

    } catch (e) {
      errors.push(`transformScatterData failed: ${e}`);
    }

    // Test 5: transformComparisonData
    console.log('\n6. Testing transformComparisonData...');
    try {
      const comparisonData = transformComparisonData(data, null);
      console.log(`   ✓ Transformed to ${comparisonData.length} records`);

      if (comparisonData.length !== 2) {
        errors.push(`Expected 2 comparison records, got ${comparisonData.length}`);
      } else {
        console.log(`   ✓ Record count is correct (2 measures)`);

        // Check values
        const millennials = comparisonData.find(r => r.measureName === 'Recognition by Millennials');
        const genZ = comparisonData.find(r => r.measureName === 'Recognition by Gen-Zs');

        if (!millennials || !genZ) {
          errors.push('Comparison data missing expected measures');
        } else {
          console.log(`   ✓ Millennials avg: ${millennials.value.toFixed(4)}`);
          console.log(`   ✓ Gen-Zs avg: ${genZ.value.toFixed(4)}`);

          // Values should be in 0-1 range
          if (millennials.value < 0 || millennials.value > 1 || genZ.value < 0 || genZ.value > 1) {
            warnings.push('Comparison values outside 0-1 range');
          }
        }
      }

      // Test with selected artist
      const comparisonDataFiltered = transformComparisonData(data, 'Celine Dion');
      if (comparisonDataFiltered.length !== 2 || comparisonDataFiltered[0].artist !== 'Celine Dion') {
        errors.push('Filtered comparison data incorrect');
      } else {
        console.log(`   ✓ Artist-filtered data works correctly`);
      }

    } catch (e) {
      errors.push(`transformComparisonData failed: ${e}`);
    }

    // Test 6: getSortedArtists
    console.log('\n7. Testing getSortedArtists...');
    try {
      const sortedArtists = getSortedArtists(data);
      console.log(`   ✓ Got ${sortedArtists.length} unique artists`);

      if (sortedArtists.length !== data.length) {
        warnings.push(`Artist count mismatch: ${sortedArtists.length} vs ${data.length}`);
      }

      // Check sorting
      const firstArtist = data.find(r => r.artist === sortedArtists[0]);
      const lastArtist = data.find(r => r.artist === sortedArtists[sortedArtists.length - 1]);

      if (firstArtist && lastArtist) {
        console.log(`   ✓ Most songs: ${firstArtist.artist} (${firstArtist['No. of Songs']} songs)`);
        console.log(`   ✓ Fewest songs: ${lastArtist.artist} (${lastArtist['No. of Songs']} songs)`);

        if (firstArtist['No. of Songs'] < lastArtist['No. of Songs']) {
          warnings.push('Artists may not be sorted correctly by No. of Songs');
        }
      }

    } catch (e) {
      errors.push(`getSortedArtists failed: ${e}`);
    }

    // Summary
    console.log('\n=== Validation Summary ===');
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

    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✓ All transformation validations passed!');
      return true;
    } else if (errors.length === 0) {
      console.log('\n✓ All validations passed (with warnings)');
      return true;
    } else {
      console.log('\n✗ Validation failed');
      return false;
    }

  } catch (error) {
    console.error(`\n✗ Fatal error: ${error}`);
    return false;
  }
}

// Main execution
const csvPath = path.join(__dirname, '../public/data/final_df.csv');
const success = validateTransformations(csvPath);
process.exit(success ? 0 : 1);
