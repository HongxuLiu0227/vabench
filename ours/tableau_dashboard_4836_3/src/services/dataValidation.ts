/**
 * Data Validation Utilities
 *
 * These functions help validate that CSV data is correctly loaded and parsed.
 * Used for deterministic Tableau source validation.
 */

import { csvParse } from 'd3-dsv';
import type { DataRow } from '../types';

/**
 * Preprocess CSV text to normalize headers with triple quotes
 * d3-dsv doesn't handle triple-quoted headers well, so we clean them first
 */
function preprocessCSV(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Clean up the header line (first line)
  const headerLine = lines[0];
  const cleanedHeader = headerLine
    .split(',')
    .map(col => {
      // Remove triple quotes and any surrounding quotes from column names
      let cleaned = col.trim();
      // Remove outer triple quotes: """colname""" -> colname
      cleaned = cleaned.replace(/^"""(.+?)"""$/, '$1');
      // Remove double quotes if any remain
      cleaned = cleaned.replace(/^"(.+?)"$/, '$1');
      // Re-wrap in standard single quotes for d3-dsv if contains comma
      return cleaned.includes(',') ? `"${cleaned}"` : cleaned;
    })
    .join(',');

  lines[0] = cleanedHeader;
  return lines.join('\n');
}

/**
 * Helper function to normalize column names by removing quotes, BOM, and extra whitespace
 */
function normalizeColumnName(colName: string): string {
  return colName
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/^['"]+|['"]+$/g, '') // Also handle single quotes
    .trim();
}

/**
 * Required source CSV columns
 */
export const REQUIRED_SOURCE_COLUMNS = [
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
] as const;

/**
 * Tableau calculated fields (not expected in source CSV)
 */
export const TABLEAU_CALCULATED_FIELDS = [
  'County Color (copy)',
  'County Denominator Expected Reports (copy)',
  'County Percent Uploads Proportions (copy)',
  'PArtner Color (copy)',
  'Partner Percent Uploaded (copy)',
] as const;

/**
 * Validate that CSV headers are correctly normalized
 */
export function validateCSVHeaders(csvText: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  headers: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const preprocessed = preprocessCSV(csvText);
  const data = csvParse(preprocessed);

  if (data.length === 0) {
    errors.push('CSV file is empty or could not be parsed');
    return { valid: false, errors, warnings, headers: [] };
  }

  const headers = Object.keys(data[0]);

  // Check for required source columns
  const missingColumns = REQUIRED_SOURCE_COLUMNS.filter(
    required => !headers.includes(required)
  );

  if (missingColumns.length > 0) {
    errors.push(
      `Missing required source columns: ${missingColumns.join(', ')}`
    );
  }

  // Check for quoted/dirty headers that weren't normalized
  const dirtyHeaders = headers.filter(h => h !== normalizeColumnName(h));
  if (dirtyHeaders.length > 0) {
    errors.push(
      `CSV headers require normalization: ${dirtyHeaders.map(h => `"${h}"`).join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    headers,
  };
}

/**
 * Validate that data rows can be correctly extracted
 */
export function validateDataExtraction(csvText: string): {
  valid: boolean;
  errors: string[];
  sampleRow: Partial<DataRow> | null;
} {
  const errors: string[] = [];
  const preprocessed = preprocessCSV(csvText);
  const data = csvParse(preprocessed);

  if (data.length === 0) {
    errors.push('No data rows found');
    return { valid: false, errors, sampleRow: null };
  }

  const firstRow = data[0];

  // Try to extract a few key fields
  const displayMFL = firstRow['DisplayMFL'] || '';
  const displayMechanism = firstRow['DisplayMechanism'] || '';
  const displayAgency = firstRow['DisplayAgency'] || '';

  if (!displayMFL) {
    errors.push('Cannot extract DisplayMFL from first row');
  }
  if (!displayMechanism) {
    errors.push('Cannot extract DisplayMechanism from first row');
  }
  if (!displayAgency) {
    errors.push('Cannot extract DisplayAgency from first row');
  }

  return {
    valid: errors.length === 0,
    errors,
    sampleRow: {
      DisplayMFL: displayMFL,
      DisplayFacilityName: firstRow['DisplayFacilityName'] || '',
      DisplayMechanism: displayMechanism,
      DisplayAgency: displayAgency,
    },
  };
}

/**
 * Full validation of CSV data source
 */
export async function validateDataSource(csvUrl: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    headers: string[];
    rowCount: number;
    hasNormalizedHeaders: boolean;
    hasAllRequiredColumns: boolean;
  };
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      errors.push(`Failed to fetch CSV: ${response.statusText}`);
      return { valid: false, errors, warnings, summary: { headers: [], rowCount: 0, hasNormalizedHeaders: false, hasAllRequiredColumns: false } };
    }

    const csvText = await response.text();

    // Validate headers
    const headerValidation = validateCSVHeaders(csvText);
    errors.push(...headerValidation.errors);
    warnings.push(...headerValidation.warnings);

    // Validate data extraction
    const dataValidation = validateDataExtraction(csvText);
    errors.push(...dataValidation.errors);

    const preprocessed = preprocessCSV(csvText);
    const data = csvParse(preprocessed);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        headers: headerValidation.headers,
        rowCount: data.length,
        hasNormalizedHeaders: headerValidation.headers.every(h => h === normalizeColumnName(h)),
        hasAllRequiredColumns: REQUIRED_SOURCE_COLUMNS.every(col => headerValidation.headers.includes(col)),
      },
    };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, errors, warnings, summary: { headers: [], rowCount: 0, hasNormalizedHeaders: false, hasAllRequiredColumns: false } };
  }
}
