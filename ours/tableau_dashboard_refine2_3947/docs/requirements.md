# Project Requirements

You are a senior React engineer tasked with rebuilding a Tableau dashboard titled 'SCOTUSVOTES' using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** CSS Modules or standard CSS. Use CSS Grid for the main dashboard layout. Do not use Ant Design or similar UI component libraries unless absolutely necessary for basic inputs (native HTML selects are preferred).
- **Data:** The data is located at `/data/TEMP_17c8nuo10pkc6t16hq2ut064xifx.csv`. You must fetch this file at runtime.

## Data Loading

Create a utility function `useScotusData` that fetches the CSV data.

1.  **Fetch:** Use `fetch('/data/TEMP_17c8nuo10pkc6t16hq2ut064xifx.csv')`.
2.  **Parse:** Use `d3-dsv` (d3.csvParse) to parse the raw text.
3.  **Type Safety:** Define a TypeScript interface `ScotusVote` matching the columns in the CSV.

### Data Schema (ScotusVote)
The CSV contains the following columns:
- `F1` (integer)
- `justice` (integer)
- `justiceName` (string) - e.g., "CThomas", "RBGinsburg"
- `majVotes` (integer)
- `minVotes` (integer)
- `decisionDirection` (integer)
- `majority` (integer)
- `caseId` (string)
- `term` (integer) - Represents the year.
- `partyWinning` (integer)
- `precedentAlteration` (integer)
- `vote` (integer)
- `issueArea` (integer)
- `vote_direction` (integer)

### Aliases & Encodings
You must implement these mappings for display labels:

**Issue Area (`issueArea`):**
- 1: "Criminal Procedure"
- 2: "Civil Rights"
- 3: "First Amendment"
- 4: "Due Process"
- 5: "Privacy"
- 6: "Attorneys"
- 7: "Unions"
- 8: "Economic Activity"
- 9: "Judicial Power"
- 10: "Federalism"
- 11: "Interstate Relations"
- 12: "Federal Taxation"
- 13: "Miscellaneous"
- 14: "Private Action"

**Vote Direction (`vote_direction`):**
- 0: "No Vote"
- 1: "Conservative"
- 2: "Liberal"
- 3: "Unspecifiable"

**Color Palette (Vote Direction):**
- Conservative (1): `#e15759`
- Liberal (2): `#4e79a7`
- No Vote (0): `#9c755f`
- Unspecifiable (3): `#76b7b2`

## Dashboard Layout (Dashboard 1)

The dashboard uses a CSS Grid layout. Approximate the zone structure defined in the workbook:

- **Grid Container:** 3 Columns, 3 Rows.
- **Zone 1 (Sheet 1):** Top-Left. Spans roughly 2 columns, 1 row.
- **Zone 6 (Legend):** Top-Right (aligned with Sheet 1). Contains the Color Legend for Vote Direction.
- **Zone 7 (Filter - Issue Area):** Top-Right (below Legend). Dropdown for Issue Area.
- **Zone 8 (Sheet 3):** Middle-Left. Spans roughly 2 columns, 1 row.
- **Zone 9 (Filter - Justice Name):** Middle-Right. Checklist/Dropdown for Justice Name.
- **Zone 10 (Sheet 4):** Bottom. Spans all 3 columns (Full Width).

## Component Specifications

### 1. Sheet 1: "SCOTUS Votes 1991 - 2017"
- **Type:** Stacked Bar Chart (Vertical).
- **Data:** Filtered by the global `issueArea` filter.
- **Encodings:**
  - **X-Axis:** `justiceName` (Dimension). Limit to the specific set of justices if filtered, otherwise show all.
  - **Y-Axis:** `Count(vote_direction)` (Measure). Height of the bar.
  - **Color:** `vote_direction` (Stacked segments).
  - **Labels:** Show the count number inside the bar segments (if space permits) or on hover. The XML specifies `mark-labels-show='true'`.
- **Interactions:** Clicking a bar segment triggers the global "Filter1" action, filtering the dashboard by that specific `justiceName` and `vote_direction`.

### 2. Sheet 3: "Precedent Changing Votes (1949 - 2018)"
- **Type:** Small Multiples Bar Chart (Trellis).
- **Layout:** A grid of small charts, one for each `justiceName`.
- **Data:** Filtered by `issueArea` (1-10, 12) and `justiceName`.
- **Encodings (per small chart):**
  - **X-Axis:** `issueArea` (Dimension).
  - **Y-Axis:** `Sum(precedentAlteration)` (Measure).
  - **Color:** `vote_direction`.
  - **Labels:** Show `Sum(precedentAlteration)` value on the bars.

### 3. Sheet 4: "Total Career Votes to Date"
- **Type:** Small Multiples Line Chart with Trendlines.
- **Layout:** A grid of small charts, one for each `justiceName`.
- **Data:** Filtered by `justiceName` and `vote_direction` (0-2).
- **Encodings (per small chart):**
  - **X-Axis:** `term` (Year) (Quantitative).
  - **Y-Axis:** `Count(Number of Records)` (Votes).
  - **Color:** `vote_direction` (Different lines for Conservative/Liberal/No Vote).
  - **Trendlines:** Calculate and draw a linear regression line for each color series. Style: `stroke: #0000002a`, `stroke-width: 1`.

### 4. Filters & Controls
- **Issue Area Filter:** A native `<select>` dropdown. Populated with the Issue Area aliases. Default: All (or specific range 1-10, 12 as per Sheet 3 filter, but for global context, 'All' is safer unless specified otherwise. The XML shows a specific filter on Sheet 3, but a general filter on Sheet 1. Implement a global filter that defaults to 'All').
- **Justice Name Filter:** A multi-select mechanism (checkbox list or custom dropdown). Default selection: CThomas, EKagan, JGRoberts, NMGorsuch, RBGinsburg, SAAlito, SGBreyer, SSotomayor.

## Implementation Details

1.  **State Management:** Use React `useState` to hold the full dataset and the current filter state (`selectedJustices`, `selectedIssueArea`).
2.  **Data Transformation:** Use `d3.rollup` or `Array.reduce` to aggregate data for the charts (e.g., counting votes per justice per direction).
3.  **D3 Integration:** Use `useRef` to select SVG elements and `useEffect` to render/update charts when data or filters change. Do not use `d3-react` wrappers; use raw D3 logic inside React effects.
4.  **Responsiveness:** Ensure the SVGs resize with their containers using `viewBox` and percentage widths.

## Sample Data

Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿\"\"\"F1\"\"\"": 18081,
    "\"justice\"": 81,
    "\"justiceName\"": "WODouglas",
    "\"majVotes\"": 7,
    "\"minVotes\"": 2,
    "\"decisionDirection\"": 1,
    "\"majority\"": 1,
    "\"caseId\"": "1962-100",
    "\"term\"": 1962,
    "\"partyWinning\"": 0,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 2,
    "\"issueArea\"": 1,
    "\"vote_direction\"": 2
  },
  {
    "﻿\"\"\"F1\"\"\"": 75624,
    "\"justice\"": 105,
    "\"justiceName\"": "AScalia",
    "\"majVotes\"": 6,
    "\"minVotes\"": 3,
    "\"decisionDirection\"": 2,
    "\"majority\"": 1,
    "\"caseId\"": "2011-076",
    "\"term\"": 2011,
    "\"partyWinning\"": 0,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 2,
    "\"issueArea\"": 3,
    "\"vote_direction\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 67958,
    "\"justice\"": 107,
    "\"justiceName\"": "DHSouter",
    "\"majVotes\"": 9,
    "\"minVotes\"": 0,
    "\"decisionDirection\"": 2,
    "\"majority\"": 2,
    "\"caseId\"": "2001-047",
    "\"term\"": 2001,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 1,
    "\"vote\"": 1,
    "\"issueArea\"": 10,
    "\"vote_direction\"": 2
  },
  {
    "﻿\"\"\"F1\"\"\"": 3229,
    "\"justice\"": 82,
    "\"justiceName\"": "FMurphy",
    "\"majVotes\"": 8,
    "\"minVotes\"": 1,
    "\"decisionDirection\"": 1,
    "\"majority\"": 2,
    "\"caseId\"": "1948-099",
    "\"term\"": 1948,
    "\"partyWinning\"": 0,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 10,
    "\"vote_direction\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 17669,
    "\"justice\"": 92,
    "\"justiceName\"": "WJBrennan",
    "\"majVotes\"": 9,
    "\"minVotes\"": 0,
    "\"decisionDirection\"": 2,
    "\"majority\"": 2,
    "\"caseId\"": "1962-054",
    "\"term\"": 1962,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 8,
    "\"vote_direction\"": 2
  },
  {
    "﻿\"\"\"F1\"\"\"": 68086,
    "\"justice\"": 109,
    "\"justiceName\"": "RBGinsburg",
    "\"majVotes\"": 5,
    "\"minVotes\"": 4,
    "\"decisionDirection\"": 2,
    "\"majority\"": 2,
    "\"caseId\"": "2001-061",
    "\"term\"": 2001,
    "\"partyWinning\"": 0,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 2,
    "\"vote_direction\"": 2
  },
  {
    "﻿\"\"\"F1\"\"\"": 39963,
    "\"justice\"": 95,
    "\"justiceName\"": "BRWhite",
    "\"majVotes\"": 9,
    "\"minVotes\"": 0,
    "\"decisionDirection\"": 1,
    "\"majority\"": 2,
    "\"caseId\"": "1977-121",
    "\"term\"": 1977,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 9,
    "\"vote_direction\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 44661,
    "\"justice\"": 99,
    "\"justiceName\"": "WEBurger",
    "\"majVotes\"": 8,
    "\"minVotes\"": 1,
    "\"decisionDirection\"": 1,
    "\"majority\"": 2,
    "\"caseId\"": "1981-016",
    "\"term\"": 1981,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 3,
    "\"issueArea\"": 2,
    "\"vote_direction\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 36809,
    "\"justice\"": 103,
    "\"justiceName\"": "JPStevens",
    "\"majVotes\"": 6,
    "\"minVotes\"": 3,
    "\"decisionDirection\"": 1,
    "\"majority\"": 2,
    "\"caseId\"": "1975-130",
    "\"term\"": 1975,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 4,
    "\"vote_direction\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 67549,
    "\"justice\"": 103,
    "\"justiceName\"": "JPStevens",
    "\"majVotes\"": 9,
    "\"minVotes\"": 0,
    "\"decisionDirection\"": 1,
    "\"majority\"": 2,
    "\"caseId\"": "2001-001",
    "\"term\"": 2001,
    "\"partyWinning\"": 1,
    "\"precedentAlteration\"": 0,
    "\"vote\"": 1,
    "\"issueArea\"": 9,
    "\"vote_direction\"": 1
  }
]
```

Please proceed with generating the React application code based on this specification.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine2_3947/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 1
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[cnt:vote_direction:qk]`
- cols_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk]`
- series_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]`
- bar_orientation: `vertical`
- zone: x=7797, y=783, w=52924, h=31687
- legend_required: true
- legend_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]`
- legend_relative_position: overlay
- highlight_fields: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:caseId:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:qk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `line_chart`
- rows_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[sum:precedentAlteration:qk]`
- cols_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:ok]`
- series_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]`
- zone: x=7206, y=35120, w=56054, h=32470
- highlight_fields: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 4
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[cnt:Number of Records:qk]`
- cols_field: `([federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk] * [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:term:qk])`
- series_field: `[federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]`
- bar_orientation: `horizontal`
- axis_title_rows: Votes
- axis_title_cols: Year
- zone: x=236, y=68072, w=65918, h=30602
- highlight_fields: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:term:qk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter1: kind=filter_action, source=Dashboard 1, target=Dashboard 1
## Highlight Bindings
- Sheet 1: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:caseId:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:qk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:qk]
- Sheet 3: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:issueArea:ok], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]
- Sheet 4: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:justiceName:nk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:term:qk], [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]
- Sheet 1: [federated.1xqbuif0zy7qie17waup21fe5cdu].[none:vote_direction:ok]
