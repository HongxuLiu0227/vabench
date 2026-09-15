import * as d3 from 'd3';
import type { SuicideData, YearlyData, GenerationSexData, AgeData, GDPData, FilterState } from '../types';
import { normalizeHeaderFieldName, validateCSVStructure } from '../utils/csvValidator';

/**
 * Parse CSV string into SuicideData array with robust error handling
 * Ensures deterministic parsing regardless of BOM, whitespace, or header formatting
 */
function parseCSVData(csvText: string): SuicideData[] {
  const parsedData = d3.csvParse(csvText, (d, index) => {
    // Normalize all field names: remove BOM, trim whitespace, clean quotes
    const cleanRow: Record<string, string> = {};
    Object.keys(d).forEach(key => {
      const cleanKey = normalizeHeaderFieldName(key);
      cleanRow[cleanKey] = (d[key] || '').trim();
    });

    // Coerce all numeric fields to numbers (don't aggregate strings!)
    const year = Number(cleanRow['year']);
    const suicides_no = Number(cleanRow['suicides_no']);
    const population = Number(cleanRow['population']);
    const gdp_for_year = Number(String(cleanRow['gdp_for_year ($)'] || '0').replace(/,/g, ''));
    const gdp_per_capita = Number(cleanRow['gdp_per_capita ($)']);
    const suicides_100k = Number(cleanRow['suicides/100k pop']);
    const hdi = cleanRow['HDI for year'] === '' ? '' : Number(cleanRow['HDI for year']);

    // Validate critical fields have values (catch silent parse errors)
    if (index === 0 && (isNaN(year) || isNaN(suicides_no))) {
      console.warn('First data row has missing or invalid numeric fields. Check CSV format.',
        { year: cleanRow['year'], suicides_no: cleanRow['suicides_no'] });
    }

    return {
      country: cleanRow['country'] || '',
      year: isNaN(year) ? 0 : year,
      sex: cleanRow['sex'] || '',
      age: cleanRow['age'] || '',
      suicides_no: isNaN(suicides_no) ? 0 : suicides_no,
      population: isNaN(population) ? 0 : population,
      'suicides/100k pop': isNaN(suicides_100k) ? 0 : suicides_100k,
      'country-year': cleanRow['country-year'] || '',
      'HDI for year': hdi,
      'gdp_for_year ($)': isNaN(gdp_for_year) ? 0 : gdp_for_year,
      'gdp_per_capita ($)': isNaN(gdp_per_capita) ? 0 : gdp_per_capita,
      generation: cleanRow['generation'] || '',
    } as SuicideData;
  });

  return parsedData;
}

// Load and parse CSV from /data/ endpoint with validation
export async function loadSuicideData(): Promise<SuicideData[]> {
  try {
    const response = await fetch('/data/suicide trend.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Validate CSV structure before parsing
    const requiredFields = ['country', 'year', 'sex', 'age', 'suicides_no', 'generation', 'gdp_for_year'];
    const validation = validateCSVStructure(csvText, requiredFields);

    if (!validation.isValid) {
      console.error('CSV validation failed:', validation.errors);
      throw new Error(`Invalid CSV structure: ${validation.errors.join('; ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('CSV validation warnings:', validation.warnings);
    }

    console.log(`CSV validated successfully: ${validation.rowCount} data rows, ${validation.headerFields.length} columns`);

    const data = parseCSVData(csvText);

    if (data.length === 0) {
      throw new Error('CSV parsed into zero data rows. Check header parsing and data format.');
    }

    // Validate we have Thailand data before filtering
    const thailandRows = data.filter(d => d.country === 'Thailand');
    if (thailandRows.length === 0) {
      console.warn('No Thailand data found in CSV. Available countries:',
        [...new Set(data.map(d => d.country))].slice(0, 10).join(', '));
    }

    // Filter to Thailand only as per spec
    return thailandRows;
  } catch (error) {
    console.error('Error loading suicide data:', error);
    throw error;
  }
}

// Aggregate data by year for Sheet 1
export function aggregateByYear(data: SuicideData[]): YearlyData[] {
  if (data.length === 0) {
    console.warn('aggregateByYear: Empty data input');
    return [];
  }

  const aggregated = d3.rollup(
    data,
    v => d3.sum(v, d => d.suicides_no),
    d => d.year
  );

  const result = Array.from(aggregated, ([year, suicides_no]) => ({ year, suicides_no }))
    .sort((a, b) => a.year - b.year);

  if (result.length === 0 || result.every(d => d.suicides_no === 0)) {
    console.warn('aggregateByYear: All years have zero suicides. Check data parsing.',
      { sampleData: data.slice(0, 3) });
  }

  return result;
}

// Aggregate data by generation and sex for Sheet 2
export function aggregateByGenerationAndSex(data: SuicideData[]): GenerationSexData[] {
  if (data.length === 0) {
    console.warn('aggregateByGenerationAndSex: Empty data input');
    return [];
  }

  const aggregated = d3.rollup(
    data,
    v => d3.sum(v, d => d.suicides_no),
    d => d.generation,
    d => d.sex
  );

  const result: GenerationSexData[] = [];
  aggregated.forEach((sexMap, generation) => {
    sexMap.forEach((suicides_no, sex) => {
      result.push({ generation, sex, suicides_no });
    });
  });

  // Sort descending by suicides_no for ranked bar chart
  const sorted = result.sort((a, b) => b.suicides_no - a.suicides_no);

  if (sorted.length === 0 || sorted.every(d => d.suicides_no === 0)) {
    console.warn('aggregateByGenerationAndSex: All values are zero. Check data parsing.');
  }

  return sorted;
}

// Aggregate data by age for Sheet 3
export function aggregateByAge(data: SuicideData[]): AgeData[] {
  if (data.length === 0) {
    console.warn('aggregateByAge: Empty data input');
    return [];
  }

  const aggregated = d3.rollup(
    data,
    v => d3.sum(v, d => d.suicides_no),
    d => d.age
  );

  const result = Array.from(aggregated, ([age, suicides_no]) => ({ age, suicides_no }))
    .sort((a, b) => a.suicides_no - b.suicides_no); // Ascending order as per spec

  if (result.length === 0 || result.every(d => d.suicides_no === 0)) {
    console.warn('aggregateByAge: All ages have zero suicides. Check data parsing.');
  }

  return result;
}

// Aggregate data by GDP for Sheet 4
export function aggregateByGDP(data: SuicideData[]): GDPData[] {
  if (data.length === 0) {
    console.warn('aggregateByGDP: Empty data input');
    return [];
  }

  const aggregated = d3.rollup(
    data,
    v => ({
      suicides_no: d3.sum(v, d => d.suicides_no),
      year: v[0].year
    }),
    d => d['gdp_for_year ($)']
  );

  const result = Array.from(aggregated, ([gdp_for_year, stats]) => ({
    gdp_for_year,
    suicides_no: stats.suicides_no,
    year: stats.year
  })).sort((a, b) => a.gdp_for_year - b.gdp_for_year);

  if (result.length === 0 || result.every(d => d.suicides_no === 0)) {
    console.warn('aggregateByGDP: All GDP values have zero suicides. Check data parsing.');
  }

  return result;
}

// Apply filters to data based on global filter state
export function applyFilters(data: SuicideData[], filters: FilterState): SuicideData[] {
  let filtered = data;

  if (filters.selectedYear !== null) {
    filtered = filtered.filter(d => d.year === filters.selectedYear);
  }

  if (filters.selectedGeneration !== null) {
    filtered = filtered.filter(d => d.generation === filters.selectedGeneration);
  }

  if (filters.selectedSex !== null) {
    filtered = filtered.filter(d => d.sex === filters.selectedSex);
  }

  if (filters.selectedAge !== null) {
    filtered = filtered.filter(d => d.age === filters.selectedAge);
  }

  // GDP filtering - filter data points within range
  if (filters.selectedGDP !== null) {
    const gdpTolerance = filters.selectedGDP * 0.05; // 5% tolerance
    filtered = filtered.filter(d =>
      Math.abs(d['gdp_for_year ($)'] - filters.selectedGDP!) <= gdpTolerance
    );
  }

  return filtered;
}
