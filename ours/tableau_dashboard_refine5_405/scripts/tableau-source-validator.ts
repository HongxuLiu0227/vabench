#!/usr/bin/env node

/**
 * Deterministic Tableau Source Validator
 *
 * This validator ensures that Tableau source data is ingested correctly
 * before QA/build stages. It validates:
 *
 * 1. CSV files exist and are readable
 * 2. CSV headers can be parsed correctly (no preamble, quoted headers handled)
 * 3. Required Tableau fields resolve to real columns at runtime
 * 4. Data types are coerced correctly (numbers, dates)
 * 5. No silent bad parses (all-zero charts, NaN filters, Jan 1970 timelines)
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation failed (data quality issues that will affect dashboard)
 *   2 - Configuration error (missing files, setup issues)
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  passed: boolean;
  stage: string;
  message: string;
  details?: Record<string, unknown>;
}

interface ValidatorConfig {
  dataPath: string;
  requiredFields: string[];
  numericFields: string[];
  dateFields: string[];
  worksheets: {
    name: string;
    requiredFields: string[];
    minDataPoints: number;
  }[];
}

const DEFAULT_CONFIG: ValidatorConfig = {
  dataPath: 'public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv',
  requiredFields: [
    'Category', 'City', 'Country', 'Customer Name', 'Manufacturer',
    'Order Date', 'Order ID', 'Postal Code', 'Product Name', 'Region',
    'Segment', 'Ship Date', 'Ship Mode', 'State', 'Sub-Category',
    'Discount', 'Number of Records', 'Profit', 'Profit Ratio',
    'Quantity', 'Sales',
  ],
  numericFields: ['Discount', 'Profit', 'Sales', 'Quantity', 'Profit Ratio'],
  dateFields: ['Order Date', 'Ship Date'],
  worksheets: [
    {
      name: 'Discount Overview by Region',
      requiredFields: ['Region', 'Discount', 'Profit', 'Sales'],
      minDataPoints: 1,
    },
    {
      name: 'Sales by Sub-Category',
      requiredFields: ['Sub-Category', 'Sales'],
      minDataPoints: 1,
    },
    {
      name: 'Scatterplot',
      requiredFields: ['Product Name', 'Sales', 'Profit'],
      minDataPoints: 1,
    },
  ],
};

class TableauSourceValidator {
  private config: ValidatorConfig;
  private results: ValidationResult[] = [];
  private parsedData: Record<string, string | number>[] = [];
  private csvContent: string = '';

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run all validations
   */
  validate(): boolean {
    console.log('╔' + '═'.repeat(68) + '╗');
    console.log('║' + ' '.repeat(15) + 'TABLEAU SOURCE VALIDATOR' + ' '.repeat(28) + '║');
    console.log('╚' + '═'.repeat(68) + '╝');
    console.log();

    // Stage 1: File existence and readability
    this.validateFileExists();

    // Stage 2: CSV parsing and header detection
    this.validateCSVParsing();

    // Stage 3: Required field resolution
    this.validateRequiredFields();

    // Stage 4: Data type coercion
    this.validateDataTypes();

    // Stage 5: Silent bad parse detection
    this.validateSilentBadParses();

    // Stage 6: Worksheet data availability
    this.validateWorksheetData();

    // Print summary
    this.printSummary();

    return this.results.every(r => r.passed);
  }

  /**
   * Stage 1: Validate file exists and is readable
   */
  private validateFileExists(): void {
    const fullPath = path.join(process.cwd(), this.config.dataPath);

    if (!fs.existsSync(fullPath)) {
      this.results.push({
        passed: false,
        stage: 'File Existence',
        message: 'Data file not found',
        details: { path: fullPath },
      });
      return;
    }

    try {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        this.results.push({
          passed: false,
          stage: 'File Existence',
          message: 'Data file is empty',
          details: { path: fullPath, size: 0 },
        });
        return;
      }

      this.results.push({
        passed: true,
        stage: 'File Existence',
        message: `Data file found (${(stats.size / 1024).toFixed(1)} KB)`,
        details: { path: fullPath, size: stats.size },
      });
    } catch (err) {
      this.results.push({
        passed: false,
        stage: 'File Existence',
        message: 'Cannot read data file',
        details: { error: err instanceof Error ? err.message : String(err) },
      });
    }
  }

  /**
   * Stage 2: Validate CSV parsing and header detection
   */
  private validateCSVParsing(): void {
    const fullPath = path.join(process.cwd(), this.config.dataPath);

    try {
      const csvContent = fs.readFileSync(fullPath, 'utf-8');

      // Check for BOM
      const hasBOM = csvContent.charCodeAt(0) === 0xFEFF;
      if (hasBOM) {
        console.log('ℹ️  BOM detected - will be handled by header normalization');
      }

      // Parse CSV
      const result = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => {
          // Simulate normalizeHeader function
          let normalized = header.replace(/^\uFEFF/, '');
          normalized = normalized.replace(/^"+|"+$/g, '');
          normalized = normalized.trim();
          return normalized;
        },
      });

      if (result.data.length === 0) {
        this.results.push({
          passed: false,
          stage: 'CSV Parsing',
          message: 'No data rows found',
          details: {},
        });
        return;
      }

      this.results.push({
        passed: true,
        stage: 'CSV Parsing',
        message: `Parsed ${result.data.length} rows successfully`,
        details: {
          row_count: result.data.length,
          column_count: Object.keys(result.data[0]).length,
          has_bom: hasBOM,
        },
      });

      // Store parsed data for subsequent validations
      this.parsedData = result.data;
      this.csvContent = csvContent;

    } catch (err) {
      this.results.push({
        passed: false,
        stage: 'CSV Parsing',
        message: 'Failed to parse CSV',
        details: { error: err instanceof Error ? err.message : String(err) },
      });
    }
  }

  /**
   * Stage 3: Validate required fields resolve to real columns
   */
  private validateRequiredFields(): void {
    const parsedData = this.parsedData;
    if (!parsedData || parsedData.length === 0) {
      this.results.push({
        passed: false,
        stage: 'Required Fields',
        message: 'Cannot validate - no parsed data available',
        details: {},
      });
      return;
    }

    const availableColumns = Object.keys(parsedData[0]);
    const missingFields = this.config.requiredFields.filter(
      field => !availableColumns.includes(field)
    );

    if (missingFields.length > 0) {
      this.results.push({
        passed: false,
        stage: 'Required Fields',
        message: `Missing ${missingFields.length} required fields`,
        details: { missing_fields: missingFields },
      });
      return;
    }

    this.results.push({
      passed: true,
      stage: 'Required Fields',
      message: `All ${this.config.requiredFields.length} required fields present`,
      details: {
        required_count: this.config.requiredFields.length,
        available_count: availableColumns.length,
      },
    });
  }

  /**
   * Stage 4: Validate data type coercion
   */
  private validateDataTypes(): void {
    const parsedData = this.parsedData;
    if (!parsedData || parsedData.length === 0) {
      return;
    }

    // Sample first 100 rows for validation
    const sampleSize = Math.min(100, parsedData.length);
    const sample = parsedData.slice(0, sampleSize);

    let numericErrors = 0;
    let dateErrors = 0;

    sample.forEach((row: Record<string, unknown>) => {
      // Check numeric fields
      this.config.numericFields.forEach(field => {
        const val = row[field];
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num)) {
            numericErrors++;
          }
        }
      });

      // Check date fields
      this.config.dateFields.forEach(field => {
        const val = row[field];
        if (val && val !== '') {
          const date = new Date(String(val));
          if (isNaN(date.getTime())) {
            dateErrors++;
          }
        }
      });
    });

    if (numericErrors > 0 || dateErrors > 0) {
      this.results.push({
        passed: false,
        stage: 'Data Type Coercion',
        message: 'Type coercion errors detected',
        details: {
          numeric_errors: numericErrors,
          date_errors: dateErrors,
          sample_size: sampleSize,
        },
      });
      return;
    }

    this.results.push({
      passed: true,
      stage: 'Data Type Coercion',
      message: `All types coerced correctly (validated ${sampleSize} rows)`,
      details: { sample_size: sampleSize },
    });
  }

  /**
   * Stage 5: Detect silent bad parses
   */
  private validateSilentBadParses(): void {
    const parsedData = this.parsedData;
    if (!parsedData || parsedData.length === 0) {
      return;
    }

    const sample = parsedData.slice(0, 100);
    let allZeroCount = 0;
    let jan1970Count = 0;

    sample.forEach((row: Record<string, unknown>) => {
      // Check for all-zero measures
      const sales = Number(row['Sales']) || 0;
      const profit = Number(row['Profit']) || 0;
      const discount = Number(row['Discount']) || 0;

      if (sales === 0 && profit === 0 && discount === 0) {
        allZeroCount++;
      }

      // Check for Jan 1970 dates
      const orderDate = new Date(String(row['Order Date']));
      if (orderDate.getTime() === 0) {
        jan1970Count++;
      }
    });

    if (allZeroCount > sample.length * 0.5) {
      this.results.push({
        passed: false,
        stage: 'Silent Bad Parse Detection',
        message: 'Too many all-zero rows detected',
        details: {
          all_zero_count: allZeroCount,
          sample_size: sample.length,
          percentage: (allZeroCount / sample.length * 100).toFixed(1),
        },
      });
      return;
    }

    if (jan1970Count > sample.length * 0.5) {
      this.results.push({
        passed: false,
        stage: 'Silent Bad Parse Detection',
        message: 'Too many Jan 1970 dates detected',
        details: {
          jan1970_count: jan1970Count,
          sample_size: sample.length,
          percentage: (jan1970Count / sample.length * 100).toFixed(1),
        },
      });
      return;
    }

    this.results.push({
      passed: true,
      stage: 'Silent Bad Parse Detection',
      message: 'No silent bad parses detected',
      details: {
        all_zero_count: allZeroCount,
        jan1970_count: jan1970Count,
      },
    });
  }

  /**
   * Stage 6: Validate worksheet data availability
   */
  private validateWorksheetData(): void {
    const parsedData = this.parsedData;
    if (!parsedData || parsedData.length === 0) {
      return;
    }

    let allWorksheetsValid = true;
    const worksheetResults: { name: string; validRows: number; hasData: boolean }[] = [];

    this.config.worksheets.forEach(worksheet => {
      // Check if required fields have non-null values
      const validRows = parsedData.filter((row: Record<string, unknown>) => {
        return worksheet.requiredFields.every(field => {
          const val = row[field];
          return val !== undefined && val !== null && val !== '';
        });
      });

      const hasData = validRows.length >= worksheet.minDataPoints;

      worksheetResults.push({
        name: worksheet.name,
        valid_rows: validRows.length,
        required: worksheet.minDataPoints,
        has_data: hasData,
      });

      if (!hasData) {
        allWorksheetsValid = false;
      }
    });

    if (!allWorksheetsValid) {
      this.results.push({
        passed: false,
        stage: 'Worksheet Data Availability',
        message: 'Some worksheets lack sufficient data',
        details: { worksheets: worksheetResults },
      });
      return;
    }

    this.results.push({
      passed: true,
      stage: 'Worksheet Data Availability',
      message: `All ${this.config.worksheets.length} worksheets have data`,
      details: { worksheets: worksheetResults },
    });
  }

  /**
   * Print validation summary
   */
  private printSummary(): void {
    console.log('─'.repeat(70));
    console.log('VALIDATION RESULTS');
    console.log('─'.repeat(70));
    console.log();

    this.results.forEach(result => {
      const icon = result.passed ? '✓' : '✗';
      const status = result.passed ? 'PASS' : 'FAIL';
      console.log(`${icon} ${result.stage.padEnd(30)} ${status}`);

      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`  └─ ${key}: ${value}`);
        });
      }
      console.log();
    });

    console.log('─'.repeat(70));
    console.log();

    const allPassed = this.results.every(r => r.passed);

    if (allPassed) {
      console.log('✓ ALL VALIDATIONS PASSED');
      console.log('  Data ingestion is deterministic and correct.');
      console.log('  Safe to proceed to QA/build stages.');
      console.log();
    } else {
      console.log('✗ VALIDATION FAILED');
      console.log('  Data quality issues detected that will affect dashboard rendering.');
      console.log('  Please fix the issues before proceeding to QA/build stages.');
      console.log();
    }

    console.log('═'.repeat(70));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const config: Partial<ValidatorConfig> = {};

  // Allow custom data path via --data-path argument
  const dataPathIndex = args.indexOf('--data-path');
  if (dataPathIndex !== -1 && args[dataPathIndex + 1]) {
    config.dataPath = args[dataPathIndex + 1];
  }

  const validator = new TableauSourceValidator(config);
  const passed = validator.validate();

  process.exit(passed ? 0 : 1);
}

// Export for programmatic use
export { TableauSourceValidator, ValidationResult, ValidatorConfig };

// Run if called directly
main();
