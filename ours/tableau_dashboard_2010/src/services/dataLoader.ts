import type { ABTestingData, ABTestingDataWithAgeGroup, AgeGroup } from '../types/data';

export async function loadCSV(url: string): Promise<ABTestingData[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const csvText = await response.text();
  return parseCSV(csvText);
}

/**
 * Normalize header names by removing extra quotes, whitespace, and special characters
 * This handles cases where headers might be quoted like ""Order Date"" or have trailing spaces
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/"+/g, '') // Remove any remaining multiple quotes
    .trim();
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Preamble rows are typically those that don't contain expected column patterns
 */
function findHeaderRowIndex(lines: string[]): number {
  // Expected column patterns for A/B testing data
  const expectedPatterns = [
    'client_id',
    'visitor_id',
    'visit_id',
    'process_step',
    'date_time',
    'gendr',
    'variation'
  ];

  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Check if this line looks like a header
    // Split by comma and normalize potential headers
    const potentialHeaders = line.split(',').map(normalizeHeader);

    // Count how many expected patterns we find
    const matchCount = potentialHeaders.filter(h =>
      expectedPatterns.some(pattern => h.toLowerCase().includes(pattern))
    ).length;

    // If we find at least 3 matching patterns, consider this the header
    if (matchCount >= 3) {
      return i;
    }
  }

  // Default to first line if no header found
  return 0;
}

/**
 * Parse a CSV line, handling quoted fields that may contain commas
 * This is a simple CSV parser that handles most common cases
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
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

function parseCSV(csvText: string): ABTestingData[] {
  // Split on various line endings and filter empty lines
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    console.warn('CSV file is empty');
    return [];
  }

  // Find the actual header row (skip preamble)
  const headerRowIndex = findHeaderRowIndex(lines);
  if (headerRowIndex > 0) {
    console.info(`Skipped ${headerRowIndex} preamble row(s) before header`);
  }

  // Parse and normalize headers
  const rawHeaders = parseCSVLine(lines[headerRowIndex]);
  const headers = rawHeaders.map(normalizeHeader);

  // Validate that we have the required columns
  const requiredColumns = ['client_id', 'process_step', 'gendr', 'Variation'];
  const missingColumns = requiredColumns.filter(
    col => !headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
  );

  if (missingColumns.length > 0) {
    console.error(`Missing required columns: ${missingColumns.join(', ')}`);
    console.error('Available columns:', headers);
    throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
  }

  const data: ABTestingData[] = [];
  const errors: string[] = [];

  // Parse data rows
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Parse and validate numeric fields with proper coercion
      const client_id = row.client_id ? Number(String(row.client_id).trim()) : 0;
      const clnt_tenure_yr = row.clnt_tenure_yr ? Number(String(row.clnt_tenure_yr).trim()) : 0;
      const clnt_tenure_mnth = row.clnt_tenure_mnth ? Number(String(row.clnt_tenure_mnth).trim()) : 0;
      const clnt_age = row.clnt_age ? Number(String(row.clnt_age).trim()) : 0;
      const num_accts = row.num_accts ? Number(String(row.num_accts).trim()) : 0;
      const bal = row.bal ? Number(String(row.bal).trim()) : 0;
      const calls_6_mnth = row.calls_6_mnth ? Number(String(row.calls_6_mnth).trim()) : 0;
      const logons_6_mnth = row.logons_6_mnth ? Number(String(row.logons_6_mnth).trim()) : 0;

      // Validate critical numeric fields
      if (isNaN(client_id)) {
        errors.push(`Row ${i}: Invalid client_id "${row.client_id}"`);
        continue;
      }

      // Parse categorical fields
      const gendr = (row.gendr || 'U').toUpperCase().trim();
      const variation = (row.Variation || 'Unknown').trim();

      data.push({
        client_id,
        visitor_id: row.visitor_id || '',
        visit_id: row.visit_id || '',
        process_step: row.process_step || '',
        date_time: row.date_time || '',
        clnt_tenure_yr,
        clnt_tenure_mnth,
        clnt_age,
        gendr,
        num_accts,
        bal,
        calls_6_mnth,
        logons_6_mnth,
        Variation: variation
      });
    } catch (error) {
      errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    console.warn(`Encountered ${errors.length} parsing errors, showing first 10:`, errors.slice(0, 10));
  }

  if (data.length === 0) {
    throw new Error('No valid data rows found in CSV');
  }

  console.info(`Successfully parsed ${data.length} rows from CSV`);
  return data;
}

export function getAgeGroup(clnt_age: number): AgeGroup {
  if (clnt_age >= 17.0 && clnt_age <= 30.5) return 'Age 17-30';
  if (clnt_age >= 31.0 && clnt_age <= 40.5) return 'Age 31-40';
  if (clnt_age >= 41.0 && clnt_age <= 55.5) return 'Age 41-55';
  if (clnt_age >= 56.0 && clnt_age <= 70.5) return 'Age 56-70';
  return 'Age 71 and above';
}

export function addAgeGroup(data: ABTestingData[]): ABTestingDataWithAgeGroup[] {
  return data.map(row => ({
    ...row,
    age_group: getAgeGroup(row.clnt_age)
  }));
}

export async function loadABTestingData(): Promise<ABTestingDataWithAgeGroup[]> {
  const data = await loadCSV('/data/a_b_testing_data.csv');
  return addAgeGroup(data);
}
