# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Swimmers Overview' using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Core:** React 18+, TypeScript, Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-force, d3-selection). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions, but prefer building with D3 for fidelity.
- **Styling:** CSS Modules or Tailwind CSS (choose one). Ensure the layout matches the Tableau dashboard structure.
- **Data:** The application must fetch data from `/data/vSwimmingCompetitions (SWIMMING_Comp).csv`.

## Data Loading
Implement a data loading utility that fetches the CSV file and parses it.

1. Use `d3-dsv` (d3.csvParse) to parse the raw CSV text.
2. Perform type coercion during parsing:
   - `CompID`, `StyleID`, `Distance`, `SwimmerId`, `TrainerID`, `SponsID` -> Number.
   - `CompDate`, `BirthDateSwimmers`, `CareerStartSwimmers`, `CareerStartTrainer`, `PayDate` -> Date object.
   - `ResTime` -> Date object (or string representing time).
   - `DopingRec` -> Boolean.
3. **Calculated Field:** Create a new property `Age` for each row using the formula: `new Date().getFullYear() - new Date(BirthDateSwimmers).getFullYear()`. (Approximating Tableau's `DATEDIFF('year', ...)`).
4. Handle null values appropriately (e.g., filter them out or map to null).

## Dashboard Layout
The dashboard 'Swimmers Overview' uses a grid layout. Recreate this using CSS Grid.

- **Container:** Fixed size or responsive container approximating the aspect ratio of the original (approx 1169x827).
- **Grid Areas:**
  - **Top Left:** `Swimmers by Rank` (Heatmap).
  - **Top Right:** Filter for `CountrySwimmers` (Dropdown/Checkbox).
  - **Bottom Left:** `Swimmers by Country` (Packed Bubble Chart).
  - **Bottom Right:** `Swimmers by Age` (Stacked Bar Chart).
  - **Bottom Right (Above Age):** Filter for `Сountry` (Competition Country).
  - **Bottom Right (Below Age):** Color Legend for `GenderSwimmer`.

## Component Specifications

### 1. SwimmersByRank (Heatmap)
- **Type:** Heatmap / Highlight Table.
- **Data:** Group data by `RankSwimmers` (Rows) and `RankTrainer` (Columns). Aggregate `CountD(SwimmerId)` for the cell value.
- **Visuals:**
  - X-Axis: `RankTrainer` (Categorical).
  - Y-Axis: `RankSwimmers` (Categorical).
  - Cells: Rectangles.
  - **Color:** Sequential scale based on `CountD(SwimmerId)`. Base color: `#86bcb6`. Lighter for lower counts, darker for higher.
  - **Size:** The size of the rectangle (width/height) can be fixed or slightly scaled by count if using a 'Square' plot, but standard heatmap usually uses fixed cell size with color encoding. The XML suggests `size-bar` encoding, implying the cell size might vary, but typically for a heatmap, color is the primary encoding. We will stick to a standard grid of squares colored by value.
  - **Labels:** Show count inside the cell. Font size 8px, color `#555555`.
- **Interaction:** Clicking a cell triggers a global filter action (Action Filter 1). It should filter the other charts by the selected `RankSwimmers` and `RankTrainer`.

### 2. SwimmersByCountry (Packed Bubble Chart)
- **Type:** Packed Bubble Chart.
- **Data:** Group by `Сountry` (Competition Country). Aggregate `CountD(SwimmerId)`.
- **Visuals:**
  - **Marks:** Circles.
  - **Size:** Radius proportional to `CountD(SwimmerId)`.
  - **Color:** Sequential color scale based on `CountD(SwimmerId)` (e.g., Light Blue to Dark Blue).
  - **Label:** Country name centered in the bubble. Font size 14px.
  - **Layout:** Use `d3-force` (`forceManyBody`, `forceCollide`, `forceCenter`) to pack bubbles without overlapping.
- **Interaction:** Tooltips showing Country and Count.

### 3. SwimmersByAge (Stacked Bar Chart)
- **Type:** Horizontal Stacked Bar Chart.
- **Data:** Group by `Age` (Calculated field) and `GenderSwimmer`. Aggregate `CountD(SwimmerId)`.
- **Visuals:**
  - **X-Axis:** `Age` (Numeric, likely binned or discrete integer).
  - **Y-Axis:** `CountD(SwimmerId)`.
  - **Color:** Encoded by `GenderSwimmer`.
    - Male ('M'): `#aec7e8`
    - Female ('F'): `#ff9da7`
    - Null: `#4e79a7`
  - **Labels:** Show labels on bars. Font size 8px, color `#555555`.
- **Filters:** This chart is filtered by `Сountry` (Competition Country) and the Action Filter from the Rank chart.

### 4. Filters & Legends
- **CountrySwimmers Filter:** A multi-select dropdown or checklist for `CountrySwimmers`. Filters the 'Swimmers by Rank' chart.
- **Competition Country Filter:** A multi-select dropdown or checklist for `Сountry`. Filters the 'Swimmers by Age' chart.
- **Gender Legend:** A simple legend showing the colors for Male and Female swimmers.

## Interactions & State Management
- **Global State:** Maintain a state object for active filters:
  - `selectedRankSwimmer`: string | null
  - `selectedRankTrainer`: string | null
  - `selectedCountrySwimmers`: string[]
  - `selectedCompCountry`: string[]
- **Action Filter:** When a user clicks a cell in `SwimmersByRank`, update `selectedRankSwimmer` and `selectedRankTrainer`. Pass these filters to `SwimmersByCountry` and `SwimmersByAge` to filter their datasets.
- **Cascading Filters:** Ensure that selecting a country updates the relevant charts immediately.

## Sample Data
Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿\"\"\"CompID\"\"\"": 256017,
    "\"CompDate\"": "2021-03-11",
    "\"Сountry\"": "Indonesia",
    "\"City\"": "Higetegera",
    "\"StyleID\"": 6,
    "\"Style\"": "Backstroke",
    "\"Distance\"": 200,
    "\"ResTime\"": "00:04:17",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 47318.0,
    "\"NameSwimmer\"": "Ingra Clayill",
    "\"GenderSwimmer\"": "F",
    "\"BirthDateSwimmers\"": "2000-02-29",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "U1",
    "\"CountrySwimmers\"": "Ukraine",
    "\"DopingRec\"": true,
    "\"TrainerID\"": 424.0,
    "\"NameTrainer\"": "Rex Bartel",
    "\"GenderTrainer\"": "M",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "2020-07-26",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 205944,
    "\"CompDate\"": "2021-03-15",
    "\"Сountry\"": "Macedonia",
    "\"City\"": "Sedlarevo",
    "\"StyleID\"": 6,
    "\"Style\"": "Backstroke",
    "\"Distance\"": 200,
    "\"ResTime\"": "00:01:54",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 53812.0,
    "\"NameSwimmer\"": "Junie Orwell",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "1991-01-29",
    "\"CareerStartSwimmers\"": "2017-09-05",
    "\"RankSwimmers\"": 2,
    "\"CountrySwimmers\"": "Egypt",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 595.0,
    "\"NameTrainer\"": "Patti Stokes",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "1969-07-06",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 4071,
    "\"CompDate\"": "2021-03-12",
    "\"Сountry\"": "Indonesia",
    "\"City\"": "Higetegera",
    "\"StyleID\"": 1,
    "\"Style\"": "Backstroke",
    "\"Distance\"": 100,
    "\"ResTime\"": "",
    "\"DisqID\"": 509.0,
    "\"Reason\"": "BBK",
    "\"Term\"": 40.79,
    "\"SwimmerId\"": 20357.0,
    "\"NameSwimmer\"": "Clarice Castelletti",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "2002-07-14",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "MS",
    "\"CountrySwimmers\"": "Nicaragua",
    "\"DopingRec\"": true,
    "\"TrainerID\"": 630.0,
    "\"NameTrainer\"": "Alisander Stanbridge",
    "\"GenderTrainer\"": "M",
    "\"RankTrainer\"": "CMS",
    "\"CareerStartTrainer\"": "2017-08-16",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 110755,
    "\"CompDate\"": "2021-03-20",
    "\"Сountry\"": "China",
    "\"City\"": "Antang",
    "\"StyleID\"": 4,
    "\"Style\"": "Front Crawl",
    "\"Distance\"": 100,
    "\"ResTime\"": "00:01:22",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 9749.0,
    "\"NameSwimmer\"": "Banky Perkinson",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "1989-11-17",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "MS",
    "\"CountrySwimmers\"": "France",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 221.0,
    "\"NameTrainer\"": "Vickie Yonnie",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "1973-12-18",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 379374,
    "\"CompDate\"": "2021-03-10",
    "\"Сountry\"": "China",
    "\"City\"": "Antang",
    "\"StyleID\"": 10,
    "\"Style\"": "Sidestroke",
    "\"Distance\"": 200,
    "\"ResTime\"": "",
    "\"DisqID\"": 916.0,
    "\"Reason\"": "SMMT",
    "\"Term\"": 47.11,
    "\"SwimmerId\"": 46332.0,
    "\"NameSwimmer\"": "Ikey Beaston",
    "\"GenderSwimmer\"": "F",
    "\"BirthDateSwimmers\"": "2000-02-29",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": 3,
    "\"CountrySwimmers\"": "Brazil",
    "\"DopingRec\"": true,
    "\"TrainerID\"": 283.0,
    "\"NameTrainer\"": "Warden Bowskill",
    "\"GenderTrainer\"": "M",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "1979-11-27",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 866568,
    "\"CompDate\"": "2021-09-10",
    "\"Сountry\"": "China",
    "\"City\"": "Jiufang",
    "\"StyleID\"": 24,
    "\"Style\"": "Front Crawl",
    "\"Distance\"": 800,
    "\"ResTime\"": "",
    "\"DisqID\"": 713.0,
    "\"Reason\"": "SJR",
    "\"Term\"": 77.95,
    "\"SwimmerId\"": 92225.0,
    "\"NameSwimmer\"": "Terry Sabathier",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "2000-02-29",
    "\"CareerStartSwimmers\"": "2000-04-16",
    "\"RankSwimmers\"": "U1",
    "\"CountrySwimmers\"": "Poland",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 506.0,
    "\"NameTrainer\"": "Ottilie Courtliff",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "2020-09-23",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 92201,
    "\"CompDate\"": "2021-03-16",
    "\"Сountry\"": "China",
    "\"City\"": "Antang",
    "\"StyleID\"": 4,
    "\"Style\"": "Front Crawl",
    "\"Distance\"": 100,
    "\"ResTime\"": "00:03:44",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 69584.0,
    "\"NameSwimmer\"": "Modesty Gray",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "1989-09-19",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": 3,
    "\"CountrySwimmers\"": "Brazil",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 282.0,
    "\"NameTrainer\"": "Rennie Aitchinson",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "1965-02-07",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 524203,
    "\"CompDate\"": "2021-09-10",
    "\"Сountry\"": "China",
    "\"City\"": "Gaojian",
    "\"StyleID\"": 15,
    "\"Style\"": "Sidestroke",
    "\"Distance\"": 400,
    "\"ResTime\"": "00:02:33",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 29087.0,
    "\"NameSwimmer\"": "Dorey Franzen",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "2000-02-29",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "U3",
    "\"CountrySwimmers\"": "Russia",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 708.0,
    "\"NameTrainer\"": "Farica Rooper",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "MS",
    "\"CareerStartTrainer\"": "1985-10-09",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 83188,
    "\"CompDate\"": "2021-03-20",
    "\"Сountry\"": "Sweden",
    "\"City\"": "Kungshamn",
    "\"StyleID\"": 4,
    "\"Style\"": "Front Crawl",
    "\"Distance\"": 100,
    "\"ResTime\"": "00:03:45",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 26359.0,
    "\"NameSwimmer\"": "Danya Bolf",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "2000-02-29",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "U2",
    "\"CountrySwimmers\"": "Cuba",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 201.0,
    "\"NameTrainer\"": "Sharona Vondrak",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "WMS",
    "\"CareerStartTrainer\"": "1957-08-11",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  },
  {
    "﻿\"\"\"CompID\"\"\"": 513700,
    "\"CompDate\"": "2021-09-17",
    "\"Сountry\"": "France",
    "\"City\"": "Mont-de-Marsan",
    "\"StyleID\"": 15,
    "\"Style\"": "Sidestroke",
    "\"Distance\"": 400,
    "\"ResTime\"": "00:01:03",
    "\"DisqID\"": "",
    "\"Reason\"": "",
    "\"Term\"": "",
    "\"SwimmerId\"": 85860.0,
    "\"NameSwimmer\"": "Samuele Rapkins",
    "\"GenderSwimmer\"": "M",
    "\"BirthDateSwimmers\"": "1997-07-16",
    "\"CareerStartSwimmers\"": "2005-05-20",
    "\"RankSwimmers\"": "U3",
    "\"CountrySwimmers\"": "Mongolia",
    "\"DopingRec\"": false,
    "\"TrainerID\"": 681.0,
    "\"NameTrainer\"": "Cristi Kneeland",
    "\"GenderTrainer\"": "F",
    "\"RankTrainer\"": "MS",
    "\"CareerStartTrainer\"": "2000-03-11",
    "\"SponsID\"": "",
    "\"NameSponsors\"": "",
    "\"Sum\"": "",
    "\"PayDate\"": ""
  }
]
```

## Implementation Notes
- Ensure the application handles the large dataset size (~170MB) efficiently. Consider using Web Workers for parsing if the main thread blocks, or simple pagination/virtualization if rendering lists (though charts aggregate data).
- Preserve the exact titles and labels from the XML (e.g., "Amount of swimmers by Age", "Rank by Swimmers by Trainers Rank").
- The color palette must match the hex codes provided in the XML.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/vSwimmingCompetitions (SWIMMING_Comp).csv

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
const rows = await loadCsv("/data/vSwimmingCompetitions (SWIMMING_Comp).csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_160/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Swimmers by Age
- chart_intent: `vertical_ranked_bar`
- rows_field: `([federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk] * [federated.15oasa50fhs26j1fbotsl1pz1pfh].[ctd:SwimmerId:qk])`
- cols_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:BirthDateSwimmers (copy)_818529261980127232:ok]`
- series_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk]`
- bar_orientation: `vertical`
- zone: x=46621, y=45345, w=51326, h=53930
- legend_required: true
- legend_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Swimmers by Country
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[ctd:SwimmerId:qk]`
- zone: x=599, y=44135, w=44825, h=74002
- highlight_fields: [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:Сountry:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Swimmers by Rank 
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:RankSwimmers:nk]`
- cols_field: `([federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:RankTrainer:nk] * [federated.15oasa50fhs26j1fbotsl1pz1pfh].[ctd:SwimmerId:qk])`
- series_field: `[federated.15oasa50fhs26j1fbotsl1pz1pfh].[attr:RankSwimmers:nk]`
- bar_orientation: `horizontal`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Swimmers by Rank , target=Swimmers Overview
## Highlight Bindings
- Swimmers by Rank : [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:RankTrainer:nk], [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:TrainerID:ok]
- Swimmers by Country: [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:Сountry:nk]
- Swimmers by Age: [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk]
- Swimmers by Age: [federated.15oasa50fhs26j1fbotsl1pz1pfh].[none:GenderSwimmer:nk]
