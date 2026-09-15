/**
 * Data Transformation Validation Script
 * Tests the full data pipeline from CSV loading to market penetration calculation
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { csvParse } from 'd3-dsv';

// Copied from dataService.ts to ensure consistency
interface RawMarketData {
  [key: string]: string | number;
}

interface MarketPenetrationData {
  geography: string;
  customerCount: number;
  population: number;
  penetrationRatio: number;
}

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
  const groupedData = new Map<string, {
    customerCount: number;
    population: number;
  }>();

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
      groupedData.set(geography, {
        customerCount: numRecords,
        population: population,
      });
    }
  }

  const result: MarketPenetrationData[] = [];
  for (const [geography, data] of groupedData.entries()) {
    const penetrationRatio = data.population > 0
      ? data.customerCount / data.population
      : 0;
    result.push({
      geography,
      customerCount: data.customerCount,
      population: data.population,
      penetrationRatio,
    });
  }

  result.sort((a, b) => b.penetrationRatio - a.penetrationRatio);
  return result;
}

function testTransformation(filePath: string, name: string) {
  console.log(`\n=== Testing ${name} ===`);
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

    console.log(`✓ Raw data loaded: ${normalizedData.length} rows`);

    // Transform data
    const transformed = transformMarketData(normalizedData);
    console.log(`✓ Data transformed: ${transformed.length} geographies`);

    if (transformed.length > 0) {
      // Show top 5 by penetration ratio
      console.log(`\n  Top 5 by Market Penetration:`);
      transformed.slice(0, 5).forEach((d, i) => {
        console.log(`    ${i + 1}. ${d.geography}: ${(d.penetrationRatio * 100).toFixed(4)}% (${d.customerCount} customers / ${d.population.toLocaleString()} pop)`);
      });

      // Verify data integrity
      const hasValidRatios = transformed.every(d => d.penetrationRatio >= 0);
      const hasValidCustomers = transformed.every(d => d.customerCount > 0);
      const hasValidPopulation = transformed.every(d => d.population > 0);
      const allHaveGeography = transformed.every(d => d.geography && d.geography !== '');

      console.log(`\n  Data integrity checks:`);
      console.log(`    ${hasValidRatios ? '✓' : '✗'} All penetration ratios are non-negative`);
      console.log(`    ${hasValidCustomers ? '✓' : '✗'} All geographies have customers`);
      console.log(`    ${hasValidPopulation ? '✓' : '✗'} All geographies have population > 0`);
      console.log(`    ${allHaveGeography ? '✓' : '✗'} All records have geography names`);

      const allValid = hasValidRatios && hasValidCustomers && hasValidPopulation && allHaveGeography;
      return { success: true, transformed, allValid };
    } else {
      console.log(`  ✗ No transformed data produced`);
      return { success: false, error: 'No transformed data' };
    }
  } catch (error) {
    console.error(`  ✗ Error:`, error);
    return { success: false, error };
  }
}

function main() {
  console.log('=== Tableau Data Transformation Validation ===');
  const dataDir = join(process.cwd(), 'public', 'data');

  const result = testTransformation(
    join(dataDir, 'TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv'),
    'Primary Dataset Transformation'
  );

  console.log('\n=== Final Result ===');
  if (result.success && result.allValid) {
    console.log('✓✓✓ Data transformation PASSED ✓✓✓');
    console.log('  - CSV parsing: OK');
    console.log('  - Column normalization: OK');
    console.log('  - Data aggregation: OK');
    console.log('  - Penetration calculation: OK');
    console.log('  - Data integrity: OK');
    process.exit(0);
  } else {
    console.log('✗✗✗ Data transformation FAILED ✗✗✗');
    process.exit(1);
  }
}

main();
