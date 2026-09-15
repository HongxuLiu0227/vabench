#!/usr/bin/env tsx
/**
 * Tableau Source Validator
 * Deterministic validation for CSV data ingestion before QA/build stages
 *
 * This script validates:
 * 1. CSV files exist and are accessible
 * 2. CSV headers are properly parsed (handling triple quotes)
 * 3. Required Tableau fields are present
 * 4. Data can be loaded and transformed correctly
 * 5. No silent parse failures (all-zero charts, NaN filters, etc.)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { csvParse } from 'd3-dsv';

interface ValidationResult {
  name: string;
  success: boolean;
  message: string;
  details?: Record<string, unknown> | unknown[];
}

// Data interfaces
interface RawMarketData {
  [key: string]: string | number;
}

interface MarketPenetrationData {
  geography: string;
  customerCount: number;
  population: number;
  penetrationRatio: number;
}

// Column normalization (mirrors dataService.ts)
function normalizeColumnName(colName: string): string {
  let normalized = colName.trim();
  normalized = normalized.replace(/^""+"|""+$/g, '');
  normalized = normalized.replace(/^"|"$/g, '');
  normalized = normalized.trim();
  return normalized;
}

function buildColumnMapping(rawData: RawMarketData[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  if (rawData.length === 0) return mapping;
  const rawColumns = Object.keys(rawData[0]);
  for (const rawCol of rawColumns) {
    mapping[rawCol] = normalizeColumnName(rawCol);
  }
  return mapping;
}

function getRowValue(row: RawMarketData, columnName: string): string | number {
  return row[columnName] ?? '';
}

function transformMarketData(rawData: RawMarketData[]): MarketPenetrationData[] {
  const groupedData = new Map<string, { customerCount: number; population: number }>();

  for (const row of rawData) {
    const geography = String(getRowValue(row, 'Geography'));
    const population = Number(getRowValue(row, 'Population')) || 0;
    const numRecords = Number(getRowValue(row, 'Number')) || 1;

    if (!geography || geography === 'null' || geography === 'undefined' || geography === '') {
      continue;
    }

    const existing = groupedData.get(geography);
    if (existing) {
      existing.customerCount += numRecords;
      if (population > existing.population) {
        existing.population = population;
      }
    } else {
      groupedData.set(geography, { customerCount: numRecords, population });
    }
  }

  const result: MarketPenetrationData[] = [];
  for (const [geography, data] of groupedData.entries()) {
    const penetrationRatio = data.population > 0 ? data.customerCount / data.population : 0;
    result.push({ geography, customerCount: data.customerCount, population: data.population, penetrationRatio });
  }

  result.sort((a, b) => b.penetrationRatio - a.penetrationRatio);
  return result;
}

// Validation checks
function checkFileExists(filePath: string): ValidationResult {
  const exists = existsSync(filePath);
  return {
    name: 'File Exists',
    success: exists,
    message: exists ? `File found: ${filePath}` : `File not found: ${filePath}`,
  };
}

function checkCsvParsing(filePath: string): ValidationResult {
  try {
    const csvText = readFileSync(filePath, 'utf-8');
    const parsedData = csvParse(csvText);

    if (parsedData.length === 0) {
      return {
        name: 'CSV Parsing',
        success: false,
        message: 'CSV file is empty or could not be parsed',
      };
    }

    const columnMapping = buildColumnMapping(parsedData as RawMarketData[]);
    const normalizedColumns = Object.values(columnMapping);

    return {
      name: 'CSV Parsing',
      success: true,
      message: `Parsed ${parsedData.length} rows with ${normalizedColumns.length} columns`,
      details: { rowCount: parsedData.length, columns: normalizedColumns },
    };
  } catch (error) {
    return {
      name: 'CSV Parsing',
      success: false,
      message: `CSV parsing failed: ${error}`,
    };
  }
}

function checkRequiredFields(filePath: string): ValidationResult {
  try {
    const csvText = readFileSync(filePath, 'utf-8');
    const parsedData = csvParse(csvText) as RawMarketData[];
    const columnMapping = buildColumnMapping(parsedData);
    const normalizedColumns = Object.values(columnMapping);

    // Required fields for Market Penetration worksheet
    const requiredFields = ['Geography', 'Population'];
    const missingFields = requiredFields.filter(field => !normalizedColumns.includes(field));

    if (missingFields.length > 0) {
      return {
        name: 'Required Fields',
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missingFields, availableFields: normalizedColumns },
      };
    }

    return {
      name: 'Required Fields',
      success: true,
      message: `All required fields present: ${requiredFields.join(', ')}`,
    };
  } catch (error) {
    return {
      name: 'Required Fields',
      success: false,
      message: `Field validation failed: ${error}`,
    };
  }
}

function checkDataTransformation(filePath: string): ValidationResult {
  try {
    const csvText = readFileSync(filePath, 'utf-8');
    const parsedData = csvParse(csvText) as RawMarketData[];

    // Build column mapping and normalize
    const columnMapping = buildColumnMapping(parsedData);
    const normalizedData = parsedData.map(row => {
      const normalizedRow: RawMarketData = {};
      for (const [rawKey, value] of Object.entries(row)) {
        const normalizedKey = columnMapping[rawKey] || normalizeColumnName(rawKey);
        normalizedRow[normalizedKey] = value;
      }
      return normalizedRow;
    });

    // Transform data
    const transformed = transformMarketData(normalizedData);

    if (transformed.length === 0) {
      return {
        name: 'Data Transformation',
        success: false,
        message: 'No data produced after transformation',
      };
    }

    // Check for silent failures
    const hasAllZeros = transformed.every(d => d.penetrationRatio === 0 && d.customerCount === 0);
    const hasNaN = transformed.some(d => isNaN(d.penetrationRatio) || isNaN(d.customerCount) || isNaN(d.population));
    const hasNullGeographies = transformed.some(d => !d.geography || d.geography === '');

    if (hasAllZeros) {
      return {
        name: 'Data Transformation',
        success: false,
        message: 'All transformed values are zero - possible parse failure',
      };
    }

    if (hasNaN) {
      return {
        name: 'Data Transformation',
        success: false,
        message: 'Transformed data contains NaN values - possible type conversion failure',
      };
    }

    if (hasNullGeographies) {
      return {
        name: 'Data Transformation',
        success: false,
        message: 'Transformed data contains null/empty geography values',
      };
    }

    return {
      name: 'Data Transformation',
      success: true,
      message: `Successfully transformed ${transformed.length} geographies`,
      details: {
        geographyCount: transformed.length,
        sampleData: transformed.slice(0, 3).map(d => ({
          geography: d.geography,
          penetrationRatio: d.penetrationRatio,
          customerCount: d.customerCount,
        })),
      },
    };
  } catch (error) {
    return {
      name: 'Data Transformation',
      success: false,
      message: `Transformation failed: ${error}`,
    };
  }
}

// Main validation
function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       Tableau Source Validator - Deterministic Ingestion      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const dataDir = join(process.cwd(), 'public', 'data');
  const primaryFile = join(dataDir, 'TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv');
  const secondaryFile = join(dataDir, 'TEMP_194sbdg00u0m5317frus01hyrusl.csv');

  const results: ValidationResult[] = [];

  // Validate primary dataset
  console.log('📊 Primary Dataset: TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv');
  console.log('─'.repeat(64));
  results.push(checkFileExists(primaryFile));
  results.push(checkCsvParsing(primaryFile));
  results.push(checkRequiredFields(primaryFile));
  results.push(checkDataTransformation(primaryFile));

  // Validate secondary dataset
  console.log('\n📊 Secondary Dataset: TEMP_194sbdg00u0m5317frus01hyrusl.csv');
  console.log('─'.repeat(64));
  results.push(checkFileExists(secondaryFile));
  results.push(checkCsvParsing(secondaryFile));
  results.push(checkRequiredFields(secondaryFile));

  // Print results
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                      Validation Results                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    console.log(`${icon} [${index + 1}/6] ${result.name}: ${status}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`);
    }
    console.log('');

    if (result.success) passCount++;
    else failCount++;
  });

  // Summary
  console.log('─'.repeat(64));
  console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed\n`);

  if (failCount === 0) {
    console.log('✅✅✅ ALL VALIDATIONS PASSED ✅✅✅');
    console.log('\nTableau source ingestion is deterministic and correct.');
    console.log('Ready for QA/build stages.\n');
    process.exit(0);
  } else {
    console.log('❌❌❌ SOME VALIDATIONS FAILED ❌❌❌');
    console.log('\nPlease fix the issues above before proceeding to QA/build.\n');
    process.exit(1);
  }
}

main();
