/**
 * Test script to validate deterministic Tableau source parsing
 * This can be run in node or the browser console to verify data loading
 */

import { loadData, validateTableauFieldMappings } from '../dataLoader';

/**
 * Main validation function
 */
export async function validateTableauSource(): Promise<{
  success: boolean;
  dataLoaded: boolean;
  validation: any;
  errors: string[];
}> {
  console.log('=== Starting Tableau Source Validation ===\n');

  const errors: string[] = [];
  let dataLoaded = false;
  let validation = null;

  try {
    // Step 1: Load the data
    console.log('Step 1: Loading CSV data...');
    const data = await loadData();
    dataLoaded = true;

    console.log(`✓ Successfully loaded ${data.length} records\n`);

    // Step 2: Validate Tableau field mappings
    console.log('Step 2: Validating Tableau field mappings...');
    validation = validateTableauFieldMappings(data);

    if (validation.isValid) {
      console.log('✓ All field mappings validated successfully');
    } else {
      console.error('✗ Field validation failed:');
      validation.errors.forEach((err: string) => console.error(`  - ${err}`));
      errors.push(...validation.errors);
    }

    if (validation.warnings.length > 0) {
      console.warn('\nWarnings:');
      validation.warnings.forEach((warn: string) => console.warn(`  - ${warn}`));
    }

    // Step 3: Check for specific data quality issues
    console.log('\nStep 3: Checking data quality...');

    // Check for non-zero values
    const nonZeroValues = data.filter(d => d.value !== 0);
    if (nonZeroValues.length === 0) {
      errors.push('All values are zero - charts will be empty');
      console.error('✗ All values are zero');
    } else {
      console.log(`✓ Found ${nonZeroValues.length} records with non-zero values`);
    }

    // Check year range
    const years = new Set(data.map(d => d.year));
    const yearArray = Array.from(years).sort((a, b) => a - b);
    console.log(`  Year range: ${yearArray[0]} to ${yearArray[yearArray.length - 1]}`);

    // Check for required years
    const requiredYears = [2014, 2015, 2016, 2017];
    const missingYears = requiredYears.filter(y => !years.has(y));
    if (missingYears.length > 0) {
      console.warn(`  Missing years: ${missingYears.join(', ')}`);
    }

    // Check location groups
    const locationGroups = new Set(data.map(d => d.locationGroup));
    console.log(`  Location groups found: ${Array.from(locationGroups).join(', ')}`);

    // Check indicators
    const indicators = new Set(data.map(d => d.indicator));
    console.log(`  Unique indicators: ${indicators.size}`);

    // Step 4: Validate specific Tableau contract requirements
    console.log('\nStep 4: Validating Tableau contract requirements...');

    // Check for "Total demand" indicator (required by filters)
    const totalDemandIndicator: IndicatorType = 'Total demand';
    if (!indicators.has(totalDemandIndicator)) {
      errors.push('Missing required indicator: "Total demand"');
      console.error('✗ Missing "Total demand" indicator');
    } else {
      console.log('✓ "Total demand" indicator found');
    }

    // Check for location groups in manual_sort
    const requiredGroups: LocationGroup[] = ['British Columbia', 'Ontario', 'Alberta', 'Quebec'];
    const foundGroups = requiredGroups.filter(g => locationGroups.has(g));
    if (foundGroups.length < requiredGroups.length) {
      console.warn(`  Missing location groups: ${requiredGroups.filter(g => !locationGroups.has(g)).join(', ')}`);
    } else {
      console.log(`✓ All required location groups found`);
    }

    // Step 5: Sample data inspection
    console.log('\nStep 5: Sample data inspection...');
    const sampleRows = data.slice(0, 3);
    sampleRows.forEach((row, i) => {
      console.log(`  Row ${i + 1}:`, {
        year: row.year,
        location: row.location,
        indicator: row.indicator,
        value: row.value
      });
    });

    console.log('\n=== Validation Complete ===\n');

    return {
      success: errors.length === 0 && validation.isValid,
      dataLoaded,
      validation,
      errors
    };

  } catch (error) {
    console.error('Fatal error during validation:', error);
    errors.push(`Fatal error: ${error}`);

    return {
      success: false,
      dataLoaded,
      validation,
      errors
    };
  }
}

/**
 * Run validation if this script is executed directly
 */
if (typeof window !== 'undefined') {
  // Browser environment - expose to console
  (window as any).validateTableauSource = validateTableauSource;
  console.log('Tableau Source Validator loaded. Call validateTableauSource() to run.');
}

export default validateTableauSource;
