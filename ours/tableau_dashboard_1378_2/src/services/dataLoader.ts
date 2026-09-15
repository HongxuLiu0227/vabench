import * as d3 from 'd3';
import type { ProviderData, RawCsvRow } from '../types/data';
import { SEPSIS_DRG_CODES } from '../types/data';

/**
 * Field mapping from normalized header names to their expected CSV column names
 * This handles various quote formats that might appear in the CSV
 * Note: The CSV may have BOM (Byte Order Mark) at the beginning
 */
type FieldMappingKey = keyof ProviderData | 'diagnosis' | 'isSepsis' | 'hospitalReferralRegion';

const FIELD_MAPPING: Record<FieldMappingKey, string[]> = {
  drgDefinition: [
    '\uFEFF"""DRG Definition"""',  // BOM + 4 quotes (actual format found)
    '"""DRG Definition"""',         // 3 quotes
    '"DRG Definition"',             // 2 quotes
    'DRG Definition'                // No quotes
  ],
  drgDefinitionSplit2: [], // Computed field
  providerId: ['"""Provider Id"""', '"Provider Id"', 'Provider Id'],
  providerName: ['"""Provider Name"""', '"Provider Name"', 'Provider Name'],
  providerState: ['"""Provider State"""', '"Provider State"', 'Provider State'],
  providerCity: ['"""Provider City"""', '"Provider City"', 'Provider City'],
  hospitalReferralRegion: [
    '"""Hospital Referral Region Description"""',
    '"Hospital Referral Region Description"',
    'Hospital Referral Region Description'
  ],
  hospitalReferralRegionSplit2: [], // Computed field
  totalDischarges: ['"""Total Discharges """', '"Total Discharges "', 'Total Discharges '],
  averageCoveredCharges: ['"""Average Covered Charges """', '"Average Covered Charges "', 'Average Covered Charges '],
  averageTotalPayments: ['"""Average Total Payments """', '"Average Total Payments "', 'Average Total Payments '],
  averageMedicarePayments: ['"""Average Medicare Payments"""', '"Average Medicare Payments"', 'Average Medicare Payments'],
  latitude: ['"""Provider Latitude"""', '"Provider Latitude"', 'Provider Latitude'],
  longitude: ['"""Provider Longitude"""', '"Provider Longitude"', 'Provider Longitude'],
  diagnosis: [], // Computed field
  isSepsis: [], // Computed field
};

/**
 * Detect and skip preamble rows before the actual CSV header
 * Returns the cleaned CSV text starting from the header row
 */
function detectAndSkipPreamble(csvText: string): string {
  const lines = csvText.split(/\r?\n/);

  // Known header patterns we're looking for
  const headerPatterns = [
    /"""DRG Definition"""/,
    /"DRG Definition"/,
    /DRG Definition/,
  ];

  // Find the first line that looks like a header
  let headerLineIndex = -1;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    if (line && headerPatterns.some(pattern => pattern.test(line))) {
      headerLineIndex = i;
      break;
    }
  }

  // If we found a header line, skip everything before it
  if (headerLineIndex > 0) {
    console.log(`Detected ${headerLineIndex} preamble row(s), skipping to line ${headerLineIndex + 1}`);
    return lines.slice(headerLineIndex).join('\n');
  }

  // If no preamble detected, return original text
  return csvText;
}

/**
 * Load CSV data from public/data directory
 */
export async function loadCsvData(url: string): Promise<ProviderData[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    let csvText = await response.text();

    // Detect and skip preamble rows if present
    csvText = detectAndSkipPreamble(csvText);

    // Parse CSV using d3.csvParse
    const rawRows: RawCsvRow[] = d3.csvParse(csvText);

    if (rawRows.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    // Inspect the actual headers in the parsed data
    const actualHeaders = Object.keys(rawRows[0]);
    console.log('Actual CSV headers found:', actualHeaders);

    // Build a normalized header mapping
    const headerMap = buildHeaderMapping(actualHeaders);
    console.log('Header mapping:', headerMap);

    // Validate that all required fields can be found
    validateRequiredFields(headerMap, actualHeaders);

    // Transform and process data
    const processedData: ProviderData[] = rawRows
      .map((row, index) => transformRow(row, headerMap, index))
      .filter((row): row is ProviderData => row !== null);

    console.log(`Successfully processed ${processedData.length} records from ${rawRows.length} raw rows`);

    if (processedData.length === 0) {
      throw new Error('No valid records found after processing. Check CSV format and required fields.');
    }

    return processedData;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

/**
 * Build a mapping from normalized field names to actual CSV headers
 * This handles triple quotes, double quotes, BOM characters, and unquoted headers
 */
function buildHeaderMapping(actualHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();

  for (const [fieldName, possibleHeaders] of Object.entries(FIELD_MAPPING)) {
    if (possibleHeaders.length === 0) continue; // Skip computed fields

    // Try exact match first
    for (const header of possibleHeaders) {
      if (actualHeaders.includes(header)) {
        mapping.set(fieldName, header);
        break;
      }
    }

    // If no exact match, try fuzzy matching
    if (!mapping.has(fieldName)) {
      const normalizedFieldName = fieldName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[drg]/g, 'drg');  // Keep DRG acronym

      for (const actualHeader of actualHeaders) {
        // Normalize actual header: remove BOM, quotes, and spaces
        const normalizedActual = actualHeader
          .replace(/^\uFEFF/, '')  // Remove BOM
          .toLowerCase()
          .replace(/["\s]/g, '');

        // Check for various match conditions
        if (
          normalizedActual === normalizedFieldName ||
          actualHeader.includes(fieldName) ||
          normalizedActual.includes('drgdefinition') && fieldName === 'drgDefinition' ||
          normalizedActual.includes('providerid') && fieldName === 'providerId' ||
          normalizedActual.includes('providername') && fieldName === 'providerName' ||
          normalizedActual.includes('providerstate') && fieldName === 'providerState' ||
          normalizedActual.includes('providercity') && fieldName === 'providerCity' ||
          normalizedActual.includes('hospitalreferralregion') && fieldName === 'hospitalReferralRegion' ||
          normalizedActual.includes('totaldischarges') && fieldName === 'totalDischarges' ||
          normalizedActual.includes('averagecoveredcharges') && fieldName === 'averageCoveredCharges' ||
          normalizedActual.includes('averagetotalpayments') && fieldName === 'averageTotalPayments' ||
          normalizedActual.includes('averagemedicarepayments') && fieldName === 'averageMedicarePayments' ||
          normalizedActual.includes('providerlatitude') && fieldName === 'latitude' ||
          normalizedActual.includes('providerlongitude') && fieldName === 'longitude'
        ) {
          mapping.set(fieldName, actualHeader);
          console.log(`Fuzzy matched: ${fieldName} -> "${actualHeader}"`);
          break;
        }
      }
    }
  }

  return mapping;
}

/**
 * Validate that all required fields can be found in the CSV
 */
function validateRequiredFields(headerMap: Map<string, string>, actualHeaders: string[]): void {
  const requiredFields: (keyof ProviderData | 'hospitalReferralRegion')[] = [
    'drgDefinition',
    'providerId',
    'providerName',
    'providerState',
    'hospitalReferralRegion',
    'totalDischarges',
    'averageCoveredCharges',
    'averageTotalPayments',
    'averageMedicarePayments',
    'latitude',
    'longitude',
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!headerMap.has(field)) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}\n` +
      `Available headers: ${actualHeaders.join(', ')}`
    );
  }
}

/**
 * Transform a raw CSV row into ProviderData
 * Uses the header mapping to access fields correctly
 */
function transformRow(row: RawCsvRow, headerMap: Map<string, string>, rowIndex: number): ProviderData | null {
  try {
    // Use the header mapping to get the correct field names
    const drgDefinition = cleanFieldName(row[headerMap.get('drgDefinition')!] || '');
    const providerId = parseNumber(row[headerMap.get('providerId')!] || '0');
    const providerName = cleanFieldName(row[headerMap.get('providerName')!] || '');
    const providerCity = cleanFieldName(row[headerMap.get('providerCity')!] || '');
    const providerState = cleanFieldName(row[headerMap.get('providerState')!] || '');
    const hospitalReferralRegion = cleanFieldName(row[headerMap.get('hospitalReferralRegion')!] || '');
    const totalDischarges = parseNumber(row[headerMap.get('totalDischarges')!] || '0');
    const averageCoveredCharges = parseNumber(row[headerMap.get('averageCoveredCharges')!] || '0');
    const averageTotalPayments = parseNumber(row[headerMap.get('averageTotalPayments')!] || '0');
    const averageMedicarePayments = parseNumber(row[headerMap.get('averageMedicarePayments')!] || '0');
    const latitude = parseNumber(row[headerMap.get('latitude')!] || '0');
    const longitude = parseNumber(row[headerMap.get('longitude')!] || '0');

    // Validate required fields
    if (!drgDefinition || !providerName || !providerState) {
      console.warn(`Row ${rowIndex}: Missing required fields - DRG: "${drgDefinition}", Name: "${providerName}", State: "${providerState}"`);
      return null;
    }

    // Validate coordinates are reasonable (latitude: -90 to 90, longitude: -180 to 180)
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      console.warn(`Row ${rowIndex}: Invalid coordinates - Lat: ${latitude}, Lon: ${longitude}`);
      return null;
    }

    // Check if this is a Sepsis-related DRG
    const isSepsis = SEPSIS_DRG_CODES.some(code => drgDefinition.includes(code));

    // Extract diagnosis from DRG Definition (second part after " - ")
    const diagnosis = extractDiagnosis(drgDefinition);

    // Compute DRG Definition - Split 2 (second part after splitting " - ")
    const drgDefinitionSplit2 = extractSecondPart(drgDefinition);

    // Compute Hospital Referral Region Description - Split 2 (second part after splitting " - ")
    const hospitalReferralRegionSplit2 = extractSecondPart(hospitalReferralRegion);

    return {
      drgDefinition,
      drgDefinitionSplit2,
      providerId,
      providerName,
      providerState,
      providerCity,
      hospitalReferralRegion,
      hospitalReferralRegionSplit2,
      totalDischarges,
      averageCoveredCharges,
      averageTotalPayments,
      averageMedicarePayments,
      latitude,
      longitude,
      diagnosis,
      isSepsis,
    };
  } catch (error) {
    console.error(`Error transforming row ${rowIndex}:`, error, row);
    return null;
  }
}

/**
 * Clean field name by removing extra quotes and whitespace
 */
function cleanFieldName(value: string): string {
  if (!value) return '';
  return value.replace(/^"+|"+$/g, '').trim();
}

/**
 * Parse number from string, handling various formats
 */
function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract diagnosis from DRG Definition
 * Format: "870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS"
 * Returns: "SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS"
 */
function extractDiagnosis(drgDefinition: string): string {
  const parts = drgDefinition.split(' - ');
  if (parts.length >= 2) {
    return parts.slice(1).join(' - ').trim();
  }
  return drgDefinition;
}

/**
 * Extract second part from a hyphen-separated string
 * Format: "FL - Orlando" or "870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS"
 * Returns: "Orlando" or "SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS"
 */
function extractSecondPart(value: string): string {
  const parts = value.split(' - ');
  if (parts.length >= 2) {
    return parts.slice(1).join(' - ').trim();
  }
  return value;
}

/**
 * Filter data to only include Sepsis-related records
 */
export function filterSepsisData(data: ProviderData[]): ProviderData[] {
  return data.filter(row => row.isSepsis);
}

/**
 * Filter data by selected states
 */
export function filterByStates(data: ProviderData[], states: Set<string>): ProviderData[] {
  if (states.size === 0) return data;
  return data.filter(row => states.has(row.providerState));
}

/**
 * Filter data by a specific provider
 */
export function filterByProvider(data: ProviderData[], provider: ProviderData | null): ProviderData[] {
  if (!provider) return data;
  return data.filter(row =>
    row.providerId === provider.providerId &&
    row.providerName === provider.providerName
  );
}

/**
 * Validate parsed data for common issues
 * Throws an error if critical issues are detected
 */
export function validateDataQuality(data: ProviderData[]): void {
  if (data.length === 0) {
    throw new Error('Dataset is empty after filtering');
  }

  // Check for all-zero values (indicates parsing failure)
  const sampleRow = data[0];
  const allZeroFields = [
    sampleRow.totalDischarges === 0,
    sampleRow.averageCoveredCharges === 0,
    sampleRow.averageTotalPayments === 0,
    sampleRow.averageMedicarePayments === 0,
  ].filter(Boolean).length;

  if (allZeroFields >= 3) {
    console.warn('Warning: Sample row has multiple zero values, indicating possible parsing issues', sampleRow);
  }

  // Check for invalid coordinates (NaN, 0,0 is usually wrong for US providers)
  const invalidCoords = data.filter(d => d.latitude === 0 || d.longitude === 0).length;
  if (invalidCoords > data.length * 0.5) {
    console.warn(`Warning: ${invalidCoords} of ${data.length} rows have invalid coordinates (0, 0)`);
  }

  // Check for reasonable value ranges
  const negativeCharges = data.filter(d => d.averageCoveredCharges < 0).length;
  if (negativeCharges > 0) {
    console.warn(`Warning: ${negativeCharges} rows have negative average covered charges`);
  }

  // Log sample data for debugging
  console.log('Data validation passed. Sample row:', {
    drg: sampleRow.drgDefinition.substring(0, 50) + '...',
    provider: sampleRow.providerName,
    state: sampleRow.providerState,
    discharges: sampleRow.totalDischarges,
    charges: sampleRow.averageCoveredCharges,
    payments: sampleRow.averageTotalPayments,
    coords: `${sampleRow.latitude}, ${sampleRow.longitude}`,
    isSepsis: sampleRow.isSepsis,
  });

  // Check that we have sepsis data
  const sepsisCount = data.filter(d => d.isSepsis).length;
  console.log(`Dataset contains ${sepsisCount} sepsis-related records out of ${data.length} total`);
}

/**
 * Get unique states from data
 */
export function getUniqueStates(data: ProviderData[]): string[] {
  const states = new Set(data.map(row => row.providerState));
  return Array.from(states).sort();
}

/**
 * Get data statistics
 */
export function getDataStats(data: ProviderData[]) {
  return {
    totalRecords: data.length,
    totalDischarges: d3.sum(data, d => d.totalDischarges),
    avgCoveredCharges: d3.mean(data, d => d.averageCoveredCharges) || 0,
    avgTotalPayments: d3.mean(data, d => d.averageTotalPayments) || 0,
    avgMedicarePayments: d3.mean(data, d => d.averageMedicarePayments) || 0,
    states: getUniqueStates(data).length,
  };
}
