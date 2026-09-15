/**
 * Robust CSV parser with header normalization
 * Handles quoted headers, preamble rows, and dirty CSV data
 */

/**
 * Normalizes a CSV header by removing excessive quotes and whitespace
 * Examples: """Field Name""" -> "Field Name", "Field" -> "Field"
 */
export function normalizeHeader(header: string): string {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove triple quotes
  cleaned = cleaned.replace(/^"""|"""$/g, '');

  // Remove double quotes
  cleaned = cleaned.replace(/^"|"$/g, '');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Detects and skips preamble rows before the actual header
 * Returns the line number where the real header starts
 */
export function detectHeaderStart(lines: string[]): number {
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Check if this looks like a header row (contains quoted field names)
    // A header row typically has multiple quoted fields
    const quotedFieldCount = (line.match(/"""/g) || []).length;

    // If we have multiple triple-quoted fields, this is likely the header
    if (quotedFieldCount >= 6) {
      return i;
    }

    // Also check for regular quoted fields
    const regularQuotes = (line.match(/"/g) || []).length;
    if (regularQuotes >= 12) {
      return i;
    }
  }

  // Default to first line if no header detected
  return 0;
}

/**
 * Parses CSV text with normalized headers
 * Returns array of records with cleaned header names
 */
export function parseNormalizedCSV<T extends Record<string, unknown>>(
  csvText: string,
  rowTransformer?: (row: Record<string, string>, headers: string[]) => T
): T[] {
  // Split into lines, handling different line endings
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Detect header start (skip preamble rows)
  const headerLineIndex = detectHeaderStart(lines);

  // Parse the header line
  const headerLine = lines[headerLineIndex];

  // Split by comma, handling quoted fields
  const headers = splitCSVLine(headerLine).map(normalizeHeader);

  // Parse data rows
  const result: T[] = [];

  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Split the line
    const values = splitCSVLine(line);

    // Skip if no values or values don't match header count
    if (values.length === 0 || values.length < headers.length - 1) {
      continue;
    }

    // Create record object
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });

    // Apply transformer if provided
    if (rowTransformer) {
      try {
        const transformed = rowTransformer(record, headers);
        result.push(transformed);
      } catch (err) {
        console.warn(`Failed to transform row ${i}:`, err);
      }
    } else {
      result.push(record as unknown as T);
    }
  }

  return result;
}

/**
 * Splits a CSV line by comma, respecting quoted fields
 */
export function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1] || '';

    // Check for triple quotes
    if (char === '"' && nextChar === '"' && line[i + 2] === '"') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = '"""';
        i += 2; // Skip next two quotes
      } else if (quoteChar === '"""') {
        inQuotes = false;
        quoteChar = '';
        i += 2; // Skip next two quotes
      } else {
        current += char;
      }
      continue;
    }

    // Check for regular quotes
    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = '"';
      } else if (quoteChar === '"') {
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
      continue;
    }

    // Check for comma separator (only when not in quotes)
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  // Don't forget the last field
  if (current || result.length > 0) {
    result.push(current);
  }

  return result;
}

/**
 * Validates that required fields exist in the parsed data
 */
export function validateFields(
  data: Record<string, unknown>[],
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  if (data.length === 0) {
    return { valid: false, missing: requiredFields };
  }

  const firstRow = data[0];
  const missing = requiredFields.filter(field => !(field in firstRow));

  return {
    valid: missing.length === 0,
    missing
  };
}
