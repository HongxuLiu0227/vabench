# SCOTUS Votes Dashboard

A React + TypeScript + Vite application that visualizes Supreme Court voting data from 1991-2017, rebuilt from a Tableau dashboard specification.

## Overview

This dashboard displays three interactive visualizations:
- **Sheet 1**: Vertical stacked bar chart showing SCOTUS votes by justice and vote direction
- **Sheet 3**: Small multiples bar chart showing precedent-changing votes by issue area
- **Sheet 4**: Small multiples line charts showing career voting trends over time

## Tech Stack

- **Framework**: React 19.1.1 + TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Visualization**: D3.js 7.9.0 (d3-scale, d3-shape, d3-axis, d3-array, d3-selection, d3-dsv)
- **Routing**: React Router DOM 7.1.1
- **Styling**: CSS Modules with CSS Grid layout

## Getting Started

### Prerequisites

- Node.js 18+
- npm package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## Data

The dashboard loads SCOTUS voting data from:
```
public/data/TEMP_17c8nuo10pkc6t16hq2ut064xifx.csv
```

Data is fetched at runtime via `fetch('/data/...')` and parsed using d3-dsv.

### Data Schema

Each record represents a single justice's vote on a case:
- `justiceName`: Justice identifier (e.g., "CThomas", "RBGinsburg")
- `term`: Year of the court term
- `issueArea`: Categorical issue area (1-14)
- `vote_direction`: Vote direction (0=No Vote, 1=Conservative, 2=Liberal, 3=Unspecifiable)
- `precedentAlteration`: Whether the vote altered precedent
- `majVotes`, `minVotes`: Vote counts for majority/minority

### Encodings

**Vote Direction Colors**:
- Conservative (1): `#e15759` (red)
- Liberal (2): `#4e79a7` (blue)
- No Vote (0): `#9c755f` (brown)
- Unspecifiable (3): `#76b7b2` (teal)

**Issue Areas**: Criminal Procedure, Civil Rights, First Amendment, Due Process, Privacy, Attorneys, Unions, Economic Activity, Judicial Power, Federalism, Interstate Relations, Federal Taxation, Miscellaneous, Private Action

## Features

### Filters

- **Issue Area Filter**: Dropdown to filter by legal issue area
- **Justice Name Filter**: Multi-select checkbox list to filter justices

Default justice selection: CThomas, EKagan, JGRoberts, NMGorsuch, RBGinsburg, SAAlito, SGBreyer, SSotomayor

### Interactions

- **Click to Highlight**: Click any bar segment to highlight that justice + vote_direction combination across all sheets
- **Click Again to Clear**: Click the same selection to clear the highlight
- **Auto-Clear**: Selections persist until manually cleared or new selections are made

### Highlight Behavior

When a selection is active:
- Selected justice + vote_direction pairs display at full opacity
- Unselected data dims to 20% opacity
- All three sheets update to reflect the selection

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── Dashboard.css          # Dashboard styles
│   ├── Sheet1.tsx             # Vertical stacked bar chart
│   ├── Sheet3.tsx             # Small multiples bar chart
│   ├── Sheet4.tsx             # Small multiples line chart
│   ├── VoteDirectionLegend.tsx # Color legend
│   ├── IssueAreaFilter.tsx    # Issue area dropdown
│   └── JusticeNameFilter.tsx  # Justice multi-select
├── contexts/
│   └── FilterContext.tsx      # Global filter state
├── services/
│   └── dataService.ts         # Data loading & aggregation
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # Router setup
├── main.tsx                   # App entry point
└── index.css                  # Global styles
```

### State Management

FilterContext provides global state for:
- `filters`: Selected issue areas, justices, vote directions
- `highlight`: Current selection state (justice, vote_direction, etc.)
- Filter setter functions
- Highlight setter functions

### Data Flow

1. Dashboard loads full CSV via `loadScotusData()`
2. Data filtered based on filter state via `filterData()`
3. Aggregated for each visualization:
   - `aggregateVotesByJusticeAndDirection()` for Sheet 1
   - `aggregatePrecedentByJusticeAndIssue()` for Sheet 3
   - `aggregateCareerVotesByTerm()` for Sheet 4
4. Aggregated data passed to chart components
5. Charts render using D3.js in useEffect hooks

## Implementation Notes

### Tableau Spec Compliance

✅ **Sheet 1** (vertical_ranked_bar):
- chart_intent: Vertical stacked bars by justice, colored by vote_direction
- Bars sorted descending by total vote count
- Legend displayed in overlay position
- Click interactions for highlight/filter

✅ **Sheet 3** (line_chart):
- Small multiples layout (one chart per justice)
- Stacked bars showing precedentAlteration sum by issueArea
- Filtered to issue areas 1-10, 12 and selected justices

✅ **Sheet 4** (horizontal_ranked_bar):
- Small multiples layout (one chart per justice)
- Line charts showing vote count over time by term
- Filtered to vote_direction 0, 2 (No Vote, Liberal)
- Axis titles: "Votes" (Y-axis), "Year" (X-axis)

✅ **Dashboard Actions**:
- Filter1 action: Clicking any bar segment filters/highlights across all sheets

✅ **Highlight Bindings**:
- All sheets support highlight by justiceName and vote_direction
- Auto-clear behavior on re-click

### Known Differences from Original Tableau

1. Small multiples layouts use automatic grid sizing rather than Tableau's manual zone placement
2. No global "Apply/Reset" button (filters apply immediately)
3. No dashboard text zones (none specified in contract)
4. Legend positioned as CSS overlay rather than Tableau's exact pixel positioning

## Performance

- CSV data cached after first load
- Aggregation performed once on filter changes
- D3 rendering in useEffect with proper cleanup
- SVG elements cleared and re-rendered on data updates

## Browser Compatibility

Tested on modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project was generated from a Vite template and rebuilt from Tableau specifications.
