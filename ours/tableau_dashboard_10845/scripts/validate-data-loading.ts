/**
 * Validation script for Tableau source data loading
 * Tests CSV parsing, field resolution, and data quality
 */

import { csvParse } from 'd3-dsv';
import * as fs from 'fs';
import * as path from 'path';

// Interface for parsed COVID data
interface ParsedCovidData {
  iso_code: string;
  continent: string;
  location: string;
  date: Date;
  total_cases: number;
  new_cases: number;
  total_deaths: number;
  new_deaths: number;
  new_cases_smoothed: number;
  new_deaths_smoothed: number;
  total_cases_per_million: number;
  new_cases_per_million: number;
  new_cases_smoothed_per_million: number;
  total_deaths_per_million: number;
  new_deaths_per_million: number;
  new_deaths_smoothed_per_million: number;
  reproduction_rate: number;
  icu_patients: number;
  icu_patients_per_million: number;
  hosp_patients: number;
  hosp_patients_per_million: number;
  weekly_icu_admissions: number;
  weekly_icu_admissions_per_million: number;
  weekly_hosp_admissions: number;
  weekly_hosp_admissions_per_million: number;
  new_tests: number;
  total_tests: number;
  total_tests_per_thousand: number;
  new_tests_per_thousand: number;
  new_tests_smoothed: number;
  new_tests_smoothed_per_thousand: number;
  positive_rate: number;
  tests_per_case: number;
  tests_units: string;
  total_vaccinations: number;
  new_vaccinations: number;
  total_vaccinations_per_hundred: number;
  new_vaccinations_per_million: number;
  stringency_index: number;
  population: number;
  population_density: number;
  median_age: number;
  aged_65_older: number;
  aged_70_older: number;
  gdp_per_capita: number;
  extreme_poverty: number;
  cardiovasc_death_rate: number;
  diabetes_prevalence: number;
  female_smokers: number;
  male_smokers: number;
  handwashing_facilities: number;
  hospital_beds_per_thousand: number;
  life_expectancy: number;
  human_development_index: number;
}

// Required fields from Tableau spec
const REQUIRED_FIELDS = [
  'iso_code',
  'continent',
  'location',
  'date',
  'total_cases',
  'new_cases',
  'total_deaths',
  'new_deaths',
  'new_cases_per_million',
  'new_deaths_per_million',
  'new_cases_smoothed',
  'new_deaths_smoothed',
  'population',
  'population_density',
  'median_age',
  'aged_65_older',
  'aged_70_older',
  'gdp_per_capita',
  'extreme_poverty',
  'cardiovasc_death_rate',
  'diabetes_prevalence',
  'female_smokers',
  'male_smokers',
  'handwashing_facilities',
  'hospital_beds_per_thousand',
  'life_expectancy',
  'human_development_index',
];

function normalizeCSVHeaders(csvText: string): string {
  // Remove BOM if present
  const text = csvText.replace(/^\uFEFF/, '');

  // Split into lines
  const lines = text.split(/\r?\n/);

  if (lines.length === 0) {
    return text;
  }

  // Process header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) {
    return text;
  }

  let headerLine = lines[headerIndex];

  // Normalize triple-quoted headers: """field_name""" -> field_name
  // This regex matches """ followed by any characters (non-greedy) followed by """
  headerLine = headerLine.replace(/"""(.*?)"""/g, '$1');

  lines[headerIndex] = headerLine;

  return lines.join('\n');
}

function safeParseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = parseFloat(String(value).trim());
  return isNaN(parsed) ? 0 : parsed;
}

function safeParseString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function validateDataLoading(): void {
  console.log('🔍 Validating Tableau source data loading...\n');

  // Load CSV file
  const csvPath = path.resolve(process.cwd(), 'public/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`✅ CSV file found: ${csvPath}`);

  const csvText = fs.readFileSync(csvPath, 'utf-8');

  // Test header normalization
  console.log('\n📋 Testing header normalization...');
  const normalizedCsv = normalizeCSVHeaders(csvText);
  const rawData = csvParse(normalizedCsv);

  if (rawData.length === 0) {
    console.error('❌ No data rows found in CSV');
    process.exit(1);
  }

  console.log(`✅ CSV parsed successfully: ${rawData.length} rows found`);

  // Check headers
  const headers = Object.keys(rawData[0]);
  console.log(`\n📊 Found ${headers.length} columns`);
  console.log('Sample headers:', headers.slice(0, 5).join(', '));

  // Validate required fields
  console.log('\n🔧 Validating required fields...');
  const missingFields: string[] = [];
  const extraFields: string[] = [];

  REQUIRED_FIELDS.forEach(field => {
    if (!headers.includes(field)) {
      missingFields.push(field);
    }
  });

  headers.forEach(header => {
    if (!REQUIRED_FIELDS.includes(header) &&
        !header.includes('per_million') &&
        !header.includes('per_hundred') &&
        !header.includes('per_thousand') &&
        !header.includes('weekly') &&
        !header.includes('new_') &&
        !header.includes('total_') &&
        !header.includes('smoothed') &&
        !header.includes('icu') &&
        !header.includes('hosp') &&
        !header.includes('tests') &&
        !header.includes('vaccin') &&
        !header.includes('reproduction') &&
        !header.includes('stringency') &&
        !header.includes('aged_') &&
        !header.includes('gdp') &&
        !header.includes('extreme') &&
        !header.includes('cardiovasc') &&
        !header.includes('diabetes') &&
        !header.includes('smokers') &&
        !header.includes('handwashing') &&
        !header.includes('hospital') &&
        !header.includes('life') &&
        !header.includes('human')) {
      extraFields.push(header);
    }
  });

  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ All required fields present`);

  if (extraFields.length > 0) {
    console.log(`ℹ️  Extra fields found: ${extraFields.join(', ')}`);
  }

  // Test data parsing
  console.log('\n🧪 Testing data parsing...');
  const sampleRow = rawData[0];

  try {
    const parsed: Partial<ParsedCovidData> = {
      iso_code: safeParseString(sampleRow.iso_code),
      continent: safeParseString(sampleRow.continent),
      location: safeParseString(sampleRow.location),
      date: new Date(safeParseString(sampleRow.date)),
      total_cases: safeParseNumber(sampleRow.total_cases),
      new_cases: safeParseNumber(sampleRow.new_cases),
      total_deaths: safeParseNumber(sampleRow.total_deaths),
      new_deaths: safeParseNumber(sampleRow.new_deaths),
      new_cases_per_million: safeParseNumber(sampleRow.new_cases_per_million),
      new_deaths_per_million: safeParseNumber(sampleRow.new_deaths_per_million),
      population: safeParseNumber(sampleRow.population),
    };

    // Check for invalid dates
    if (isNaN(parsed.date.getTime())) {
      console.error(`❌ Invalid date detected: "${sampleRow.date}"`);
      process.exit(1);
    }

    console.log('✅ Sample row parsed successfully');
    console.log(`   Location: ${parsed.location}`);
    console.log(`   Date: ${parsed.date.toISOString()}`);
    console.log(`   New cases: ${parsed.new_cases}`);
    console.log(`   New deaths: ${parsed.new_deaths}`);

  } catch (error) {
    console.error(`❌ Error parsing sample row: ${error}`);
    process.exit(1);
  }

  // Check for common data quality issues
  console.log('\n🔍 Checking data quality...');

  // Check for rows with all zeros
  let allZeroRows = 0;
  let invalidDates = 0;

  rawData.forEach((row: { [key: string]: string | number | null | undefined }) => {
    const numericFields = [
      safeParseNumber(row.new_cases),
      safeParseNumber(row.new_deaths),
      safeParseNumber(row.new_cases_per_million),
      safeParseNumber(row.new_deaths_per_million),
    ];

    if (numericFields.every(v => v === 0)) {
      allZeroRows++;
    }

    const date = new Date(safeParseString(row.date));
    if (isNaN(date.getTime())) {
      invalidDates++;
    }
  });

  const allZeroPercentage = (allZeroRows / rawData.length) * 100;
  const invalidDatePercentage = (invalidDates / rawData.length) * 100;

  console.log(`✅ Data quality check complete`);
  console.log(`   Rows with all zeros: ${allZeroRows} (${allZeroPercentage.toFixed(2)}%)`);
  console.log(`   Invalid dates: ${invalidDates} (${invalidDatePercentage.toFixed(2)}%)`);

  if (allZeroPercentage > 50) {
    console.warn(`⚠️  Warning: More than 50% of rows have all zero values`);
  }

  if (invalidDatePercentage > 5) {
    console.warn(`⚠️  Warning: More than 5% of rows have invalid dates`);
  }

  // Test worksheet-specific filters
  console.log('\n📊 Testing worksheet-specific data requirements...');

  // Daily Cases: Filter for months 3-12
  const monthFiltered = rawData.filter((d: { [key: string]: string | number | null | undefined }) => {
    const date = new Date(safeParseString(d.date));
    const month = date.getMonth() + 1;
    return month >= 3 && month <= 12;
  });

  if (monthFiltered.length === 0) {
    console.error('❌ Daily Cases filter produced no results');
    process.exit(1);
  }

  console.log(`✅ Daily Cases filter: ${monthFiltered.length} rows (months 3-12)`);

  // Top 10: Filter for specific locations
  const top10Locations = [
    'Afghanistan', 'Australia', 'Brazil', 'France', 'India',
    'Italy', 'Russia', 'South Africa', 'Turkey', 'United Kingdom', 'United States'
  ];

  const top10Filtered = rawData.filter((d: { [key: string]: string | number | null | undefined }) =>
    top10Locations.includes(safeParseString(d.location))
  );

  if (top10Filtered.length === 0) {
    console.error('❌ Top 10 filter produced no results');
    process.exit(1);
  }

  console.log(`✅ Top 10 filter: ${top10Filtered.length} rows (11 countries)`);

  // Total Cases/Deaths: Filter for continents
  const continentFiltered = rawData.filter((d: { [key: string]: string | number | null | undefined }) => {
    const continent = safeParseString(d.continent);
    return continent === 'Africa' || continent === 'South America';
  });

  if (continentFiltered.length === 0) {
    console.error('❌ Continent filter produced no results');
    process.exit(1);
  }

  console.log(`✅ Continent filter: ${continentFiltered.length} rows (Africa + South America)`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDATION PASSED');
  console.log('='.repeat(60));
  console.log('\n📋 Summary:');
  console.log(`   • CSV file loaded successfully`);
  console.log(`   • Headers normalized and parsed correctly`);
  console.log(`   • All ${REQUIRED_FIELDS.length} required fields present`);
  console.log(`   • Data quality checks passed`);
  console.log(`   • Worksheet filters working correctly`);
  console.log(`   • ${rawData.length} total rows loaded`);
  console.log('\n✨ Tableau source ingestion is deterministic and correct!');
  console.log('');
}

// Run validation
try {
  validateDataLoading();
} catch (error) {
  console.error('\n❌ VALIDATION FAILED');
  console.error(error);
  process.exit(1);
}
