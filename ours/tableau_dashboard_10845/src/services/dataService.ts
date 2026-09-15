import { csvParse } from 'd3-dsv';
import type { ParsedCovidData } from '../types/data';

const DATA_URL = '/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv';

/**
 * Normalizes CSV headers by removing extra quotes and BOM
 * Handles cases like """field_name""" -> field_name
 */
function normalizeHeader(csvText: string): string {
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
  // Also handles edge cases where quotes might be separated by commas
  headerLine = headerLine.replace(/"""([^"]*)"""/g, '$1');

  // Additional cleanup: remove any remaining double quotes around field names
  headerLine = headerLine.replace(/"([^"]+)"/g, '$1');

  // Trim whitespace
  headerLine = headerLine.trim();

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

export async function fetchCovidData(): Promise<ParsedCovidData[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  let csvText = await response.text();

  // Normalize CSV headers before parsing
  csvText = normalizeHeader(csvText);

  const rawData = csvParse(csvText);

  // Map normalized headers to parsed data
  return rawData.map((row: { [key: string]: string | number | null | undefined }) => ({
    iso_code: safeParseString(row.iso_code),
    continent: safeParseString(row.continent),
    location: safeParseString(row.location),
    date: new Date(safeParseString(row.date)),
    total_cases: safeParseNumber(row.total_cases),
    new_cases: safeParseNumber(row.new_cases),
    total_deaths: safeParseNumber(row.total_deaths),
    new_deaths: safeParseNumber(row.new_deaths),
    new_cases_smoothed: safeParseNumber(row.new_cases_smoothed),
    new_deaths_smoothed: safeParseNumber(row.new_deaths_smoothed),
    total_cases_per_million: safeParseNumber(row.total_cases_per_million),
    new_cases_per_million: safeParseNumber(row.new_cases_per_million),
    new_cases_smoothed_per_million: safeParseNumber(row.new_cases_smoothed_per_million),
    total_deaths_per_million: safeParseNumber(row.total_deaths_per_million),
    new_deaths_per_million: safeParseNumber(row.new_deaths_per_million),
    new_deaths_smoothed_per_million: safeParseNumber(row.new_deaths_smoothed_per_million),
    reproduction_rate: safeParseNumber(row.reproduction_rate),
    icu_patients: safeParseNumber(row.icu_patients),
    icu_patients_per_million: safeParseNumber(row.icu_patients_per_million),
    hosp_patients: safeParseNumber(row.hosp_patients),
    hosp_patients_per_million: safeParseNumber(row.hosp_patients_per_million),
    weekly_icu_admissions: safeParseNumber(row.weekly_icu_admissions),
    weekly_icu_admissions_per_million: safeParseNumber(row.weekly_icu_admissions_per_million),
    weekly_hosp_admissions: safeParseNumber(row.weekly_hosp_admissions),
    weekly_hosp_admissions_per_million: safeParseNumber(row.weekly_hosp_admissions_per_million),
    new_tests: safeParseNumber(row.new_tests),
    total_tests: safeParseNumber(row.total_tests),
    total_tests_per_thousand: safeParseNumber(row.total_tests_per_thousand),
    new_tests_per_thousand: safeParseNumber(row.new_tests_per_thousand),
    new_tests_smoothed: safeParseNumber(row.new_tests_smoothed),
    new_tests_smoothed_per_thousand: safeParseNumber(row.new_tests_smoothed_per_thousand),
    positive_rate: safeParseNumber(row.positive_rate),
    tests_per_case: safeParseNumber(row.tests_per_case),
    tests_units: safeParseString(row.tests_units),
    total_vaccinations: safeParseNumber(row.total_vaccinations),
    new_vaccinations: safeParseNumber(row.new_vaccinations),
    total_vaccinations_per_hundred: safeParseNumber(row.total_vaccinations_per_hundred),
    new_vaccinations_per_million: safeParseNumber(row.new_vaccinations_per_million),
    stringency_index: safeParseNumber(row.stringency_index),
    population: safeParseNumber(row.population),
    population_density: safeParseNumber(row.population_density),
    median_age: safeParseNumber(row.median_age),
    aged_65_older: safeParseNumber(row.aged_65_older),
    aged_70_older: safeParseNumber(row.aged_70_older),
    gdp_per_capita: safeParseNumber(row.gdp_per_capita),
    extreme_poverty: safeParseNumber(row.extreme_poverty),
    cardiovasc_death_rate: safeParseNumber(row.cardiovasc_death_rate),
    diabetes_prevalence: safeParseNumber(row.diabetes_prevalence),
    female_smokers: safeParseNumber(row.female_smokers),
    male_smokers: safeParseNumber(row.male_smokers),
    handwashing_facilities: safeParseNumber(row.handwashing_facilities),
    hospital_beds_per_thousand: safeParseNumber(row.hospital_beds_per_thousand),
    life_expectancy: safeParseNumber(row.life_expectancy),
    human_development_index: safeParseNumber(row.human_development_index),
  }));
}

export async function getDailyCasesData(data: ParsedCovidData[]) {
  // Filter for months 3-12 (March to December)
  const filteredData = data.filter(d => {
    const month = d.date.getMonth() + 1;
    return month >= 3 && month <= 12;
  });

  // Group by Year-Month and sum new_cases_per_million
  const monthlyData = new Map<string, number>();

  filteredData.forEach(d => {
    const year = d.date.getFullYear();
    const month = d.date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const value = d.new_cases_per_million;

    if (monthlyData.has(key)) {
      monthlyData.set(key, monthlyData.get(key)! + value);
    } else {
      monthlyData.set(key, value);
    }
  });

  return Array.from(monthlyData.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getTop10Data(data: ParsedCovidData[]) {
  // Filter for specific locations
  const locations = [
    'Afghanistan', 'Australia', 'Brazil', 'France', 'India',
    'Italy', 'Russia', 'South Africa', 'Turkey', 'United Kingdom', 'United States'
  ];

  const filteredData = data.filter(d => locations.includes(d.location));

  // Group by location and sum new_deaths
  const locationData = new Map<string, number>();

  filteredData.forEach(d => {
    const value = d.new_deaths;
    if (locationData.has(d.location)) {
      locationData.set(d.location, locationData.get(d.location)! + value);
    } else {
      locationData.set(d.location, value);
    }
  });

  return Array.from(locationData.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export async function getTotalCasesData(data: ParsedCovidData[]) {
  // Filter for Africa and South America
  const filteredData = data.filter(d =>
    d.continent === 'Africa' || d.continent === 'South America'
  );

  // Group by continent and average new_cases
  const continentData = new Map<string, { sum: number; count: number }>();

  filteredData.forEach(d => {
    const value = d.new_cases;
    if (continentData.has(d.continent)) {
      const current = continentData.get(d.continent)!;
      continentData.set(d.continent, {
        sum: current.sum + value,
        count: current.count + 1
      });
    } else {
      continentData.set(d.continent, { sum: value, count: 1 });
    }
  });

  return Array.from(continentData.entries())
    .map(([category, data]) => ({ category, value: data.sum / data.count }))
    .sort((a, b) => b.value - a.value);
}

export async function getTotalDeathsData(data: ParsedCovidData[]) {
  // Filter for Africa and South America
  const filteredData = data.filter(d =>
    d.continent === 'Africa' || d.continent === 'South America'
  );

  // Group by continent and average new_deaths_per_million
  const continentData = new Map<string, { sum: number; count: number }>();

  filteredData.forEach(d => {
    const value = d.new_deaths_per_million;
    if (continentData.has(d.continent)) {
      const current = continentData.get(d.continent)!;
      continentData.set(d.continent, {
        sum: current.sum + value,
        count: current.count + 1
      });
    } else {
      continentData.set(d.continent, { sum: value, count: 1 });
    }
  });

  return Array.from(continentData.entries())
    .map(([category, data]) => ({ category, value: data.sum / data.count }))
    .sort((a, b) => b.value - a.value);
}
