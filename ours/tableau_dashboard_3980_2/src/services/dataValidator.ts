/**
 * Tableau Data Validator
 * Ensures data is loaded deterministically and correctly
 * Run this validator after data loading to catch issues early
 */

import type { BikeTripData, HourRecord } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    startHourDistribution: { [hour: number]: number };
    endHourDistribution: { [hour: number]: number };
  };
}

/**
 * Validate that bike trip data meets Tableau requirements
 */
export function validateBikeTripData(data: BikeTripData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalRows: data.length,
    validRows: 0,
    invalidRows: 0,
    startHourDistribution: {} as { [hour: number]: number },
    endHourDistribution: {} as { [hour: number]: number }
  };

  // Validate each row
  data.forEach((row, index) => {
    let isValid = true;

    // Check required fields
    if (!row.starttime || row.starttime.trim() === '') {
      errors.push(`Row ${index + 1}: Missing starttime`);
      isValid = false;
    }

    if (!row.stoptime || row.stoptime.trim() === '') {
      errors.push(`Row ${index + 1}: Missing stoptime`);
      isValid = false;
    }

    // Check numeric fields
    if (isNaN(row.tripduration) || row.tripduration < 0) {
      errors.push(`Row ${index + 1}: Invalid tripduration: ${row.tripduration}`);
      isValid = false;
    }

    if (isNaN(row.start_station_id)) {
      warnings.push(`Row ${index + 1}: Invalid start_station_id: ${row.start_station_id}`);
    }

    if (isNaN(row.end_station_id)) {
      warnings.push(`Row ${index + 1}: Invalid end_station_id: ${row.end_station_id}`);
    }

    // Validate dates
    const startDate = new Date(row.starttime);
    const endDate = new Date(row.stoptime);

    if (isNaN(startDate.getTime())) {
      errors.push(`Row ${index + 1}: Invalid starttime format: ${row.starttime}`);
      isValid = false;
    } else {
      // Track start hour distribution
      const hour = startDate.getHours();
      stats.startHourDistribution[hour] = (stats.startHourDistribution[hour] || 0) + 1;
    }

    if (isNaN(endDate.getTime())) {
      errors.push(`Row ${index + 1}: Invalid stoptime format: ${row.stoptime}`);
      isValid = false;
    } else {
      // Track end hour distribution
      const hour = endDate.getHours();
      stats.endHourDistribution[hour] = (stats.endHourDistribution[hour] || 0) + 1;
    }

    if (isValid) {
      stats.validRows++;
    } else {
      stats.invalidRows++;
    }
  });

  // Check for data quality issues
  if (stats.validRows === 0) {
    errors.push('No valid data rows found');
  }

  if (stats.validRows < data.length * 0.9) {
    warnings.push(`More than 10% of rows are invalid: ${stats.validRows}/${data.length} valid`);
  }

  // Check hour distribution
  const startHours = Object.keys(stats.startHourDistribution).length;
  const endHours = Object.keys(stats.endHourDistribution).length;

  if (startHours === 0) {
    errors.push('No valid start hours found in data');
  } else if (startHours < 24) {
    warnings.push(`Only ${startHours} unique start hours found (expected 24)`);
  }

  if (endHours === 0) {
    errors.push('No valid end hours found in data');
  } else if (endHours < 24) {
    warnings.push(`Only ${endHours} unique end hours found (expected 24)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

/**
 * Validate aggregated hour records
 */
export function validateHourRecords(
  records: HourRecord[],
  type: 'start' | 'end'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check we have 24 hours (0-23)
  if (records.length !== 24) {
    errors.push(`Expected 24 hour records, got ${records.length}`);
  }

  // Check each hour is present
  for (let hour = 0; hour < 24; hour++) {
    const record = records.find(r => r.hour === hour);
    if (!record) {
      errors.push(`Missing hour ${hour} in ${type} hours`);
    } else {
      // Check count is valid
      if (typeof record.count !== 'number' || isNaN(record.count)) {
        errors.push(`Invalid count for hour ${hour}: ${record.count}`);
      } else if (record.count < 0) {
        errors.push(`Negative count for hour ${hour}: ${record.count}`);
      }
    }
  }

  // Check if all counts are zero
  const totalCount = records.reduce((sum, r) => sum + r.count, 0);
  if (totalCount === 0) {
    errors.push(`All ${type} hour counts are zero - data may not be loaded correctly`);
  }

  const stats = {
    totalRows: records.length,
    validRows: records.filter(r => r.count > 0).length,
    invalidRows: records.filter(r => r.count <= 0).length,
    startHourDistribution: type === 'start' ? records.reduce((acc, r) => ({ ...acc, [r.hour]: r.count }), {}) : {},
    endHourDistribution: type === 'end' ? records.reduce((acc, r) => ({ ...acc, [r.hour]: r.count }), {}) : {}
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

/**
 * Run comprehensive validation
 */
export function runComprehensiveValidation(
  rawData: BikeTripData[],
  startHours: HourRecord[],
  endHours: HourRecord[]
): {
  overallValid: boolean;
  rawDataValidation: ValidationResult;
  startHoursValidation: ValidationResult;
  endHoursValidation: ValidationResult;
} {
  const rawDataValidation = validateBikeTripData(rawData);
  const startHoursValidation = validateHourRecords(startHours, 'start');
  const endHoursValidation = validateHourRecords(endHours, 'end');

  const overallValid =
    rawDataValidation.isValid &&
    startHoursValidation.isValid &&
    endHoursValidation.isValid;

  return {
    overallValid,
    rawDataValidation,
    startHoursValidation,
    endHoursValidation
  };
}

/**
 * Log validation results to console
 */
export function logValidationResults(
  results: ReturnType<typeof runComprehensiveValidation>
): void {
  console.log('=== Tableau Data Validation Results ===\n');

  console.log('Overall Status:', results.overallValid ? '✓ VALID' : '✗ INVALID');
  console.log();

  // Raw data validation
  console.log('Raw Data Validation:');
  console.log(`  Total rows: ${results.rawDataValidation.stats.totalRows}`);
  console.log(`  Valid rows: ${results.rawDataValidation.stats.validRows}`);
  console.log(`  Invalid rows: ${results.rawDataValidation.stats.invalidRows}`);
  console.log(`  Unique start hours: ${Object.keys(results.rawDataValidation.stats.startHourDistribution).length}`);
  console.log(`  Unique end hours: ${Object.keys(results.rawDataValidation.stats.endHourDistribution).length}`);

  if (results.rawDataValidation.errors.length > 0) {
    console.log(`  Errors (${results.rawDataValidation.errors.length}):`);
    results.rawDataValidation.errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
    if (results.rawDataValidation.errors.length > 5) {
      console.log(`    ... and ${results.rawDataValidation.errors.length - 5} more`);
    }
  }

  if (results.rawDataValidation.warnings.length > 0) {
    console.log(`  Warnings (${results.rawDataValidation.warnings.length}):`);
    results.rawDataValidation.warnings.slice(0, 5).forEach(w => console.log(`    - ${w}`));
    if (results.rawDataValidation.warnings.length > 5) {
      console.log(`    ... and ${results.rawDataValidation.warnings.length - 5} more`);
    }
  }

  console.log();

  // Start hours validation
  console.log('Start Hours Validation:');
  console.log(`  Status: ${results.startHoursValidation.isValid ? '✓ VALID' : '✗ INVALID'}`);
  console.log(`  Total records: ${results.startHoursValidation.stats.totalRows}`);
  console.log(`  Non-zero hours: ${results.startHoursValidation.stats.validRows}`);

  if (results.startHoursValidation.errors.length > 0) {
    console.log(`  Errors:`);
    results.startHoursValidation.errors.forEach(e => console.log(`    - ${e}`));
  }

  console.log();

  // End hours validation
  console.log('End Hours Validation:');
  console.log(`  Status: ${results.endHoursValidation.isValid ? '✓ VALID' : '✗ INVALID'}`);
  console.log(`  Total records: ${results.endHoursValidation.stats.totalRows}`);
  console.log(`  Non-zero hours: ${results.endHoursValidation.stats.validRows}`);

  if (results.endHoursValidation.errors.length > 0) {
    console.log(`  Errors:`);
    results.endHoursValidation.errors.forEach(e => console.log(`    - ${e}`));
  }

  console.log('\n=====================================\n');
}
