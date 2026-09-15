# Project Requirements

You are an expert React and TypeScript developer. Your task is to implement a dashboard that exactly replicates the provided Tableau workbook specification.

## Tech Stack
- **Framework:** React + TypeScript + Vite
- **Visualization:** D3.js (use primitives like `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions, but prefer D3 for fidelity.
- **Styling:** CSS Modules or Tailwind CSS (choose one). Use CSS Grid for the main dashboard layout.

## Data Loading

The primary data source is a CSV file located at `/data/clients (techmadness).csv`.

1.  **Fetch:** Use the native `fetch()` API to load the data.
2.  **Parse:** Use `d3-dsv` (specifically `d3.csvParse`) to parse the CSV string into an array of objects.
3.  **Type Definition:** Define a TypeScript interface for the raw data rows based on the columns found in the CSV (e.g., `campaign`, `channel`, `control`, `uid`, `event`, `ts`, `dadd`).
4.  **Data Processing:** The dashboard relies on calculated fields. Implement these transformations in the data loading hook:
    - `users_count`: `COUNTD([uid])` (Count distinct UIDs).
    - `Number of Records`: `SUM(1)` (Total row count).
    - `control` mapping: 0 -> "Целевая" (Target), 1 -> "Контрольная" (Control).

## Dashboard Layout

The dashboard is named "Dashboard 1" and uses a 2x2 grid layout. Implement this using CSS Grid.

- **Top-Left:** Sheet 4 ("Группы")
- **Top-Right:** Sheet 3 ("Каналы")
- **Bottom-Left:** Sheet 2 ("Воронка")
- **Bottom-Right:** Sheet 5 ("Кампании")

## Component Specifications

### 1. Sheet 4: "Группы" (Groups)
- **Type:** Bubble Chart (Packed Bubbles or simple positioned circles).
- **Data:** Group by `control` (Target/Control).
- **Visual Encodings:**
    - **Size:** `users_count` (Distinct users).
    - **Color:** `users_count` (Sequential color scale, e.g., light to dark blue or similar heatmap style).
    - **Labels:** Display two lines of text inside/near the bubble:
        1.  `control` (The alias: "Целевая" or "Контрольная").
        2.  `Number of Records` (The total count of rows, NOT distinct users).
- **Interaction:** Clicking a bubble triggers a global filter for the selected `control` group.

### 2. Sheet 3: "Каналы" (Channels)
- **Type:** Bubble Chart.
- **Data:** Group by `channel`.
- **Visual Encodings:**
    - **Size:** `users_count`.
    - **Color:** `channel` (Categorical). Use the specific colors from the workbook:
        - "chat": `#4e79a7`
        - "sms": `#e15759`
        - "email": `#f28e2b`
    - **Labels:** Display `channel` name and `users_count`.
- **Interaction:** Clicking a bubble triggers a global filter for the selected `channel`.

### 3. Sheet 2: "Воронка" (Funnel)
- **Type:** Horizontal Bar Chart (or Text Table with bars).
- **Data:** Group by `event` and `control`.
- **Visual Encodings:**
    - **Rows:** `event`.
    - **Columns:** Split by `control` (Target vs Control). This effectively creates two bars per event row.
    - **Length/Value:** `users_count`.
    - **Color:** `control`.
        - 0 (Target): `#59a14f`
        - 1 (Control): `#e15759`
    - **Labels:** Display `users_count` at the end of the bars.
    - **Sorting:** Sort `event` rows in descending order by `users_count`.
- **Interaction:** This sheet acts as a receiver for filters but does not trigger them (based on the workbook actions).

### 4. Sheet 5: "Кампании" (Campaigns)
- **Type:** Horizontal Bar Chart.
- **Data:** Group by `campaign`.
- **Visual Encodings:**
    - **Rows:** `campaign`.
    - **Length/Value:** `users_count`.
    - **Color:** `channel` (Use the same palette as Sheet 3). Note: A campaign might have multiple channels. In Tableau, this usually results in stacked bars or multiple bars per campaign if the color is on the shelf. Given the "Automatic" mark type and single axis, implement as stacked bars or side-by-side bars if multiple channels exist per campaign. If single channel per campaign, color by that channel.
    - **Labels:** Display `users_count`.
    - **Sorting:** Sort `campaign` rows in descending order by `users_count`.
- **Interaction:** Clicking a bar (or a segment of a stacked bar) triggers a global filter for the selected `campaign`.

## Interactions & State Management

- **Global State:** Maintain a filter state object: `{ control: number | null, channel: string | null, campaign: string | null }`.
- **Filter Logic:**
    - **Sheet 4 (Groups):** Updates `control` filter.
    - **Sheet 3 (Channels):** Updates `channel` filter.
    - **Sheet 5 (Campaigns):** Updates `campaign` filter.
    - **Cross-Filtering:** When a filter is active, all sheets must re-render their data to reflect only the records matching the active filters. For example, if "chat" is selected in Sheet 3, Sheet 2 should only show events for the "chat" channel.
    - **Clearing:** Clicking an already selected item should toggle it off (clear that specific filter).

## Sample Data

Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_4",
    "\"channel\"": "email",
    "\"control\"": 0,
    "\"uid\"": 9558167,
    "\"event\"": "sent",
    "\"ts\"": "2019-11-14 12:38:13.000",
    "\"dadd\"": "2019-11-14"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_3",
    "\"channel\"": "email",
    "\"control\"": 0,
    "\"uid\"": 9723451,
    "\"event\"": "sent",
    "\"ts\"": "2019-11-07 19:18:28.592",
    "\"dadd\"": "2019-11-07"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_1",
    "\"channel\"": "sms",
    "\"control\"": 0,
    "\"uid\"": 10060077,
    "\"event\"": "sent",
    "\"ts\"": "2019-11-06 16:37:27.987",
    "\"dadd\"": "2019-11-06"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_1",
    "\"channel\"": "sms",
    "\"control\"": 0,
    "\"uid\"": 9553676,
    "\"event\"": "sent",
    "\"ts\"": "2019-09-20 00:00:00.000",
    "\"dadd\"": "2019-09-20"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_1",
    "\"channel\"": "sms",
    "\"control\"": 0,
    "\"uid\"": 10024622,
    "\"event\"": "sent",
    "\"ts\"": "2019-10-20 00:00:00.000",
    "\"dadd\"": "2019-10-20"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_4",
    "\"channel\"": "email",
    "\"control\"": 0,
    "\"uid\"": 9322365,
    "\"event\"": "view",
    "\"ts\"": "2019-09-18 22:37:16.762",
    "\"dadd\"": "2019-09-18"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_5",
    "\"channel\"": "chat",
    "\"control\"": 0,
    "\"uid\"": 9496868,
    "\"event\"": "view",
    "\"ts\"": "2019-09-20 18:53:13.988",
    "\"dadd\"": "2019-09-20"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_4",
    "\"channel\"": "email",
    "\"control\"": 0,
    "\"uid\"": 8488395,
    "\"event\"": "sent",
    "\"ts\"": "2019-09-17 15:54:41.275",
    "\"dadd\"": "2019-09-17"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_1",
    "\"channel\"": "sms",
    "\"control\"": 0,
    "\"uid\"": 10182331,
    "\"event\"": "sent",
    "\"ts\"": "2019-11-10 16:25:12.261",
    "\"dadd\"": "2019-11-10"
  },
  {
    "﻿\"\"\"campaign\"\"\"": "campaign_1",
    "\"channel\"": "sms",
    "\"control\"": 0,
    "\"uid\"": 954712,
    "\"event\"": "sent",
    "\"ts\"": "2019-11-08 16:27:19.417",
    "\"dadd\"": "2019-11-08"
  }
]
```

## Implementation Notes

- Ensure the layout is responsive but maintains the relative proportions of the 2x2 grid.
- Use the exact hex codes provided for colors.
- Preserve the Russian titles ("Воронка", "Каналы", etc.) and aliases ("Целевая", "Контрольная").
- Handle the asynchronous data loading with a loading state.
- Use `d3-array`'s `rollup` or `group` functions to aggregate the raw CSV data into the format needed for the charts (e.g., `d3.group(data, d => d.event)`).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_902/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 2
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]`
- cols_field: `([federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok] * [federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk])`
- series_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[Action (channel)]`
- bar_orientation: `horizontal`
- zone: x=800, y=38375, w=61100, h=60625
- highlight_fields: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]`
- zone: x=61899, y=1000, w=37301, h=37375
- highlight_fields: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 4
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]`
- zone: x=800, y=1000, w=61099, h=37375
- highlight_fields: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 5
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk]`
- cols_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]`
- series_field: `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]`
- bar_orientation: `horizontal`
- zone: x=61900, y=38375, w=37300, h=60625
- highlight_fields: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sheet 4, target=Dashboard 1
- Filter 2 (generated): kind=filter_action, source=Sheet 3, target=Dashboard 1
- Filter 3 (generated): kind=filter_action, source=Sheet 5, target=Dashboard 1
## Highlight Bindings
- Sheet 2: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]
- Sheet 3: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]
- Sheet 4: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]
- Sheet 3: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]
- Sheet 5: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]
- Sheet 5: [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk], [federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]
