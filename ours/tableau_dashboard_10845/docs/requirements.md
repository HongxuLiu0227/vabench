# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the provided Tableau workbook definition and data constraints.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or higher) for visualizations (use `d3-scale`, `d3-axis`, `d3-shape`, `d3-time`, `d3-array`).
- CSS Modules or Styled Components for styling (no external UI component libraries like Ant Design).

## Data Loading

The application must load data from the following URL:
`/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv`

Implement a data fetching utility using the native `fetch` API. Use `d3-dsv` (specifically `d3.csvParse`) to parse the CSV string into an array of objects.

Example implementation logic:
```typescript
import { csvParse } from 'd3-dsv';

export const fetchCovidData = async (): Promise<CovidData[]> => {
  const response = await fetch('/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const csvText = await response.text();
  const data = csvParse(csvText);
  // Type assertion or mapping to CovidData interface here
  return data as CovidData[];
};
```

## Data Types

Define a TypeScript interface `CovidData` based on the columns found in the workbook XML. Key fields include:
- `iso_code`: string
- `continent`: string
- `location`: string
- `date`: Date (parse from string)
- `total_cases`: number
- `new_cases`: number
- `total_deaths`: number
- `new_deaths`: number
- `stringency_index`: number
- `population`: number
- `gdp_per_capita`: number
- `human_development_index`: number

(Note: Some fields in the XML are marked as string in metadata but represent numbers; handle parsing safely).

## Dashboard Layout & Components

The dashboard should be a single-page application with the following structure:

1.  **App Container**: A full-height flex container.
2.  **Header**: Displays the title "Covid-19 Analysis".
3.  **Controls Area**: Contains a filter for `location` (Country). Default selection should be "India" (as inferred from semantic values in the workbook).
4.  **Main Visualization Area**: A responsive container for the charts.

### Visualizations

Since the workbook XML was truncated, the visual encodings are inferred from the `<style>` section which defines specific color palettes for `location` and `date`.

**Component: `CountryTrendChart`**
- **Type**: Multi-Line Chart.
- **Purpose**: Compare COVID trends across specific countries over time.
- **Data Mapping**:
  - **X-Axis**: `date` (Time scale).
  - **Y-Axis**: `total_cases` (Linear scale). (Alternatively `new_cases` if `total_cases` is too flat, but `total_cases` is standard for cumulative analysis).
  - **Color (Lines)**: Encoded by `location`.
- **Specific Color Palette**: You MUST use the exact hex codes defined in the Tableau workbook for the following countries. If a country is not in this list, use a default color.
  - Turkey: `#499894`
  - United States: `#4e79a7`
  - Italy: `#59a14f`
  - Afghanistan: `#86bcb6`
  - France: `#8cd17d`
  - Brazil: `#a0cbe8`
  - Russia: `#b6992d`
  - Australia: `#e15759`
  - South Africa: `#f1ce63`
  - India: `#f28e2b`
  - United Kingdom: `#ffbe7d`
- **Interactions**:
  - **Tooltip**: On hover, show the Date, Location, and Total Cases.
  - **Filter**: The chart should update based on the global `location` filter (e.g., highlighting the selected country or filtering to show only the selected country vs the world average).

**Component: `KPIDisplay`** (Optional but recommended based on standard dashboards)
- Display `total_cases` and `total_deaths` for the currently selected `location`.

## Implementation Details

- Use `d3.scaleTime` for the x-axis.
- Use `d3.scaleLinear` for the y-axis.
- Use `d3.scaleOrdinal` with the specific color range for the country lines.
- Use `d3.line` to generate the path data.
- Use `d3.axisBottom` and `d3.axisLeft` for axes.
- Ensure the chart is responsive (listen to window resize events).

## Sample Data

```json
[
  {
    "﻿\"\"\"iso_code\"\"\"": "ROU",
    "\"continent\"": "Europe",
    "\"location\"": "Romania",
    "\"date\"": "2020-09-05",
    "\"total_cases\"": 93864.0,
    "\"new_cases\"": 1269.0,
    "\"new_cases_smoothed\"": 1147.286,
    "\"total_deaths\"": 3850.0,
    "\"new_deaths\"": 38.0,
    "\"new_deaths_smoothed\"": 44.429,
    "\"total_cases_per_million\"": 4879.174,
    "\"new_cases_per_million\"": 65.964,
    "\"new_cases_smoothed_per_million\"": 59.637,
    "\"total_deaths_per_million\"": 200.128,
    "\"new_deaths_per_million\"": 1.975,
    "\"new_deaths_smoothed_per_million\"": 2.309,
    "\"reproduction_rate\"": 1.02,
    "\"icu_patients\"": 476.0,
    "\"icu_patients_per_million\"": 24.743,
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": 1901240.0,
    "\"total_tests_per_thousand\"": 98.829,
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": 17182.0,
    "\"new_tests_smoothed_per_thousand\"": 0.893,
    "\"positive_rate\"": 0.067,
    "\"tests_per_case\"": 15.0,
    "\"tests_units\"": "tests performed",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 45.37,
    "\"population\"": 19237682.0,
    "\"population_density\"": 85.129,
    "\"median_age\"": 43.0,
    "\"aged_65_older\"": 17.85,
    "\"aged_70_older\"": 11.69,
    "\"gdp_per_capita\"": 23313.199,
    "\"extreme_poverty\"": 5.7,
    "\"cardiovasc_death_rate\"": 370.946,
    "\"diabetes_prevalence\"": 9.74,
    "\"female_smokers\"": 22.9,
    "\"male_smokers\"": 37.1,
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 6.892,
    "\"life_expectancy\"": 76.05,
    "\"human_development_index\"": 0.811
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "EGY",
    "\"continent\"": "Africa",
    "\"location\"": "Egypt",
    "\"date\"": "2020-07-11",
    "\"total_cases\"": 81158.0,
    "\"new_cases\"": 923.0,
    "\"new_cases_smoothed\"": 1017.571,
    "\"total_deaths\"": 3769.0,
    "\"new_deaths\"": 67.0,
    "\"new_deaths_smoothed\"": 69.857,
    "\"total_cases_per_million\"": 793.067,
    "\"new_cases_per_million\"": 9.019,
    "\"new_cases_smoothed_per_million\"": 9.943999999999999,
    "\"total_deaths_per_million\"": 36.83,
    "\"new_deaths_per_million\"": 0.655,
    "\"new_deaths_smoothed_per_million\"": 0.683,
    "\"reproduction_rate\"": 0.81,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 60.19,
    "\"population\"": 102334403.0,
    "\"population_density\"": 97.999,
    "\"median_age\"": 25.3,
    "\"aged_65_older\"": 5.159,
    "\"aged_70_older\"": 2.891,
    "\"gdp_per_capita\"": 10550.206,
    "\"extreme_poverty\"": 1.3,
    "\"cardiovasc_death_rate\"": 525.432,
    "\"diabetes_prevalence\"": 17.31,
    "\"female_smokers\"": 0.2,
    "\"male_smokers\"": 50.1,
    "\"handwashing_facilities\"": 89.827,
    "\"hospital_beds_per_thousand\"": 1.6,
    "\"life_expectancy\"": 71.99,
    "\"human_development_index\"": 0.696
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "MLI",
    "\"continent\"": "Africa",
    "\"location\"": "Mali",
    "\"date\"": "2020-11-22",
    "\"total_cases\"": 4255.0,
    "\"new_cases\"": 49.0,
    "\"new_cases_smoothed\"": 50.714,
    "\"total_deaths\"": 145.0,
    "\"new_deaths\"": 2.0,
    "\"new_deaths_smoothed\"": 0.571,
    "\"total_cases_per_million\"": 210.115,
    "\"new_cases_per_million\"": 2.42,
    "\"new_cases_smoothed_per_million\"": 2.504,
    "\"total_deaths_per_million\"": 7.16,
    "\"new_deaths_per_million\"": 0.099,
    "\"new_deaths_smoothed_per_million\"": 0.028,
    "\"reproduction_rate\"": 1.18,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 37.96,
    "\"population\"": 20250834.0,
    "\"population_density\"": 15.196,
    "\"median_age\"": 16.4,
    "\"aged_65_older\"": 2.519,
    "\"aged_70_older\"": 1.486,
    "\"gdp_per_capita\"": 2014.306,
    "\"extreme_poverty\"": "",
    "\"cardiovasc_death_rate\"": 268.024,
    "\"diabetes_prevalence\"": 2.42,
    "\"female_smokers\"": 1.6,
    "\"male_smokers\"": 23.0,
    "\"handwashing_facilities\"": 52.232,
    "\"hospital_beds_per_thousand\"": 0.1,
    "\"life_expectancy\"": 59.31,
    "\"human_development_index\"": 0.427
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "EGY",
    "\"continent\"": "Africa",
    "\"location\"": "Egypt",
    "\"date\"": "2020-04-28",
    "\"total_cases\"": 5042.0,
    "\"new_cases\"": 260.0,
    "\"new_cases_smoothed\"": 221.714,
    "\"total_deaths\"": 359.0,
    "\"new_deaths\"": 22.0,
    "\"new_deaths_smoothed\"": 13.571,
    "\"total_cases_per_million\"": 49.27,
    "\"new_cases_per_million\"": 2.541,
    "\"new_cases_smoothed_per_million\"": 2.167,
    "\"total_deaths_per_million\"": 3.508,
    "\"new_deaths_per_million\"": 0.215,
    "\"new_deaths_smoothed_per_million\"": 0.133,
    "\"reproduction_rate\"": 1.32,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 84.26,
    "\"population\"": 102334403.0,
    "\"population_density\"": 97.999,
    "\"median_age\"": 25.3,
    "\"aged_65_older\"": 5.159,
    "\"aged_70_older\"": 2.891,
    "\"gdp_per_capita\"": 10550.206,
    "\"extreme_poverty\"": 1.3,
    "\"cardiovasc_death_rate\"": 525.432,
    "\"diabetes_prevalence\"": 17.31,
    "\"female_smokers\"": 0.2,
    "\"male_smokers\"": 50.1,
    "\"handwashing_facilities\"": 89.827,
    "\"hospital_beds_per_thousand\"": 1.6,
    "\"life_expectancy\"": 71.99,
    "\"human_development_index\"": 0.696
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "BWA",
    "\"continent\"": "Africa",
    "\"location\"": "Botswana",
    "\"date\"": "2020-11-19",
    "\"total_cases\"": 9594.0,
    "\"new_cases\"": 491.0,
    "\"new_cases_smoothed\"": 195.571,
    "\"total_deaths\"": 31.0,
    "\"new_deaths\"": 1.0,
    "\"new_deaths_smoothed\"": 0.571,
    "\"total_cases_per_million\"": 4079.732,
    "\"new_cases_per_million\"": 208.792,
    "\"new_cases_smoothed_per_million\"": 83.164,
    "\"total_deaths_per_million\"": 13.182,
    "\"new_deaths_per_million\"": 0.425,
    "\"new_deaths_smoothed_per_million\"": 0.243,
    "\"reproduction_rate\"": 0.87,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 50.93,
    "\"population\"": 2351625.0,
    "\"population_density\"": 4.044,
    "\"median_age\"": 25.8,
    "\"aged_65_older\"": 3.941,
    "\"aged_70_older\"": 2.242,
    "\"gdp_per_capita\"": 15807.374,
    "\"extreme_poverty\"": "",
    "\"cardiovasc_death_rate\"": 237.372,
    "\"diabetes_prevalence\"": 4.8100000000000005,
    "\"female_smokers\"": 5.7,
    "\"male_smokers\"": 34.4,
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 1.8,
    "\"life_expectancy\"": 69.59,
    "\"human_development_index\"": 0.717
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "JOR",
    "\"continent\"": "Asia",
    "\"location\"": "Jordan",
    "\"date\"": "2020-03-11",
    "\"total_cases\"": 1.0,
    "\"new_cases\"": 0.0,
    "\"new_cases_smoothed\"": 0.0,
    "\"total_deaths\"": "",
    "\"new_deaths\"": "",
    "\"new_deaths_smoothed\"": 0.0,
    "\"total_cases_per_million\"": 0.098,
    "\"new_cases_per_million\"": 0.0,
    "\"new_cases_smoothed_per_million\"": 0.0,
    "\"total_deaths_per_million\"": "",
    "\"new_deaths_per_million\"": "",
    "\"new_deaths_smoothed_per_million\"": 0.0,
    "\"reproduction_rate\"": "",
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 11.11,
    "\"population\"": 10203140.0,
    "\"population_density\"": 109.285,
    "\"median_age\"": 23.2,
    "\"aged_65_older\"": 3.81,
    "\"aged_70_older\"": 2.3609999999999998,
    "\"gdp_per_capita\"": 8337.49,
    "\"extreme_poverty\"": 0.1,
    "\"cardiovasc_death_rate\"": 208.257,
    "\"diabetes_prevalence\"": 11.75,
    "\"female_smokers\"": "",
    "\"male_smokers\"": "",
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 1.4,
    "\"life_expectancy\"": 74.53,
    "\"human_development_index\"": 0.735
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "GIN",
    "\"continent\"": "Africa",
    "\"location\"": "Guinea",
    "\"date\"": "2020-09-23",
    "\"total_cases\"": 10434.0,
    "\"new_cases\"": 47.0,
    "\"new_cases_smoothed\"": 40.0,
    "\"total_deaths\"": 65.0,
    "\"new_deaths\"": 0.0,
    "\"new_deaths_smoothed\"": 0.286,
    "\"total_cases_per_million\"": 794.5,
    "\"new_cases_per_million\"": 3.5789999999999997,
    "\"new_cases_smoothed_per_million\"": 3.046,
    "\"total_deaths_per_million\"": 4.949,
    "\"new_deaths_per_million\"": 0.0,
    "\"new_deaths_smoothed_per_million\"": 0.022,
    "\"reproduction_rate\"": 1.03,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 58.8,
    "\"population\"": 13132792.0,
    "\"population_density\"": 51.755,
    "\"median_age\"": 19.0,
    "\"aged_65_older\"": 3.135,
    "\"aged_70_older\"": 1.733,
    "\"gdp_per_capita\"": 1998.926,
    "\"extreme_poverty\"": 35.3,
    "\"cardiovasc_death_rate\"": 336.717,
    "\"diabetes_prevalence\"": 2.42,
    "\"female_smokers\"": "",
    "\"male_smokers\"": "",
    "\"handwashing_facilities\"": 17.45,
    "\"hospital_beds_per_thousand\"": 0.3,
    "\"life_expectancy\"": 61.6,
    "\"human_development_index\"": 0.459
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "JOR",
    "\"continent\"": "Asia",
    "\"location\"": "Jordan",
    "\"date\"": "2020-07-18",
    "\"total_cases\"": 1214.0,
    "\"new_cases\"": 5.0,
    "\"new_cases_smoothed\"": 5.429,
    "\"total_deaths\"": 11.0,
    "\"new_deaths\"": 1.0,
    "\"new_deaths_smoothed\"": 0.143,
    "\"total_cases_per_million\"": 118.983,
    "\"new_cases_per_million\"": 0.49,
    "\"new_cases_smoothed_per_million\"": 0.532,
    "\"total_deaths_per_million\"": 1.078,
    "\"new_deaths_per_million\"": 0.098,
    "\"new_deaths_smoothed_per_million\"": 0.014,
    "\"reproduction_rate\"": 1.07,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": "",
    "\"total_tests\"": "",
    "\"total_tests_per_thousand\"": "",
    "\"new_tests_per_thousand\"": "",
    "\"new_tests_smoothed\"": "",
    "\"new_tests_smoothed_per_thousand\"": "",
    "\"positive_rate\"": "",
    "\"tests_per_case\"": "",
    "\"tests_units\"": "",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 48.15,
    "\"population\"": 10203140.0,
    "\"population_density\"": 109.285,
    "\"median_age\"": 23.2,
    "\"aged_65_older\"": 3.81,
    "\"aged_70_older\"": 2.3609999999999998,
    "\"gdp_per_capita\"": 8337.49,
    "\"extreme_poverty\"": 0.1,
    "\"cardiovasc_death_rate\"": 208.257,
    "\"diabetes_prevalence\"": 11.75,
    "\"female_smokers\"": "",
    "\"male_smokers\"": "",
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 1.4,
    "\"life_expectancy\"": 74.53,
    "\"human_development_index\"": 0.735
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "AUS",
    "\"continent\"": "Oceania",
    "\"location\"": "Australia",
    "\"date\"": "2020-08-03",
    "\"total_cases\"": 18730.0,
    "\"new_cases\"": 412.0,
    "\"new_cases_smoothed\"": 489.571,
    "\"total_deaths\"": 232.0,
    "\"new_deaths\"": 11.0,
    "\"new_deaths_smoothed\"": 9.286,
    "\"total_cases_per_million\"": 734.513,
    "\"new_cases_per_million\"": 16.157,
    "\"new_cases_smoothed_per_million\"": 19.199,
    "\"total_deaths_per_million\"": 9.098,
    "\"new_deaths_per_million\"": 0.431,
    "\"new_deaths_smoothed_per_million\"": 0.364,
    "\"reproduction_rate\"": 1.09,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": 40529.0,
    "\"total_tests\"": 4386911.0,
    "\"total_tests_per_thousand\"": 172.037,
    "\"new_tests_per_thousand\"": 1.589,
    "\"new_tests_smoothed\"": 57117.0,
    "\"new_tests_smoothed_per_thousand\"": 2.24,
    "\"positive_rate\"": 0.009,
    "\"tests_per_case\"": 116.7,
    "\"tests_units\"": "tests performed",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 79.17,
    "\"population\"": 25499881.0,
    "\"population_density\"": 3.202,
    "\"median_age\"": 37.9,
    "\"aged_65_older\"": 15.504,
    "\"aged_70_older\"": 10.129,
    "\"gdp_per_capita\"": 44648.71,
    "\"extreme_poverty\"": 0.5,
    "\"cardiovasc_death_rate\"": 107.791,
    "\"diabetes_prevalence\"": 5.07,
    "\"female_smokers\"": 13.0,
    "\"male_smokers\"": 16.5,
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 3.84,
    "\"life_expectancy\"": 83.44,
    "\"human_development_index\"": 0.939
  },
  {
    "﻿\"\"\"iso_code\"\"\"": "LTU",
    "\"continent\"": "Europe",
    "\"location\"": "Lithuania",
    "\"date\"": "2020-10-11",
    "\"total_cases\"": 6122.0,
    "\"new_cases\"": 159.0,
    "\"new_cases_smoothed\"": 133.857,
    "\"total_deaths\"": 103.0,
    "\"new_deaths\"": 0.0,
    "\"new_deaths_smoothed\"": 1.286,
    "\"total_cases_per_million\"": 2248.841,
    "\"new_cases_per_million\"": 58.407,
    "\"new_cases_smoothed_per_million\"": 49.171,
    "\"total_deaths_per_million\"": 37.836,
    "\"new_deaths_per_million\"": 0.0,
    "\"new_deaths_smoothed_per_million\"": 0.472,
    "\"reproduction_rate\"": 1.3599999999999999,
    "\"icu_patients\"": "",
    "\"icu_patients_per_million\"": "",
    "\"hosp_patients\"": "",
    "\"hosp_patients_per_million\"": "",
    "\"weekly_icu_admissions\"": "",
    "\"weekly_icu_admissions_per_million\"": "",
    "\"weekly_hosp_admissions\"": "",
    "\"weekly_hosp_admissions_per_million\"": "",
    "\"new_tests\"": 2836.0,
    "\"total_tests\"": 782170.0,
    "\"total_tests_per_thousand\"": 287.32,
    "\"new_tests_per_thousand\"": 1.042,
    "\"new_tests_smoothed\"": 5961.0,
    "\"new_tests_smoothed_per_thousand\"": 2.19,
    "\"positive_rate\"": 0.022,
    "\"tests_per_case\"": 44.5,
    "\"tests_units\"": "tests performed",
    "\"total_vaccinations\"": "",
    "\"new_vaccinations\"": "",
    "\"total_vaccinations_per_hundred\"": "",
    "\"new_vaccinations_per_million\"": "",
    "\"stringency_index\"": 48.61,
    "\"population\"": 2722291.0,
    "\"population_density\"": 45.135,
    "\"median_age\"": 43.5,
    "\"aged_65_older\"": 19.002,
    "\"aged_70_older\"": 13.778,
    "\"gdp_per_capita\"": 29524.265,
    "\"extreme_poverty\"": 0.7,
    "\"cardiovasc_death_rate\"": 342.989,
    "\"diabetes_prevalence\"": 3.67,
    "\"female_smokers\"": 21.3,
    "\"male_smokers\"": 38.0,
    "\"handwashing_facilities\"": "",
    "\"hospital_beds_per_thousand\"": 6.5600000000000005,
    "\"life_expectancy\"": 75.93,
    "\"human_development_index\"": 0.858
  }
]
```

## Summary

Build a clean, responsive dashboard that loads the CSV, parses it, and displays a line chart comparing COVID total cases over time for the countries specified in the color palette. Ensure the default view focuses on India.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_10845/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Daily Cases
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[yr:date:ok] / [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[mn:date:ok])`
- cols_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_cases_per_million:qk]`
- series_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[mn:date:ok]`
- bar_orientation: `horizontal`
- zone: x=643, y=51485, w=98714, h=47525
- highlight_fields: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[mn:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[qr:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_cases_per_million:qk], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[tmn:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[tyr:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[yr:date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:location:nk]`
- cols_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_deaths:qk]`
- series_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:location:nk]`
- bar_orientation: `horizontal`
- zone: x=643, y=11262, w=35903, h=40223
- highlight_fields: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_deaths:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Cases
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[avg:new_cases:qk]`
- cols_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]`
- series_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]`
- bar_orientation: `vertical`
- zone: x=36546, y=11262, w=31486, h=40223
- highlight_fields: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Deaths
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[avg:new_deaths_per_million:qk]`
- cols_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]`
- series_field: `[federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]`
- bar_orientation: `vertical`
- zone: x=68032, y=11262, w=31325, h=40223
- highlight_fields: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=36225, y=51114, w=28032, h=8416): Purvit Vashishtha COVID-19 Analysis Dashboard
## Dashboard Actions
- Highlight 1 (generated) 1 1 1: kind=highlight_brush, source=Dashboard, target=Dashboard
## Highlight Bindings
- Top 10: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_deaths:qk]
- Daily Cases: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[mn:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[qr:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[sum:new_cases_per_million:qk], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[tmn:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[tyr:date:ok], [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[yr:date:ok]
- Total Cases: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]
- Total Deaths: [federated.17ox5ky0iutaqo1ecxaon1e8t3yr].[none:continent:nk]
