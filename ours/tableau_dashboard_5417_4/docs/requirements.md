# Project Requirements

You are an expert React engineer. Your task is to implement a dashboard based on the provided Tableau workbook definition and data manifest.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use d3-scale, d3-axis, d3-shape, d3-selection primitives)
- CSS Modules or Styled Components for styling
- No UI component libraries (e.g., Ant Design) unless absolutely necessary for basic layout containers.

## Data Loading
1.  **Source**: The primary data source is `/data/metacritic_games_clean.csv`.
2.  **Fetching**: Use the native `fetch` API to load the CSV file.
3.  **Parsing**: Use `d3-dsv` (d3.csvParse) to parse the raw text into an array of objects.
4.  **Type Safety**: Define a TypeScript interface `GameData` matching the columns in the CSV.

```typescript
// Example Interface
interface GameData {
  F1: number;
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  release_date: Date; // Parse string to Date
  positive_critics: number;
  neutral_critics: number;
  negative_critics: number;
  positive_users: number;
  neutral_users: number;
  negative_users: number;
  metascore: number;
  user_score: number;
}
```

## Dashboard Layout
The dashboard layout should be responsive and use CSS Grid/Flexbox.
- **Header**: Title of the dashboard (inferred from workbook context: "Metacritic Games Analysis").
- **Sidebar (Left)**: Controls for filtering data.
- **Main Content (Right)**: The primary visualization area.

## Components

### 1. FilterPanel
- **Purpose**: Allow users to filter the dataset.
- **Controls**:
  - **Platform Filter**: A multi-select dropdown or checkbox group for the `platform` field.
  - **Genre Filter**: A multi-select dropdown or checkbox group for the `genre` field.
- **Behavior**: Changing a filter updates the global state (or context), which triggers a re-render of the visualization with filtered data.

### 2. ScatterPlot (Main Visualization)
- **Purpose**: Visualize the relationship between Critic scores and User scores.
- **Data Mapping**:
  - **X-Axis**: `metascore` (Range: 0-100).
  - **Y-Axis**: `user_score` (Range: 0-100).
  - **Marks**: Circles.
  - **Color Encodings**: The color of the circle is determined by the `game` name.
  - **Tooltips**: On hover, display: `game`, `platform`, `genre`, `metascore`, `user_score`.

#### D3 Implementation Details
- **Scales**:
  - `xScale`: `d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right])`
  - `yScale`: `d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top])`
- **Axes**: Render `d3.axisBottom(xScale)` and `d3.axisLeft(yScale)`. Include grid lines for readability.
- **Color Logic**: The Tableau XML defines a specific color palette for specific games. You must implement a color scale that respects these mappings.
  - Create a `Map<string, string>` or a lookup object containing the specific game-to-color mappings found in the XML `<style>` section (e.g., "3D Classics: Kirby's Adventure" maps to "#499894").
  - If a game is not found in the specific map, assign a default color (e.g., "#ccc").
  - *Note*: The XML contains hundreds of specific mappings. Ensure your implementation can handle a large lookup object efficiently.

## Interactions
- **Filtering**: Selecting options in the FilterPanel must filter the data passed to the ScatterPlot. The chart should animate the transition (enter/update/exit pattern) if possible, or re-render cleanly.
- **Hover**: Hovering over a data point should highlight the circle (increase opacity or stroke) and show a custom HTML tooltip positioned near the mouse.

## Sample Data
Below is the placeholder for the sample data. In the actual implementation, this will be replaced by the fetched data.

```json
[
  {
    "﻿\"\"\"F1\"\"\"": 5256,
    "\"game\"": "TT Isle of Man",
    "\"platform\"": "PC",
    "\"developer\"": "Kylotonn",
    "\"genre\"": "Racing",
    "\"number_players\"": "Up to 8",
    "\"rating\"": "E",
    "\"release_date\"": "2018-03-27",
    "\"positive_critics\"": 2,
    "\"neutral_critics\"": 5,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 0,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 4,
    "\"metascore\"": 68,
    "\"user_score\"": 46
  },
  {
    "﻿\"\"\"F1\"\"\"": 3443,
    "\"game\"": "Dangerous Golf",
    "\"platform\"": "PS4",
    "\"developer\"": "Three Fields Entertainment",
    "\"genre\"": "Sports",
    "\"number_players\"": "Up to 8",
    "\"rating\"": "E",
    "\"release_date\"": "2016-06-03",
    "\"positive_critics\"": 2,
    "\"neutral_critics\"": 15,
    "\"negative_critics\"": 5,
    "\"positive_users\"": 2,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 56,
    "\"user_score\"": 49
  },
  {
    "﻿\"\"\"F1\"\"\"": 88,
    "\"game\"": "Two Worlds II",
    "\"platform\"": "PC",
    "\"developer\"": "Reality Pump",
    "\"genre\"": "Role-Playing",
    "\"number_players\"": "Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2011-02-03",
    "\"positive_critics\"": 19,
    "\"neutral_critics\"": 12,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 31,
    "\"neutral_users\"": 37,
    "\"negative_users\"": 22,
    "\"metascore\"": 76,
    "\"user_score\"": 64
  },
  {
    "﻿\"\"\"F1\"\"\"": 982,
    "\"game\"": "Remember Me",
    "\"platform\"": "PC",
    "\"developer\"": "DONTNOD Entertainment",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2013-06-03",
    "\"positive_critics\"": 7,
    "\"neutral_critics\"": 18,
    "\"negative_critics\"": 1,
    "\"positive_users\"": 155,
    "\"neutral_users\"": 58,
    "\"negative_users\"": 33,
    "\"metascore\"": 65,
    "\"user_score\"": 74
  },
  {
    "﻿\"\"\"F1\"\"\"": 2540,
    "\"game\"": "Farming Simulator 15",
    "\"platform\"": "PS4",
    "\"developer\"": "Giants Software",
    "\"genre\"": "Simulation",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2015-05-19",
    "\"positive_critics\"": 3,
    "\"neutral_critics\"": 14,
    "\"negative_critics\"": 4,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 1,
    "\"metascore\"": 54,
    "\"user_score\"": 55
  },
  {
    "﻿\"\"\"F1\"\"\"": 3100,
    "\"game\"": "Ray Gigant",
    "\"platform\"": "VITA",
    "\"developer\"": "Bandai Namco Games",
    "\"genre\"": "Role-Playing",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2016-05-03",
    "\"positive_critics\"": 5,
    "\"neutral_critics\"": 9,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 2,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 72,
    "\"user_score\"": 81
  },
  {
    "﻿\"\"\"F1\"\"\"": 5478,
    "\"game\"": "Milanoir",
    "\"platform\"": "Switch",
    "\"developer\"": "Italo Games",
    "\"genre\"": "Role-Playing",
    "\"number_players\"": "Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2018-05-31",
    "\"positive_critics\"": 0,
    "\"neutral_critics\"": 7,
    "\"negative_critics\"": 3,
    "\"positive_users\"": 0,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 1,
    "\"metascore\"": 50,
    "\"user_score\"": 50
  },
  {
    "﻿\"\"\"F1\"\"\"": 384,
    "\"game\"": "Fluidity: Spin Cycle",
    "\"platform\"": "3DS",
    "\"developer\"": "Curve Studios",
    "\"genre\"": "Action",
    "\"number_players\"": "1 Player",
    "\"rating\"": "E",
    "\"release_date\"": "2012-12-27",
    "\"positive_critics\"": 14,
    "\"neutral_critics\"": 3,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 78,
    "\"user_score\"": 66
  },
  {
    "﻿\"\"\"F1\"\"\"": 5134,
    "\"game\"": "Leisure Suit Larry: Wet Dreams Don't Dry",
    "\"platform\"": "PC",
    "\"developer\"": "CrazyBunch",
    "\"genre\"": "Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2018-11-07",
    "\"positive_critics\"": 7,
    "\"neutral_critics\"": 9,
    "\"negative_critics\"": 1,
    "\"positive_users\"": 8,
    "\"neutral_users\"": 2,
    "\"negative_users\"": 2,
    "\"metascore\"": 71,
    "\"user_score\"": 65
  },
  {
    "﻿\"\"\"F1\"\"\"": 1149,
    "\"game\"": "Astebreed",
    "\"platform\"": "PC",
    "\"developer\"": "Edelweiss",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2014-05-30",
    "\"positive_critics\"": 14,
    "\"neutral_critics\"": 0,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 15,
    "\"neutral_users\"": 2,
    "\"negative_users\"": 2,
    "\"metascore\"": 86,
    "\"user_score\"": 73
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/metacritic_games_clean.csv

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
const rows = await loadCsv("/data/metacritic_games_clean.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5417_4/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: numb_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- zone: x=800, y=50100, w=49200, h=44900
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: numb_meta
- chart_intent: `line_chart`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- zone: x=800, y=1000, w=98400, h=49100
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: numb_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- zone: x=50000, y=50100, w=49200, h=44900
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
## Dashboard Actions
- Filtro 13 (generado): kind=filter_action, source=numb_users, target=number
- Filtro 14 (generado): kind=filter_action, source=numb_crit, target=number
- Filtro 15 (generado): kind=filter_action, source=numb_meta, target=number
## Highlight Bindings
- numb_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- numb_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- numb_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
