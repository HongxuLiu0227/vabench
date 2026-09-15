# Tableau Dashboard - Data Breach Visualization

This project recreates a Tableau dashboard titled "Dashboard 1" showing data breach statistics using React, TypeScript, and D3.js.

## Overview

The dashboard visualizes data breach incidents with three interactive charts:
1. **Types of Breach** - Vertical bar chart showing breach type distribution
2. **Annual % by Type & Year** - Pie chart showing breach distribution by year
3. **Information Source for Breach** - Stacked bar chart showing information sources by breach type

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Visualization**: D3.js (d3-scale, d3-shape, d3-axis, d3-array, d3-time-format)
- **Routing**: React Router DOM v7
- **Data Loading**: Native fetch API with CSV parsing

## Data Source

The dashboard loads data from `/public/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv`, containing:
- Date Made Public
- Company
- Location
- Type of breach
- Type of organization
- Records Breached
- Total Records
- Description of incident
- Information Source
- Source URL

## Features

### Interactive Filtering (Action 1)
- Click on any pie slice in "Annual % by Type & Year" to filter the dashboard
- Filters propagate to "Types of Breach" and "Information Source for Breach" charts
- Click again on the same slice or click a different slice to change/clear the filter
- Auto-clear behavior enabled

### Visual Encodings
- **Breach Type Colors**: DISC (blue), PORT (green), PHYS (teal), UNKN (purple), INSD (red), STAT (yellow), HACK (orange)
- **Information Source Colors**: 12 distinct colors for different sources (Media, Government Agency, PHIPrivacy.net, etc.)

### Layout
The dashboard follows the Tableau zone layout:
- Top row: "Types of Breach" (left) and "Annual % by Type & Year" (right)
- Sidebar: Information Source legend (top), Breach Type legend (bottom), Filter indicator
- Bottom row: "Information Source for Breach" (full width stacked bar chart)

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build

```bash
pnpm build
```

The built files will be in the `dist` directory.

### Preview

```bash
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── AnnualByTypeYearChart.tsx    # Pie chart component
│   ├── BreachTypeLegend.tsx         # Breach type legend
│   ├── Dashboard.tsx                # Main dashboard layout
│   ├── InfoSourceLegend.tsx         # Information source legend
│   ├── InformationSourceChart.tsx   # Stacked bar chart
│   └── TypesOfBreachChart.tsx       # Vertical bar chart
├── contexts/
│   └── FilterContext.tsx            # Global filter state management
├── services/
│   ├── dataAggregator.ts            # Data aggregation utilities
│   └── dataLoader.ts                # CSV data loader
├── types/
│   └── data.ts                      # TypeScript type definitions
├── utils/
│   └── colors.ts                    # Color scales for chart encoding
├── App.tsx                          # React Router setup
└── main.tsx                         # Application entry point
```

## Tableau Spec Compliance

This implementation follows the structured contracts in:
- `docs/tableau_spec.json` - Authoritative machine-readable specification
- `docs/tableau_render_contract.json` - Chart geometry and layout contract

### Worksheet Implementation Checklist

✅ **Types of Breach** (vertical_ranked_bar)
- Chart Type: Vertical bar chart
- X-Axis: Type of breach (categorical)
- Y-Axis: Count of Total Records
- Color: Type of breach (matches Tableau palette)
- Sort: Descending by count
- Filter: Listens to Action 1 filter
- Location: x=1231, y=1192, w=35078, h=48808

✅ **Annual % by Type & Year** (pie_chart)
- Chart Type: Pie chart
- Slices: Type of breach (color) + Year (detail)
- Wedge Size: Percent of Total Count
- Filter: DISC to UNKN only
- Legend: Required (position: below)
- Interaction: Source of Action 1 filter (on-select, auto-clear)
- Location: x=36309, y=1192, w=35075, h=48808

✅ **Information Source for Breach** (vertical_ranked_bar with stacking)
- Chart Type: Vertical stacked bar chart
- X-Axis: Type of breach
- Y-Axis: Count of Total Records
- Color/Stack: Information Source (12 distinct values)
- Filter: Excludes null Information Source; listens to Action 1
- Legend: Required (position: above)
- Location: x=1231, y=50000, w=70153, h=48808

### Interactions
- ✅ Filter 1 (generated): kind=filter_action, source=Annual % by Type & Year, target=Dashboard 1
- ✅ Highlight Bindings: 7 bindings implemented (see tableau_spec.json for details)

## Data Policy

✅ Runtime data source: `public/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv`
✅ Full dataset loaded via fetch API
✅ No synthesized sample data
✅ No data files under src/data or src/mocks
✅ Numeric measures parsed explicitly before aggregation
✅ Charts use D3 primitives (not high-level wrappers)

## License

MIT

