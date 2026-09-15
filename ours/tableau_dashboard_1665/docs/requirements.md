# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the following specification.

# Project Overview
Recreate the Tableau dashboard "Recognizability of 90's Artists in 2020 by Millenials and Gen-Zs - Andrew Liawan" using React, TypeScript, and Vite.

# Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-dsv` for visualizations. Do not use high-level chart libraries.
- CSS: Use standard CSS or CSS Modules. Use CSS Grid for the main dashboard layout.

# Data Loading
The data is located at `/data/final_df.csv`.

1.  Create a utility function `useData.ts` to fetch and parse the CSV.
2.  Use `d3.csvParse` (from `d3-dsv`) to parse the raw text.
3.  Type the data row as follows:
    ```typescript
    interface DataRow {
      artist: string;
      "13 Years Old": number;
      "12 Years Old": number;
      "11 Years Old": number;
      "10 Years Old": number;
      "9 Years Old": number;
      "8 Years Old": number;
      "7 Years Old": number;
      "6 Years Old": number;
      "5 Years Old": number;
      "4 Years Old": number;
      "3 Years Old": number;
      "2 Years Old": number;
      "1 Years Old": number;
      "Year Born": number;
      "Recognition by Millennials": number;
      "Recognition by Gen-Zs": number;
      "No. of Songs": number;
    }
    ```

# Sample Data
```json
[
  {
    "artist": "Paula Abdul",
    "13 Years Old": 0.802350427350427,
    "12 Years Old": 0.866666666666667,
    "11 Years Old": 0.829268292682927,
    "10 Years Old": 0.605263157894737,
    "9 Years Old": 0.755555555555556,
    "8 Years Old": 0.589285714285714,
    "7 Years Old": 0.589285714285714,
    "6 Years Old": 0.464285714285714,
    "5 Years Old": 0.457142857142857,
    "4 Years Old": 0.428571428571429,
    "3 Years Old": 0.225806451612903,
    "2 Years Old": 0.298507462686567,
    "1 Years Old": 0.168831168831169,
    "Year Born": 0.2,
    "Recognition by Millennials": 0.322589176033034,
    "Recognition by Gen-Zs": 0.153124123094412,
    "No. of Songs": 3
  },
  {
    "artist": "R. Kelly",
    "13 Years Old": 0.978494623655914,
    "12 Years Old": 0.983333333333333,
    "11 Years Old": 0.985507246376812,
    "10 Years Old": 0.962264150943396,
    "9 Years Old": 0.985294117647059,
    "8 Years Old": 0.92156862745098,
    "7 Years Old": 0.970588235294118,
    "6 Years Old": 0.939393939393939,
    "5 Years Old": 0.981132075471698,
    "4 Years Old": 0.958333333333333,
    "3 Years Old": 0.938775510204082,
    "2 Years Old": 0.891304347826087,
    "1 Years Old": 0.966666666666667,
    "Year Born": 0.830188679245283,
    "Recognition by Millennials": 0.962349709280719,
    "Recognition by Gen-Zs": 0.819578741797448,
    "No. of Songs": 5
  },
  {
    "artist": "Usher",
    "13 Years Old": 0.514430684554524,
    "12 Years Old": 0.546875,
    "11 Years Old": 0.471698113207547,
    "10 Years Old": 0.45,
    "9 Years Old": 0.550724637681159,
    "8 Years Old": 0.338709677419355,
    "7 Years Old": 0.303030303030303,
    "6 Years Old": 0.413793103448276,
    "5 Years Old": 0.403846153846154,
    "4 Years Old": 0.25,
    "3 Years Old": 0.215686274509804,
    "2 Years Old": 0.266666666666667,
    "1 Years Old": 0.236842105263158,
    "Year Born": 0.133333333333333,
    "Recognition by Millennials": 0.428589042924803,
    "Recognition by Gen-Zs": 0.156916517803726,
    "No. of Songs": 3
  },
  {
    "artist": "Michael Jackson",
    "13 Years Old": 0.992248062015504,
    "12 Years Old": 0.96551724137931,
    "11 Years Old": 0.956521739130435,
    "10 Years Old": 0.981132075471698,
    "9 Years Old": 0.96875,
    "8 Years Old": 0.982142857142857,
    "7 Years Old": 1.0,
    "6 Years Old": 0.98,
    "5 Years Old": 0.928571428571429,
    "4 Years Old": 0.933333333333333,
    "3 Years Old": 0.830188679245283,
    "2 Years Old": 0.85,
    "1 Years Old": 0.797101449275362,
    "Year Born": 0.811320754716981,
    "Recognition by Millennials": 0.893535723996891,
    "Recognition by Gen-Zs": 0.812752525252525,
    "No. of Songs": 3
  },
  {
    "artist": "C+C Music Factory",
    "13 Years Old": 0.93616452991453,
    "12 Years Old": 0.95,
    "11 Years Old": 0.976744186046512,
    "10 Years Old": 0.964285714285714,
    "9 Years Old": 0.851851851851852,
    "8 Years Old": 0.844444444444444,
    "7 Years Old": 0.877551020408163,
    "6 Years Old": 0.876923076923077,
    "5 Years Old": 0.956521739130435,
    "4 Years Old": 0.876923076923077,
    "3 Years Old": 0.835820895522388,
    "2 Years Old": 0.816326530612245,
    "1 Years Old": 0.950819672131147,
    "Year Born": 0.830985915492958,
    "Recognition by Millennials": 0.873686203128234,
    "Recognition by Gen-Zs": 0.689387768664084,
    "No. of Songs": 3
  },
  {
    "artist": "Puff Daddy",
    "13 Years Old": 0.60816808832761,
    "12 Years Old": 0.592592592592593,
    "11 Years Old": 0.426229508196721,
    "10 Years Old": 0.438356164383562,
    "9 Years Old": 0.4,
    "8 Years Old": 0.538461538461538,
    "7 Years Old": 0.366666666666667,
    "6 Years Old": 0.396551724137931,
    "5 Years Old": 0.395833333333333,
    "4 Years Old": 0.465116279069767,
    "3 Years Old": 0.276595744680851,
    "2 Years Old": 0.211538461538462,
    "1 Years Old": 0.358974358974359,
    "Year Born": 0.433962264150943,
    "Recognition by Millennials": 0.452602377469291,
    "Recognition by Gen-Zs": 0.364862114862115,
    "No. of Songs": 3
  },
  {
    "artist": "Toni Braxton",
    "13 Years Old": 0.974389282899921,
    "12 Years Old": 0.924528301886792,
    "11 Years Old": 0.955223880597015,
    "10 Years Old": 0.932203389830508,
    "9 Years Old": 0.950819672131147,
    "8 Years Old": 0.907894736842105,
    "7 Years Old": 0.936507936507937,
    "6 Years Old": 0.842105263157895,
    "5 Years Old": 0.862068965517241,
    "4 Years Old": 0.88,
    "3 Years Old": 0.777777777777778,
    "2 Years Old": 0.818181818181818,
    "1 Years Old": 0.642857142857143,
    "Year Born": 0.666666666666667,
    "Recognition by Millennials": 0.901616287412525,
    "Recognition by Gen-Zs": 0.584686740240068,
    "No. of Songs": 3
  },
  {
    "artist": "Ace Of Base",
    "13 Years Old": 0.978571428571429,
    "12 Years Old": 0.954545454545455,
    "11 Years Old": 0.983606557377049,
    "10 Years Old": 0.933333333333333,
    "9 Years Old": 0.954545454545455,
    "8 Years Old": 0.953846153846154,
    "7 Years Old": 1.0,
    "6 Years Old": 0.893333333333333,
    "5 Years Old": 0.904761904761905,
    "4 Years Old": 0.875,
    "3 Years Old": 0.805970149253731,
    "2 Years Old": 0.725490196078431,
    "1 Years Old": 0.770833333333333,
    "Year Born": 0.765957446808511,
    "Recognition by Millennials": 0.879769207133577,
    "Recognition by Gen-Zs": 0.597304467747343,
    "No. of Songs": 3
  },
  {
    "artist": "Michael Bolton",
    "13 Years Old": 0.930499325236167,
    "12 Years Old": 0.846153846153846,
    "11 Years Old": 0.896551724137931,
    "10 Years Old": 0.66,
    "9 Years Old": 0.666666666666667,
    "8 Years Old": 0.666666666666667,
    "7 Years Old": 0.625,
    "6 Years Old": 0.553846153846154,
    "5 Years Old": 0.611940298507463,
    "4 Years Old": 0.444444444444444,
    "3 Years Old": 0.436363636363636,
    "2 Years Old": 0.447761194029851,
    "1 Years Old": 0.421052631578947,
    "Year Born": 0.39344262295082,
    "Recognition by Millennials": 0.446315717016527,
    "Recognition by Gen-Zs": 0.245248408590127,
    "No. of Songs": 4
  },
  {
    "artist": "Brandy",
    "13 Years Old": 0.483771442675552,
    "12 Years Old": 0.5,
    "11 Years Old": 0.403508771929825,
    "10 Years Old": 0.375,
    "9 Years Old": 0.305084745762712,
    "8 Years Old": 0.245614035087719,
    "7 Years Old": 0.181818181818182,
    "6 Years Old": 0.196428571428571,
    "5 Years Old": 0.19047619047619,
    "4 Years Old": 0.101694915254237,
    "3 Years Old": 0.166666666666667,
    "2 Years Old": 0.17741935483871,
    "1 Years Old": 0.162790697674419,
    "Year Born": 0.241379310344828,
    "Recognition by Millennials": 0.374129973438098,
    "Recognition by Gen-Zs": 0.165090362744424,
    "No. of Songs": 3
  }
]
```

# Component Architecture

## App Component
- Manages the global state for the selected artist (filter).
- State: `selectedArtist: string | null`.
- Fetches data using `useData`.
- Renders the `Dashboard` layout.

## Dashboard Layout
Use CSS Grid to replicate the layout defined in the workbook.

**Grid Structure:**
- **Header**: Title "Recognizability of 90's Artists in 2020 by Millenials and Gen-Zs - Andrew Liawan".
- **Main Content Area**: A 2-column grid (approx 85% width / 15% width).
    - **Left Column (Charts)**: A 2x2 grid.
        - Top-Left: `Number of Songs in the 90s`
        - Top-Right: `Recognizability by Age When Song Was Released`
        - Bottom-Left: `Number of Songs vs. Recognizability`
        - Bottom-Right: `Mean Recognizability by Age When Song Was Released`
    - **Right Column (Legends)**: Vertical stack.
        - Top: Color Legend (Artist)
        - Bottom: Shape Legend (Measure Names)
- **Footer**: Full width.
    - `Millenials vs. Gen-Zs`

## Chart Components

### 1. Number of Songs in the 90s (`SongsBarChart`)
- **Type**: Horizontal Bar Chart.
- **Data**: `No. of Songs` per `artist`.
- **Encoding**:
    - X-Axis: `No. of Songs` (Range: 0 to 19, fixed).
    - Y-Axis: `artist` (Sorted Descending by `No. of Songs`).
    - Color: `#e15759` (Red).
- **Interaction**: Clicking a bar sets the `selectedArtist` state in the parent.
- **Styling**: Axis titles hidden or minimal. Font size ~12px.

### 2. Recognizability by Age When Song Was Released (`AgeLineChart`)
- **Type**: Multi-Line Chart.
- **Data**: Pivoted data. X-axis is Age (Year Born, 1-13), Y-axis is Recognizability (0-1).
- **Encoding**:
    - X-Axis: Categorical ("Year Born", "1 Years Old", ..., "13 Years Old").
    - Y-Axis: Linear (0.0 to 1.0, fixed). Title: "Recognizability".
    - Color: Mapped to `artist`. Use the specific color mapping provided below.
    - Mark: Line.
- **Filter**: If `selectedArtist` is not null, highlight that artist's line and dim others, or filter to show only that artist.

### 3. Number of Songs vs. Recognizability (`ScatterPlot`)
- **Type**: Scatter Plot.
- **Data**: `No. of Songs` vs `Recognition by Millennials` and `Recognition by Gen-Zs`.
- **Encoding**:
    - X-Axis: `No. of Songs` (Range: 0 to 19, fixed).
    - Y-Axis: `Recognizability` (0.0 to 1.0, fixed). Title: "Recognizability".
    - Color: Mapped to `artist` (Same mapping as Line Chart).
    - Shape: Mapped to Measure Name ("Recognition by Millennials" = Square, "Recognition by Gen-Zs" = Circle).
- **Filter**: If `selectedArtist` is not null, highlight that artist's points.

### 4. Mean Recognizability by Age When Song Was Released (`MeanLineChart`)
- **Type**: Line Chart (Aggregated).
- **Data**: Average recognizability across all (or filtered) artists for each age.
- **Encoding**:
    - X-Axis: Categorical ("Year Born", "1 Years Old", ..., "13 Years Old").
    - Y-Axis: Linear (0.0 to 1.0, fixed). Title: "Recognizability".
    - Color: `#4e79a7` (Blue).
- **Filter**: Calculate the mean based on the `selectedArtist`. If an artist is selected, the line represents that single artist (or the mean of the selection if multiple were supported, but here it's single).

### 5. Millenials vs. Gen-Zs (`ComparisonChart`)
- **Type**: Horizontal Dot Plot / Bar Chart.
- **Data**: `Recognition by Millennials` and `Recognition by Gen-Zs`.
- **Encoding**:
    - X-Axis: `Recognizability` (0.0 to 1.0, fixed). Title: "Recognizability".
    - Y-Axis: Categorical ("Recognition by Millennials", "Recognition by Gen-Zs").
    - Mark: Circle or Bar.
    - Reference Line: Average value across the dataset (vertical line).
- **Filter**: If `selectedArtist` is not null, show values for that specific artist.

### 6. Legends
- **Color Legend**: Display the mapping of Artists to Colors.
- **Shape Legend**: Display the mapping of Measure Names to Shapes (Circle = Gen-Zs, Square = Millennials).

# Color Mapping (Artist)
Use this specific ordinal scale for artists:
```typescript
const artistColorScale: Record<string, string> = {
  "Ace Of Base": "#4e79a7",
  "Boyz II Men": "#4e79a7",
  "The Notorious B.I.G": "#4e79a7",
  "Madonna": "#59a14f",
  "Celine Dion": "#76b7b2",
  "Wilson Phillips": "#8cd17d",
  "Toni Braxton": "#9c755f",
  "Puff Daddy": "#9d7660",
  "Savage Garden": "#a0cbe8",
  "R. Kelly": "#b07aa1",
  "Color Me Badd": "#b6992d",
  "Whitney Houston": "#bab0ac",
  "Monica": "#d37295",
  "Phil Collins": "#d4a6c8",
  "Roxette": "#d7b5a6",
  "C+C Music Factory": "#e15759",
  "Janet Jackson": "#e15759",
  "Mariah Carey": "#edc948",
  "Michael Jackson": "#edc948",
  "En Vogue": "#f1ce63",
  "Bryan Adams": "#f28e2b",
  "Paula Abdul": "#fabfd2",
  "Michael Bolton": "#ff9d9a",
  "TLC": "#ff9da7",
  "Brandy": "#ffbe7d",
  "Usher": "#ffbe7d"
};
```

# Implementation Details
- **Dimensions**: Use `viewBox` for SVGs to ensure responsiveness. Set container widths to 100%.
- **Margins**: Standardize margins (e.g., top: 20, right: 20, bottom: 40, left: 50) to accommodate axis labels.
- **Tooltips**: Implement a simple tooltip that follows the mouse cursor to show exact values on hover.
- **Responsiveness**: The CSS Grid should stack vertically on smaller screens (media query).

# Interaction Logic
1.  **Initialization**: Load data. `selectedArtist` is null. All charts show aggregate or all-artist data.
2.  **User Action**: User clicks a bar in "Number of Songs in the 90s".
3.  **State Update**: `selectedArtist` is set to the clicked artist's name.
4.  **Propagation**: The new state is passed down to all other chart components.
5.  **Chart Updates**:
    - `AgeLineChart`: Highlights the specific artist's line.
    - `ScatterPlot`: Highlights the specific artist's points.
    - `MeanLineChart`: Updates to show the trend for the specific artist (since mean of 1 is the value itself).
    - `ComparisonChart`: Updates to show the specific artist's recognition values.
6.  **Reset**: Clicking the same artist again or a background element (if implemented) resets `selectedArtist` to null.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/final_df.csv

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
const rows = await loadCsv("/data/final_df.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1665/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Mean Recognizability by Age When Song Was Released
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[Multiple Values]`
- cols_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names]`
- series_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names]`
- series_order: [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:1 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:2 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:3 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:4 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:5 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:6 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:7 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:8 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:9 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:10 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:11 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:12 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:13 Years Old:qk]
- expected_series_values: [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:1 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:2 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:3 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:4 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:5 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:6 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:7 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:8 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:9 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:10 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:11 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:12 Years Old:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[avg:13 Years Old:qk]
- axis_title_rows: Recognizability
- zone: x=43134, y=48631, w=42651, h=29353
- highlight_fields: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Calculation_788129974626648065:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Millenials vs. Gen-Zs
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names]`
- cols_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[Multiple Values]`
- series_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names]`
- category_order: [federated.0c41x7800cm3vo122xn0d15j97ro].[sum:Recognition by Millennials:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[sum:Recognition by Gen-Zs:qk]
- axis_title_cols: Recognizability
- zone: x=499, y=77984, w=99002, h=21038
- highlight_fields: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Number of Songs in the 90s
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]`
- cols_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[sum:No. of Songs:qk]`
- series_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]`
- bar_orientation: `horizontal`
- zone: x=499, y=7213, w=42635, h=36770
- highlight_fields: [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Number of Songs vs. Recognizability
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[Multiple Values]`
- cols_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[sum:No. of Songs:qk]`
- series_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]`
- axis_title_rows: Recognizability
- zone: x=499, y=43983, w=42635, h=34001
- highlight_fields: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Recognizability by Age When Song Was Released
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[Multiple Values]`
- cols_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names]`
- series_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]`
- axis_title_rows: Recognizability
- zone: x=43134, y=7213, w=42651, h=41418
- legend_required: true
- legend_field: `[federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Calculation_788129974626648065:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Number of Songs in the 90s, target=Recognizability of 90's Artists in 2020 by Millenials and Gen-Zs - Andrew Liawan
## Highlight Bindings
- Number of Songs in the 90s: [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- Recognizability by Age When Song Was Released: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Calculation_788129974626648065:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- Mean Recognizability by Age When Song Was Released: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Calculation_788129974626648065:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:Year Born:qk], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- Millenials vs. Gen-Zs: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- Number of Songs vs. Recognizability: [federated.0c41x7800cm3vo122xn0d15j97ro].[:Measure Names], [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
- Recognizability by Age When Song Was Released: [federated.0c41x7800cm3vo122xn0d15j97ro].[none:artist:nk]
