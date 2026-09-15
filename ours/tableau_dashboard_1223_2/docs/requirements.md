# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard ('Dashboard 3') using React, TypeScript, and Vite. You must use D3.js (d3-scale, d3-shape, d3-axis, d3-array) for visualizations. Do not use high-level chart libraries like Recharts or Nivo.

## 1. Data Loading

The application must load data from the following URL:
- Primary Data: `/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv`

Use the native `fetch` API to retrieve the CSV data. Parse the CSV text using a library like `d3-dsv` (specifically `d3.csvParse`). 

**Data Schema Inference:**
The CSV represents a joined dataset ('Canada customers' joined with 'Canada population').
Expected columns:
- `Geography` (string): The state/province name.
- `Population` (number): The population for that geography.
- `Number of Records` (number): Represents the count of customers (often implicit as row count, but check if column exists; if not, count the rows per group).
- `Gender` (string): 'male' or 'female'.
- `StateFull` (string): State name.
- `Age2 ` (number): Age.
- `Rand` (number): Random value.

## 2. Data Transformation

The 'Market Penetration' worksheet requires aggregated data. You must transform the raw row-level data into a structure suitable for the chart.

1.  **Group** the data by the `Geography` column.
2.  **Aggregate** per group:
    -   `customerCount`: Sum of `[Number of Records]` (or count of rows if that column is just 1).
    -   `population`: Max of `[Population]` (since it's constant per geography in the join).
3.  **Calculate** `penetrationRatio`: `customerCount / population`.

The resulting data structure for the chart should be an array of objects:
```typescript
interface MarketData {
  geography: string;
  customerCount: number;
  population: number;
  penetrationRatio: number;
}
```

## 3. Component Architecture

Create the following component structure:

-   `App.tsx`: The main entry point. Handles data fetching and state management. Passes processed data to `Dashboard3`.
-   `Dashboard3.tsx`: The layout container corresponding to the Tableau Dashboard 'Dashboard 3'. It centers the content and applies the specific sizing constraints.
-   `MarketPenetration.tsx`: The visualization component corresponding to the Tableau Worksheet 'Market Penetration'. It renders the D3 chart.

## 4. Layout Specification (Dashboard 3)

-   **Container**: A `div` with a fixed aspect ratio or specific sizing constraints to mimic the Tableau dashboard settings.
-   **Sizing**: The Tableau dashboard specifies `minwidth="420"` and `maxwidth="650"`. Apply these as CSS `min-width` and `max-width` to the main container. Center it horizontally using `margin: 0 auto`.
-   **Margins**: Apply a margin of `8px` around the inner content (as per `<zone-style><format attr="margin" value="8" /></zone-style>`).
-   **Sheet Container**: The 'Market Penetration' sheet should take up the available space within the dashboard container.

## 5. Visualization Specification (Market Penetration)

**Chart Type**: Vertical Bar Chart.

**Dimensions & Measures**:
-   **X-Axis**: `Geography` (Dimension). Use `d3.scaleBand`.
-   **Y-Axis**: `Penetration Ratio` (Measure). Use `d3.scaleLinear`.
-   **Color**: Encoded by `Penetration Ratio`. Use a sequential color scale (e.g., `d3.interpolateBlues` or similar Tableau-like blue palette).

**Visual Encodings**:
-   **Bars**: Render `<rect>` elements for each geography.
-   **Labels**: Display the `Penetration Ratio` formatted as a percentage (e.g., "0.15%") and the `customerCount` (integer) inside or above the bars. The XML specifies `<format attr="mark-labels-show" value="true" />`.
-   **Axis Labels**: Rotate the X-axis labels (Geography) -90 degrees (vertical) to match `<format attr="text-orientation" value="-90" />`.
-   **Reference Line**: Add a horizontal reference line across the chart.
    -   **Value**: `0.0015` (derived from `[Parameters].[Parameter 1]`).
    -   **Style**: A solid line. Add a text label indicating the value (e.g., "0.15%" or "Benchmark").

**Interactions**:
-   **Tooltip**: On hover over a bar, show a tooltip displaying:
    -   Geography
    -   Penetration Ratio (formatted as %)
    -   Customer Count
    -   Population

## 6. Sample Data

Here is a sample of the data structure expected after transformation:

```json
[
  {
    "﻿\"\"\"Number\"\"\"": 24069,
    "\"Gender\"": "male",
    "\"StateFull\"": "Quebec",
    "\"Age2 \"": 39,
    "\"Rand\"": 0.545350882,
    "\"Geography\"": "Quebec",
    "\"Population\"": 8452209
  },
  {
    "﻿\"\"\"Number\"\"\"": 38333,
    "\"Gender\"": "male",
    "\"StateFull\"": "British Columbia",
    "\"Age2 \"": 49,
    "\"Rand\"": 0.433731185,
    "\"Geography\"": "British Columbia",
    "\"Population\"": 5034482
  },
  {
    "﻿\"\"\"Number\"\"\"": 5642,
    "\"Gender\"": "female",
    "\"StateFull\"": "British Columbia",
    "\"Age2 \"": 58,
    "\"Rand\"": 0.365764796,
    "\"Geography\"": "British Columbia",
    "\"Population\"": 5034482
  },
  {
    "﻿\"\"\"Number\"\"\"": 24129,
    "\"Gender\"": "male",
    "\"StateFull\"": "Alberta",
    "\"Age2 \"": 24,
    "\"Rand\"": 0.134057079,
    "\"Geography\"": "Alberta",
    "\"Population\"": 4362503
  },
  {
    "﻿\"\"\"Number\"\"\"": 36902,
    "\"Gender\"": "female",
    "\"StateFull\"": "Saskatchewan",
    "\"Age2 \"": 32,
    "\"Rand\"": 0.42639305,
    "\"Geography\"": "Saskatchewan",
    "\"Population\"": 1169131
  },
  {
    "﻿\"\"\"Number\"\"\"": 10294,
    "\"Gender\"": "male",
    "\"StateFull\"": "Nova Scotia",
    "\"Age2 \"": 36,
    "\"Rand\"": 0.748233333,
    "\"Geography\"": "Nova Scotia",
    "\"Population\"": 966858
  },
  {
    "﻿\"\"\"Number\"\"\"": 35732,
    "\"Gender\"": "male",
    "\"StateFull\"": "Quebec",
    "\"Age2 \"": 39,
    "\"Rand\"": 0.664952467,
    "\"Geography\"": "Quebec",
    "\"Population\"": 8452209
  },
  {
    "﻿\"\"\"Number\"\"\"": 28133,
    "\"Gender\"": "male",
    "\"StateFull\"": "Ontario",
    "\"Age2 \"": 37,
    "\"Rand\"": 0.285054388,
    "\"Geography\"": "Ontario",
    "\"Population\"": 14490207
  },
  {
    "﻿\"\"\"Number\"\"\"": 9819,
    "\"Gender\"": "female",
    "\"StateFull\"": "Saskatchewan",
    "\"Age2 \"": 26,
    "\"Rand\"": 0.729155783,
    "\"Geography\"": "Saskatchewan",
    "\"Population\"": 1169131
  },
  {
    "﻿\"\"\"Number\"\"\"": 12185,
    "\"Gender\"": "female",
    "\"StateFull\"": "Saskatchewan",
    "\"Age2 \"": 24,
    "\"Rand\"": 0.959865311,
    "\"Geography\"": "Saskatchewan",
    "\"Population\"": 1169131
  }
]
```

## 7. Implementation Notes

-   **Formatting**: Ensure the Penetration Ratio is formatted as a percentage with 2 decimal places (e.g., `0.15%`) using `d3.format(".2%")`.
-   **Styling**: Use standard CSS or CSS Modules. Do not rely on external UI component libraries for the chart layout.
-   **Responsiveness**: The SVG should resize to fit its container width while maintaining the aspect ratio or adjusting height dynamically.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_194sbdg00u0m5317frus01hyrusl.csv
- /data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv

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
const rows = await loadCsv("/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1223_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Market Penetration
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0wys7u413bis7d1g2ya3b07pv7ay].[usr:Calculation_53128439857385472:qk]`
- cols_field: `[federated.0wys7u413bis7d1g2ya3b07pv7ay].[none:Geography:nk]`
- series_field: `[federated.0wys7u413bis7d1g2ya3b07pv7ay].[usr:Calculation_53128439857385472:qk]`
- bar_orientation: `vertical`
- zone: x=1231, y=989, w=97538, h=98022
- highlight_fields: [federated.0wys7u413bis7d1g2ya3b07pv7ay].[none:Geography:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Highlight Bindings
- Market Penetration: [federated.0wys7u413bis7d1g2ya3b07pv7ay].[none:Geography:nk]
