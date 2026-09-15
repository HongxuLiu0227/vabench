export interface CovidData {
  iso_code: string;
  continent: string;
  location: string;
  date: string;
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

export interface ParsedCovidData {
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

export interface BarChartData {
  category: string;
  value: number;
  originalData?: ParsedCovidData;
}

export interface WorksheetProps {
  data: ParsedCovidData[];
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
}

export interface DashboardZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface HighlightState {
  highlightedCategories: Set<string>;
  sourceWorksheet?: string;
}
