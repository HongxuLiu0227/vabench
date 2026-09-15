/**
 * Robust CSV parser that handles:
 * - UTF-8 BOM (Byte Order Mark)
 * - Non-breaking spaces (U+00A0) in headers
 * - Quoted field values with commas and quotes
 * - Normalizes whitespace for reliable field lookup
 */

import { csv } from 'd3';

/**
 * Normalizes a string by:
 * 1. Stripping UTF-8 BOM if present
 * 2. Stripping wrapping quotes (single or double, including repeated quotes)
 * 3. Converting no-break spaces (U+00A0) to regular spaces
 * 4. Collapsing multiple spaces to single spaces
 * 5. Trimming leading/trailing whitespace
 */
export function normalizeFieldName(name: string): string {
  return name
    .replace(/^\uFEFF/, '')             // Strip UTF-8 BOM
    .replace(/^["']+|["']+$/g, '')     // Strip wrapping quotes (single or double)
    .replace(/""/g, '"')                // Convert escaped double quotes to single quotes
    .replace(/''/g, "'")                // Convert escaped single quotes
    .replace(/\u00A0/g, ' ')            // Convert no-break space to regular space
    .replace(/\s+/g, ' ')               // Collapse multiple spaces to one
    .trim();
}

/**
 * Create a canonical field name that can be used for lookup
 * Handles common aliases for Tableau fields
 */
export function getCanonicalFieldName(name: string): string {
  const normalized = normalizeFieldName(name);

  // Map common field aliases to their canonical names
  // These must match the headers as they come from D3 after parsing (quotes already stripped)
  const fieldAliases: Record<string, string> = {
    // Demographic fields - match exact headers from CSV
    'A1. Gender:': 'Gender',
    'Gender': 'Gender',

    'A2. Age:': 'Age',
    'Age': 'Age',

    'A3. What is your marital status?  If "other" please specify': 'Marital status',
    'A3. What is your marital status? If "other" please specify': 'Marital status',
    'A3. What is your marital status?  If other please specify': 'Marital status',
    'Marital status': 'Marital status',

    'A4. What is your ethnicity?  If "other" please specify': 'Ethnicity',
    'A4. What is your ethnicity? If "other" please specify': 'Ethnicity',
    'A4. What is your ethnicity?  If other please specify': 'Ethnicity',
    'Ethnicity': 'Ethnicity',

    'A5. What is your highest level of education?': 'Education',
    'Education': 'Education',

    'A6. What is your annual income?': 'Annual income',
    'Annual income': 'Annual income',

    'A7. What is your employment status as a musician?  If "other" please specify': 'Employment status as a musician',
    'A7. What is your employment status as a musician? If "other" please specify': 'Employment status as a musician',
    'A7. What is your employment status as a musician?  If other please specify': 'Employment status as a musician',
    'Employment status as a musician': 'Employment status as a musician',

    // Substance use fields - match the actual header from CSV (partial match)
    'A24. After a performance, do you consume any form of non-prescription depressants?': 'After a performance, consume non-prescription depressants',
    'After a performance, consume non-prescription depressants': 'After a performance, consume non-prescription depressants',

    'A14. On average, how many shows a year do you play?': 'Shows a year',
    'A14. On average, how many shows a year do you play? ': 'Shows a year',
    'Shows a year': 'Shows a year',

    // PANAS score fields (calculated)
    'Positive-Score': 'positiveScore',
    'Positive Score': 'positiveScore',
    'positiveScore': 'positiveScore',

    'Negative Score': 'negativeScore',
    'NegativeScore': 'negativeScore',
    'negativeScore': 'negativeScore',
  };

  // Return the canonical name if found, otherwise return the normalized name
  return fieldAliases[normalized] || normalized;
}

/**
 * Parse CSV data with header normalization and field aliasing
 * @param url - URL to CSV file
 * @returns Promise of parsed and normalized data with field aliases
 */
export async function loadNormalizedCSV(url: string): Promise<Record<string, string | number | null>[]> {
  try {
    const rawData = await csv(url);

    // Normalize all field names in each row and add aliases
    const normalizedData = rawData.map(row => {
      const normalizedRow: Record<string, string | number | null> = {};

      Object.entries(row).forEach(([key, value]) => {
        // Store with normalized original key
        const normalizedKey = normalizeFieldName(key);
        normalizedRow[normalizedKey] = value;

        // Also add under canonical alias name if different
        const canonicalKey = getCanonicalFieldName(normalizedKey);
        if (canonicalKey !== normalizedKey) {
          normalizedRow[canonicalKey] = value;
        }
      });

      return normalizedRow;
    });

    return normalizedData;
  } catch (error) {
    console.error(`Error loading CSV from ${url}:`, error);
    throw error;
  }
}

/**
 * Create a mapping of original field names to normalized field names
 * Useful for debugging and field lookup validation
 */
export function createFieldNameMapping(originalHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  originalHeaders.forEach(header => {
    mapping[header] = normalizeFieldName(header);
  });

  return mapping;
}

/**
 * Validate that expected fields exist in normalized data
 * Handles both original field names and canonical aliases
 * Uses fuzzy matching for fields that might have spacing differences
 * @throws Error if any expected fields are missing
 */
export function validateFields(
  data: Record<string, unknown>[],
  expectedFields: string[]
): void {
  if (data.length === 0) {
    throw new Error('No data to validate');
  }

  const availableFields = Object.keys(data[0]);

  // Helper function to check if a field exists (with fuzzy matching)
  const fieldExists = (field: string): boolean => {
    // Check exact match
    if (availableFields.includes(field)) return true;

    // Check canonical version
    const canonicalField = getCanonicalFieldName(field);
    if (canonicalField !== field && availableFields.includes(canonicalField)) return true;

    // Fuzzy match: normalize both and compare
    const normalizedField = normalizeFieldName(field).toLowerCase().replace(/\s+/g, ' ');
    const found = availableFields.some(available => {
      const normalizedAvailable = normalizeFieldName(available).toLowerCase().replace(/\s+/g, ' ');
      return normalizedAvailable === normalizedField ||
             normalizedAvailable.includes(normalizedField) ||
             normalizedField.includes(normalizedAvailable);
    });
    return found;
  };

  // Check for missing fields
  const missingFields = expectedFields.filter(field => !fieldExists(field));

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    console.error('Available fields (first 30):', availableFields.slice(0, 30).join(', '));

    // Try to provide helpful mapping info
    const mappingSuggestions = missingFields.map(field => {
      const canonicalField = getCanonicalFieldName(field);
      const normalizedField = normalizeFieldName(field).toLowerCase().replace(/\s+/g, ' ');

      const found = availableFields.find(f => {
        const normalizedAvailable = normalizeFieldName(f).toLowerCase().replace(/\s+/g, ' ');
        return normalizedAvailable === normalizedField ||
               normalizedAvailable.includes(normalizedField) ||
               normalizedField.includes(normalizedAvailable);
      });

      if (found) {
        return `${field} -> ${found}`;
      }
      if (canonicalField !== field && availableFields.includes(canonicalField)) {
        return `${field} -> ${canonicalField} (found)`;
      }
      return `${field} (NOT FOUND)`;
    });

    console.error('Field mapping suggestions:', mappingSuggestions);

    throw new Error(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  console.log('✓ All required fields validated successfully');
}
