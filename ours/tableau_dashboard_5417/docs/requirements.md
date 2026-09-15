# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard analyzing Metacritic game data.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-selection`, `d3-array`, `d3-time-format`).
- No external UI component libraries (use standard CSS/Flexbox/Grid).

**Data Source:**
- The data is located at `/data/metacritic_games_clean.csv`.
- You must fetch this data at runtime.

**Data Schema (Inferred from XML):**
```typescript
interface GameData {
  F1: number; // Index
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  release_date: Date; // Parse from string
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

**Dashboard Layout & Composition:**
Recreate the dashboard using a CSS Grid layout with the following structure:
- **Header:** Title "Metacritic Games Analysis".
- **Sidebar (Left, 250px):** Global Filters.
- **Main Content (Right):** A grid of visualizations.

**Components to Implement:**

1.  **FilterPanel (`src/components/FilterPanel.tsx`)**
    - **Purpose:** Allow filtering of the dataset.
    - **Controls:**
        - Multi-select dropdown for `platform`.
        - Multi-select dropdown for `genre`.
        - Multi-select dropdown for `rating`.
    - **Interaction:** Changing a filter updates the global state, which propagates to all charts.

2.  **ScoreScatterPlot (`src/components/ScoreScatterPlot.tsx`)**
    - **Purpose:** Compare Critic scores vs User scores.
    - **Visual Encoding:**
        - Mark Type: Circle.
        - X-Axis: `metascore` (0-100).
        - Y-Axis: `user_score` (0-100).
        - Color: Encoded by `platform` (use a categorical color scale like `d3.schemeTableau10`).
        - Size: Fixed or slightly variable based on `number_players` (if parseable).
        - Tooltip: Display `game`, `platform`, `metascore`, `user_score`.
    - **D3 Implementation:** Use `d3.select` to render SVG circles. Handle zooming/panning if possible, or at least responsive resizing.

3.  **SentimentStackedBar (`src/components/SentimentStackedBar.tsx`)**
    - **Purpose:** Visualize the breakdown of positive, neutral, and negative reviews for Critics vs Users.
    - **Data Preparation:** Aggregate the filtered data. Sum `positive_critics`, `neutral_critics`, `negative_critics` into a "Critics" group, and similarly for Users.
    - **Visual Encoding:**
        - Mark Type: Stacked Bar.
        - X-Axis: Categories ("Critics", "Users").
        - Y-Axis: Count of reviews.
        - Color: Encoded by sentiment (Positive=Green, Neutral=Gray, Negative=Red).
    - **D3 Implementation:** Use `d3.stack` to calculate the stacked positions and `d3.scaleBand` for the x-axis.

4.  **ReleaseTrendChart (`src/components/ReleaseTrendChart.tsx`)**
    - **Purpose:** Show average scores over time.
    - **Data Preparation:** Group data by `release_date` (truncated to Month).
    - **Visual Encoding:**
        - Mark Type: Line Chart (Multi-line).
        - X-Axis: `release_date` (Time scale).
        - Y-Axis: Average Score (0-100).
        - Color: Two lines (one for `metascore`, one for `user_score`).
    - **D3 Implementation:** Use `d3.line` and `d3.scaleTime`.

**Data Loading Implementation:**
Create a utility function `src/utils/data.ts`:
```typescript
import { csv } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

const parseDate = timeParse('%Y-%m-%d');

export const loadData = async () => {
  const data = await csv<GameData>('/data/metacritic_games_clean.csv', (d) => {
    return {
      ...d,
      F1: +d.F1,
      positive_critics: +d.positive_critics,
      neutral_critics: +d.neutral_critics,
      negative_critics: +d.negative_critics,
      positive_users: +d.positive_users,
      neutral_users: +d.neutral_users,
      negative_users: +d.negative_users,
      metascore: +d.metascore,
      user_score: +d.user_score,
      release_date: parseDate(d.release_date as string) || new Date(),
    } as GameData;
  });
  return data;
};
```

**Sample Data:**
```json
[
  {
    "﻿\"\"\"F1\"\"\"": 1793,
    "\"game\"": "Ori and the Blind Forest",
    "\"platform\"": "PC",
    "\"developer\"": "Moon Studios",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2015-03-11",
    "\"positive_critics\"": 12,
    "\"neutral_critics\"": 0,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 124,
    "\"neutral_users\"": 14,
    "\"negative_users\"": 3,
    "\"metascore\"": 88,
    "\"user_score\"": 87
  },
  {
    "﻿\"\"\"F1\"\"\"": 1284,
    "\"game\"": "Super Time Force",
    "\"platform\"": "XONE",
    "\"developer\"": "Capy Games",
    "\"genre\"": "Action",
    "\"number_players\"": "Up to 4",
    "\"rating\"": "T",
    "\"release_date\"": "2014-05-14",
    "\"positive_critics\"": 30,
    "\"neutral_critics\"": 6,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 7,
    "\"neutral_users\"": 3,
    "\"negative_users\"": 1,
    "\"metascore\"": 80,
    "\"user_score\"": 66
  },
  {
    "﻿\"\"\"F1\"\"\"": 849,
    "\"game\"": "Spin the Bottle: Bumpie's Party",
    "\"platform\"": "WIIU",
    "\"developer\"": "Redgrim AB",
    "\"genre\"": "Miscellaneous",
    "\"number_players\"": "1-8",
    "\"rating\"": "E",
    "\"release_date\"": "2013-08-08",
    "\"positive_critics\"": 4,
    "\"neutral_critics\"": 6,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 75,
    "\"user_score\"": 77
  },
  {
    "﻿\"\"\"F1\"\"\"": 5697,
    "\"game\"": "Generation Zero",
    "\"platform\"": "PC",
    "\"developer\"": "Avalanche Studios",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2019-03-26",
    "\"positive_critics\"": 1,
    "\"neutral_critics\"": 11,
    "\"negative_critics\"": 6,
    "\"positive_users\"": 5,
    "\"neutral_users\"": 2,
    "\"negative_users\"": 6,
    "\"metascore\"": 50,
    "\"user_score\"": 57
  },
  {
    "﻿\"\"\"F1\"\"\"": 1469,
    "\"game\"": "Killzone: Shadow Fall - Intercept",
    "\"platform\"": "PS4",
    "\"developer\"": "Guerrilla",
    "\"genre\"": "Action",
    "\"number_players\"": "Up to 4",
    "\"rating\"": "M",
    "\"release_date\"": "2014-06-24",
    "\"positive_critics\"": 14,
    "\"neutral_critics\"": 9,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 2,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 72,
    "\"user_score\"": 67
  },
  {
    "﻿\"\"\"F1\"\"\"": 2345,
    "\"game\"": "The Charnel House Trilogy",
    "\"platform\"": "PC",
    "\"developer\"": "Owl Cave",
    "\"genre\"": "Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2015-04-16",
    "\"positive_critics\"": 7,
    "\"neutral_critics\"": 8,
    "\"negative_critics\"": 2,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 68,
    "\"user_score\"": 56
  },
  {
    "﻿\"\"\"F1\"\"\"": 352,
    "\"game\"": "Uncharted: Golden Abyss",
    "\"platform\"": "VITA",
    "\"developer\"": "Naughty Dog, Sony Bend",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2012-02-15",
    "\"positive_critics\"": 64,
    "\"neutral_critics\"": 16,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 119,
    "\"neutral_users\"": 28,
    "\"negative_users\"": 7,
    "\"metascore\"": 80,
    "\"user_score\"": 74
  },
  {
    "﻿\"\"\"F1\"\"\"": 4754,
    "\"game\"": "ABZU",
    "\"platform\"": "Switch",
    "\"developer\"": "Giant Squid",
    "\"genre\"": "Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2018-11-29",
    "\"positive_critics\"": 16,
    "\"neutral_critics\"": 4,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 80,
    "\"user_score\"": 80
  },
  {
    "﻿\"\"\"F1\"\"\"": 4540,
    "\"game\"": "Return of the Obra Dinn",
    "\"platform\"": "PC",
    "\"developer\"": "Lucas Pope",
    "\"genre\"": "Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2018-10-18",
    "\"positive_critics\"": 32,
    "\"neutral_critics\"": 2,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 25,
    "\"neutral_users\"": 4,
    "\"negative_users\"": 3,
    "\"metascore\"": 89,
    "\"user_score\"": 78
  },
  {
    "﻿\"\"\"F1\"\"\"": 108,
    "\"game\"": "Rock of Ages",
    "\"platform\"": "PC",
    "\"developer\"": "ACE Team",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2011-09-07",
    "\"positive_critics\"": 9,
    "\"neutral_critics\"": 8,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 15,
    "\"neutral_users\"": 12,
    "\"negative_users\"": 2,
    "\"metascore\"": 74,
    "\"user_score\"": 77
  }
]
```

**Styling:**
- Use CSS Modules or Styled Components.
- Ensure the dashboard is responsive (charts resize on window resize).
- Use a clean, sans-serif font (Inter or system-ui).
- Match the color palette to the Tableau workbook where possible (Tableau 10/20 colors).

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5417/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: dev_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- zone: x=800, y=50100, w=49200, h=44900
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: dev_meta
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (developer)]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- zone: x=800, y=1000, w=98400, h=49100
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: dev_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- zone: x=50000, y=50100, w=49200, h=44900
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: game_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: game_meta
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:2:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:3:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: game_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: genre_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: genre_meta
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[attr:game:nk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: genre_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: name_games
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- cols_field: ``
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: numb_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: numb_meta
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
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
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: plat_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: plat_meta
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: plat_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
## Dashboard Actions
- Filtro 10 (generado): kind=filter_action, source=genre_meta, target=genre
- Filtro 11 (generado): kind=filter_action, source=genre_crit, target=genre
- Filtro 12 (generado): kind=filter_action, source=genre_users, target=genre
- Filtro 13 (generado): kind=filter_action, source=numb_users, target=number
- Filtro 14 (generado): kind=filter_action, source=numb_crit, target=number
- Filtro 15 (generado): kind=filter_action, source=numb_meta, target=number
- Filtro 1 (generado): kind=filter_action, source=game_meta, target=game
- Filtro 2 (generado): kind=filter_action, source=game_crit, target=game
- Filtro 3 (generado): kind=filter_action, source=plat_meta, target=plat
- Filtro 4 (generado): kind=filter_action, source=plat_crit, target=plat
- Filtro 5 (generado): kind=filter_action, source=plat_users, target=plat
- Filtro 6 (generado): kind=filter_action, source=game_users, target=game
- Filtro 7 (generado): kind=filter_action, source=dev_crit, target=dev
- Filtro 8 (generado): kind=filter_action, source=dev_users, target=dev
- Filtro 9 (generado): kind=filter_action, source=dev_meta, target=dev
## Highlight Bindings
- game_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:2:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:3:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]
- game_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- game_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- plat_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- plat_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- plat_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- dev_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- dev_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- dev_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- genre_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- genre_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- genre_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- numb_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- numb_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- numb_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:developer:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:genre:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:number_players:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- name_games: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
