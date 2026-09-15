/**
 * Data loading service for dashboard data
 * Fetches CSV data from /data/ endpoint using the native fetch API
 */

import { csvParse } from 'd3-dsv';
import { useState, useEffect } from 'react';
import type { DataRow, FacilityData } from '../types';
import { enrichDataWithCalculations } from '../utils/calculations';

const DATA_URL = '/data/federated_0se4v9q15j8hfi17f25m50.csv';

/**
 * Strip UTF-8 BOM (Byte Order Mark) from the beginning of a string
 * The BOM is a sequence of bytes (EF BB BF) that indicates UTF-8 encoding
 * When present as a string, it appears as the Unicode character \uFEFF
 */
function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Clean column headers by:
 * 1. Removing UTF-8 BOM if present
 * 2. Removing triple quotes from the start and end (e.g., """DisplayMFL""" -> DisplayMFL)
 * 3. Removing any remaining quotes
 */
function cleanColumnName(key: string): string {
  // Remove BOM if present
  let clean = stripBOM(key);
  // Remove triple quotes from start and end
  clean = clean.replace(/^"""/, '').replace(/"""$/g, '');
  // Remove any remaining quotes
  clean = clean.replace(/"/g, '');
  return clean;
}

/**
 * Map cleaned column names to Tableau-calculated field names
 * Tableau workbook has calculated fields with "(copy)" suffix that need to map to actual CSV columns
 */
function mapToTableauFields(row: Record<string, string>): Record<string, string> {
  const mapped = { ...row };

  // Map SiteabstractionDate (copy) -> Siteabstractiondate
  if (row.Siteabstractiondate && !mapped['SiteabstractionDate (copy)']) {
    mapped['SiteabstractionDate (copy)'] = row.Siteabstractiondate;
  }

  // Map Fixed Site (copy) -> SiteCode (this appears to be the site identifier)
  if (row.SiteCode && !mapped['Fixed Site (copy)']) {
    mapped['Fixed Site (copy)'] = row.SiteCode;
  }

  return mapped;
}

/**
 * Validate that all required fields exist in the parsed data
 * Returns an error message if validation fails, null if successful
 */
function validateDataRow(row: Record<string, string>): string | null {
  const requiredFields = [
    // Core data fields
    'DisplayMFL',
    'DisplayFacilityName',
    'DisplaySubcounty',
    'DisplayCounty',
    'DisplayMechanism',
    'DisplayAgency',
    'UploadStatus',
    'UploadDate',
    'Upload_monthYear',
    'SiteCode',
    'MPI_SiteCode',
    'UploadDate_MPI',
    'Upload_monthYear_MPI',
    'Siteabstractiondate',
    // Tableau calculated field aliases
    'SiteabstractionDate (copy)',
    'Fixed Site (copy)'
  ];

  const missingFields = requiredFields.filter(field => !(field in row) || row[field] === undefined);

  if (missingFields.length > 0) {
    const sampleKeys = Object.keys(row).slice(0, 5).join(', ');
    return `Missing required fields: ${missingFields.join(', ')}. Available fields sample: ${sampleKeys}...`;
  }

  return null;
}

/**
 * Custom hook to load and process dashboard data
 * @returns { data, loading, error, facilities, refetch }
 */
export function useDashboardData(selectedDate: Date) {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      let csvText = await response.text();

      // Strip BOM from the entire CSV text before parsing
      csvText = stripBOM(csvText);

      // Parse CSV with cleaned column names
      const parsed = csvParse(csvText, (d: { [key: string]: string }) => {
        const row: Record<string, string> = {};

        // Clean up the column names
        Object.keys(d).forEach((key) => {
          const cleanKey = cleanColumnName(key);
          row[cleanKey] = d[key];
        });

        // Map to Tableau calculated field names
        const mappedRow = mapToTableauFields(row);

        // Validate that all required fields exist
        const validationError = validateDataRow(mappedRow);
        if (validationError) {
          console.warn('Data row validation warning:', validationError);
        }

        return mappedRow as unknown as DataRow;
      });

      // Check if we got any data
      if (parsed.length === 0) {
        throw new Error('No data rows found in CSV file. The file may be empty or malformed.');
      }

      // Log sample data for debugging
      console.log(`Loaded ${parsed.length} rows from CSV`);
      console.log('Sample row:', parsed[0]);

      setRawData(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading data';
      console.error('Error loading dashboard data:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Enrich data with calculated fields
  const facilities: FacilityData[] = rawData.length > 0
    ? enrichDataWithCalculations(rawData, selectedDate)
    : [];

  return {
    rawData,
    facilities,
    loading,
    error,
    refetch: loadData,
  };
}

/**
 * Load data on-demand (not as a hook)
 */
export async function loadDashboardData(): Promise<DataRow[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  let csvText = await response.text();

  // Strip BOM from the entire CSV text before parsing
  csvText = stripBOM(csvText);

  return csvParse(csvText, (d: { [key: string]: string }) => {
    const row: Record<string, string> = {};

    // Clean up the column names
    Object.keys(d).forEach((key) => {
      const cleanKey = cleanColumnName(key);
      row[cleanKey] = d[key];
    });

    // Map to Tableau calculated field names
    const mappedRow = mapToTableauFields(row);

    // Validate that all required fields exist
    const validationError = validateDataRow(mappedRow);
    if (validationError) {
      throw new Error(validationError);
    }

    return mappedRow as unknown as DataRow;
  });
}
