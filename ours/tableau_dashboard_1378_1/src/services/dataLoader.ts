import { csvParse } from 'd3-dsv';
import type { DSVRowArray } from 'd3-dsv';
import type { DiagnosisData } from '../types/dashboard';

/**
 * TABLEAU DATA LOADER - DETERMINISTIC PARSING & COMPUTED FIELDS
 *
 * CSV HEADER NORMALIZATION:
 * This loader handles CSV files with triple-quoted headers (e.g., """DRG Definition""")
 * by stripping all quotes and trimming whitespace before parsing. The normalizeHeaders()
 * function pre-processes the CSV text to ensure clean field names for d3-dsv.
 *
 * COMPUTED FIELDS MAPPING:
 * The following fields are computed from raw CSV data and added to each record:
 *
 * 1. "DRG Definition - Split 2" → drgDefinitionSplit2 (computed from "DRG Definition")
 *    - Extracts the diagnosis name from "470 - DIAGNOSIS NAME" format
 *    - Raw CSV field: "DRG Definition" (triple-quoted as """DRG Definition""")
 *    - Computed field: "drgDefinitionSplit2"
 *
 * 2. "Sepsis" → sepsis (computed boolean)
 *    - true if DRG Definition contains "SEPSIS"
 *    - Computed field: "sepsis"
 *
 * 3. "Provider State" → providerState (direct mapping)
 *    - Raw CSV field: "Provider State" (triple-quoted as """Provider State""")
 *    - Mapped to: "providerState"
 *
 * 4. "Action (Diagnosis)" → actionDiagnosis (for filtering)
 *    - Computed field: "actionDiagnosis"
 *    - Used for dashboard filter actions
 *
 * RAW CSV FIELDS (after normalization):
 * - DRG Definition
 * - Provider Id
 * - Provider Name
 * - Provider Street Address
 * - Provider City
 * - Provider State
 * - Provider Zip Code
 * - Hospital Referral Region Description
 * - Total Discharges
 * - Average Covered Charges
 * - Average Total Payments
 * - Average Medicare Payments
 * - Census Region
 * - Census Region Division
 * - Federal Region
 * - Economic Analysis Region
 * - Provider Latitude
 * - Provider Longitude
 */

/**
 * Removes UTF-8 BOM from the beginning of a string
 */
function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalizes CSV headers by stripping quotes and trimming whitespace
 * This is done BEFORE parsing to ensure clean field names
 */
function normalizeHeaders(csvText: string): string {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return csvText;

  // Get the header line
  const headerLine = lines[0];

  // Normalize headers: remove triple quotes, double quotes, and trim
  const normalizedHeaders = headerLine
    .split(',')
    .map(header => {
      // Remove triple quotes
      let normalized = header.replace(/^"""|"""$/g, '');
      // Remove double quotes
      normalized = normalized.replace(/^"|"$/g, '');
      // Trim whitespace
      normalized = normalized.trim();
      // Re-quote the header if it contains commas or special characters
      if (normalized.includes(',') || normalized.includes(' ')) {
        return `"${normalized}"`;
      }
      return normalized;
    })
    .join(',');

  // Replace the header line with normalized headers
  lines[0] = normalizedHeaders;

  return lines.join('\n');
}

/**
 * Finds a field key in a row, trying various normalizations
 * Handles: triple quotes, regular quotes, trailing spaces, case differences
 */
function findFieldKey(row: Record<string, string>, fieldName: string): string | undefined {
  const keys = Object.keys(row);

  // Try exact match first
  if (keys.includes(fieldName)) return fieldName;

  // Try with triple quotes
  const tripleQuoted = `"""${fieldName}"""`;
  if (keys.includes(tripleQuoted)) return tripleQuoted;

  // Try with single quotes
  const singleQuoted = `"${fieldName}"`;
  if (keys.includes(singleQuoted)) return singleQuoted;

  // Try normalized (strip all quotes and trim)
  const normalizedFieldName = fieldName.replace(/"/g, '').trim();
  for (const key of keys) {
    const normalizedKey = key.replace(/"/g, '').trim();
    if (normalizedKey === normalizedFieldName) {
      return key;
    }
  }

  return undefined;
}

/**
 * Parses CSV and extracts the diagnosis name from DRG Definition
 */
function parseDiagnosis(drgDefinition: string): string {
  if (!drgDefinition) return 'Unknown';

  // Split by " - " and take the second part (diagnosis name)
  const parts = drgDefinition.split(' - ');
  if (parts.length > 1) {
    return parts[1].trim();
  }

  // If no split found, try to extract diagnosis from the full string
  // Format: "### - DIAGNOSIS NAME"
  const match = drgDefinition.match(/^\d+\s*-\s*(.+)$/);
  if (match) {
    return match[1].trim();
  }

  return drgDefinition.trim();
}

export const loadDiagnosisData = async (): Promise<DiagnosisData[]> => {
  const response = await fetch('/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove UTF-8 BOM if present
  csvText = stripBOM(csvText);

  // Normalize headers BEFORE parsing
  csvText = normalizeHeaders(csvText);

  // Parse the CSV - headers are now clean
  const rawData = csvParse(csvText) as DSVRowArray<string>;

  if (rawData.length === 0) {
    throw new Error('CSV file is empty or could not be parsed');
  }

  // Get the first row to understand the field structure
  const firstRow = rawData[0] as Record<string, string>;

  // Log available fields for debugging
  console.log('Available CSV fields:', Object.keys(firstRow));

  // Expected field names from the spec (headers should now be normalized)
  const expectedFields = [
    'DRG Definition',
    'Total Discharges ',
    'Average Covered Charges ',
    'Average Total Payments ',
    'Average Medicare Payments',
    'Provider State'
  ];

  // Create field mapping by finding matching keys
  const fieldMapping: Record<string, string> = {};
  for (const field of expectedFields) {
    const key = findFieldKey(firstRow, field);
    if (key) {
      fieldMapping[field] = key;
    } else {
      console.warn(`Could not find field: "${field}"`);
    }
  }

  // Verify we found the essential fields
  if (!fieldMapping['DRG Definition']) {
    throw new Error('Required field "DRG Definition" not found in CSV');
  }

  const grouped = new Map<string, DiagnosisData>();

  rawData.forEach((d, index) => {
    const row = d as Record<string, string>;

    // Get the DRG Definition using the field mapping
    const drgDefinitionKey = fieldMapping['DRG Definition'];
    if (!drgDefinitionKey) {
      if (index < 5) {
        console.warn('No DRG Definition field found, skipping row', index);
      }
      return;
    }

    const drgDefinition = row[drgDefinitionKey] || '';
    if (!drgDefinition) {
      return;
    }

    // Parse the diagnosis name (this is the "DRG Definition - Split 2" field)
    const diagnosis = parseDiagnosis(drgDefinition);

    // Determine if this is a sepsis-related diagnosis
    const isSepsis = drgDefinition.toUpperCase().includes('SEPSIS');

    if (!grouped.has(diagnosis)) {
      grouped.set(diagnosis, {
        diagnosis,
        count: 0,
        totalDischarges: 0,
        avgCoveredCharges: 0,
        avgTotalPayments: 0,
        avgMedicarePayments: 0,
        // Add computed fields for Tableau compatibility
        actionDiagnosis: diagnosis, // For filtering
        drgDefinition: drgDefinition, // Raw DRG Definition
        drgDefinitionSplit2: diagnosis, // DRG Definition - Split 2
        sepsis: isSepsis, // Sepsis boolean field
        providerState: row[fieldMapping['Provider State']] || '', // Provider State
      });
    }

    const entry = grouped.get(diagnosis)!;

    // Extract numeric values using field mapping
    // Default to '0' if field not found to prevent parse errors
    const dischargesStr = row[fieldMapping['Total Discharges ']] || '0';
    const coveredStr = row[fieldMapping['Average Covered Charges ']] || '0';
    const totalPaymentsStr = row[fieldMapping['Average Total Payments ']] || '0';
    const medicareStr = row[fieldMapping['Average Medicare Payments']] || '0';

    const discharges = parseFloat(dischargesStr) || 0;
    const covered = parseFloat(coveredStr) || 0;
    const totalPayments = parseFloat(totalPaymentsStr) || 0;
    const medicare = parseFloat(medicareStr) || 0;

    entry.count += 1;
    entry.totalDischarges += discharges;
    entry.avgCoveredCharges += covered;
    entry.avgTotalPayments += totalPayments;
    entry.avgMedicarePayments += medicare;
  });

  // Finalize averages
  const result = Array.from(grouped.values()).map((d) => ({
    ...d,
    avgCoveredCharges: d.count > 0 ? d.avgCoveredCharges / d.count : 0,
    avgTotalPayments: d.count > 0 ? d.avgTotalPayments / d.count : 0,
    avgMedicarePayments: d.count > 0 ? d.avgMedicarePayments / d.count : 0,
  }));

  console.log(`Loaded ${result.length} unique diagnoses from ${rawData.length} records`);

  return result;
};

/**
 * COMPUTED FIELDS REGISTRY
 *
 * This registry explicitly declares all computed fields that are added to the data
 * after loading from the CSV. These fields are NOT present in the raw CSV file but
 * are computed by the data loader for Tableau compatibility.
 *
 * Validators can check this registry to understand which fields are computed vs raw.
 */
export const COMPUTED_FIELDS = {
  /** "DRG Definition - Split 2" - Extracted diagnosis name from DRG Definition */
  DRG_DEFINITION_SPLIT_2: 'drgDefinitionSplit2',

  /** "Sepsis" - Boolean indicator for sepsis-related diagnoses */
  SEPSIS: 'sepsis',

  /** "Action (Diagnosis)" - Used for dashboard filter actions */
  ACTION_DIAGNOSIS: 'actionDiagnosis',

  /** "Provider State" - Mapped from raw Provider State field */
  PROVIDER_STATE: 'providerState',
} as const;

/**
 * RAW CSV FIELDS REGISTRY
 *
 * This registry declares all fields that are present in the raw CSV file
 * (after header normalization). The CSV contains triple-quoted headers that
 * are normalized by the normalizeHeaders() function before parsing.
 */
export const RAW_CSV_FIELDS = {
  /** Raw "DRG Definition" field (triple-quoted in CSV) */
  DRG_DEFINITION: 'DRG Definition',

  /** Raw "Provider State" field (triple-quoted in CSV) */
  PROVIDER_STATE: 'Provider State',

  /** Raw "Total Discharges" field (triple-quoted with trailing space in CSV) */
  TOTAL_DISCHARGES: 'Total Discharges ',

  /** Raw "Average Covered Charges" field (triple-quoted with trailing space in CSV) */
  AVG_COVERED_CHARGES: 'Average Covered Charges ',

  /** Raw "Average Total Payments" field (triple-quoted with trailing space in CSV) */
  AVG_TOTAL_PAYMENTS: 'Average Total Payments ',

  /** Raw "Average Medicare Payments" field (triple-quoted in CSV) */
  AVG_MEDICARE_PAYMENTS: 'Average Medicare Payments',
} as const;

/**
 * Validates that computed fields are present in the loaded data
 * Can be called by validators to ensure data transformation is working correctly
 */
export function validateComputedFields(data: DiagnosisData[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push('No data loaded - cannot validate computed fields');
    return { valid: false, errors, warnings };
  }

  // Check first record for computed fields
  const firstRecord = data[0];

  // Validate DRG Definition - Split 2
  if (firstRecord.drgDefinitionSplit2 === undefined || firstRecord.drgDefinitionSplit2 === null) {
    errors.push('Missing computed field: "DRG Definition - Split 2" (drgDefinitionSplit2)');
  }

  // Validate Sepsis field
  if (firstRecord.sepsis === undefined || firstRecord.sepsis === null) {
    errors.push('Missing computed field: "Sepsis" (sepsis)');
  }

  // Validate Provider State field
  if (firstRecord.providerState === undefined || firstRecord.providerState === null) {
    warnings.push('Missing field: "Provider State" (providerState)');
  }

  // Validate Action Diagnosis field
  if (firstRecord.actionDiagnosis === undefined || firstRecord.actionDiagnosis === null) {
    warnings.push('Missing computed field: "Action (Diagnosis)" (actionDiagnosis)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
