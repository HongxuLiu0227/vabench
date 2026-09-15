/**
 * Deterministic Tableau Source Validator
 *
 * This validator ensures that:
 * 1. CSV files are parsed correctly with proper header detection
 * 2. All required Tableau fields from the spec resolve to real columns
 * 3. No silent bad parses (NaN, infinity, Jan 1970 dates, all-zero metrics)
 * 4. Data quality checks pass before dashboard rendering
 */

import Papa from 'papaparse';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    columns: string[];
    numericFieldStats: Record<string, { min: number; max: number; avg: number; nullCount: number }>;
  };
}

interface TableauFieldMapping {
  fieldName: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'none';
  expectedType: 'number' | 'string' | 'date';
}

// Required field mappings based on tableau_spec.json and tableau_render_contract.json
const REQUIRED_FIELDS: TableauFieldMapping[] = [
  { fieldName: 'Rank', expectedType: 'number' },
  { fieldName: 'Name', expectedType: 'string' },
  { fieldName: 'Platform', expectedType: 'string' },
  { fieldName: 'Year', expectedType: 'number' },
  { fieldName: 'Genre', expectedType: 'string' },
  { fieldName: 'Publisher', expectedType: 'string' },
  { fieldName: 'NA_Sales', expectedType: 'number' },
  { fieldName: 'EU_Sales', expectedType: 'number' },
  { fieldName: 'JP_Sales', expectedType: 'number' },
  { fieldName: 'Other_Sales', expectedType: 'number' },
  { fieldName: 'Global_Sales', expectedType: 'number' },
  { fieldName: 'Averaged_Sales', expectedType: 'number' },
];

// Fields used in aggregations
const AGGREGATION_FIELDS = ['Global_Sales', 'Averaged_Sales', 'NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales'];

// Fields used for filtering/grouping
const DIMENSION_FIELDS = ['Genre', 'Publisher', 'Platform', 'Year'];

/**
 * Extract all unique field references from Tableau spec files
 * This ensures we validate all fields actually used in the dashboard
 */
function extractFieldsFromSpec(spec: any, debug = false): Set<string> {
  const fields = new Set<string>();
  let depth = 0;
  const maxDepth = 20;

  function extractFromObject(obj: any): void {
    if (depth > maxDepth) return;

    // Check if this is a string that looks like a field reference
    if (typeof obj === 'string') {
      // Pattern: [federated.xxx].[none:Field:...] or [Field] or just Field
      // Matches strings like:
      // - "[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year (copy)_413205318226034688:qk]"
      // - "[none:Genre:nk]"
      // - "[avg:Global_Sales:qk]"
      if ((obj.includes('[') && obj.includes(']')) && obj.includes(':')) {
        fields.add(obj);
        if (debug && fields.size <= 5) {
          console.log(`[Spec Parser] Found field: ${obj.substring(0, 80)}`);
        }
      }
    }

    // Check arrays
    if (Array.isArray(obj)) {
      depth++;
      obj.forEach(item => extractFromObject(item));
      depth--;
      return;
    }

    // Recursively search for field references in objects
    if (typeof obj === 'object' && obj !== null) {
      depth++;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          extractFromObject(obj[key]);
        }
      }
      depth--;
    }
  }

  extractFromObject(spec);
  if (debug) {
    console.log(`[Spec Parser] Total fields extracted: ${fields.size}`);
  }
  return fields;
}

/**
 * Load and parse Tableau spec files to extract required fields
 */
async function loadRequiredFieldsFromSpecs(): Promise<string[]> {
  const specFields: string[] = [];

  try {
    // Check if we're in Node environment by checking for process.versions.node
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

    if (isNode) {
      // Running in Node/test environment - read from filesystem
      // Use dynamic import to avoid requiring in browser
      const fs = await import('fs');
      const path = await import('path');

      const specPath = path.join(process.cwd(), 'docs/tableau_spec.json');
      const contractPath = path.join(process.cwd(), 'docs/tableau_render_contract.json');

      console.log(`[Spec Parser] Looking for specs at:`, { specPath, contractPath });

      if (fs.existsSync(specPath)) {
        console.log(`[Spec Parser] Reading tableau_spec.json from ${specPath}`);
        const specContent = fs.readFileSync(specPath, 'utf-8');
        const spec = JSON.parse(specContent);
        const fields = extractFieldsFromSpec(spec, false); // Disable debug
        console.log(`[Spec Parser] Found ${fields.size} field references in tableau_spec.json`);
        specFields.push(...Array.from(fields));
      } else {
        console.log(`[Spec Parser] tableau_spec.json not found at ${specPath}`);
      }

      if (fs.existsSync(contractPath)) {
        console.log(`[Spec Parser] Reading tableau_render_contract.json from ${contractPath}`);
        const contractContent = fs.readFileSync(contractPath, 'utf-8');
        const contract = JSON.parse(contractContent);
        const fields = extractFieldsFromSpec(contract, false); // Disable debug
        console.log(`[Spec Parser] Found ${fields.size} field references in tableau_render_contract.json`);
        specFields.push(...Array.from(fields));
      } else {
        console.log(`[Spec Parser] tableau_render_contract.json not found at ${contractPath}`);
      }
    } else {
      // Running in browser - use fetch
      // Try to load tableau_spec.json
      const specResponse = await fetch('/docs/tableau_spec.json');
      if (specResponse.ok) {
        const spec = await specResponse.json();
        const fields = extractFieldsFromSpec(spec);
        console.log(`[Spec Parser] Found ${fields.size} field references in tableau_spec.json`);
        specFields.push(...Array.from(fields));
      }

      // Try to load tableau_render_contract.json
      const contractResponse = await fetch('/docs/tableau_render_contract.json');
      if (contractResponse.ok) {
        const contract = await contractResponse.json();
        const fields = extractFieldsFromSpec(contract);
        console.log(`[Spec Parser] Found ${fields.size} field references in tableau_render_contract.json`);
        specFields.push(...Array.from(fields));
      }
    }
  } catch (error) {
    console.warn('[Spec Parser] Could not load spec files:', error);
  }

  return specFields;
}

/**
 * Extract base field name from Tableau field reference
 * Handles patterns like:
 * - "[federated.xxx].[none:Year (copy)_413205318226034688:qk]" -> "Year"
 * - "[none:Year (copy)_413205318226034688:qk]" -> "Year"
 * - "Year (copy)_413205318226034688" -> "Year"
 */
function extractBaseFieldName(tableauFieldRef: string): string {
  // Remove tableau federation prefix if present
  let fieldName = tableauFieldRef.replace(/\[federated\.[^\]]+\]\./g, '');
  // Remove brackets
  fieldName = fieldName.replace(/\[|\]/g, '');

  // Extract field name from Tableau internal format like "none:Year (copy)_413205318226034688:qk"
  // or "avg:Global_Sales:qk" or "attr:Platform:nk"
  const parts = fieldName.split(':');
  if (parts.length >= 2) {
    fieldName = parts[1]; // Get the middle part (actual field name)
  } else if (parts.length === 1) {
    fieldName = parts[0];
  }

  // Handle "Year (copy)_<digits>" pattern - extract base field name
  const copyPattern = /^(.+?)\s*\(copy\).*$/;
  const match = fieldName.match(copyPattern);

  if (match) {
    const baseFieldName = match[1].trim();
    console.log(`[Field Mapper] Mapping "${tableauFieldRef}" -> "${fieldName}" -> "${baseFieldName}"`);
    return baseFieldName;
  }

  console.log(`[Field Mapper] Mapping "${tableauFieldRef}" -> "${fieldName}"`);
  return fieldName;
}

/**
 * Check if a required Tableau field can be satisfied by a CSV column
 * considering Tableau internal field name mappings
 */
function findCsvColumnForTableauField(tableauFieldName: string, csvHeaders: string[]): string | null {
  // First try direct match (normalized)
  const normalizedFieldName = normalizeHeader(tableauFieldName);
  const directMatch = csvHeaders.find(h => normalizeHeader(h) === normalizedFieldName);
  if (directMatch) {
    return directMatch;
  }

  // Try extracting base field name from Tableau internal references
  const baseFieldName = extractBaseFieldName(tableauFieldName);
  const normalizedBaseName = normalizeHeader(baseFieldName);
  const baseMatch = csvHeaders.find(h => normalizeHeader(h) === normalizedBaseName);

  if (baseMatch) {
    console.log(`[Field Mapper] Field "${tableauFieldName}" satisfied by CSV column "${baseMatch}" (via mapping to "${baseFieldName}")`);
    return baseMatch;
  }

  return null;
}

/**
 * Normalize CSV headers by removing quotes, extra spaces, and special characters
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/["'"]/g, ''); // Remove any internal quotes
}

/**
 * Detect and skip preamble rows before the real header
 * Returns the line number where the actual header starts
 */
function detectHeaderLine(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    const normalizedHeaders = line.split(',').map(h => normalizeHeader(h));

    // Check if this line looks like a header (contains known field names)
    const hasKnownFields = REQUIRED_FIELDS.some(field =>
      normalizedHeaders.some(h => h.includes(field.fieldName))
    );

    if (hasKnownFields) {
      return i;
    }
  }

  // Default to first line if no header detected
  return 0;
}

/**
 * Validate a single numeric value
 */
function validateNumericValue(value: any, fieldName: string, errors: string[]): boolean {
  if (value === null || value === undefined || value === '') {
    return true; // Null values are okay, will be counted
  }

  const num = Number(value);

  if (isNaN(num)) {
    errors.push(`Invalid numeric value in field "${fieldName}": "${value}" is not a number`);
    return false;
  }

  if (!isFinite(num)) {
    errors.push(`Invalid numeric value in field "${fieldName}": "${value}" is infinite`);
    return false;
  }

  if (num < 0) {
    errors.push(`Warning: Negative value in field "${fieldName}": ${num}`);
  }

  return true;
}

/**
 * Validate year field for Jan 1970 issues (Unix epoch timestamps)
 */
function validateYearField(yearValues: (number | null)[]): string[] {
  const warnings: string[] = [];

  yearValues.forEach(year => {
    if (year !== null) {
      // Check for Unix epoch timestamps (values that look like seconds since 1970)
      if (year > 1000000000 && year < 2000000000) {
        warnings.push(`Potential Unix epoch timestamp detected in Year field: ${year}. This should be a 4-digit year.`);
      }

      // Check for reasonable year range (video games didn't exist before 1950 and shouldn't be after current year + 5)
      if (year < 1950 || year > 2030) {
        warnings.push(`Year value out of reasonable range: ${year}`);
      }
    }
  });

  return warnings;
}

/**
 * Check for all-zero metrics that indicate bad parses
 */
function checkForAllZeroMetrics(data: any[], fieldName: string): string[] {
  const errors: string[] = [];

  const allZero = data.every(row => {
    const val = Number(row[fieldName]);
    return val === 0 || isNaN(val);
  });

  if (allZero && data.length > 0) {
    errors.push(`All values in field "${fieldName}" are zero or NaN. This indicates a parsing error.`);
  }

  return errors;
}

/**
 * Main validation function
 */
export async function validateTableauSource(csvUrl: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`[Tableau Source Validator] Starting validation for: ${csvUrl}`);

  try {
    // Fetch CSV
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());

    console.log(`[Tableau Source Validator] CSV loaded. Total lines: ${lines.length}`);

    // Detect header line
    const headerLineIndex = detectHeaderLine(lines);
    if (headerLineIndex > 0) {
      warnings.push(`Preamble detected: Skipping ${headerLineIndex} lines before header`);
    }

    // Parse CSV with PapaParse
    const parseResult = Papa.parse(lines.slice(headerLineIndex).join('\n'), {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(err => {
        errors.push(`CSV parsing error at row ${err.row}: ${err.message}`);
      });
    }

    const data = parseResult.data;
    console.log(`[Tableau Source Validator] Parsed ${data.length} rows`);

    // Normalize headers
    const rawHeaders = parseResult.meta.fields || [];
    const normalizedHeaders = rawHeaders.map(normalizeHeader);
    console.log(`[Tableau Source Validator] Raw headers:`, rawHeaders);
    console.log(`[Tableau Source Validator] Normalized headers:`, normalizedHeaders);

    // Check for required fields and build a mapping from required field names to CSV column names
    const missingFields: string[] = [];
    const presentFields = new Set<string>();
    const fieldToCsvColumnMap: Record<string, string> = {};

    // First, check base REQUIRED_FIELDS
    REQUIRED_FIELDS.forEach(requiredField => {
      // Try to find the CSV column that satisfies this required field
      // This handles Tableau internal field names like "Year (copy)_413205318226034688"
      const csvColumn = findCsvColumnForTableauField(requiredField.fieldName, rawHeaders);

      if (csvColumn) {
        presentFields.add(requiredField.fieldName);
        fieldToCsvColumnMap[requiredField.fieldName] = csvColumn;
      } else {
        missingFields.push(requiredField.fieldName);
      }
    });

    // Second, load and validate fields from Tableau spec files
    const specFields = await loadRequiredFieldsFromSpecs();
    const specFieldValidationErrors: string[] = [];

    specFields.forEach(tableauFieldRef => {
      const baseFieldName = extractBaseFieldName(tableauFieldRef);
      const csvColumn = findCsvColumnForTableauField(baseFieldName, rawHeaders);

      if (csvColumn) {
        // Field exists, add to mapping if not already present
        if (!fieldToCsvColumnMap[baseFieldName]) {
          fieldToCsvColumnMap[baseFieldName] = csvColumn;
        }
      } else {
        // Field doesn't exist in CSV
        specFieldValidationErrors.push(`${tableauFieldRef} (mapped to: ${baseFieldName})`);
      }
    });

    if (specFieldValidationErrors.length > 0) {
      errors.push(`Missing required fields from Tableau specs:\n  - ${specFieldValidationErrors.join('\n  - ')}`);
    }

    if (missingFields.length > 0) {
      errors.push(`Missing required base fields: ${missingFields.join(', ')}`);
    }

    // Calculate statistics for numeric fields
    const numericFieldStats: Record<string, { min: number; max: number; avg: number; nullCount: number }> = {};

    REQUIRED_FIELDS.filter(f => f.expectedType === 'number').forEach(field => {
      const csvColumn = fieldToCsvColumnMap[field.fieldName];
      if (!csvColumn) {
        // Field not found, skip statistics
        return;
      }

      const values = data.map((row: any) => row[csvColumn]);

      const validValues = values
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));

      const nullCount = values.filter(v => v === null || v === undefined || v === '' || isNaN(Number(v))).length;

      if (validValues.length > 0) {
        numericFieldStats[field.fieldName] = {
          min: Math.min(...validValues),
          max: Math.max(...validValues),
          avg: validValues.reduce((a, b) => a + b, 0) / validValues.length,
          nullCount,
        };
      } else {
        numericFieldStats[field.fieldName] = {
          min: 0,
          max: 0,
          avg: 0,
          nullCount: values.length,
        };
      }
    });

    // Validate numeric fields
    data.forEach((row: any) => {
      REQUIRED_FIELDS.filter(f => f.expectedType === 'number').forEach(field => {
        const csvColumn = fieldToCsvColumnMap[field.fieldName];
        if (!csvColumn) {
          // Field not found, skip validation
          return;
        }

        if (row[csvColumn] !== null && row[csvColumn] !== undefined) {
          validateNumericValue(row[csvColumn], field.fieldName, errors);
        }
      });
    });

    // Validate Year field
    const yearCsvColumn = fieldToCsvColumnMap['Year'];
    if (yearCsvColumn) {
      const yearValues = data.map((row: any) => row[yearCsvColumn]).map(v => v === null || v === undefined ? null : Number(v));
      const yearWarnings = validateYearField(yearValues);
      warnings.push(...yearWarnings);
    }

    // Check for all-zero metrics
    AGGREGATION_FIELDS.forEach(field => {
      const csvColumn = fieldToCsvColumnMap[field];
      if (csvColumn) {
        const zeroErrors = checkForAllZeroMetrics(data, csvColumn);
        errors.push(...zeroErrors);
      }
    });

    // Check dimension fields for empty values
    DIMENSION_FIELDS.forEach(field => {
      const csvColumn = fieldToCsvColumnMap[field];
      if (csvColumn) {
        const emptyCount = data.filter((row: any) => !row[csvColumn] || row[csvColumn].toString().trim() === '').length;
        if (emptyCount > 0) {
          warnings.push(`Field "${field}" has ${emptyCount} empty values (${((emptyCount / data.length) * 100).toFixed(1)}%)`);
        }
      }
    });

    // Check for duplicate rows (by Name)
    const nameCsvColumn = fieldToCsvColumnMap['Name'];
    if (nameCsvColumn) {
      const names = data.map((row: any) => row[nameCsvColumn]);
      const uniqueNames = new Set(names);
      if (names.length !== uniqueNames.size) {
        warnings.push(`Duplicate game names detected: ${names.length - uniqueNames.size} duplicates found`);
      }
    }

    console.log(`[Tableau Source Validator] Validation complete. Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return {
      success: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: data.length,
        columns: normalizedHeaders,
        numericFieldStats,
      },
    };

  } catch (error) {
    console.error('[Tableau Source Validator] Validation failed:', error);
    return {
      success: false,
      errors: [`Validation exception: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
      summary: {
        totalRows: 0,
        columns: [],
        numericFieldStats: {},
      },
    };
  }
}

/**
 * Run validation and log results
 */
export async function runValidationAndLog(csvUrl: string = '/data/processed_data_All.csv'): Promise<boolean> {
  console.log('='.repeat(80));
  console.log('TABLEAU SOURCE VALIDATOR');
  console.log('='.repeat(80));

  const result = await validateTableauSource(csvUrl);

  console.log('\n📊 SUMMARY:');
  console.log(`  Total Rows: ${result.summary.totalRows}`);
  console.log(`  Columns Found: ${result.summary.columns.length}`);
  console.log(`  ${result.summary.columns.map(c => `    - ${c}`).join('\n')}`);

  console.log('\n📈 NUMERIC FIELD STATISTICS:');
  Object.entries(result.summary.numericFieldStats).forEach(([field, stats]) => {
    console.log(`  ${field}:`);
    console.log(`    Min: ${stats.min.toFixed(2)}`);
    console.log(`    Max: ${stats.max.toFixed(2)}`);
    console.log(`    Avg: ${stats.avg.toFixed(2)}`);
    console.log(`    Null Count: ${stats.nullCount}`);
  });

  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(e => console.log(`  - ${e}`));
    console.log('\n❌ VALIDATION FAILED');
    return false;
  } else {
    console.log('\n✅ VALIDATION PASSED');
    return true;
  }
}
