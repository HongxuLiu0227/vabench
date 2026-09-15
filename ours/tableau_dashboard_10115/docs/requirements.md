# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Suicide Trends In Thailand' using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions, but prefer raw D3 for fidelity.
- **Styling:** CSS Modules or Styled Components. Replicate the exact colors and fonts found in the specification.
- **Data:** The data is located at `/data/suicide trend.csv`.

## Data Loading

You must implement a data loading utility to fetch and parse the CSV file.

1.  **Fetch:** Use the native `fetch` API to get the data from `/data/suicide trend.csv`.
2.  **Parse:** Use `d3-dsv` (specifically `d3.csvParse`) to parse the raw CSV text into an array of objects.
3.  **Typing:** Define a TypeScript interface `SuicideData` matching the columns: `country`, `year`, `sex`, `age`, `suicides_no`, `population`, `suicides/100k pop`, `country-year`, `HDI for year`, `gdp_for_year ($)`, `gdp_per_capita ($)`, `generation`.
4.  **Default Filter:** The dashboard is scoped to 'Thailand'. Ensure the data is filtered where `country === 'Thailand'` before passing it to the visualization components.

## Sample Data

```json
[
  {
    "﻿country": "Italy",
    "year": 2013,
    "sex": "female",
    "age": "15-24 years",
    "suicides_no": 49,
    "population": 2892351,
    "suicides/100k pop": 1.69,
    "country-year": "Italy2013",
    "HDI for year": 0.873,
    " gdp_for_year ($) ": 2130491320659,
    "gdp_per_capita ($)": 37050,
    "generation": "Millenials"
  },
  {
    "﻿country": "Hungary",
    "year": 2012,
    "sex": "male",
    "age": "5-14 years",
    "suicides_no": 2,
    "population": 497525,
    "suicides/100k pop": 0.4,
    "country-year": "Hungary2012",
    "HDI for year": 0.823,
    " gdp_for_year ($) ": 127856647108,
    "gdp_per_capita ($)": 13525,
    "generation": "Generation Z"
  },
  {
    "﻿country": "Japan",
    "year": 1994,
    "sex": "male",
    "age": "75+ years",
    "suicides_no": 1364,
    "population": 2476000,
    "suicides/100k pop": 55.09,
    "country-year": "Japan1994",
    "HDI for year": "",
    " gdp_for_year ($) ": 4907039384470,
    "gdp_per_capita ($)": 41563,
    "generation": "G.I. Generation"
  },
  {
    "﻿country": "Seychelles",
    "year": 2008,
    "sex": "male",
    "age": "25-34 years",
    "suicides_no": 1,
    "population": 8453,
    "suicides/100k pop": 11.83,
    "country-year": "Seychelles2008",
    "HDI for year": "",
    " gdp_for_year ($) ": 967199594,
    "gdp_per_capita ($)": 11667,
    "generation": "Generation X"
  },
  {
    "﻿country": "Spain",
    "year": 2015,
    "sex": "male",
    "age": "55-74 years",
    "suicides_no": 736,
    "population": 4750328,
    "suicides/100k pop": 15.49,
    "country-year": "Spain2015",
    "HDI for year": "",
    " gdp_for_year ($) ": 1197789902774,
    "gdp_per_capita ($)": 27108,
    "generation": "Boomers"
  },
  {
    "﻿country": "Panama",
    "year": 1999,
    "sex": "female",
    "age": "5-14 years",
    "suicides_no": 2,
    "population": 304856,
    "suicides/100k pop": 0.66,
    "country-year": "Panama1999",
    "HDI for year": "",
    " gdp_for_year ($) ": 12130252200,
    "gdp_per_capita ($)": 4606,
    "generation": "Millenials"
  },
  {
    "﻿country": "Antigua and Barbuda",
    "year": 2015,
    "sex": "female",
    "age": "55-74 years",
    "suicides_no": 1,
    "population": 6403,
    "suicides/100k pop": 15.62,
    "country-year": "Antigua and Barbuda2015",
    "HDI for year": "",
    " gdp_for_year ($) ": 1364863037,
    "gdp_per_capita ($)": 14853,
    "generation": "Boomers"
  },
  {
    "﻿country": "Greece",
    "year": 2014,
    "sex": "male",
    "age": "35-54 years",
    "suicides_no": 165,
    "population": 1564680,
    "suicides/100k pop": 10.55,
    "country-year": "Greece2014",
    "HDI for year": 0.865,
    " gdp_for_year ($) ": 237029579261,
    "gdp_per_capita ($)": 22834,
    "generation": "Generation X"
  },
  {
    "﻿country": "Mexico",
    "year": 2010,
    "sex": "female",
    "age": "25-34 years",
    "suicides_no": 177,
    "population": 9676184,
    "suicides/100k pop": 1.83,
    "country-year": "Mexico2010",
    "HDI for year": 0.746,
    " gdp_for_year ($) ": 1057801282051,
    "gdp_per_capita ($)": 9991,
    "generation": "Generation X"
  },
  {
    "﻿country": "Jamaica",
    "year": 1991,
    "sex": "female",
    "age": "15-24 years",
    "suicides_no": 0,
    "population": 250172,
    "suicides/100k pop": 0.0,
    "country-year": "Jamaica1991",
    "HDI for year": "",
    " gdp_for_year ($) ": 4071219198,
    "gdp_per_capita ($)": 1889,
    "generation": "Generation X"
  }
]
```

## Component Architecture

The application consists of a main `Dashboard` component that orchestrates the layout and state, and four visualization components corresponding to the Tableau worksheets.

### 1. Dashboard Layout (`Dashboard.tsx`)
- **Layout:** Use CSS Grid to replicate the layout.
  - **Header:** Full width, centered text "Suicide Trends In Thailand". Font: 'Prompt SemiBold', Size: 36px, Color: #75a1c7. Background: #f0f3fa.
  - **Main Grid:** Two columns.
    - **Left Column (approx 60%):**
      - Top: `Sheet1` (Suicide Rates Per Year). Background: #f3faf9, Border: 1px solid #75a1c7.
      - Bottom: `Sheet4` (Suicide Rates By GDP). Background: #f3faf9, Border: 1px solid #a0cbe8.
    - **Right Column (approx 40%):**
      - Top: `Sheet3` (Suicide Rates By Ages). Background: #f3faf9, Border: 1px solid #75a1c7.
      - Bottom: `Sheet2` (Suicide Rates Between Sex and Generations). Background: #f3faf9, Border: 1px solid #75a1c7.

### 2. Sheet 1: Suicide Rates Per Year (`Sheet1.tsx`)
- **Type:** Line Chart.
- **Data:** Aggregated `SUM(suicides_no)` grouped by `year`.
- **Encodings:**
  - **X-Axis:** `year` (Quantitative/Ordinal). Range: Data extent.
  - **Y-Axis:** `SUM(suicides_no)` (Quantitative).
  - **Color:** Sequential interpolation based on `SUM(suicides_no)`. Use the palette: `['#f1f1f1', '#d6dee6', '#beccdb', '#a6bbd0', '#90abc5', '#7c9cbb', '#698db0', '#577fa5', '#47719a', '#39648f', '#2c5985']`.
  - **Marks:** Line with points. Labels enabled (show values).
- **Interactions:** Clicking a point filters the global state `selectedYear`.

### 3. Sheet 2: Suicide Rates Between Sex and Generations (`Sheet2.tsx`)
- **Type:** Bar Chart (Grouped or Stacked, likely Grouped given the 'sex' detail).
- **Data:** `SUM(suicides_no)` grouped by `generation` and `sex`.
- **Encodings:**
  - **X-Axis:** `generation` (Nominal).
  - **Y-Axis:** `SUM(suicides_no)`.
  - **Color:** Sequential interpolation (same palette as Sheet 1) based on `SUM(suicides_no)`.
  - **Detail:** `sex` (used to split the bars).
- **Sorting:** Sort generations by `SUM(suicides_no)` in Descending order.
- **Interactions:** Clicking a bar filters the global state `selectedGeneration` and `selectedSex`.

### 4. Sheet 3: Suicide Rates By Ages (`Sheet3.tsx`)
- **Type:** Horizontal Bar Chart.
- **Data:** `SUM(suicides_no)` grouped by `age`.
- **Encodings:**
  - **Y-Axis:** `age` (Nominal).
  - **X-Axis:** `SUM(suicides_no)`.
  - **Color:** Sequential interpolation (same palette) based on `SUM(suicides_no)`.
  - **Size:** Bar width corresponds to value.
- **Sorting:** Sort ages by `SUM(suicides_no)` in Ascending order (per XML `direction='ASC'`).

### 5. Sheet 4: Suicide Rates By GDP (`Sheet4.tsx`)
- **Type:** Line Chart.
- **Data:** `SUM(suicides_no)` vs `gdp_for_year ($)`.
- **Encodings:**
  - **X-Axis:** `gdp_for_year ($)` (Quantitative).
  - **Y-Axis:** `SUM(suicides_no)`.
  - **Color:** Fixed color `#2c5985`.
- **Interactions:** Clicking a point filters the global state `selectedGDP`.

## State Management & Interactions

Implement a global filter state (e.g., using React Context or lifting state up to `Dashboard.tsx`) containing:
- `selectedYear`: number | null
- `selectedGeneration`: string | null
- `selectedSex`: string | null
- `selectedGDP`: number | null

**Filtering Logic:**
- When a user interacts with Sheet 1, update `selectedYear`. All other sheets should filter their data to include only records matching that year.
- When a user interacts with Sheet 2, update `selectedGeneration` and `selectedSex`. All other sheets should filter accordingly.
- When a user interacts with Sheet 4, update `selectedGDP`. All other sheets should filter accordingly.
- Filters are cumulative (AND logic).

## Styling Specifics
- **Fonts:** Use 'Prompt' font family if available, otherwise fallback to sans-serif.
- **Colors:**
  - Title Text: #75a1c7
  - Chart Backgrounds: #f3faf9
  - Borders: #75a1c7 (standard), #a0cbe8 (Sheet 4)
  - Main Background: #f0f3fa
- **Tooltips:** Implement custom HTML tooltips that appear on hover over marks, displaying the dimension values and the sum of suicides.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/suicide trend.csv

Example (CSV via fetch):
```ts
async function loadCsv(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const csvText = await res.text();
  // Prefer a robust CSV parser (e.g. PapaParse) for production; keep a minimal parser if needed.
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

// Default entrypoint
const rows = await loadCsv("/data/suicide trend.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_10115/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 1
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]`
- cols_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:year:qk]`
- series_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk]`
- zone: x=483, y=8246, w=58841, h=45413
- highlight_fields: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 2
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]`
- cols_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:generation:nk]`
- series_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]`
- bar_orientation: `vertical`
- zone: x=59324, y=53659, w=40193, h=45412
- highlight_fields: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:generation:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:age:nk]`
- cols_field: ``
- series_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]`
- zone: x=59324, y=8246, w=40193, h=38444
- highlight_fields: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:age:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 4
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]`
- cols_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:gdp_for_year ($):qk]`
- series_field: `[federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk]`
- zone: x=483, y=53659, w=58841, h=45412
- highlight_fields: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:age:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:gdp_for_year ($):qk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:year:qk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:gdp_per_capita ($):qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=483, y=929, w=99034, h=7317): Suicide Trends In Thailand
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sheet 1, target=Dashboard 1
- Filter 2 (generated): kind=filter_action, source=Sheet 2, target=Dashboard 1
- Filter 3 (generated): kind=filter_action, source=Sheet 4, target=Dashboard 1
## Highlight Bindings
- Sheet 1: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]
- Sheet 2: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:generation:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk]
- Sheet 3: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:age:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:sex:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:suicides_no:qk]
- Sheet 4: [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:age:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:country:nk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:gdp_for_year ($):qk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[none:year:qk], [federated.1xdgsy21nx11aw18vwq0q1q7a7kf].[sum:gdp_per_capita ($):qk]
