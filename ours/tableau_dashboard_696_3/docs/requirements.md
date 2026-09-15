# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard ('Results and model accuracy') using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-time-format). Do not use high-level chart libraries like Recharts or Nivo.
- **UI Library:** None required. Use standard CSS/Flexbox/Grid.
- **Styling:** Match the exact colors, fonts (Calibri), and layout from the Tableau definition.

## Data Loading

The primary dataset is available at `/data/prices-split-adjusted.csv`.

1.  **Fetch & Parse:** Use `d3-dsv` (or standard fetch + split) to load the CSV.
2.  **Type Definition:** Define an interface for the data:
    ```typescript
    interface StockData {
      date: Date;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }
    ```
3.  **Prediction Data:** The workbook references a secondary datasource ('Sheet1 (prediction)') connected to a Google Sheet. Since this file is not in the provided manifest, you must **mock** this data structure to ensure the dashboard renders. Create a mock array of objects matching the prediction schema:
    ```typescript
    interface PredictionData {
      Date: Date;
      open: number;
      close: number;
    }
    ```
    Generate ~20-30 data points for the mock data to populate the charts.

## Dashboard Specification: "Results and model accuracy"

### Layout Structure
The dashboard uses a dark theme background (`#000000`). Implement a CSS Grid layout with the following zones:

1.  **Header (Top):**
    *   Background: `#b4b4b4`.
    *   Title: "Results and Model accuracy" (Left aligned, Calibri, 15px, Black).
    *   Navigation: "Go to home" button (Right aligned). This is a clickable element (styled as a button or link) that triggers a navigation action (e.g., `console.log('Navigate Home')` or state change).
    *   Subtitle: "Uses google excel as the data source. Sign in to Google to see predicted charts." (Below title, Italic, Gray text).

2.  **Main Content Area (Split into two rows):**
    *   **Row 1 (Top):**
        *   **Left (Chart):** "Results - pred close".
            *   Background: `#e6e6e6`.
            *   Y-Axis Label (Rotated): "Close Stock" (Bold, Black, -90deg orientation).
        *   **Right (Metrics):**
            *   Label: "Root Mean Square Error" (Gray text).
            *   Values: "Train : 0.36" and "Test: 1.54" (Black text).
    *   **Row 2 (Bottom):**
        *   **Left (Chart):** "Results - pred open".
            *   Background: `#e6e6e6`.
            *   Y-Axis Label (Rotated): "Open Stock" (Bold, Black, -90deg orientation).
        *   **Right (Metrics):**
            *   Values: "Train: 0.38" and "Test: 2.69" (Black text).

### Component Implementation Details

#### 1. `StockChart` Component (D3)
Create a reusable component `StockChart` that accepts:
- `data`: Array of data points.
- `xKey`: string (e.g., 'Date').
- `yKey`: string (e.g., 'close').
- `color`: string (Line color).
- `title`: string (Optional, though titles are handled outside in this dashboard).

**Implementation Specs:**
- **Margins:** Standard D3 margins (top: 20, right: 30, bottom: 30, left: 60).
- **Scales:**
  - X: `d3.scaleTime` (parse dates if strings).
  - Y: `d3.scaleLinear` (domain derived from `d3.extent`).
- **Axes:**
  - Bottom Axis: `d3.axisBottom`. Format dates using `d3.timeFormat` (e.g., "%b %Y"). Label: "Date".
  - Left Axis: `d3.axisLeft`. Remove axis title (empty string in Tableau).
- **Mark:** `d3.line()` or `d3.area()`. Since Tableau mark type is "Automatic" and it's stock data, a Line chart is the most faithful approximation. Stroke width ~2px.
- **Gridlines:** Add horizontal gridlines for readability (matching the light gray background).
- **Tooltip:** Implement a simple D3 tooltip that shows the Date and Value on hover.

#### 2. `ResultsDashboard` Component
- **State:**
  - `predictionData`: State to hold the mock prediction data.
  - `stockData`: State to hold the loaded CSV data (if used for context, though the charts specifically use the prediction schema).
- **Effect:** Use `useEffect` to load the CSV and generate the mock prediction data on mount.
- **Render:**
  - Container `div` with `backgroundColor: '#000000'`, `fontFamily: 'Calibri'`.
  - CSS Grid for layout.
  - Render `StockChart` twice: once for 'close', once for 'open'.
  - Render text elements for metrics and labels exactly as specified.

### Interactions
- **Go to home:** The button should be clickable. Since the target "Title" dashboard is not fully defined in the provided XML snippet, implement a placeholder function `handleGoHome` that logs the action or alerts the user.

### Sample Data

```json
[
  {
    "﻿\"\"\"date\"\"\"": "1967-09-18",
    "\"open\"": 0.5208,
    "\"high\"": 0.5337,
    "\"low\"": 0.5144,
    "\"close\"": 0.5208,
    "\"volume\"": 1654726
  },
  {
    "﻿\"\"\"date\"\"\"": "2013-02-15",
    "\"open\"": 55.05,
    "\"high\"": 55.62,
    "\"low\"": 54.89,
    "\"close\"": 55.61,
    "\"volume\"": 17783400
  },
  {
    "﻿\"\"\"date\"\"\"": "2000-06-20",
    "\"open\"": 41.94,
    "\"high\"": 42.06,
    "\"low\"": 41.56,
    "\"close\"": 41.75,
    "\"volume\"": 3296900
  },
  {
    "﻿\"\"\"date\"\"\"": "2018-06-06",
    "\"open\"": 100.06,
    "\"high\"": 101.94,
    "\"low\"": 99.76,
    "\"close\"": 101.91,
    "\"volume\"": 7830803
  },
  {
    "﻿\"\"\"date\"\"\"": "1990-07-31",
    "\"open\"": 9.8225,
    "\"high\"": 9.9375,
    "\"low\"": 9.6875,
    "\"close\"": 9.8025,
    "\"volume\"": 7014804
  },
  {
    "﻿\"\"\"date\"\"\"": "2019-09-16",
    "\"open\"": 136.29,
    "\"high\"": 137.2411,
    "\"low\"": 135.3,
    "\"close\"": 135.8,
    "\"volume\"": 6321656
  },
  {
    "﻿\"\"\"date\"\"\"": "1968-08-26",
    "\"open\"": 0.3592,
    "\"high\"": 0.3592,
    "\"low\"": 0.3541,
    "\"close\"": 0.3566,
    "\"volume\"": 350394
  },
  {
    "﻿\"\"\"date\"\"\"": "1969-11-24",
    "\"open\"": 0.5882,
    "\"high\"": 0.5882,
    "\"low\"": 0.5786,
    "\"close\"": 0.5875,
    "\"volume\"": 1907875
  },
  {
    "﻿\"\"\"date\"\"\"": "1963-01-02",
    "\"open\"": 0.1443,
    "\"high\"": 0.1495,
    "\"low\"": 0.1424,
    "\"close\"": 0.1475,
    "\"volume\"": 369882
  },
  {
    "﻿\"\"\"date\"\"\"": "1988-05-25",
    "\"open\"": 4.6358,
    "\"high\"": 4.6975,
    "\"low\"": 4.6358,
    "\"close\"": 4.6667,
    "\"volume\"": 3927804
  }
]
```

### Summary of Visual Encodings
- **Colors:**
  - Dashboard BG: `#000000`
  - Header BG: `#b4b4b4`
  - Chart BG: `#e6e6e6`
  - Text: `#000000` (Black), `#898989` (Gray for subtitles).
- **Fonts:** Calibri, sizes 12px, 15px.
- **Orientation:** Specific labels ("Open Stock", "Close Stock") are rotated -90 degrees.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/prices-split-adjusted.csv

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
const rows = await loadCsv("/data/prices-split-adjusted.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_696_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Go to home
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- zone: x=89713, y=733, w=9726, h=6968
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:Calculation_1169247112986927108:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Results - pred close
- chart_intent: `line_chart`
- rows_field: `[federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[sum:close:qk]`
- cols_field: `[federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[tdy:Date:qk]`
- axis_title_cols: Date
- zone: x=18080, y=19193, w=51060, h=33252
- highlight_fields: [federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[yr:Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Results - pred open
- chart_intent: `line_chart`
- rows_field: `[federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[sum:open:qk]`
- cols_field: `[federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[tdy:Date:qk]`
- axis_title_cols: Date
- zone: x=17394, y=59780, w=51559, h=33252
- highlight_fields: [federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[yr:Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=187, y=0, w=99813, h=8802): Results and Model accuracy
- zone(x=78803, y=25550, w=13529, h=11614): Train : 0.36 Test: 1.54
- zone(x=73691, y=11002, w=24377, h=3667): Root Mean Square Error
- zone(x=3741, y=20782, w=2618, h=23350): Open Stock
- zone(x=3803, y=67482, w=3117, h=18949): Close Stock
- zone(x=81484, y=72372, w=8666, h=9046): Train: 0.38 Test: 2.69
- zone(x=810, y=9291, w=55985, h=7335): Uses google excel as the data source. Sign in to Google to see predicted charts.
## Highlight Bindings
- Go to home: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:Calculation_1169247112986927108:nk]
- Results - pred close: [federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[yr:Date:ok]
- Results - pred open: [federated.0lvyz3e14xqiuk0zls8fu0uuqig1].[yr:Date:ok]
