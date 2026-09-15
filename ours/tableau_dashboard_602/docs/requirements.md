# Project Requirements

You are an expert React engineer. Your task is to implement a dashboard based on the provided Tableau workbook definition.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`).
- CSS for styling (CSS Modules or standard CSS).

## Data Loading

The primary data source is located at `/data/1InsuranceRates.csv`.

You must implement a data loading utility that fetches this CSV file and parses it into an array of objects.

Example implementation:

```typescript
// src/utils/data.ts
import { csvParse } from 'd3-dsv';

export interface InsuranceRow {
  Age: number;
  Gender: 'Male' | 'Female';
  '6-month premium': number;
}

export const loadData = async (): Promise<InsuranceRow[]> => {
  const response = await fetch('/data/1InsuranceRates.csv');
  const csvText = await response.text();
  const data = csvParse<InsuranceRow>(csvText, (d) => ({
    Age: +d.Age,
    Gender: d.Gender.trim() as 'Male' | 'Female',
    '6-month premium': +d['6-month premium'],
  }));
  return data;
};
```

## Sample Data

```json
[
  {
    "﻿Age": 25,
    "Gender": "Female",
    "6-month premium": 700
  },
  {
    "﻿Age": 25,
    "Gender": "Male",
    "6-month premium": 700
  },
  {
    "﻿Age": 17,
    "Gender": "Male",
    "6-month premium": 1300
  },
  {
    "﻿Age": 17,
    "Gender": "Female",
    "6-month premium": 1200
  },
  {
    "﻿Age": 18,
    "Gender": "Male",
    "6-month premium": 1200
  },
  {
    "﻿Age": 18,
    "Gender": "Female",
    "6-month premium": 1100
  },
  {
    "﻿Age": 19,
    "Gender": "Male",
    "6-month premium": 1100
  },
  {
    "﻿Age": 24,
    "Gender": "Male",
    "6-month premium": 800
  },
  {
    "﻿Age": 20,
    "Gender": "Male",
    "6-month premium": 1000
  },
  {
    "﻿Age": 20,
    "Gender": "Female",
    "6-month premium": 900
  }
]
```

## Dashboard Architecture

The application consists of a main `App` component that fetches data and manages the shared state (highlighting), and a `Dashboard` component that lays out the two worksheets.

### Component Hierarchy
- `App`
  - `Dashboard`
    - `PremiumsFallChart` (Top)
    - `GenderGapChart` (Bottom)
    - `GenderLegend` (Positioned near Gender Gap)

### Layout
- The dashboard uses a vertical layout (CSS Flexbox column).
- **Top Section (approx 50% height):** "Premiums Fall" chart.
- **Bottom Section (approx 50% height):** "Gender Gap" chart.
- Margins should be minimal (approx 4px-8px) as per the workbook definition.

## Visual Specifications

### 1. Premiums Fall Chart

**Title:** "Premiums fall as age increases"

**Type:** Circle/Shape Chart (Scatter plot with discrete X-axis).

**Data Preparation:**
- Group data by `Age`.
- Calculate the **Average** of `6-month premium` for each Age.

**Encodings:**
- **X-Axis:** `Age` (Ordinal/Discrete). Range: Data domain.
- **Y-Axis:** `AVG(6-month premium)` (Quantitative). Range: [0, Max Value].
- **Mark:** Circle.
- **Color:** `#55557f` (Purple-grey).
- **Size:** Fixed size (approx 5-6px radius).

**Styling:**
- Font: Sans-serif (Tableau Book equivalent).
- Axis labels: Dark grey (`#333333`).
- Y-Axis format: Currency ("$"#,##0).
- Gridlines: Horizontal only (optional, based on standard Tableau defaults).

**Annotations:**
- Add a point annotation at **Age 16** displaying the specific premium value.
- Add a point annotation at **Age 25** displaying the specific premium value.
- Annotation style: Small text, grey label for "Age:" and "Premium:", bold value.

### 2. Gender Gap Chart

**Title:** "Disparity in premium cost by gender"

**Type:** Line Chart.

**Data Preparation:**
- Use raw data (one point per Age/Gender combination).
- **Sorting Logic (CRITICAL):** The X-axis (Age) must be sorted by the Y-axis value (Premium) in **Descending** order. This is a specific requirement from the workbook (`<computed-sort column='[Age]' direction='DESC' using='[6-month premium]' />`).

**Encodings:**
- **X-Axis:** `Age` (Ordinal). Domain order determined by sorting Premium Descending.
- **Y-Axis:** `SUM(6-month premium)` (Quantitative). Range: [Min Value, Max Value].
- **Color:** `Gender`.
  - Male: `#4e79a7` (Blue)
  - Female: `#f28e2b` (Orange)
- **Mark:** Line (width approx 2px).

**Styling:**
- Font: Sans-serif.
- Y-Axis format: Currency ("$"#,##0).
- Mark Labels: Show labels for specific points (Age 21, 22, 23) as defined in the workbook, or generally show labels on hover/selection.

**Annotations:**
- Add an **Area Annotation** labeled "Gender Gap Closes".
- Position: Covering the approximate range of Age 23 to 25.
- Style: White background, black border, centered text.

### 3. Legend

**Type:** Color Legend for Gender.
- Items: Male (Blue), Female (Orange).
- Position: Floating or placed to the right/bottom of the Gender Gap chart.

## Interactions

**Action:** "Highlight 1 (generated)"
- **Trigger:** Click/Select on any mark in the dashboard.
- **Target:** The entire dashboard.
- **Effect:** Highlighting based on the `Gender` field.

**Implementation:**
1.  Create a state variable `selectedGender` in `App` (type: 'Male' | 'Female' | null).
2.  Pass `selectedGender` and a setter `onGenderSelect` to both charts.
3.  **In Gender Gap Chart:**
    - When a line or point is clicked, set `selectedGender` to that point's gender.
    - If `selectedGender` is set, dim (reduce opacity) the lines/points that do not match the selected gender.
4.  **In Premiums Fall Chart:**
    - This chart aggregates data, so it doesn't explicitly show gender. However, to maintain consistency, clicking a point could potentially highlight the underlying data. Since the visual encoding doesn't support gender filtering visually on this specific chart, the primary interaction focus is on the Gender Gap chart driving the highlight state.

## Implementation Details

- Use `d3-scale` for `scaleBand` (X-axis) and `scaleLinear` (Y-axis).
- Use `d3-shape` `line()` generator for the Gender Gap chart.
- Use `d3-axis` for rendering axes.
- Ensure the SVGs are responsive (use `viewBox` and percentage widths).
- Handle window resizing to re-render charts if necessary (or use a resize observer).

## Summary of Files to Create
1.  `src/main.tsx`
2.  `src/App.tsx` (Data fetching, State management)
3.  `src/components/Dashboard.tsx` (Layout)
4.  `src/components/PremiumsFallChart.tsx`
5.  `src/components/GenderGapChart.tsx`
6.  `src/utils/data.ts` (CSV parsing)

Please proceed with generating the code for this application.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_602/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Gender Gap
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[sum:6-month premium:ok]`
- cols_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok]`
- series_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[none:Gender:nk]`
- series_order: Male, Female, %all%
- expected_series_values: Male, Female, %all%
- zone: x=800, y=50000, w=98400, h=49000
- legend_required: true
- legend_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[none:Gender:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.1nootr000bhdfw14p7u8a08vc5al].[Age & Gender (group)], [federated.1nootr000bhdfw14p7u8a08vc5al].[avg:Age:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[io:Set 1:nk], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:6-month premium:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Gender:nk], [federated.1nootr000bhdfw14p7u8a08vc5al].[sum:Age:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Premiums Fall
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[avg:6-month premium:qk]`
- cols_field: `[federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok]`
- zone: x=800, y=1000, w=98400, h=49000
- highlight_fields: [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Dashboard, target=Dashboard
  fields: Gender
## Highlight Bindings
- Premiums Fall: [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok]
- Gender Gap: [federated.1nootr000bhdfw14p7u8a08vc5al].[Age & Gender (group)], [federated.1nootr000bhdfw14p7u8a08vc5al].[avg:Age:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[io:Set 1:nk], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:6-month premium:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Age:ok], [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Gender:nk], [federated.1nootr000bhdfw14p7u8a08vc5al].[sum:Age:ok]
- Gender Gap: [federated.1nootr000bhdfw14p7u8a08vc5al].[none:Gender:nk]
