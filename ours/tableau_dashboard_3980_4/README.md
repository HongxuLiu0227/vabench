# CityBike Challenge Dashboard

A React-based interactive dashboard analyzing CitiBike trip data for Jersey City in 2020, recreated from Tableau specifications.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3.js v7** - Data visualization (using primitives: d3-scale, d3-axis, d3-shape, d3-selection)
- **React Router DOM** - Client-side routing
- **CSS Modules** - Styling

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173/`

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Data Source

The dashboard uses CitiBike trip data loaded from `/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv`.

### Data Transformations

- **Age**: Calculated as `2021 - birth_year`
- **GenderNames**: Mapped from gender codes (0→Unknown, 1→Male, 2→Female)
- **Invalid records**: Filtered out (age < 0 or age > 120)

## Dashboard Features

### Worksheets

1. **Usertype by Age** (Horizontal Bar Chart)
   - Shows average age by user type (Subscriber/Customer)
   - Color encoding: Subscriber (#e15759), Customer (#edc948)
   - Click interaction: Filters dashboard by selected usertype

2. **Usertype by Gender** (Vertical Grouped Bar Chart)
   - Shows trip count by usertype and gender
   - Color encoding: Unknown (#59a14f), Male (#f28e2b), Female (#b07aa1)
   - Responds to usertype filter from Age chart

### Interactions

- **Filter Action (Action4/Filter3)**: Selecting a usertype in the Age chart filters both charts
- **Auto-clear**: Clicking the same bar again clears the filter
- **Highlight**: Non-selected bars are dimmed when a filter is active
- **Tooltips**: Display detailed values on hover

### Summary Statistics

- Total Trips
- Average Trip Duration
- Average Age

All statistics update dynamically based on applied filters.

## Routing

The dashboard is accessible at:
- `/` - Main dashboard
- `/dashboard` - Alias route to main dashboard

## Architecture

```
src/
├── components/
│   ├── Dashboard.tsx              # Main dashboard container
│   ├── UsertypeByAgeChart.tsx     # Horizontal bar chart (D3)
│   └── UsertypeByGenderChart.tsx  # Vertical grouped bar chart (D3)
├── services/
│   └── dataLoader.ts              # Data loading and aggregation
├── types/
│   └── index.ts                   # TypeScript interfaces
├── App.tsx                        # Router configuration
└── main.tsx                       # Application entry point
```

## Tableau Spec Compliance

This implementation follows the structured Tableau specifications:

- ✅ All worksheets implemented with correct chart intents
- ✅ Color encoding matches Tableau palette
- ✅ Filter interactions (Action4) implemented
- ✅ Highlight bindings applied
- ✅ Axis titles and labels preserved
- ✅ Dynamic chart margins for full label visibility
- ✅ Bars sorted by measure values (descending)

See [TABLEAU_SPEC_COMPLIANCE.md](./TABLEAU_SPEC_COMPLIANCE.md) for detailed checklist.
