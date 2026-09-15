/**
 * Robust CSV parser that handles:
 * - BOM (Byte Order Mark) at the start of files
 * - Triple-quoted headers like """field_name"""
 * - Normal quoted CSV fields
 */

/**
 * Normalize header names by removing triple quotes and extra whitespace
 * Examples:
 *   """start station name""" -> start station name
 *   """tripduration""" -> tripduration
 *   "normal" -> normal
 */
export function normalizeHeader(header: string): string {
  let normalized = header.trim();

  // Remove BOM if present (UTF-8 BOM: \uFEFF)
  normalized = normalized.replace(/^\uFEFF/, '');

  // Handle triple quotes: """field name""" -> field name
  if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
    normalized = normalized.slice(3, -3);
  }
  // Handle double quotes: "field name" -> field name
  else if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.trim();
}

/**
 * Parse CSV with proper header normalization
 * Handles BOM, triple-quoted headers, and standard CSV quoting
 */
export function parseCSV<T = Record<string, string>>(csvText: string): T[] {
  // Remove BOM from the entire text if present
  const text = csvText.replace(/^\uFEFF/, '');

  // Split into lines
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) {
    return [];
  }

  // Parse and normalize headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(normalizeHeader);

  // Parse data rows
  const result: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Skip empty rows or rows with mismatched column count
    if (values.length === 0 || values.length !== headers.length) {
      continue;
    }

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });

    result.push(record as T);
  }

  return result;
}

/**
 * Parse a single CSV line, handling quoted fields
 * This is a simplified parser that handles standard CSV quoting rules
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote within quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Validate that required fields exist in parsed data
 */
export function validateParsedData(
  data: Record<string, unknown>[],
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  if (data.length === 0) {
    return { valid: false, missing: ['No data rows found'] };
  }

  const sampleRow = data[0];
  const missing = requiredFields.filter(field => !(field in sampleRow));

  return {
    valid: missing.length === 0,
    missing
  };
}
