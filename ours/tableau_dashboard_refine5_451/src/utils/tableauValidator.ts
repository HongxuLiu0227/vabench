import type { ParsedRecord } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: ValidationSummary;
}

/**
 * Validation summary with statistics
 */
export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  recordsWithMissingFields: number;
  recordsWithInvalidDates: number;
  recordsWithInvalidNumbers: number;
  recordsWithZeroMeasures: number;
  dateRange: { min: Date; max: Date } | null;
  measureRanges: {
    sales: { min: number; max: number; avg: number; nonZeroCount: number };
    profit: { min: number; max: number; avg: number; nonZeroCount: number };
    quantity: { min: number; max: number; avg: number; nonZeroCount: number };
  };
}

/**
 * Validates that the data source meets Tableau requirements
 * This prevents silent bad parses that lead to all-zero charts or NaN filters
 */
export function validateTableauSource(data: ParsedRecord[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const summary: ValidationSummary = {
    totalRecords: data.length,
    validRecords: 0,
    recordsWithMissingFields: 0,
    recordsWithInvalidDates: 0,
    recordsWithInvalidNumbers: 0,
    recordsWithZeroMeasures: 0,
    dateRange: null,
    measureRanges: {
      sales: { min: Infinity, max: -Infinity, avg: 0, nonZeroCount: 0 },
      profit: { min: Infinity, max: -Infinity, avg: 0, nonZeroCount: 0 },
      quantity: { min: Infinity, max: -Infinity, avg: 0, nonZeroCount: 0 }
    }
  };

  // Check if we have any data at all
  if (data.length === 0) {
    errors.push('No records found in data source');
    return {
      isValid: false,
      errors,
      warnings,
      summary
    };
  }

  // Track date range
  const dates: Date[] = [];

  // Validate each record
  data.forEach((record, index) => {
    let recordIsValid = true;

    // Check for missing critical fields
    const criticalFields: Array<keyof ParsedRecord> = ['Sales', 'Order Date', 'Product Name'];
    const missingFields = criticalFields.filter(field => {
      const value = record[field];
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      summary.recordsWithMissingFields++;
      recordIsValid = false;
      if (index < 5) {
        errors.push(`Record ${index + 1}: Missing critical fields: ${missingFields.join(', ')}`);
      }
    }

    // Validate dates
    try {
      const orderDate = record['Order Date'];
      if (!(orderDate instanceof Date) || isNaN(orderDate.getTime())) {
        summary.recordsWithInvalidDates++;
        recordIsValid = false;
        if (index < 5) {
          errors.push(`Record ${index + 1}: Invalid Order Date`);
        }
      } else {
        dates.push(orderDate);
      }

      const shipDate = record['Ship Date'];
      if (!(shipDate instanceof Date) || isNaN(shipDate.getTime())) {
        summary.recordsWithInvalidDates++;
        recordIsValid = false;
      }
    } catch {
      summary.recordsWithInvalidDates++;
      recordIsValid = false;
    }

    // Validate numeric fields
    const numericFields = ['Sales', 'Profit', 'Quantity', 'Discount'] as const;
    numericFields.forEach(field => {
      const value = record[field];
      if (typeof value !== 'number' || isNaN(value)) {
        summary.recordsWithInvalidNumbers++;
        recordIsValid = false;
        if (index < 5) {
          errors.push(`Record ${index + 1}: Invalid ${field} value: ${value}`);
        }
      } else {
        // Update measure ranges
        const range = summary.measureRanges[field.toLowerCase() as keyof typeof summary.measureRanges];
        if (range) {
          range.min = Math.min(range.min, value);
          range.max = Math.max(range.max, value);
          if (value !== 0) {
            range.nonZeroCount++;
          }
        }
      }
    });

    // Check for records with all zero measures (would cause all-zero charts)
    const hasZeroMeasures = record.Sales === 0 && record.Profit === 0 && record.Quantity === 0;
    if (hasZeroMeasures) {
      summary.recordsWithZeroMeasures++;
    }

    if (recordIsValid) {
      summary.validRecords++;
    }
  });

  // Calculate date range
  if (dates.length > 0) {
    summary.dateRange = {
      min: new Date(Math.min(...dates.map(d => d.getTime()))),
      max: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }

  // Calculate averages (simple approximation)
  summary.measureRanges.sales.avg = summary.measureRanges.sales.max > -Infinity
    ? (summary.measureRanges.sales.min + summary.measureRanges.sales.max) / 2
    : 0;
  summary.measureRanges.profit.avg = summary.measureRanges.profit.max > -Infinity
    ? (summary.measureRanges.profit.min + summary.measureRanges.profit.max) / 2
    : 0;
  summary.measureRanges.quantity.avg = summary.measureRanges.quantity.max > -Infinity
    ? (summary.measureRanges.quantity.min + summary.measureRanges.quantity.max) / 2
    : 0;

  // Check for Jan 1970 dates (indicates parsing errors)
  if (summary.dateRange) {
    const epochDate = new Date(0);
    const isNearEpoch = Math.abs(summary.dateRange.min.getTime() - epochDate.getTime()) < 1000 ||
                       Math.abs(summary.dateRange.max.getTime() - epochDate.getTime()) < 1000;

    if (isNearEpoch) {
      errors.push('Date range includes epoch (Jan 1970), indicating date parsing errors');
    }
  }

  // Warnings for data quality issues
  if (summary.recordsWithZeroMeasures > data.length * 0.5) {
    warnings.push(
      `More than 50% of records have zero measures (Sales, Profit, Quantity). ` +
      `This may cause all-zero charts.`
    );
  }

  if (summary.measureRanges.sales.nonZeroCount === 0) {
    errors.push('All Sales values are zero. Charts will be empty.');
  }

  if (summary.measureRanges.sales.min < 0) {
    warnings.push('Negative Sales values detected. This may indicate data quality issues.');
  }

  if (summary.recordsWithInvalidDates > data.length * 0.1) {
    errors.push(
      `More than 10% of records have invalid dates. ` +
      `(${summary.recordsWithInvalidDates}/${data.length})`
    );
  }

  // Determine overall validity
  const isValid =
    errors.length === 0 &&
    summary.validRecords > 0 &&
    summary.recordsWithInvalidDates === 0 &&
    summary.recordsWithInvalidNumbers === 0;

  return {
    isValid,
    errors,
    warnings,
    summary
  };
}

/**
 * Logs validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  console.log('=== Tableau Source Validation ===');

  if (result.isValid) {
    console.log('✓ Data source is VALID');
  } else {
    console.log('✗ Data source is INVALID');
  }

  console.log('\nSummary:');
  console.log(`  Total records: ${result.summary.totalRecords}`);
  console.log(`  Valid records: ${result.summary.validRecords}`);
  console.log(`  Records with missing fields: ${result.summary.recordsWithMissingFields}`);
  console.log(`  Records with invalid dates: ${result.summary.recordsWithInvalidDates}`);
  console.log(`  Records with invalid numbers: ${result.summary.recordsWithInvalidNumbers}`);
  console.log(`  Records with zero measures: ${result.summary.recordsWithZeroMeasures}`);

  if (result.summary.dateRange) {
    console.log(`  Date range: ${result.summary.dateRange.min.toISOString().split('T')[0]} to ${result.summary.dateRange.max.toISOString().split('T')[0]}`);
  }

  console.log('\nMeasure Ranges:');
  console.log(`  Sales: min=${result.summary.measureRanges.sales.min.toFixed(2)}, ` +
             `max=${result.summary.measureRanges.sales.max.toFixed(2)}, ` +
             `non-zero=${result.summary.measureRanges.sales.nonZeroCount}`);
  console.log(`  Profit: min=${result.summary.measureRanges.profit.min.toFixed(2)}, ` +
             `max=${result.summary.measureRanges.profit.max.toFixed(2)}, ` +
             `non-zero=${result.summary.measureRanges.profit.nonZeroCount}`);
  console.log(`  Quantity: min=${result.summary.measureRanges.quantity.min}, ` +
             `max=${result.summary.measureRanges.quantity.max}, ` +
             `non-zero=${result.summary.measureRanges.quantity.nonZeroCount}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(error => console.log(`  ✗ ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
  }

  console.log('================================\n');
}

/**
 * Throws an error if validation fails
 * Use this to prevent running with bad data
 */
export function assertValidDataSource(data: ParsedRecord[]): void {
  const result = validateTableauSource(data);

  if (!result.isValid) {
    throw new Error(
      'Tableau data source validation failed:\n' +
      result.errors.map(e => `  - ${e}`).join('\n') +
      '\n\nCharts may display incorrectly or be empty. ' +
      'Please check the CSV data source.'
    );
  }

  if (result.warnings.length > 0) {
    console.warn('Tableau data source warnings:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
  }
}
