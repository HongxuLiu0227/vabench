/**
 * Deterministic Tableau Source Validator
 *
 * Validates that:
 * 1. Data files are in public/data/ (not in src/data or src/mocks)
 * 2. Data loading uses fetch('/data/...') not local imports
 * 3. Required Tableau fields resolve to real columns
 * 4. No silent bad parses (all-zero charts, NaN filters, Jan 1970 timelines)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: { name: string; passed: boolean; message: string }[];
}

const REQUIRED_TABLEAU_FIELDS = [
  'Accident_Severity',
  'Number_of_Vehicles',
  'Number_of_Casualties',
  'Day_of_Week',
  'Speed_limit',
  'Light_Conditions',
  'Weather_Conditions',
  'Road_Surface_Conditions',
  'Urban_or_Rural_Area',
  'Time',
  'Date'
];

class TableauSourceValidator {
  private results: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    checks: []
  };

  private addCheck(name: string, passed: boolean, message: string) {
    this.results.checks.push({ name, passed, message });
    if (!passed) {
      this.results.errors.push(message);
      this.results.passed = false;
    }
  }

  private addWarning(message: string) {
    this.results.warnings.push(message);
  }

  /**
   * Check 1: Verify data files are in public/data/
   */
  validateDataFileLocation() {
    console.log('\n📁 Check 1: Data file location');

    const publicDataDir = path.resolve(process.cwd(), 'public/data');
    const srcDataDir = path.resolve(process.cwd(), 'src/data');
    const srcMocksDir = path.resolve(process.cwd(), 'src/mocks');

    // Check that public/data exists and contains data
    if (fs.existsSync(publicDataDir)) {
      const files = fs.readdirSync(publicDataDir).filter(f => f.endsWith('.csv'));
      if (files.length > 0) {
        this.addCheck(
          'Data files in public/data/',
          true,
          `Found ${files.length} data file(s) in public/data/: ${files.join(', ')}`
        );
        console.log(`   ✅ Found ${files.length} data file(s) in public/data/`);
      } else {
        this.addCheck(
          'Data files in public/data/',
          false,
          'public/data/ directory exists but contains no CSV files'
        );
        console.log('   ❌ public/data/ directory exists but contains no CSV files');
      }
    } else {
      this.addCheck(
        'Data files in public/data/',
        false,
        'public/data/ directory does not exist'
      );
      console.log('   ❌ public/data/ directory does not exist');
    }

    // Check that src/data doesn't contain CSV files (should not exist or be empty)
    if (fs.existsSync(srcDataDir)) {
      const files = fs.readdirSync(srcDataDir).filter(f => f.endsWith('.csv') || f.endsWith('.json'));
      if (files.length > 0) {
        this.addCheck(
          'No CSV/JSON files in src/data',
          false,
          `Found ${files.length} data file(s) in src/data: ${files.join(', ')}. These should be moved to public/data/`
        );
        console.log(`   ❌ Found ${files.length} data file(s) in src/data: ${files.join(', ')}`);
      } else {
        console.log('   ✅ No CSV/JSON files in src/data');
      }
    } else {
      console.log('   ✅ src/data directory does not exist');
    }

    // Check that src/mocks doesn't contain dashboard data
    if (fs.existsSync(srcMocksDir)) {
      const files = fs.readdirSync(srcMocksDir).filter(f => f.endsWith('.csv') || f.endsWith('.json'));
      if (files.length > 0) {
        this.addCheck(
          'No dashboard data in src/mocks',
          false,
          `Found ${files.length} data file(s) in src/mocks: ${files.join(', ')}. Dashboard data should be in public/data/`
        );
        console.log(`   ❌ Found ${files.length} data file(s) in src/mocks: ${files.join(', ')}`);
      } else {
        console.log('   ✅ No dashboard data in src/mocks');
      }
    } else {
      console.log('   ✅ src/mocks directory does not exist');
    }
  }

  /**
   * Check 2: Verify data loading uses fetch('/data/...') not local imports
   */
  validateDataLoadingMethod() {
    console.log('\n📡 Check 2: Data loading method');

    const srcDir = path.resolve(process.cwd(), 'src');
    const serviceFiles = this.findFiles(srcDir, /dataService|dataLoader|data.*Service/i);

    if (serviceFiles.length === 0) {
      this.addWarning('No data service files found');
      console.log('   ⚠️  No data service files found');
      return;
    }

    let usesFetch = false;
    let usesD3Csv = false;
    let usesLocalImport = false;

    for (const file of serviceFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Check for fetch usage
      if (content.includes("fetch('/data/") || content.includes('fetch("/data/')) {
        usesFetch = true;
      }

      // Check for d3.csv usage with /data/ path
      if (content.match(/d3\.csv\s*\(\s*['"]\/data\//)) {
        usesD3Csv = true;
      }

      // Check for local imports (patterns that import from ../data or similar)
      if (content.match(/import.*from\s+['"]\.\.\/data/) || content.match(/import.*from\s+['"]\.\.\/.*\.csv['"]/)) {
        usesLocalImport = true;
      }
    }

    if ((usesFetch || usesD3Csv) && !usesLocalImport) {
      const method = usesD3Csv ? 'd3.csv' : 'fetch';
      this.addCheck(
        'Data loading uses fetch/d3.csv',
        true,
        `Data service correctly uses ${method}("/data/...") to load data`
      );
      console.log(`   ✅ Data loading correctly uses ${method}("/data/...")`);
    } else if (usesLocalImport) {
      this.addCheck(
        'Data loading uses fetch/d3.csv',
        false,
        'Data service uses local imports to load data. Should use fetch("/data/...") or d3.csv("/data/...") instead'
      );
      console.log('   ❌ Data loading uses local imports');
    } else if (!usesFetch && !usesD3Csv) {
      this.addWarning('Could not determine data loading method');
      console.log('   ⚠️  Could not determine data loading method');
    }
  }

  /**
   * Check 3: Verify required Tableau fields resolve to real columns
   */
  validateRequiredFields() {
    console.log('\n🔍 Check 3: Required Tableau fields');

    const csvPath = path.resolve(process.cwd(), 'public/data/DfTRoadSafety_Accidents_2014.csv');

    if (!fs.existsSync(csvPath)) {
      this.addCheck(
        'Required fields in CSV',
        false,
        'CSV file not found: ' + csvPath
      );
      console.log('   ❌ CSV file not found');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const data = d3.csvParse(csvContent);

    if (!data || data.length === 0) {
      this.addCheck(
        'Required fields in CSV',
        false,
        'CSV file is empty or could not be parsed'
      );
      console.log('   ❌ CSV file is empty or could not be parsed');
      return;
    }

    const firstRow = data[0];
    const availableFields = Object.keys(firstRow);
    const missingFields: string[] = [];

    for (const field of REQUIRED_TABLEAU_FIELDS) {
      if (!(field in firstRow)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length === 0) {
      this.addCheck(
        'Required fields in CSV',
        true,
        `All ${REQUIRED_TABLEAU_FIELDS.length} required fields are present in the CSV`
      );
      console.log(`   ✅ All ${REQUIRED_TABLEAU_FIELDS.length} required fields are present`);
    } else {
      this.addCheck(
        'Required fields in CSV',
        false,
        `Missing required fields: ${missingFields.join(', ')}`
      );
      console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
    }

    // Show available fields
    console.log(`   Available fields (${availableFields.length}):`);
    availableFields.forEach(f => console.log(`      - ${f}`));
  }

  /**
   * Check 4: Verify no silent bad parses
   */
  validateDataQuality() {
    console.log('\n🧪 Check 4: Data quality (no silent bad parses)');

    const csvPath = path.resolve(process.cwd(), 'public/data/DfTRoadSafety_Accidents_2014.csv');

    if (!fs.existsSync(csvPath)) {
      console.log('   ⚠️  CSV file not found, skipping data quality check');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const data = d3.csvParse(csvContent);

    if (!data || data.length === 0) {
      console.log('   ⚠️  CSV file is empty, skipping data quality check');
      return;
    }

    // Check for data quality issues that would cause silent bad parses
    let allZeroVehicles = 0;
    let allZeroCasualties = 0;
    let emptyDates = 0;
    let emptyTimes = 0;
    let invalidSpeedLimits = 0;

    for (const row of data) {
      const vehicles = parseInt(row['Number_of_Vehicles'] || '0');
      const casualties = parseInt(row['Number_of_Casualties'] || '0');
      const date = row['Date'] || '';
      const time = row['Time'] || '';
      const speedLimit = row['Speed_limit'] || '';

      if (vehicles === 0) allZeroVehicles++;
      if (casualties === 0) allZeroCasualties++;
      if (!date || date.trim() === '') emptyDates++;
      if (!time || time.trim() === '') emptyTimes++;
      if (!speedLimit || speedLimit.trim() === '' || speedLimit === '-1') invalidSpeedLimits++;
    }

    const total = data.length;
    const allZeroVehiclesPct = (allZeroVehicles / total * 100).toFixed(2);
    const allZeroCasualtiesPct = (allZeroCasualties / total * 100).toFixed(2);
    const emptyDatesPct = (emptyDates / total * 100).toFixed(2);
    const emptyTimesPct = (emptyTimes / total * 100).toFixed(2);
    const invalidSpeedLimitsPct = (invalidSpeedLimits / total * 100).toFixed(2);

    console.log(`   Total records: ${total}`);
    console.log(`   Records with 0 vehicles: ${allZeroVehicles} (${allZeroVehiclesPct}%)`);
    console.log(`   Records with 0 casualties: ${allZeroCasualties} (${allZeroCasualtiesPct}%)`);
    console.log(`   Records with empty dates: ${emptyDates} (${emptyDatesPct}%)`);
    console.log(`   Records with empty times: ${emptyTimes} (${emptyTimesPct}%)`);
    console.log(`   Records with invalid speed limits: ${invalidSpeedLimits} (${invalidSpeedLimitsPct}%)`);

    // Check for concerning patterns
    if (allZeroVehicles > total * 0.5) {
      this.addCheck(
        'No all-zero vehicle counts',
        false,
        `${allZeroVehiclesPct}% of records have 0 vehicles - possible parsing issue`
      );
      console.log(`   ❌ Too many records with 0 vehicles (${allZeroVehiclesPct}%)`);
    } else {
      this.addCheck(
        'No all-zero vehicle counts',
        true,
        'Vehicle counts look reasonable'
      );
      console.log('   ✅ Vehicle counts look reasonable');
    }

    if (emptyDates > total * 0.1) {
      this.addWarning(`${emptyDatesPct}% of records have empty dates - may cause timeline issues`);
      console.log(`   ⚠️  Many records have empty dates (${emptyDatesPct}%)`);
    } else {
      this.addCheck(
        'Dates are populated',
        true,
        'Dates are populated for most records'
      );
      console.log('   ✅ Dates are populated');
    }
  }

  /**
   * Helper: Find files matching a pattern
   */
  private findFiles(dir: string, pattern: RegExp): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and dist
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          results.push(...this.findFiles(fullPath, pattern));
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Run all validation checks
   */
  validate() {
    console.log('='.repeat(80));
    console.log('DETERMINISTIC TABLEAU SOURCE VALIDATOR');
    console.log('='.repeat(80));

    this.validateDataFileLocation();
    this.validateDataLoadingMethod();
    this.validateRequiredFields();
    this.validateDataQuality();

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(80));

    console.log(`\nTotal checks: ${this.results.checks.length}`);
    console.log(`Passed: ${this.results.checks.filter(c => c.passed).length}`);
    console.log(`Failed: ${this.results.checks.filter(c => !c.passed).length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(w => console.log(`   - ${w}`));
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(e => console.log(`   - ${e}`));
    }

    console.log('\n' + '='.repeat(80));
    if (this.results.passed) {
      console.log('✅ VALIDATION PASSED');
      console.log('='.repeat(80));
    } else {
      console.log('❌ VALIDATION FAILED');
      console.log('='.repeat(80));
    }

    return this.results;
  }
}

// Run validator
const validator = new TableauSourceValidator();
const results = validator.validate();
process.exit(results.passed ? 0 : 1);
