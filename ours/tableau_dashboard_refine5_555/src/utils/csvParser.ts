/**
 * Robust CSV parser that handles:
 * - UTF-8 BOM (Byte Order Mark)
 * - Windows/Unix line endings
 * - Preamble rows before the actual header
 * - Quoted fields with commas
 * - Header normalization
 */

export interface ParseOptions {
  /** Number of preamble rows to skip before the header */
  skipPreambleRows?: number;
  /** Whether to detect preamble automatically (looks for non-standard header patterns) */
  autoDetectPreamble?: boolean;
  /** Whether to normalize header names (remove quotes, extra whitespace) */
  normalizeHeaders?: boolean;
}

/**
 * Removes UTF-8 BOM if present
 */
function stripBOM(text: string): string {
  // UTF-8 BOM is EF BB BF
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalizes line endings to \n
 */
function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Detects preamble rows by looking for non-standard header patterns
 * A valid header row should contain column names without "Unnamed" prefixes
 */
function detectPreambleRows(lines: string[]): number {
  let preambleCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty lines are preamble
    if (!trimmed) {
      preambleCount++;
      continue;
    }

    // Check if this looks like a data header
    // Headers should have comma-separated values and not contain "Unnamed"
    const hasCommas = trimmed.includes(',');
    const hasUnnamed = trimmed.includes('Unnamed');

    // Check for descriptive text (starts with capital letter, not a standard header)
    // A valid header should have known column names like "Row ID", "Order ID", etc.
    const hasDescriptiveText = /^[A-Z]/.test(trimmed) && !hasCommas;

    // Check if line is mostly empty commas (like ",,,,,,,,,,,,,,,,,,,,,,,")
    const values = trimmed.split(',').filter(v => v.trim());
    const mostlyEmpty = values.length < 3 && trimmed.includes(',');

    // A row is preamble if it has "Unnamed", is mostly empty commas,
    // or contains descriptive text without proper column structure
    if (hasUnnamed || mostlyEmpty || hasDescriptiveText) {
      preambleCount++;
    } else {
      // Found what looks like a valid header
      break;
    }
  }

  return preambleCount;
}

/**
 * Normalizes CSV header names
 * - Removes surrounding quotes
 * - Trims whitespace
 * - Handles quoted fields with commas
 */
function normalizeHeader(header: string): string {
  return header.trim().replace(/^"|"$/g, '');
}

/**
 * Parses CSV text with robust error handling
 */
export function parseCSV<T extends Record<string, unknown>>(
  csvText: string,
  options: ParseOptions = {}
): T[] {
  const {
    skipPreambleRows = 0,
    autoDetectPreamble = true,
    normalizeHeaders = true,
  } = options;

  try {
    // Step 1: Remove BOM
    let cleaned = stripBOM(csvText);

    // Step 2: Normalize line endings
    cleaned = normalizeLineEndings(cleaned);

    // Step 3: Split into lines
    const lines = cleaned.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Step 4: Detect or skip preamble
    let preambleRows = skipPreambleRows;
    if (autoDetectPreamble && skipPreambleRows === 0) {
      preambleRows = detectPreambleRows(lines);
    }

    // Step 5: Extract header and data lines
    const headerLine = lines[preambleRows];
    if (!headerLine) {
      throw new Error('No header row found after preamble');
    }

    const dataLines = lines.slice(preambleRows + 1);

    // Step 6: Parse header manually to handle quoted fields
    const headers = parseCSVLine(headerLine);
    const normalizedHeaders = normalizeHeaders
      ? headers.map(normalizeHeader)
      : headers;

    // Step 7: Parse data rows
    const result: T[] = [];

    for (const line of dataLines) {
      if (!line.trim()) continue;

      try {
        const values = parseCSVLine(line);
        const row: Record<string, unknown> = {};

        normalizedHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        result.push(row as T);
      } catch (e) {
        // Skip malformed rows but log them
        console.warn('Skipping malformed CSV row:', line, e);
        continue;
      }
    }

    return result;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Parses a single CSV line, handling quoted fields correctly
 * This is a simplified parser that handles:
 * - Quoted fields: "value"
 * - Quoted fields with commas: "City, State"
 * - Unquoted fields
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
        // Escaped quote within quoted field
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
 * Validates that required columns exist in the parsed data
 */
export function validateColumns<T extends Record<string, unknown>>(
  data: T[],
  requiredColumns: string[]
): { valid: boolean; missing: string[] } {
  if (data.length === 0) {
    return { valid: false, missing: requiredColumns };
  }

  const columns = Object.keys(data[0]);
  const missing = requiredColumns.filter(col => !columns.includes(col));

  return {
    valid: missing.length === 0,
    missing,
  };
}
