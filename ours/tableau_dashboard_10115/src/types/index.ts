// Data type definitions for suicide dataset
export interface SuicideData {
  country: string;
  year: number;
  sex: string;
  age: string;
  suicides_no: number;
  population: number;
  'suicides/100k pop': number;
  'country-year': string;
  'HDI for year': number | string;
  'gdp_for_year ($)': number;
  'gdp_per_capita ($)': number;
  generation: string;
}

// Filter state for global interactions
export interface FilterState {
  selectedYear: number | null;
  selectedGeneration: string | null;
  selectedSex: string | null;
  selectedGDP: number | null;
  selectedAge: string | null;
}

// Aggregated data types for different views
export interface YearlyData {
  year: number;
  suicides_no: number;
}

export interface GenerationSexData {
  generation: string;
  sex: string;
  suicides_no: number;
}

export interface AgeData {
  age: string;
  suicides_no: number;
}

export interface GDPData {
  gdp_for_year: number;
  suicides_no: number;
  year: number;
}
