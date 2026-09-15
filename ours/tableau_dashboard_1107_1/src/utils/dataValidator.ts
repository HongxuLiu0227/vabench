import type { TripData } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sampleData?: TripData[];
}

/**
 * Validates trip data for required fields and data quality
 */
export const validateTripData = (data: TripData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if we have any data
  if (!data || data.length === 0) {
    errors.push('No data found in dataset');
    return { isValid: false, errors, warnings };
  }

  // Check first row for required fields
  const firstRow = data[0];
  const requiredFields: (keyof TripData)[] = [
    'TripID',
    'starttime',
    'stoptime',
    'usertype',
    'gender'
  ];

  requiredFields.forEach(field => {
    if (!firstRow[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check for reasonable data values
  const sampleSize = Math.min(5, data.length);
  const sampleData = data.slice(0, sampleSize);

  // Validate date formats
  let invalidDates = 0;
  data.slice(0, 100).forEach(row => {
    const startTime = new Date(row.starttime);
    const stopTime = new Date(row.stoptime);
    if (isNaN(startTime.getTime()) || isNaN(stopTime.getTime())) {
      invalidDates++;
    }
  });

  if (invalidDates > 0) {
    warnings.push(`${invalidDates} rows have invalid date formats in first 100 rows`);
  }

  // Check gender values
  const genderValues = new Set(data.map(row => row.gender));
  const validGenders = ['0', '1', '2', ''];  // 0=unknown, 1=male, 2=female
  const invalidGenders = Array.from(genderValues).filter(g => !validGenders.includes(g));
  if (invalidGenders.length > 0) {
    warnings.push(`Unexpected gender values found: ${invalidGenders.join(', ')}`);
  }

  // Check usertype values
  const usertypeValues = new Set(data.map(row => row.usertype));
  if (usertypeValues.size > 10) {
    warnings.push(`Large number of usertype values detected: ${usertypeValues.size}`);
  }

  // Log sample data for debugging
  console.log('Sample trip data:', sampleData);
  console.log('Gender distribution:', Array.from(genderValues));
  console.log('Usertype distribution:', Array.from(usertypeValues));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sampleData
  };
};

/**
 * Validates that year extraction is working
 */
export const validateYearExtraction = (data: TripData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const years = new Set<number>();
  let invalidDates = 0;

  data.slice(0, 100).forEach(row => {
    try {
      const date = new Date(row.starttime);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear());
      } else {
        invalidDates++;
      }
    } catch (e) {
      invalidDates++;
    }
  });

  if (invalidDates > 0) {
    errors.push(`${invalidDates} rows could not parse dates`);
  }

  if (years.size === 0) {
    errors.push('No valid years extracted from data');
  } else {
    console.log('Years found in data:', Array.from(years).sort());
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
