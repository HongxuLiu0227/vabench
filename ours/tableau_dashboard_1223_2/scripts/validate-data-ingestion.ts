/**
 * Data Ingestion Validation Script
 * Tests CSV parsing with triple-quoted headers and verifies data integrity
 */

import { csvParse } from 'd3-dsv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Normalize column names by removing all quote variations
function normalizeColumnName(colName: string): string {
  let normalized = colName.trim();
  // Replace triple quotes with empty string
  normalized = normalized.replace(/^""+"|""+$/g, '');
  // Replace any remaining single quotes
  normalized = normalized.replace(/^"|"$/g, '');
  // Trim any remaining whitespace
  normalized = normalized.trim();
  return normalized;
}

// Build a mapping from raw column names to normalized names
function buildColumnMapping(rawData: Record<string, string | number>[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  if (rawData.length === 0) return mapping;
  const rawColumns = Object.keys(rawData[0]);
  for (const rawCol of rawColumns) {
    mapping[rawCol] = normalizeColumnName(rawCol);
  }
  return mapping;
}

// Test CSV parsing
function testCsvParsing(filePath: string, name: string) {
  console.log(`\n=== Testing ${name} ===`);
  try {
    const csvText = readFileSync(filePath, 'utf-8');
    const parsedData = csvParse(csvText);

    console.log(`✓ CSV parsed successfully`);
    console.log(`  Rows: ${parsedData.length}`);
    console.log(`  Raw columns: ${Object.keys(parsedData[0] || {}).join(', ')}`);

    // Build column mapping
    const columnMapping = buildColumnMapping(parsedData);
    console.log(`  Normalized columns: ${Object.values(columnMapping).join(', ')}`);

    // Verify expected columns exist
    const normalizedCols = Object.values(columnMapping);
    const hasGeography = normalizedCols.includes('Geography');
    const hasPopulation = normalizedCols.includes('Population');

    if (hasGeography) {
      console.log(`  ✓ Geography column found`);
    } else {
      console.log(`  ✗ Geography column NOT found`);
    }

    if (hasPopulation) {
      console.log(`  ✓ Population column found`);
    } else {
      console.log(`  ✗ Population column NOT found`);
    }

    // Test data access
    const firstRow = parsedData[0];
    if (firstRow) {
      const normalizedRow: Record<string, string | number> = {};
      for (const [rawKey, value] of Object.entries(firstRow)) {
        const normalizedKey = columnMapping[rawKey] || normalizeColumnName(rawKey);
        normalizedRow[normalizedKey] = value;
      }

      console.log(`  First row sample:`);
      console.log(`    Geography: ${normalizedRow.Geography}`);
      console.log(`    Population: ${normalizedRow.Population}`);
    }

    return { success: true, hasGeography, hasPopulation, rowCount: parsedData.length };
  } catch (error) {
    console.error(`  ✗ Error parsing CSV:`, error);
    return { success: false, error };
  }
}

// Main validation
function main() {
  const dataDir = join(process.cwd(), 'public', 'data');

  console.log('=== Tableau Data Ingestion Validation ===');
  console.log(`Data directory: ${dataDir}`);

  // Test primary data file
  const primaryResult = testCsvParsing(
    join(dataDir, 'TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv'),
    'Primary Dataset (TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv)'
  );

  // Test secondary data file
  const secondaryResult = testCsvParsing(
    join(dataDir, 'TEMP_194sbdg00u0m5317frus01hyrusl.csv'),
    'Secondary Dataset (TEMP_194sbdg00u0m5317frus01hyrusl.csv)'
  );

  // Summary
  console.log('\n=== Validation Summary ===');
  if (primaryResult.success && primaryResult.hasGeography && primaryResult.hasPopulation) {
    console.log('✓ Primary dataset: PASS');
  } else {
    console.log('✗ Primary dataset: FAIL');
  }

  if (secondaryResult.success && secondaryResult.hasGeography && secondaryResult.hasPopulation) {
    console.log('✓ Secondary dataset: PASS');
  } else {
    console.log('✗ Secondary dataset: FAIL');
  }

  const allPass =
    primaryResult.success && primaryResult.hasGeography && primaryResult.hasPopulation &&
    secondaryResult.success && secondaryResult.hasGeography && secondaryResult.hasPopulation;

  if (allPass) {
    console.log('\n✓✓✓ All validations PASSED ✓✓✓');
    process.exit(0);
  } else {
    console.log('\n✗✗✗ Some validations FAILED ✗✗✗');
    process.exit(1);
  }
}

main();
