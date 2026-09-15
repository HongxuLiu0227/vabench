/**
 * Data loading and processing service
 * Loads CSV data from public/data/ and transforms it for visualization
 */

import { csvParse } from 'd3-dsv';
import type { StockData, PredictionData } from '../types/data';

interface CleanRow {
  [key: string]: string;
}

/**
 * Fetch and parse CSV data
 */
async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

/**
 * Clean column name by removing quotes, BOM, and extra spaces
 * Handles triple-quoted CSV headers like """date"""
 */
function cleanColumnName(name: string): string {
  return name
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']+|["']+$/g, '') // Remove quotes from start/end
    .replace(/"{2,}/g, '') // Remove two or more consecutive quotes
    .trim();
}

/**
 * Normalize CSV headers by handling triple-quoted and malformed headers
 * Strips all quotes and extra whitespace from header row before parsing
 */
function normalizeCsvHeaders(csvText: string): string {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return csvText;

  // Process the first line (header row)
  const headerLine = lines[0];
  // Remove all quotes from header column names
  const normalizedHeader = headerLine
    .split(',')
    .map(col => col.replace(/^["']+|["']+$/g, '').replace(/"/g, '').trim())
    .join(',');

  lines[0] = normalizedHeader;
  return lines.join('\n');
}

/**
 * Parse stock CSV data and convert to typed array
 */
export async function loadStockData(): Promise<StockData[]> {
  try {
    let csvText = await fetchCsv('/data/prices-split-adjusted.csv');

    // Normalize headers before parsing to handle triple quotes
    csvText = normalizeCsvHeaders(csvText);

    const parsedData = csvParse(csvText);

    // Clean column names (additional safety)
    const cleanData = parsedData.map((row): CleanRow => {
      const cleanRow: CleanRow = {};
      Object.keys(row).forEach(key => {
        cleanRow[cleanColumnName(key)] = row[key];
      });
      return cleanRow;
    });

    // Transform to typed StockData
    const stockData: StockData[] = cleanData
      .filter((row: CleanRow) => row.date && row.close)
      .map((row: CleanRow) => ({
        date: new Date(row.date),
        open: parseFloat(row.open) || 0,
        high: parseFloat(row.high) || 0,
        low: parseFloat(row.low) || 0,
        close: parseFloat(row.close) || 0,
        volume: parseFloat(row.volume) || 0,
      }))
      .filter((d: StockData) => !isNaN(d.date.getTime()) && !isNaN(d.close))
      .sort((a: StockData, b: StockData) => a.date.getTime() - b.date.getTime());

    return stockData;
  } catch (error) {
    console.error('Error loading stock data:', error);
    throw error;
  }
}

/**
 * Transform StockData to PredictionData format for charting
 * Uses real data from CSV
 */
function transformStockToPrediction(stockData: StockData[]): PredictionData[] {
  return stockData.map(row => ({
    Date: row.date,
    open: row.open,
    close: row.close,
  }));
}

/**
 * Get combined view data (stock + predictions)
 * This is the primary data source for the dashboard
 * NOW RETURNS REAL DATA FROM CSV INSTEAD OF MOCK DATA
 */
export async function loadDashboardData(): Promise<{
  stockData: StockData[];
  predictionData: PredictionData[];
}> {
  try {
    const stockData = await loadStockData();

    // Use real stock data for predictions, not mock data
    const predictionData = transformStockToPrediction(stockData);

    return {
      stockData,
      predictionData,
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}
