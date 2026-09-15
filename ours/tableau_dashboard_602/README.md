# Insurance Premium Dashboard

A Tableau-inspired interactive dashboard built with React, TypeScript, Vite, and D3.js that visualizes insurance premium rates by age and gender.

## Overview

This dashboard displays insurance premium data across two interactive worksheets:
- **Premiums Fall**: Circle chart showing average 6-month premium by age
- **Gender Gap**: Line chart comparing premiums between male and female drivers by age

## Features

- Interactive data visualization using D3.js primitives
- Gender-based highlighting across all worksheets
- Responsive design with proper aspect ratios
- Real-time data loading from CSV
- Tableau-faithful styling and interactions

## Tech Stack

- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool and dev server
- **D3.js 7.9.0** - Data visualization
- **React Router DOM 7.1.1** - Client-side routing

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173/`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Data Source

The dashboard loads insurance premium data from `/public/data/1InsuranceRates.csv` with the following structure:
- Age (16-25)
- Gender (Male/Female)
- 6-month premium (in USD)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── PremiumsFallChart.tsx  # Circle chart visualization
│   ├── GenderGapChart.tsx     # Line chart with gender series
│   └── GenderLegend.tsx       # Overlay legend component
├── utils/
│   └── data.ts                # Data loading and aggregation utilities
├── App.tsx                    # Root component with routing and data fetching
├── main.tsx                   # Application entry point
├── App.css                    # Component-specific styles
└── index.css                  # Global styles
```

## Interactions

### Gender Highlighting

1. **Click on any data point** in the Gender Gap chart or legend to highlight a specific gender
2. **Non-selected elements** will be dimmed (opacity reduced)
3. **Click outside** or click the same gender again to clear the selection

This feature demonstrates Tableau-style dashboard interactions where selections propagate across all worksheets.

## Visualization Details

### Premiums Fall Chart
- **Type**: Circle/Shape chart (scatter plot with discrete x-axis)
- **X-Axis**: Age (ordinal, 16-25)
- **Y-Axis**: Average 6-month premium (quantitative, USD)
- **Color**: #55557f (purple-grey)
- **Interactions**: Hover tooltips, click-to-select

### Gender Gap Chart
- **Type**: Line chart with gender series
- **X-Axis**: Age (ordinal, 16-25)
- **Y-Axis**: Sum of 6-month premium (quantitative, USD)
- **Colors**: Male (#4e79a7 blue), Female (#f28e2b orange)
- **Interactions**: Hover tooltips, gender-based highlighting, legend interaction

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
