import { csvParse } from 'd3-dsv';
import type { DiabetesRecord, TransformedDiabetesRecord, StackedBarData } from '../types';

/**
 * Normalize header names by removing:
 * 1. BOM (Byte Order Mark) characters
 * 2. Triple quotes (""") or any number of surrounding quotes
 * 3. Leading/trailing whitespace
 */
const normalizeHeader = (header: string): string => {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove triple quotes (""") or any number of surrounding quotes
  // Pattern: remove " characters from the start and end
  cleaned = cleaned.replace(/^"+|"+$/g, '');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * Robust CSV parser that handles:
 * - BOM (Byte Order Mark) at the start of the file
 * - Triple-quoted headers ("""field_name""")
 * - Quoted headers ("field_name")
 * - Mixed quote styles
 * - Validates that required fields exist
 */
export const loadDiabetesData = async (): Promise<TransformedDiabetesRecord[]> => {
  const response = await fetch('/data/Diabetes_Cleaned.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove BOM if present at the start of the file
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  // Pre-process: remove triple quotes before parsing
  // This handles the """field""" format in the CSV
  csvText = csvText.replace(/"""/g, '"');

  // Parse CSV with D3
  const rawData = csvParse(csvText);

  if (!rawData || rawData.length === 0) {
    throw new Error('CSV file is empty or could not be parsed');
  }

  // Get the first row to extract headers
  const firstRow = rawData[0];
  const rawHeaders = Object.keys(firstRow);

  // Create a mapping from raw headers to normalized headers
  const headerMap: Record<string, string> = {};
  rawHeaders.forEach(rawHeader => {
    headerMap[rawHeader] = normalizeHeader(rawHeader);
  });

  // Check for required fields based on Tableau contract
  const requiredFields = ['diag_1', 'diag_2', 'diag_3', 'readmitted'];
  const normalizedHeaders = Object.values(headerMap);

  const missingFields = requiredFields.filter(field => !normalizedHeaders.includes(field));
  if (missingFields.length > 0) {
    console.warn('Warning: Missing expected fields:', missingFields);
    console.warn('Available headers:', normalizedHeaders);
  }

  // Transform data with normalized headers
  const cleanedData = rawData.map((record) => {
    const cleaned: Record<string, string | number> = {};

    Object.keys(record).forEach((rawKey) => {
      const cleanKey = headerMap[rawKey] || normalizeHeader(rawKey);
      let value: string | number = record[rawKey];

      // Convert numeric fields based on the Tableau data contract
      if (cleanKey === 'encounter_id' || cleanKey === 'patient_nbr' ||
          cleanKey === 'admission_type_id' || cleanKey === 'discharge_disposition_id' ||
          cleanKey === 'admission_source_id' || cleanKey === 'time_in_hospital' ||
          cleanKey === 'num_lab_procedures' || cleanKey === 'num_procedures' ||
          cleanKey === 'num_medications' || cleanKey === 'number_outpatient' ||
          cleanKey === 'number_emergency' || cleanKey === 'number_inpatient' ||
          cleanKey === 'number_diagnoses') {

        // Handle empty strings, '?' (unknown value marker), or null
        if (value === '' || value === '?' || value === null) {
          value = 0;
        } else {
          const num = Number(value);
          value = isNaN(num) ? 0 : num;
        }
      }

      cleaned[cleanKey] = value;
    });

    return cleaned as unknown as DiabetesRecord;
  });

  // Apply Tableau transformation: readmitted (group)
  // Based on the contract, this groups readmission status
  const transformedData = cleanedData.map((record: DiabetesRecord) => {
    let readmittedGroup = 'Not Readmitted';

    // Group readmission status according to Tableau logic
    if (record.readmitted === '<30') {
      readmittedGroup = 'Readmitted';
    } else if (record.readmitted === '>30' || record.readmitted === 'NO') {
      readmittedGroup = 'Not Readmitted';
    } else {
      // Handle any unexpected values
      readmittedGroup = 'Not Readmitted';
    }

    return {
      ...record,
      readmitted_group: readmittedGroup
    };
  });

  return transformedData;
};

// Aggregate data for stacked percentage bars
export const aggregateForStackedPercentage = (
  data: TransformedDiabetesRecord[],
  categoryField: keyof TransformedDiabetesRecord,
  seriesField: 'readmitted_group'
): StackedBarData[] => {
  // Group by category and series
  const grouped: Record<string, Record<string, number>> = {};

  data.forEach((record) => {
    const category = String(record[categoryField]);
    const series = record[seriesField];

    if (!grouped[category]) {
      grouped[category] = {};
    }
    if (!grouped[category][series]) {
      grouped[category][series] = 0;
    }
    grouped[category][series]++;
  });

  // Convert to flat array and calculate percentages
  const result: StackedBarData[] = [];
  Object.entries(grouped).forEach(([category, seriesData]) => {
    const total = Object.values(seriesData).reduce((sum, val) => sum + val, 0);
    Object.entries(seriesData).forEach(([series, count]) => {
      result.push({
        category,
        series,
        value: count,
        percentage: (count / total) * 100
      });
    });
  });

  return result;
};

// Filter data based on filter state
export const filterData = (
  data: TransformedDiabetesRecord[],
  filters: Record<string, string[]>
): TransformedDiabetesRecord[] => {
  return data.filter((record) => {
    return Object.entries(filters).every(([field, selectedValues]) => {
      if (selectedValues.length === 0) return true;
      const value = String((record as Record<string, unknown>)[field]);
      return selectedValues.includes(value);
    });
  });
};
