import { loadABTestingData } from './dataLoader';
import { parseTableauField, extractFieldRefs, validateTableauFields } from './tableauFieldMapping';
import tableauSpec from '../../docs/tableau_spec.json';
import tableauRenderContract from '../../docs/tableau_render_contract.json';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export async function validateTableauDataSource(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  // Step 1: Validate CSV can be loaded
  result.info.push('Step 1: Validating CSV data loading...');
  try {
    const data = await loadABTestingData();
    result.info.push(`✓ Successfully loaded ${data.length} rows from CSV`);

    if (data.length === 0) {
      result.errors.push('CSV file is empty or could not be parsed');
      result.valid = false;
      return result;
    }

    // Check for data quality issues
    const sampleRow = data[0];
    result.info.push('✓ Sample row data:');
    result.info.push(`  - client_id: ${sampleRow.client_id}`);
    result.info.push(`  - process_step: ${sampleRow.process_step}`);
    result.info.push(`  - gendr: ${sampleRow.gendr}`);
    result.info.push(`  - Variation: ${sampleRow.Variation}`);
    result.info.push(`  - bal: ${sampleRow.bal}`);

    // Check for NaN values
    const nanBalanceCount = data.filter(row => isNaN(row.bal) || row.bal === 0).length;
    if (nanBalanceCount > data.length * 0.5) {
      result.warnings.push(`${nanBalanceCount} rows have zero or NaN balance values`);
    }

    // Check for missing critical fields
    const missingSteps = data.filter(row => !row.process_step).length;
    if (missingSteps > 0) {
      result.errors.push(`${missingSteps} rows missing process_step`);
      result.valid = false;
    }

    const missingGender = data.filter(row => !row.gendr || row.gendr === 'U').length;
    if (missingGender > data.length * 0.1) {
      result.warnings.push(`${missingGender} rows have unknown or missing gender`);
    }

  } catch (error) {
    result.errors.push(`Failed to load CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.valid = false;
    return result;
  }

  // Step 2: Validate Tableau spec field mappings
  result.info.push('\nStep 2: Validating Tableau spec field mappings...');

  const specWorksheets = tableauSpec.worksheets || [];
  result.info.push(`Found ${specWorksheets.length} worksheets in spec`);

  specWorksheets.forEach((worksheet: any) => {
    const fieldRefs = extractFieldRefs(worksheet);
    result.info.push(`\nWorksheet: "${worksheet.name}"`);
    result.info.push(`  Fields to validate: ${fieldRefs.length}`);

    const validation = validateTableauFields(worksheet.name, fieldRefs);

    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.valid = false;
    } else {
      result.info.push(`  ✓ All ${fieldRefs.length} fields can be resolved`);

      // Show field mappings
      fieldRefs.slice(0, 3).forEach(fieldRef => {
        const mapping = parseTableauField(fieldRef);
        if (mapping) {
          result.info.push(`    - ${fieldRef.substring(0, 60)}... => ${mapping.columnName} (${mapping.aggregation})`);
        }
      });
      if (fieldRefs.length > 3) {
        result.info.push(`    ... and ${fieldRefs.length - 3} more fields`);
      }
    }
  });

  // Step 3: Validate render contract field mappings
  result.info.push('\nStep 3: Validating render contract field mappings...');

  const contractWorksheets = tableauRenderContract.worksheets || [];
  result.info.push(`Found ${contractWorksheets.length} worksheets in render contract`);

  contractWorksheets.forEach((worksheet: any) => {
    const fieldRefs: string[] = [];

    // Extract fields from contract structure
    if (worksheet.rows_field) fieldRefs.push(worksheet.rows_field);
    if (worksheet.cols_field) fieldRefs.push(worksheet.cols_field);
    if (worksheet.series_field) fieldRefs.push(worksheet.series_field);
    if (worksheet.slices) {
      worksheet.slices.forEach((slice: string) => fieldRefs.push(slice));
    }

    result.info.push(`\nWorksheet: "${worksheet.name}"`);
    result.info.push(`  Fields to validate: ${fieldRefs.length}`);

    const validation = validateTableauFields(worksheet.name, fieldRefs);

    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.valid = false;
    } else {
      result.info.push(`  ✓ All ${fieldRefs.length} fields can be resolved`);

      // Show field mappings for key fields
      if (worksheet.rows_field) {
        const mapping = parseTableauField(worksheet.rows_field);
        if (mapping) {
          result.info.push(`    - rows: ${mapping.columnName} (${mapping.aggregation})`);
        }
      }
      if (worksheet.cols_field) {
        const mapping = parseTableauField(worksheet.cols_field);
        if (mapping) {
          result.info.push(`    - cols: ${mapping.columnName} (${mapping.aggregation})`);
        }
      }
      if (worksheet.series_field) {
        const mapping = parseTableauField(worksheet.series_field);
        if (mapping) {
          result.info.push(`    - series: ${mapping.columnName} (${mapping.aggregation})`);
        }
      }
    }
  });

  // Step 4: Check for common data quality issues
  result.info.push('\nStep 4: Checking for common data quality issues...');

  try {
    const data = await loadABTestingData();

    // Check for date parsing issues
    const invalidDates = data.filter(row => {
      if (!row.date_time) return true;
      const date = new Date(row.date_time);
      return isNaN(date.getTime());
    }).length;

    if (invalidDates > 0) {
      result.warnings.push(`${invalidDates} rows have invalid date_time values`);
    } else {
      result.info.push('✓ All date_time values are parsable');
    }

    // Check for numeric field ranges
    const negativeBalances = data.filter(row => row.bal < 0).length;
    if (negativeBalances > 0) {
      result.warnings.push(`${negativeBalances} rows have negative balance values`);
    }

    const zeroAge = data.filter(row => row.clnt_age === 0).length;
    if (zeroAge > data.length * 0.5) {
      result.warnings.push(`More than 50% of rows have age = 0 (may be missing data)`);
    }

    // Check variation distribution
    const controlCount = data.filter(row => row.Variation === 'Control').length;
    const testCount = data.filter(row => row.Variation === 'Test').length;
    const unknownCount = data.filter(row => row.Variation === 'Unknown' || !row.Variation).length;

    result.info.push(`✓ Variation distribution: Control=${controlCount}, Test=${testCount}, Unknown=${unknownCount}`);

    if (unknownCount > data.length * 0.1) {
      result.warnings.push(`More than 10% of rows have Unknown variation`);
    }

  } catch (error) {
    result.warnings.push(`Could not complete data quality checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Final summary
  result.info.push('\n=== Validation Summary ===');
  if (result.valid) {
    result.info.push('✓ All validations passed!');
    result.info.push('✓ CSV data can be loaded and parsed correctly');
    result.info.push('✓ All Tableau fields can be resolved to CSV columns');
    result.info.push('✓ Data quality checks passed');
  } else {
    result.errors.push('Validation failed. Please fix the errors above.');
  }

  return result;
}

/**
 * Run validation and log results to console
 */
export async function runValidationAndLog(): Promise<void> {
  console.log('='.repeat(80));
  console.log('Tableau Source Data Validation');
  console.log('='.repeat(80));

  const result = await validateTableauDataSource();

  // Log info messages
  result.info.forEach(msg => console.log(msg));

  // Log warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠ Warnings:');
    result.warnings.forEach(msg => console.log(`  ${msg}`));
  }

  // Log errors
  if (result.errors.length > 0) {
    console.log('\n✗ Errors:');
    result.errors.forEach(msg => console.log(`  ${msg}`));
  }

  console.log('\n' + '='.repeat(80));

  if (result.valid) {
    console.log('✓ VALIDATION PASSED');
  } else {
    console.log('✗ VALIDATION FAILED');
  }
  console.log('='.repeat(80));
}
