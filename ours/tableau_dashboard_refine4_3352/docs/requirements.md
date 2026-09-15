# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided XML workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-time`, `d3-dsv` for visualizations. Do not use high-level chart libraries.
- CSS: Use standard CSS or CSS Modules. No external UI component libraries (e.g., Ant Design) unless necessary for basic layout, but prefer native HTML/CSS.

## Data Loading

The application must load data from the following URL:
`/data/TableauTemp_06jfdtn1lakc5a1amq8mn12idbt8.csv`

Implement a `useData` hook or utility function that:
1. Uses `fetch()` to retrieve the CSV file.
2. Uses `d3.csvParse` to parse the raw text.
3. Transforms the data into a strongly typed array.

**Data Schema (TypeScript Interface):**
```typescript
interface DataRecord {
  '#': number;        // Integer: ID
  'Filename': string; // String
  'File extension': string; // String (e.g., ".mp3", ".wma")
  'Path': string;    // String
  'Size': number;    // Integer: File size in bytes
  'Date created': string; // String (ISO date format), parse to Date object
}
```

## Sample Data
```json
[
  {
    "﻿\"\"\"#\"\"\"": 441,
    "\"Filename\"": "03 Symphony No. 29 in A major, K. 201 (K. 186a)- 4th Movement.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\ASVitality  The Classical Sampler\\",
    "\"Size\"": 7012454,
    "\"Date created\"": "2007-06-24 12:37:26"
  },
  {
    "﻿\"\"\"#\"\"\"": 522,
    "\"Filename\"": "13 Track 13.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\Bach  St. Luke Passion\\",
    "\"Size\"": 9204606,
    "\"Date created\"": "2010-05-21 12:38:05"
  },
  {
    "﻿\"\"\"#\"\"\"": 196,
    "\"Filename\"": "04 An English Ladymass.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\A Decade Of Excellence\\",
    "\"Size\"": 5312088,
    "\"Date created\"": "2007-06-25 20:52:39"
  },
  {
    "﻿\"\"\"#\"\"\"": 48,
    "\"Filename\"": "15 Funeral March.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\1000 Years Of Sacred Music Disc 4\\",
    "\"Size\"": 3119850,
    "\"Date created\"": "2014-03-03 14:48:13"
  },
  {
    "﻿\"\"\"#\"\"\"": 570,
    "\"Filename\"": "14 b5.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\Bach  St. Mark Passion\\",
    "\"Size\"": 1330140,
    "\"Date created\"": "2010-05-21 12:38:24"
  },
  {
    "﻿\"\"\"#\"\"\"": 1068,
    "\"Filename\"": "(Disc 4) 15 - Personent Hodie.mp3",
    "\"File extension\"": ".mp3",
    "\"Path\"": "\\Christmas Hits 2007\\",
    "\"Size\"": 3954817,
    "\"Date created\"": "2010-03-06 22:05:19"
  },
  {
    "﻿\"\"\"#\"\"\"": 204,
    "\"Filename\"": "12 Agripinna- Aria- L'alma mia.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\A Decade Of Excellence\\",
    "\"Size\"": 3415188,
    "\"Date created\"": "2007-06-25 20:52:48"
  },
  {
    "﻿\"\"\"#\"\"\"": 676,
    "\"Filename\"": "03 Symphony No. 7, Presto.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\Beethoven Symphonies No. 7 & 8\\",
    "\"Size\"": 12058720,
    "\"Date created\"": "2014-03-03 15:13:22"
  },
  {
    "﻿\"\"\"#\"\"\"": 39,
    "\"Filename\"": "06 Sicut erat in principio.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\1000 Years Of Sacred Music Disc 4\\",
    "\"Size\"": 2994658,
    "\"Date created\"": "2014-03-03 14:48:12"
  },
  {
    "﻿\"\"\"#\"\"\"": 594,
    "\"Filename\"": "13 Sonata no. 2 in A minor-  Grave.wma",
    "\"File extension\"": ".wma",
    "\"Path\"": "\\Bach Sonatas & Partitas for violin\\",
    "\"Size\"": 6439510,
    "\"Date created\"": "2007-06-29 22:01:58"
  }
]
```

## Dashboard Layout (Dashboard 1)

The dashboard uses a horizontal layout divided into two main sections.

**Container Structure:**
- Root Container: Flexbox row, `height: 100vh`, `width: 100vw`, `overflow: hidden`.
- **Left Section (approx 40% width):** Flexbox row.
  - **Sheet 1 Container:** Flex-grow 1. Contains the "Diff File Extentions with Min size" chart.
  - **Legend Strip (approx 20% of Left Section):** Flexbox column, narrow width (approx 100-150px). Contains the Color Legends for Sheet 1 and Sheet 2 stacked vertically.
- **Right Section (approx 60% width):** Flex-grow 1. Contains the "Years and Quarters Vs Min of '#'" chart.

**Styling:**
- Background: White (#FFFFFF).
- Margins: Apply 4px margins around charts as per zone styles.
- Fonts: Sans-serif (e.g., Arial, Helvetica, system-ui).

## Worksheet Specifications

### Sheet 1: "Diff File Extentions with Min size"

**Visual Type:** Vertical Bar Chart.

**Data Preparation:**
- Group data by `['File extension']`.
- Calculate `MIN([Size])` for each group.
- Sort groups manually: [".wma", ".mp3", ".m4b"] (Ascending order as per XML).

**Encodings:**
- **X-Axis:** `File extension` (Nominal). Use `d3.scaleBand`.
- **Y-Axis:** `MIN(Size)` (Quantitative). Use `d3.scaleLinear`.
- **Color:** `File extension` (Nominal). Use the specific color mapping below.
- **Labels:** Display `MIN(Size)` value on top of (or inside) the bars.

**Color Palette (Sheet 1):**
- `.wma`: `#4e79a7`
- `.m4b`: `#59a14f`
- `.mp3`: `#b07aa1`

**Component:** `Sheet1.tsx`
- Props: `data: DataRecord[]`, `width: number`, `height: number`.
- Render an SVG.
- Draw axes using `d3.axisBottom` and `d3.axisLeft`.
- Draw bars using `rect` elements.
- Add text labels for the values.

### Sheet 2: "Years and Quarters Vs Min of '#'"

**Visual Type:** Vertical Bar Chart (Nested).

**Data Preparation:**
- Group data by `YEAR([Date created])` and `QUARTER([Date created])`.
- Calculate `MIN(['#'])` for each group.
- The X-axis should represent the hierarchy: Year -> Quarter.

**Encodings:**
- **X-Axis:** `YEAR(Date created)` and `QUARTER(Date created)` (Ordinal). Use a nested band scale or grouped band scale.
- **Y-Axis:** `MIN('#')` (Quantitative). Use `d3.scaleLinear`.
- **Color:** `YEAR(Date created)` (Ordinal). Use the specific color mapping below.
- **Labels:** Display `MIN('#')` value on the bars.

**Color Palette (Sheet 2):**
- 2014: `#4e79a7`
- 2010: `#59a14f`
- 2012: `#76b7b2`
- 2006: `#9c755f`
- 2009: `#b07aa1`
- 2008: `#e15759`
- 2011: `#edc948`
- 2007: `#f28e2b`
- 2013: `#ff9da7`

**Component:** `Sheet2.tsx`
- Props: `data: DataRecord[]`, `width: number`, `height: number`, `highlightYear?: number | null`.
- Render an SVG.
- Draw axes.
- Draw bars grouped by Year.
- Implement interaction: Clicking a bar (or group) sets the `highlightYear` state in the parent.
- **Highlight Logic:** If `highlightYear` is set, dim (reduce opacity) bars that do not belong to that year.

### Legends

**Component:** `Legend.tsx`
- Props: `colorScale: d3.ScaleOrdinal<string, string>`, `title: string`.
- Render a vertical list of colored rectangles and text labels.
- **Legend 1 (Sheet 1):** Title "File extension". Uses Sheet 1 colors.
- **Legend 2 (Sheet 2):** Title "Year of Date created". Uses Sheet 2 colors.

## Interactions

**Highlight Action:**
- The workbook defines a "Highlight" action on `YEAR(Date created)`.
- **Implementation:**
  - State: `highlightYear` (number | null) in the main `Dashboard` component.
  - Event: When a user clicks a bar in `Sheet2`, update `highlightYear` to the corresponding year.
  - Effect: Pass `highlightYear` to `Sheet2`. `Sheet2` should visually highlight the selected year (e.g., full opacity) and fade out others (e.g., opacity 0.3).
  - Note: Sheet 1 does not use `YEAR(Date created)`, so it does not react to this highlight.

## Implementation Steps

1.  **Setup:** Initialize Vite + React + TypeScript project. Install `d3` and `@types/d3`.
2.  **Data:** Create `useData.ts` to fetch and parse the CSV.
3.  **Components:**
    - Create `Sheet1.tsx` (Bar chart for File Extensions).
    - Create `Sheet2.tsx` (Bar chart for Years/Quarters).
    - Create `Legend.tsx` (Generic legend).
4.  **Layout:** Create `Dashboard.tsx`.
    - Use CSS Grid or Flexbox to match the "Left (Sheet 1 + Legends) | Right (Sheet 2)" structure.
    - Integrate the components.
5.  **Wiring:** Connect the click event in `Sheet2` to the highlight state.
6.  **Refinement:** Ensure fonts, colors, and titles match the XML exactly (including the typo "Extentions").

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine4_3352/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 1
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[min:Size:qk]`
- cols_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]`
- series_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]`
- bar_orientation: `vertical`
- category_order: %all%, .wma, .mp3, .m4b
- zone: x=566, y=1105, w=32766, h=97790
- legend_required: true
- legend_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]`
- legend_relative_position: right
- highlight_fields: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[attr:File extension:nk], [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 2
- chart_intent: `line_chart`
- rows_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[min:#:qk]`
- cols_field: `([federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok] / [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[qr:Date created:ok])`
- series_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok]`
- zone: x=41400, y=1105, w=58034, h=97790
- legend_required: true
- legend_field: `[federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok]`
- legend_relative_position: left
- highlight_fields: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored left the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Dashboard 1, target=Dashboard 1
  fields: YEAR(Date created)
## Highlight Bindings
- Sheet 1: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[attr:File extension:nk], [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]
- Sheet 2: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok]
- Sheet 1: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[none:File extension:nk]
- Sheet 2: [federated.1bz57tv0fdrdbw16vbh6k09ofyi2].[yr:Date created:ok]
