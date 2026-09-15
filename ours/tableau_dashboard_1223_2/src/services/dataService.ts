/**
 * Data Service for Tableau Dashboard
 * Handles CSV loading and transformation for Market Penetration analysis
 */

import { csvParse } from 'd3-dsv';

// Raw data structure from CSV
export interface RawMarketData {
  [key: string]: string | number;
}

// Processed data structure for Market Penetration chart
export interface MarketPenetrationData {
  geography: string;
  customerCount: number;
  population: number;
  penetrationRatio: number;
}

/**
 * Normalize column names by removing all quote variations
 * Handles: """Geography""", "Geography", Geography
 */
function normalizeColumnName(colName: string): string {
  // Remove all leading/trailing quotes (both single " and triple """)
  let normalized = colName.trim();

  // Handle triple quotes first: """Column Name"""
  // Match exactly 3 quotes at start or end
  while (normalized.startsWith('"""') && normalized.endsWith('"""')) {
    normalized = normalized.slice(3, -3);
  }

  // Handle double quotes: "Column Name"
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  // Handle single quotes at start or end (unmatched quotes)
  if (normalized.startsWith('"')) {
    normalized = normalized.slice(1);
  }
  if (normalized.endsWith('"')) {
    normalized = normalized.slice(0, -1);
  }

  // Trim any remaining whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Build a mapping from raw column names to normalized names
 */
function buildColumnMapping(rawData: RawMarketData[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  if (rawData.length === 0) return mapping;

  // Get all unique column names from the first row
  const rawColumns = Object.keys(rawData[0]);

  for (const rawCol of rawColumns) {
    mapping[rawCol] = normalizeColumnName(rawCol);
  }

  return mapping;
}

/**
 * Load CSV data from the public/data directory
 * Normalizes column names to handle quoted headers
 */
export async function loadCsvData(url: string): Promise<{ data: RawMarketData[], columnMapping: Record<string, string> }> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsedData = csvParse(csvText) as RawMarketData[];

  // Build column mapping from the parsed data
  const columnMapping = buildColumnMapping(parsedData);

  // Normalize column names in each row
  const normalizedData = parsedData.map(row => {
    const normalizedRow: RawMarketData = {};
    for (const [rawKey, value] of Object.entries(row)) {
      const normalizedKey = columnMapping[rawKey] || normalizeColumnName(rawKey);
      normalizedRow[normalizedKey] = value;
    }
    return normalizedRow;
  });

  return {
    data: normalizedData,
    columnMapping
  };
}

/**
 * Get the value from a row using the normalized column name
 */
function getRowValue(row: RawMarketData, columnName: string): string | number {
  return row[columnName] ?? '';
}

/**
 * Transform raw CSV data into aggregated Market Penetration data
 * Groups by Geography and calculates penetration ratio
 */
export function transformMarketData(rawData: RawMarketData[]): MarketPenetrationData[] {
  // Group by Geography
  const groupedData = new Map<string, {
    customerCount: number;
    population: number;
  }>();

  for (const row of rawData) {
    // Use normalized column names
    const geography = String(getRowValue(row, 'Geography'));
    const population = Number(getRowValue(row, 'Population')) || 0;
    const numRecords = Number(getRowValue(row, 'Number')) || 1;

    if (!geography || geography === 'null' || geography === 'undefined' || geography === '') {
      continue;
    }

    const existing = groupedData.get(geography);
    if (existing) {
      existing.customerCount += numRecords;
      // Use max population (should be constant per geography)
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

  // Transform to array and calculate penetration ratio
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

  // Sort by penetration ratio descending (ranked bar chart)
  result.sort((a, b) => b.penetrationRatio - a.penetrationRatio);

  return result;
}

/**
 * Load and transform Market Penetration data in one call
 */
export async function loadMarketPenetrationData(
  url: string = '/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv'
): Promise<MarketPenetrationData[]> {
  const { data } = await loadCsvData(url);
  return transformMarketData(data);
}

/**
 * Reference line value from Tableau spec
 */
export const REFERENCE_LINE_VALUE = 0.0015; // 0.15%
