/**
 * Runtime Data Validator
 * Validates that parsed data meets expectations for Tableau dashboard
 */

import type { SuicideData, YearlyData, GenerationSexData, AgeData, GDPData } from '../types';

export interface DataValidationReport {
  isValid: boolean;
  sourceRowCount: number;
  filteredRowCount: number;
  yearRange: { min: number; max: number };
  uniqueCountries: string[];
  uniqueGenerations: string[];
  uniqueAges: string[];
  totalSuicides: number;
  warnings: string[];
  errors: string[];
}

/**
 * Validate raw suicide data for completeness and sanity
 */
export function validateSuicideData(data: SuicideData[]): DataValidationReport {
  const report: DataValidationReport = {
    isValid: true,
    sourceRowCount: data.length,
    filteredRowCount: 0,
    yearRange: { min: Infinity, max: -Infinity },
    uniqueCountries: [],
    uniqueGenerations: [],
    uniqueAges: [],
    totalSuicides: 0,
    warnings: [],
    errors: []
  };

  if (data.length === 0) {
    report.isValid = false;
    report.errors.push('No data available after filtering');
    return report;
  }

  // Check for required fields and data quality
  let validRows = 0;
  const countries = new Set<string>();
  const generations = new Set<string>();
  const ages = new Set<string>();
  let totalSuicides = 0;

  data.forEach(row => {
    // Check for critical missing or invalid fields
    if (!row.country || row.country === '') {
      report.warnings.push(`Row missing country field: ${JSON.stringify(row)}`);
      return;
    }

    if (row.year === 0 || row.year === 1970) { // 1970 is default for invalid dates
      report.warnings.push(`Row has invalid year: ${row.country}-${row.year}`);
      return;
    }

    // Ensure numeric coercion before aggregation
    const suicidesNo = Number(row.suicides_no);
    if (isNaN(suicidesNo)) {
      report.warnings.push(`Row has invalid suicides_no: ${row.country}-${row.year} (${row.suicides_no})`);
      return;
    }

    if (suicidesNo === 0) {
      // This might be valid (no suicides that year), but track it
    }

    validRows++;
    countries.add(row.country);
    generations.add(row.generation);
    ages.add(row.age);
    totalSuicides += suicidesNo;

    // Track year range
    if (row.year < report.yearRange.min) report.yearRange.min = row.year;
    if (row.year > report.yearRange.max) report.yearRange.max = row.year;
  });

  report.filteredRowCount = validRows;
  report.uniqueCountries = Array.from(countries).sort();
  report.uniqueGenerations = Array.from(generations).sort();
  report.uniqueAges = Array.from(ages).sort();
  report.totalSuicides = totalSuicides;

  // Validate data sanity
  if (validRows === 0) {
    report.isValid = false;
    report.errors.push('No valid data rows found after validation');
  }

  if (report.yearRange.min === Infinity) {
    report.isValid = false;
    report.errors.push('No valid year values found (all are 0 or 1970)');
  }

  if (totalSuicides === 0) {
    report.warnings.push('Total suicides is zero - check if parsing is working correctly');
  }

  if (report.uniqueCountries.length === 0) {
    report.errors.push('No countries found in data');
  }

  return report;
}

/**
 * Validate aggregated data for non-zero values
 */
export function validateAggregatedData<T extends { suicides_no: number }>(
  data: T[],
  sheetName: string
): boolean {
  if (data.length === 0) {
    console.error(`${sheetName}: No aggregated data available`);
    return false;
  }

  const allZeros = data.every(d => d.suicides_no === 0);
  if (allZeros) {
    console.error(`${sheetName}: All aggregated values are zero. Check source data parsing.`,
      { sampleData: data.slice(0, 3) });
    return false;
  }

  const hasNaN = data.some(d => isNaN(d.suicides_no));
  if (hasNaN) {
    console.error(`${sheetName}: Found NaN values in aggregated data`,
      { sampleData: data.filter(d => isNaN(d.suicides_no)).slice(0, 3) });
    return false;
  }

  console.log(`${sheetName}: Validated ${data.length} data points, ` +
    `total suicides: ${data.reduce((sum, d) => sum + d.suicides_no, 0)}`);

  return true;
}

/**
 * Validate year-based aggregation (Sheet 1)
 */
export function validateYearlyData(data: YearlyData[]): boolean {
  return validateAggregatedData(data, 'Sheet 1 (Yearly)');
}

/**
 * Validate generation-sex aggregation (Sheet 2)
 */
export function validateGenerationSexData(data: GenerationSexData[]): boolean {
  return validateAggregatedData(data, 'Sheet 2 (Generation/Sex)');
}

/**
 * Validate age aggregation (Sheet 3)
 */
export function validateAgeData(data: AgeData[]): boolean {
  return validateAggregatedData(data, 'Sheet 3 (Age)');
}

/**
 * Validate GDP aggregation (Sheet 4)
 */
export function validateGDPData(data: GDPData[]): boolean {
  return validateAggregatedData(data, 'Sheet 4 (GDP)');
}

/**
 * Run full validation pipeline
 */
export function runFullValidation(
  rawData: SuicideData[],
  sheet1Data: YearlyData[],
  sheet2Data: GenerationSexData[],
  sheet3Data: AgeData[],
  sheet4Data: GDPData[]
): boolean {
  console.log('=== Tableau Data Validation Report ===');

  // Validate raw data
  const rawReport = validateSuicideData(rawData);
  console.log('Raw Data Validation:');
  console.log(`  Countries: ${rawReport.uniqueCountries.join(', ')}`);
  console.log(`  Year Range: ${rawReport.yearRange.min} - ${rawReport.yearRange.max}`);
  console.log(`  Valid Rows: ${rawReport.filteredRowCount}/${rawReport.sourceRowCount}`);
  console.log(`  Total Suicides: ${rawReport.totalSuicides}`);

  if (rawReport.warnings.length > 0) {
    console.warn('  Warnings:', rawReport.warnings);
  }

  if (rawReport.errors.length > 0) {
    console.error('  Errors:', rawReport.errors);
    return false;
  }

  // Validate each sheet
  const allValid = [
    validateYearlyData(sheet1Data),
    validateGenerationSexData(sheet2Data),
    validateAgeData(sheet3Data),
    validateGDPData(sheet4Data)
  ].every(v => v);

  if (allValid) {
    console.log('✓ All validation checks passed');
  } else {
    console.error('✗ Some validation checks failed');
  }

  return allValid;
}
