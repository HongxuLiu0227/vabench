import Papa from 'papaparse';
import type { ExtendedDataRow } from '../types';

// Load Visualization data which contains the full dataset with all demographic fields
const DATA_URL = '/data/1.Who-PANAS - F _Visulizaton.csv';

let cachedData: ExtendedDataRow[] | null = null;

// PANAS response mapping to numeric values (1-5 scale)
const RESPONSE_MAP: Record<string, number> = {
  'Very Slightly or Not at All': 1,
  'A Little': 2,
  'Moderately': 3,
  'Quite a Bit': 4,
  'Extremely': 5,
  'Very Slightly or Not at All ': 1, // with trailing space
  'A Little ': 2,
  'Moderately ': 3,
  'Quite a Bit ': 4,
  'Extremely ': 5,
  'Null': 0, // Missing/null response
  '': 0, // Empty response
  null: 0,
  undefined: 0,
};

// Positive affect terms (PANAS)
const POSITIVE_TERMS = [
  'Interested',
  'Excited',
  'Strong',
  'Enthusiastic',
  'Proud',
  'Alert',
  'Inspired',
  'Determined',
  'Attentive',
  'Active',
];

// Negative affect terms (PANAS)
const NEGATIVE_TERMS = [
  'Distressed',
  'Upset',
  'Guilty',
  'Scared',
  'Hostile',
  'Irritable',
  'Ashamed',
  'Nervous',
  'Jittery',
  'Afraid',
];

/**
 * Normalize column name by removing extra whitespace, quotes, line breaks, and special characters
 * Also extracts emotion names from B-series PANAS question columns
 */
function normalizeColumnName(name: string): string {
  if (!name) return '';

  // First normalize the basic formatting
  let normalized = name
    .replace(/[\r\n\u00a0\u200B\u200C\u200D\u2060]+/g, ' ') // Remove line breaks, non-breaking spaces, and zero-width characters
    .replace(/""/g, '"') // Normalize double quotes to single quotes
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim()
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();

  // Extract emotion name from B-series PANAS columns
  // Format: "B1. Indicate to what extent the feelings you experience after a performance: Interested"
  // We want to extract just "Interested"
  const bSeriesMatch = normalized.match(/^B\d+\.\s+Indicate to what extent the feelings you experience after a performance:\s*(.+)$/i);
  if (bSeriesMatch && bSeriesMatch[1]) {
    return bSeriesMatch[1].trim();
  }

  return normalized;
}

/**
 * Find a column in a row by trying multiple possible name variations
 */
function findColumn(row: Record<string, any>, possibleNames: string[]): any {
  for (const name of possibleNames) {
    if (row[name] !== undefined) {
      return row[name];
    }
  }
  return undefined;
}

/**
 * Convert PANAS text response to numeric score
 */
function responseToScore(response: string | number | null | undefined): number {
  if (typeof response === 'number') {
    return response > 0 ? response : 0;
  }

  if (response === null || response === undefined) {
    return 0;
  }

  const strResponse = String(response).trim();
  return RESPONSE_MAP[strResponse] || 0;
}

/**
 * Calculate Positive-Score from PANAS positive affect responses
 */
function calculatePositiveScore(row: Record<string, any>): number {
  let score = 0;
  let validResponses = 0;

  for (const term of POSITIVE_TERMS) {
    // Try different column name variations
    // After normalization, the column should be just the emotion name
    // But we also try variations with spaces and original B-series format
    const variations = [
      term,
      `${term} `,
      ` ${term}`,
      `Indicate to what extent the feelings you experience after a performance: ${term}`,
    ];

    const value = findColumn(row, variations);
    const numericScore = responseToScore(value);
    if (numericScore > 0) {
      score += numericScore;
      validResponses++;
    }
  }

  // Return average of positive terms (only if we have valid responses)
  return validResponses > 0 ? Math.round((score / validResponses) * 100) / 100 : 0;
}

/**
 * Calculate Negative Score from PANAS negative affect responses
 */
function calculateNegativeScore(row: Record<string, any>): number {
  let score = 0;
  let validResponses = 0;

  for (const term of NEGATIVE_TERMS) {
    // Try different column name variations
    // After normalization, the column should be just the emotion name
    // But we also try variations with spaces and original B-series format
    const variations = [
      term,
      `${term} `,
      ` ${term}`,
      `Indicate to what extent the feelings you experience after a performance: ${term}`,
    ];

    const value = findColumn(row, variations);
    const numericScore = responseToScore(value);
    if (numericScore > 0) {
      score += numericScore;
      validResponses++;
    }
  }

  // Return average of negative terms (only if we have valid responses)
  return validResponses > 0 ? Math.round((score / validResponses) * 100) / 100 : 0;
}

export const loadData = async (): Promise<ExtendedDataRow[]> => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    const csvText = await response.text();

    // Parse CSV with proper handling of quoted fields
    const result = Papa.parse(csvText, {
      header: true,
      dynamicTyping: false, // We'll handle type conversion manually
      skipEmptyLines: true,
      transformHeader: normalizeColumnName,
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    if (!result.data || result.data.length === 0) {
      throw new Error('No data found in CSV file');
    }

    // Process and extend data with calculated fields
    const extendedData: ExtendedDataRow[] = result.data
      .filter((row: any) => row['Response ID'] && row['Response ID'] !== '') // Filter out empty rows
      .map((row: any) => {
        // Calculate PANAS scores
        const positiveScore = calculatePositiveScore(row);
        const negativeScore = calculateNegativeScore(row);
        const positiveNegativeScore = positiveScore - negativeScore;

        // Clean and normalize demographic data
        const cleanRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          const cleanKey = normalizeColumnName(key);
          const cleanValue = value === 'Null' || value === '' ? null : value;
          cleanRow[cleanKey] = cleanValue;
        }

        return {
          ...cleanRow,
          'Response ID': Number(cleanRow['Response ID']) || 0,
          'Positive-Score': positiveScore,
          'Negative Score': negativeScore,
          PositiveNegativeScore: positiveNegativeScore,
          isPositive: positiveNegativeScore > 0,
          isNegative: positiveNegativeScore < 0,
          // Map Tableau canonical field names to normalized column names
          // These are the fields expected by the Tableau spec
          'Gender': cleanRow['A1. Gender:'] || 'Unknown',
          'Age': cleanRow['A2. Age:'] || 'Unknown',
          'Marital status': findColumn(cleanRow, [
            'A3. What is your marital status? If "other" please specify',
            'A3. What is your marital status?  If "other" please specify'
          ]) || 'Unknown',
          'Ethnicity': findColumn(cleanRow, [
            'A4. What is your ethnicity? If "other" please specify',
            'A4. What is your ethnicity?  If "other" please specify'
          ]) || 'Unknown',
          'Education': cleanRow['A5. What is your highest level of education?'] || 'Unknown',
          'Annual income': cleanRow['A6. What is your annual income?'] || 'Unknown',
          'Employment status as a musician': findColumn(cleanRow, [
            'A7. What is your employment status as a musician? If "other" please specify',
            'A7. What is your employment status as a musician?  If "other" please specify'
          ]) || 'Unknown',
          'Years of experience as a musician': findColumn(cleanRow, [
            'A8. How many years of experience do you have as a musician? If "other" please specify',
            'A8. How many years of experience do you have as a musician?  If "other" please specify'
          ]) || 'Unknown',
          'Shows a year': cleanRow['A14. On average, how many shows a year do you play?'] || 'Unknown',
          // Note: The A24 column name contains special formatting, line breaks, and non-breaking spaces
          // After normalization, extra spaces are collapsed
          'After a performance,  consume non-prescription depressants':
            findColumn(cleanRow, [
              'A24. After a performance, do you consume any form of non-prescription depressants? Forms include Alcohol, Barbiturates, Benzodiazepines, Cannabis, Hydrocodone, Ketamine, Opioids (Codeine, Heroin, Methadone, Morphine, Oxycodone). If you answered, "yes", "sometimes" or "other", in the space below please specify which ones or expand on your answer.',
              'A24. After a performance, do you consume any form of non-prescription depressants?   Forms include Alcohol, Barbiturates, Benzodiazepines, Cannabis,   Hydrocodone, Ketamine, Opioids (Codeine, Heroin, Methadone, Morphine, Oxycodone).  If you answered, "yes", "sometimes" or "other", in the space below please specify which ones or expand on your answer.',
              'A24. After a performance, do you consume any form of non-prescription depressants?',
              'A24. After a performance',
            ]) || 'Unknown',
          // Preserve original column names for backward compatibility
          'A1. Gender:': cleanRow['A1. Gender:'] || 'Unknown',
          'A2. Age:': cleanRow['A2. Age:'] || 'Unknown',
          'A3. What is your marital status?  If "other" please specify': findColumn(cleanRow, [
            'A3. What is your marital status? If "other" please specify',
            'A3. What is your marital status?  If "other" please specify'
          ]) || 'Unknown',
          'A4. What is your ethnicity?  If "other" please specify': findColumn(cleanRow, [
            'A4. What is your ethnicity? If "other" please specify',
            'A4. What is your ethnicity?  If "other" please specify'
          ]) || 'Unknown',
          'A5. What is your highest level of education?': cleanRow['A5. What is your highest level of education?'] || 'Unknown',
          'A6. What is your annual income?': cleanRow['A6. What is your annual income?'] || 'Unknown',
          'A7. What is your employment status as a musician?  If "other" please specify': findColumn(cleanRow, [
            'A7. What is your employment status as a musician? If "other" please specify',
            'A7. What is your employment status as a musician?  If "other" please specify'
          ]) || 'Unknown',
          'A8. How many years of experience do you have as a musician?  If "other" please specify': findColumn(cleanRow, [
            'A8. How many years of experience do you have as a musician? If "other" please specify',
            'A8. How many years of experience do you have as a musician?  If "other" please specify'
          ]) || 'Unknown',
        } as ExtendedDataRow;
      })
      .filter((row) => row['Response ID'] > 0); // Filter out rows with invalid IDs

    if (extendedData.length === 0) {
      throw new Error('No valid data records found after processing');
    }

    console.log(`Loaded ${extendedData.length} records from ${DATA_URL}`);
    console.log(
      `Sample scores - Positive: ${extendedData[0]['Positive-Score']}, Negative: ${extendedData[0]['Negative Score']}`
    );

    cachedData = extendedData;
    return extendedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const getData = async (): Promise<ExtendedDataRow[]> => {
  return await loadData();
};

export const clearCache = (): void => {
  cachedData = null;
};
