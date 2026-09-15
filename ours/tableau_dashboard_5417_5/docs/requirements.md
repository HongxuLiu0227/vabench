# Project Requirements

You are an expert React developer. Your task is to implement a dashboard application that replicates the functionality and design of a Tableau workbook analyzing Metacritic game data.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for data visualization (scales, shapes, axis, selection). Use D3 primitives, not high-level chart libraries.
- CSS for styling (CSS Modules or Tailwind CSS preferred, but standard CSS is acceptable). Do not use Ant Design.

## Data Loading
The application must load data from `/data/metacritic_games_clean.csv`.

1.  **Fetch Implementation:**
    Use the native `fetch` API to retrieve the CSV file.
    ```typescript
    const loadData = async () => {
      const response = await fetch('/data/metacritic_games_clean.csv');
      const csvText = await response.text();
      // Parse CSV using d3-dsv or a custom parser
      const data = d3.csvParse(csvText, (d) => ({
        ...d,
        metascore: +d.metascore,
        user_score: +d.user_score,
        positive_critics: +d.positive_critics,
        neutral_critics: +d.neutral_critics,
        negative_critics: +d.negative_critics,
        positive_users: +d.positive_users,
        neutral_users: +d.neutral_users,
        negative_users: +d.negative_users,
        release_date: new Date(d.release_date)
      }));
      return data;
    };
    ```

2.  **Data Structure:**
    The dataset contains columns: `game`, `platform`, `developer`, `genre`, `number_players`, `rating`, `release_date`, `positive_critics`, `neutral_critics`, `negative_critics`, `positive_users`, `neutral_users`, `negative_users`, `metascore`, `user_score`.

## Sample Data
```json
[
  {
    "﻿\"\"\"F1\"\"\"": 3860,
    "\"game\"": "Death Squared",
    "\"platform\"": "Switch",
    "\"developer\"": "SMG Studio",
    "\"genre\"": "General",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2017-07-13",
    "\"positive_critics\"": 17,
    "\"neutral_critics\"": 7,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 2,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 78,
    "\"user_score\"": 79
  },
  {
    "﻿\"\"\"F1\"\"\"": 3641,
    "\"game\"": "Uncharted: The Lost Legacy",
    "\"platform\"": "PS4",
    "\"developer\"": "Naughty Dog",
    "\"genre\"": "Action",
    "\"number_players\"": "Up to 10",
    "\"rating\"": "T",
    "\"release_date\"": "2017-08-22",
    "\"positive_critics\"": 93,
    "\"neutral_critics\"": 11,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 129,
    "\"neutral_users\"": 33,
    "\"negative_users\"": 22,
    "\"metascore\"": 84,
    "\"user_score\"": 77
  },
  {
    "﻿\"\"\"F1\"\"\"": 2947,
    "\"game\"": "Trackmania Turbo",
    "\"platform\"": "XONE",
    "\"developer\"": "Nadeo",
    "\"genre\"": "Racing",
    "\"number_players\"": "Up to 8",
    "\"rating\"": "E",
    "\"release_date\"": "2016-03-22",
    "\"positive_critics\"": 8,
    "\"neutral_critics\"": 4,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 3,
    "\"negative_users\"": 2,
    "\"metascore\"": 76,
    "\"user_score\"": 73
  },
  {
    "﻿\"\"\"F1\"\"\"": 986,
    "\"game\"": "Blood of the Werewolf",
    "\"platform\"": "PC",
    "\"developer\"": "Scientifically Proven",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2013-10-28",
    "\"positive_critics\"": 3,
    "\"neutral_critics\"": 6,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 9,
    "\"neutral_users\"": 4,
    "\"negative_users\"": 2,
    "\"metascore\"": 65,
    "\"user_score\"": 74
  },
  {
    "﻿\"\"\"F1\"\"\"": 566,
    "\"game\"": "A Game of Dwarves",
    "\"platform\"": "PC",
    "\"developer\"": "Zeal Game Studios",
    "\"genre\"": "Strategy",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2012-10-23",
    "\"positive_critics\"": 0,
    "\"neutral_critics\"": 10,
    "\"negative_critics\"": 1,
    "\"positive_users\"": 6,
    "\"neutral_users\"": 8,
    "\"negative_users\"": 5,
    "\"metascore\"": 60,
    "\"user_score\"": 66
  },
  {
    "﻿\"\"\"F1\"\"\"": 4082,
    "\"game\"": "Cars 3: Driven to Win",
    "\"platform\"": "PS4",
    "\"developer\"": "Avalanche Software",
    "\"genre\"": "Racing",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2017-06-13",
    "\"positive_critics\"": 9,
    "\"neutral_critics\"": 10,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 4,
    "\"negative_users\"": 2,
    "\"metascore\"": 72,
    "\"user_score\"": 59
  },
  {
    "﻿\"\"\"F1\"\"\"": 4429,
    "\"game\"": "Micro Machines World Series",
    "\"platform\"": "PC",
    "\"developer\"": "Codemasters",
    "\"genre\"": "Racing",
    "\"number_players\"": "Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2017-06-29",
    "\"positive_critics\"": 0,
    "\"neutral_critics\"": 6,
    "\"negative_critics\"": 2,
    "\"positive_users\"": 0,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 58,
    "\"user_score\"": 34
  },
  {
    "﻿\"\"\"F1\"\"\"": 5073,
    "\"game\"": "Mulaka",
    "\"platform\"": "Switch",
    "\"developer\"": "Lienzo",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2018-03-01",
    "\"positive_critics\"": 9,
    "\"neutral_critics\"": 12,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 6,
    "\"neutral_users\"": 4,
    "\"negative_users\"": 3,
    "\"metascore\"": 73,
    "\"user_score\"": 73
  },
  {
    "﻿\"\"\"F1\"\"\"": 1549,
    "\"game\"": "The LEGO Movie Videogame",
    "\"platform\"": "PC",
    "\"developer\"": "TT Games",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2014-02-07",
    "\"positive_critics\"": 3,
    "\"neutral_critics\"": 4,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 2,
    "\"metascore\"": 68,
    "\"user_score\"": 68
  },
  {
    "﻿\"\"\"F1\"\"\"": 5270,
    "\"game\"": "The Escapists: Complete Edition",
    "\"platform\"": "Switch",
    "\"developer\"": "Mouldy Toof Studios",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2018-09-25",
    "\"positive_critics\"": 4,
    "\"neutral_critics\"": 10,
    "\"negative_critics\"": 1,
    "\"positive_users\"": 0,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 67,
    "\"user_score\"": 68
  }
]
```

## Dashboard Layout & Components
The dashboard should be laid out using CSS Grid or Flexbox to mimic a standard Tableau dashboard layout.

### 1. Main Container (`Dashboard`)
- **Layout:** A sidebar for filters (left or top) and a main area for the visualization.
- **State Management:** Maintain state for `selectedPlatform` (string[]), `selectedGenre` (string[]), and `hoveredGame` (string | null).

### 2. Filter Component (`FilterPanel`)
- **Purpose:** Allow users to filter the data by `platform` and `genre`.
- **Implementation:** Create a multi-select checklist or dropdown for these dimensions.
- **Interaction:** Changing a filter updates the data passed to the main chart.

### 3. Main Visualization (`ScatterPlot`)
- **Type:** Scatter Plot.
- **Dimensions & Measures:**
    - **X-Axis:** `user_score` (Range: 0-100).
    - **Y-Axis:** `metascore` (Range: 0-100).
    - **Color:** Encoded by `game`.
    - **Tooltip:** Display `game`, `platform`, `genre`, `developer`, and `release_date` on hover.
- **Visual Encoding Details:**
    - **Color Palette:** The Tableau workbook defines specific colors for specific games. You must implement a color scale that maps specific game names to the hex codes found in the workbook definition (e.g., '3D Classics: Kirby's Adventure' -> '#499894', '88 Heroes: 98 Heroes Edition' -> '#499894', '#IDARB' -> '#4e79a7'). For games not explicitly listed in the XML mapping, use a default fallback color (e.g., '#ccc').
    - **Axes:** Standard D3 axes with ticks. Label them "User Score" and "Metascore".
- **Interactions:**
    - **Hover:** Highlight the specific circle (increase opacity or stroke) and show a custom HTML tooltip following the mouse cursor.
    - **Action (Filter):** Clicking a game mark should act as a filter. In this React implementation, clicking a point should set the `hoveredGame` state or trigger a console log indicating the selected game for potential future filtering logic (simulating the 'Action (game)' group in the XML).

## Implementation Details

### Styling
- Use a clean, sans-serif font (e.g., Inter, system-ui).
- Ensure the chart is responsive (resize observer on the container).
- Background color should be white or very light gray to match standard Tableau themes.

### D3 Integration
- Use `useRef` to select the SVG container.
- Use `useEffect` to render the chart. Ensure cleanup (removing the SVG content) on re-renders.
- Use `d3.scaleLinear` for X and Y axes.
- Use `d3.scaleOrdinal` or a custom lookup function for the Color scale based on the game name.

### Constraints
- Do not use any UI component library that provides pre-built charts (like Recharts or Nivo). Build the Scatter Plot using D3.js logic within a React component.
- Ensure the CSV parsing handles the specific date format and numeric conversions correctly.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5417_5/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: plat_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- zone: x=800, y=47999, w=49200, h=47001
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: plat_meta
- chart_intent: `line_chart`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- zone: x=800, y=1000, w=98400, h=46999
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
- zone: x=50000, y=47999, w=49200, h=47001
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
## Dashboard Actions
- Filtro 3 (generado): kind=filter_action, source=plat_meta, target=plat
- Filtro 4 (generado): kind=filter_action, source=plat_crit, target=plat
- Filtro 5 (generado): kind=filter_action, source=plat_users, target=plat
## Highlight Bindings
- plat_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]
- plat_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- plat_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
