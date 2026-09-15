/**
 * Tableau Field Validator
 *
 * This utility ensures that all fields referenced in the Tableau spec
 * can be resolved to actual columns in the CSV data at runtime.
 * It validates the data contract between the spec and the source data.
 */

import type { ProcessedTripData } from '../types/data';
import { TABLEAU_FIELD_MAPPING } from '../types/data';

/**
 * Fields required by the Tableau spec
 * Extracted from tableau_spec.json and tableau_render_contract.json
 */
const REQUIRED_TABLEAU_FIELDS = [
  // Core trip fields
  'TripID',
  'tripduration',
  'starttime',
  'stoptime',

  // Start station fields
  'start station id',
  'start station name',
  'start station latitude',
  'start station longitude',

  // End station fields
  'end station id',
  'end station name',
  'end station latitude',
  'end station longitude',

  // Rider fields
  'bikeid',
  'usertype',
  'birth year',
  'gender',

  // Derived/calculated fields
  'Gender Text',
  'Month',
  'Year',
];

/**
 * Validate that all required Tableau fields can be resolved
 * @param sampleData A sample row from the processed data
 * @returns Validation result with any missing or problematic fields
 */
export function validateTableauFields(
  sampleData: ProcessedTripData | null
): {
  isValid: boolean;
  missingFields: string[];
  resolvedFields: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const missingFields: string[] = [];
  const resolvedFields: string[] = [];

  // If no data provided, we can't validate
  if (!sampleData) {
    return {
      isValid: false,
      missingFields: REQUIRED_TABLEAU_FIELDS,
      resolvedFields: [],
      errors: ['Tableau field validation failed: no data record provided. Ensure data loading completed successfully before calling validateTableauFields.'],
    };
  }

  // Check each required field
  for (const tableauField of REQUIRED_TABLEAU_FIELDS) {
    const internalField = TABLEAU_FIELD_MAPPING[tableauField];

    if (!internalField) {
      errors.push(
        `Tableau field "${tableauField}" has no mapping to internal field. ` +
        `Please add it to TABLEAU_FIELD_MAPPING in types/data.ts`
      );
      continue;
    }

    const value = sampleData[internalField];

    // Check if the field exists and has a valid value
    if (value === undefined || value === null) {
      missingFields.push(tableauField);
    } else {
      resolvedFields.push(tableauField);

      // Additional validation for specific field types
      if (internalField === 'startTime' || internalField === 'stopTime') {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          errors.push(
            `Field "${tableauField}" → "${internalField}" has invalid date value: ${value}`
          );
        }
      } else if (typeof value === 'number') {
        if (isNaN(value)) {
          errors.push(
            `Field "${tableauField}" → "${internalField}" is NaN`
          );
        }
      }
    }
  }

  const isValid = missingFields.length === 0 && errors.length === 0;

  // Log validation results
  if (isValid) {
    console.log('✓ All Tableau fields validated successfully');
    console.log(`  Resolved ${resolvedFields.length} required fields`);
  } else {
    console.error('✗ Tableau field validation failed:');
    if (missingFields.length > 0) {
      console.error(`  Missing fields: ${missingFields.join(', ')}`);
    }
    if (errors.length > 0) {
      errors.forEach(err => console.error(`  ${err}`));
    }
  }

  return {
    isValid,
    missingFields,
    resolvedFields,
    errors,
  };
}

/**
 * Validate a complete dataset for data quality issues
 * Checks for common problems that could cause silent failures
 */
export function validateDataQuality(data: ProcessedTripData[]): {
  isValid: boolean;
  issues: string[];
  stats: {
    totalRecords: number;
    invalidDates: number;
    missingValues: number;
    zeroValues: number;
  };
} {
  const issues: string[] = [];
  const stats = {
    totalRecords: data.length,
    invalidDates: 0,
    missingValues: 0,
    zeroValues: 0,
  };

  if (data.length === 0) {
    return {
      isValid: false,
      issues: ['Dataset is empty'],
      stats,
    };
  }

  // Sample first 1000 records for validation (performance)
  const sampleSize = Math.min(data.length, 1000);
  const sample = data.slice(0, sampleSize);

  for (const record of sample) {
    // Check dates
    if (record.startTime instanceof Date && isNaN(record.startTime.getTime())) {
      stats.invalidDates++;
    }
    if (record.stopTime instanceof Date && isNaN(record.stopTime.getTime())) {
      stats.invalidDates++;
    }

    // Check for missing/null critical values
    if (!record.tripId || record.tripId === 0) stats.zeroValues++;
    if (!record.userType) stats.missingValues++;
    if (record.gender === undefined || record.gender === null) stats.missingValues++;

    // Check for unrealistic values
    if (record.tripDuration < 0) {
      issues.push(
        `Trip ${record.tripId} has negative duration: ${record.tripDuration}`
      );
    }
    if (record.tripDuration > 24 * 60 * 60) {
      // More than 24 hours
      issues.push(
        `Trip ${record.tripId} has suspiciously long duration: ${record.tripDuration}s ` +
        `(${(record.tripDuration / 3600).toFixed(1)} hours)`
      );
    }
  }

  // Generate warnings for quality issues
  if (stats.invalidDates > 0) {
    issues.push(
      `${stats.invalidDates} invalid dates found in sample of ${sampleSize} records`
    );
  }

  if (stats.missingValues > sampleSize * 0.1) {
    // More than 10% missing
    issues.push(
      `High number of missing values: ${stats.missingValues} in sample of ${sampleSize} records`
    );
  }

  const isValid = issues.length === 0;

  if (isValid) {
    console.log('✓ Data quality validation passed');
    console.log(`  Checked ${sampleSize} records (sample of ${data.length} total)`);
  } else {
    console.warn('⚠ Data quality issues found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }

  return {
    isValid,
    issues,
    stats,
  };
}

/**
 * Run all validations on a dataset
 * This is the main entry point for data validation
 */
export function runValidations(data: ProcessedTripData[]): {
  tableauFields: ReturnType<typeof validateTableauFields>;
  dataQuality: ReturnType<typeof validateDataQuality>;
  overallValid: boolean;
} {
  console.log('\n=== Tableau Data Validation ===\n');

  const sampleData = data.length > 0 ? data[0] : null;
  const tableauFields = validateTableauFields(sampleData);
  const dataQuality = validateDataQuality(data);

  const overallValid = tableauFields.isValid && dataQuality.isValid;

  if (overallValid) {
    console.log('\n✓ All validations passed! Data is ready for visualization.\n');
  } else {
    console.log('\n✗ Validation failed. Please review the issues above.\n');
  }

  return {
    tableauFields,
    dataQuality,
    overallValid,
  };
}
