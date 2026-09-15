/**
 * Robust CSV parser for handling malformed Tableau exports
 * Deals with:
 * - Over-quoted headers (e.g., """field""",""field2"")
 * - Mixed quote patterns
 * - BOM (Byte Order Mark) characters
 * - Empty preamble rows
 */

import { csvParse } from 'd3-dsv';
import type { DSVRowArray } from 'd3-dsv';

/**
 * Normalize a CSV header by removing extra quotes and whitespace
 * Examples:
 *   """F1"""          -> "F1"
 *   ""tripduration""  -> "tripduration"
 *   "normal field"    -> "normal field"
 *   "gender"\r        -> "gender"
 */
export function normalizeHeader(header: string): string {
  let normalized = header.trim();

  // Remove BOM if present
  normalized = normalized.replace(/^\uFEFF/, '');

  // Remove trailing carriage returns (Windows line endings)
  normalized = normalized.replace(/\r+$/, '');

  // Remove wrapping quotes iteratively until none remain
  // This handles patterns like: """field""" -> ""field"" -> "field" -> field
  let changed = true;
  while (changed) {
    changed = false;

    // Check if wrapped in triple quotes
    if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
      normalized = normalized.slice(1, -1); // Remove one quote from each side
      changed = true;
    }
    // Check if wrapped in double quotes
    else if (normalized.startsWith('""') && normalized.endsWith('""')) {
      normalized = normalized.slice(1, -1); // Remove one quote from each side
      changed = true;
    }
    // Check if wrapped in single quotes
    else if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1); // Remove one quote from each side
      changed = true;
    }
  }

  return normalized;
}

/**
 * Parse CSV with header normalization
 * Returns normalized rows with clean field names
 */
export function parseTableauCSV(csvText: string): DSVRowArray<string> {
  const parsed = csvParse(csvText);

  if (parsed.columns.length === 0) {
    throw new Error('CSV parsing failed: No columns found');
  }

  // Normalize column names
  const normalizedColumns = parsed.columns.map(col => normalizeHeader(col));

  // Create a new DSVRowArray with normalized column names
  const normalizedRows = parsed.map(row => {
    const normalizedRow: Record<string, string> = {};
    parsed.columns.forEach((originalCol, index) => {
      const normalizedCol = normalizedColumns[index];
      normalizedRow[normalizedCol] = row[originalCol] || '';
    });
    return normalizedRow;
  });

  // Create a new DSVRowArray-like object
  const result = normalizedRows as DSVRowArray<string>;
  (result as DSVRowArray<string> & { columns: string[] }).columns = normalizedColumns;

  return result;
}

/**
 * Validate that required fields exist in parsed data
 */
export function validateFields(
  data: DSVRowArray<string>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const availableFields = new Set(data.columns.map(c => c.toLowerCase()));
  const missing = requiredFields.filter(
    field => !availableFields.has(field.toLowerCase())
  );

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Detect and skip preamble rows before the real header
 * Returns the index of the actual header row
 */
export function detectHeaderRow(lines: string[]): number {
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    // Check if this looks like a header row
    // A header row typically has quoted strings with commas
    const quoteCount = (line.match(/"/g) || []).length;

    // If we have multiple quoted fields, this is likely the header
    if (quoteCount >= 4 && line.includes(',')) {
      return i;
    }
  }

  // Default to first row if no clear header found
  return 0;
}

/**
 * Load and parse Tableau CSV with full preprocessing
 */
export async function loadTableauCSV(url: string): Promise<DSVRowArray<string>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText} (${response.status})`);
  }

  const csvText = await response.text();

  // Check for preamble rows
  const lines = csvText.split('\n');
  const headerRowIndex = detectHeaderRow(lines);

  if (headerRowIndex > 0) {
    console.warn(`Detected ${headerRowIndex} preamble rows, skipping to header at line ${headerRowIndex + 1}`);
  }

  // Extract CSV from header row onwards
  const csvContent = lines.slice(headerRowIndex).join('\n');

  // Parse with normalization
  const parsed = parseTableauCSV(csvContent);

  console.log(`Parsed ${parsed.length} rows with ${parsed.columns.length} columns:`, parsed.columns);

  return parsed;
}
