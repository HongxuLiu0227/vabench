/**
 * Tableau Data Validator
 *
 * Validates that the CSV data contains all required fields for the Tableau specification
 * and that aggregations work correctly for the three worksheets:
 * 1. Swimmers by Age (vertical ranked bar)
 * 2. Swimmers by Country (custom tableau view)
 * 3. Swimmers by Rank (horizontal ranked bar)
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Required fields from tableau_spec.json for each worksheet
const WORKSHEET_REQUIREMENTS = {
  'Swimmers by Age': {
    requiredFields: ['GenderSwimmer', 'SwimmerId', 'BirthDateSwimmers'],
    aggregationKey: ['GenderSwimmer', 'Age'],
  },
  'Swimmers by Country': {
    requiredFields: ['SwimmerId', 'Сountry'],
    aggregationKey: ['Сountry'],
  },
  'Swimmers by Rank': {
    requiredFields: ['RankSwimmers', 'RankTrainer', 'SwimmerId', 'CountrySwimmers'],
    aggregationKey: ['RankSwimmers', 'RankTrainer'],
  },
};

// Normalize header function
function normalizeHeaderKey(key: string): string {
  let cleaned = key.trim();
  while (cleaned.startsWith('"') || cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"') || cleaned.endsWith("'")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

interface ValidationResult {
  success: boolean;
  worksheets: {
    name: string;
    hasRequiredFields: boolean;
    canAggregate: boolean;
    sampleAggregation: number;
    missingFields: string[];
    errors: string[];
  }[];
  globalErrors: string[];
}

function validateTableauData(csvPath: string): ValidationResult {
  const result: ValidationResult = {
    success: false,
    worksheets: [],
    globalErrors: [],
  };

  try {
    console.log(`\n🔍 Validating Tableau data for: ${csvPath}\n`);

    // Read and parse CSV
    if (!fs.existsSync(csvPath)) {
      result.globalErrors.push(`CSV file not found: ${csvPath}`);
      return result;
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      preview: 1000, // Parse more rows for aggregation testing
    });

    if (parseResult.errors.length > 0) {
      result.globalErrors.push(
        ...parseResult.errors.map(e => e.message)
      );
    }

    // Normalize headers and prepare data
    const data = parseResult.data.map((row: Record<string, unknown>) => {
      const normalized: Record<string, unknown> = {};
      for (const key in row) {
        const normalizedKey = normalizeHeaderKey(key);
        normalized[normalizedKey] = row[key];
      }
      return normalized;
    });

    console.log(`📊 Total rows parsed: ${data.length}\n`);

    // Validate each worksheet's requirements
    for (const [worksheetName, requirements] of Object.entries(WORKSHEET_REQUIREMENTS)) {
      console.log(`📋 Validating worksheet: ${worksheetName}`);

      const worksheetResult: ValidationResult['worksheets'][0] = {
        name: worksheetName,
        hasRequiredFields: false,
        canAggregate: false,
        sampleAggregation: 0,
        missingFields: [],
        errors: [],
      };

      // Check for required fields
      worksheetResult.missingFields = requirements.requiredFields.filter(
        field => !(field in data[0])
      );

      worksheetResult.hasRequiredFields = worksheetResult.missingFields.length === 0;

      if (!worksheetResult.hasRequiredFields) {
        worksheetResult.errors.push(
          `Missing required fields: ${worksheetResult.missingFields.join(', ')}`
        );
        console.log(`  ❌ Missing fields: ${worksheetResult.missingFields.join(', ')}\n`);
      } else {
        console.log(`  ✅ All required fields present: ${requirements.requiredFields.join(', ')}\n`);
      }

      // Test aggregation
      if (worksheetResult.hasRequiredFields) {
        try {
          const aggregation = new Map<string, number>();

          data.forEach(row => {
            const key = requirements.aggregationKey
              .map(k => String(row[k] || 'Unknown'))
              .join('|');

            aggregation.set(key, (aggregation.get(key) || 0) + 1);
          });

          worksheetResult.sampleAggregation = aggregation.size;
          worksheetResult.canAggregate = aggregation.size > 0;

          if (worksheetResult.canAggregate) {
            console.log(`  ✅ Aggregation successful: ${aggregation.size} unique groups\n`);

            // Show sample aggregation data
            const samples = Array.from(aggregation.entries()).slice(0, 3);
            console.log(`  📊 Sample aggregation groups:`);
            samples.forEach(([key, count]) => {
              console.log(`     - ${key}: ${count} records`);
            });
            console.log('');
          } else {
            worksheetResult.errors.push('Aggregation produced no groups');
            console.log(`  ❌ Aggregation failed: no groups produced\n`);
          }
        } catch (error) {
          worksheetResult.errors.push(
            `Aggregation error: ${error instanceof Error ? error.message : String(error)}`
          );
          console.log(`  ❌ Aggregation error: ${error}\n`);
        }
      }

      result.worksheets.push(worksheetResult);
    }

    // Check for critical data quality issues
    const emptyFields = ['SwimmerId', 'RankSwimmers', 'CountrySwimmers'].filter(
      field => data.some(row => !row[field])
    );

    if (emptyFields.length > 0) {
      result.globalErrors.push(
        `Critical fields have empty values: ${emptyFields.join(', ')}`
      );
    }

    // Overall success check
    result.success =
      result.globalErrors.length === 0 &&
      result.worksheets.every(w => w.hasRequiredFields && w.canAggregate);

  } catch (error) {
    result.globalErrors.push(
      `Validation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return result;
}

// Main execution
const csvPath = path.resolve(
  '/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_160/public/data/vSwimmingCompetitions (SWIMMING_Comp).csv'
);

const validationResult = validateTableauData(csvPath);

// Print results
console.log('═'.repeat(70));
console.log('TABLEAU DATA VALIDATION RESULTS');
console.log('═'.repeat(70));

if (validationResult.success) {
  console.log('✅ TABLEAU DATA VALIDATION PASSED\n');

  console.log('📊 Worksheet Summary:');
  validationResult.worksheets.forEach(w => {
    console.log(`  - ${w.name}:`);
    console.log(`    ✅ Required fields: present`);
    console.log(`    ✅ Aggregation: ${w.sampleAggregation} groups`);
  });
  console.log('');

  console.log('✨ All worksheets can render correctly with the available data\n');
  process.exit(0);
} else {
  console.log('❌ TABLEAU DATA VALIDATION FAILED\n');

  if (validationResult.globalErrors.length > 0) {
    console.log('Global Errors:');
    validationResult.globalErrors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
    console.log('');
  }

  console.log('Worksheet Errors:');
  validationResult.worksheets.forEach(w => {
    if (w.errors.length > 0) {
      console.log(`\n  ${w.name}:`);
      w.errors.forEach(error => {
        console.log(`    ❌ ${error}`);
      });
    }
  });
  console.log('');

  process.exit(1);
}
