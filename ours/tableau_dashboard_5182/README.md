# College Fight Songs Dashboard

A React + TypeScript + Vite application that recreates a Tableau dashboard visualizing college fight song characteristics.

## Overview

This dashboard displays fight songs from various colleges and universities, plotting Beats Per Minute (BPM) against Duration (in seconds), colored by athletic conference.

## Features

- **Dynamic Title**: Updates based on school selection
- **Interactive Scatterplot**:
  - D3.js-powered visualization
  - Click to select/highlight a specific school
  - Hover tooltips showing school names
  - Reference lines showing average BPM and duration
  - Quadrant annotations (Fast/Slow + Long/Short)
  - Conference-based color encoding
- **Legend**: Overlay legend showing all conferences with their colors
- **URL-based State**: Selection state is reflected in the URL query parameters
- **Auto-clear**: Clicking the same school again clears the selection

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization (scales, axes, shapes, selections)
- **React Router DOM** - Client-side routing with URL state management

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard container
│   ├── DynamicTitle.tsx       # Selection-aware title component
│   ├── Scatterplot.tsx        # D3-powered scatterplot visualization
│   ├── ConferenceLegend.tsx   # Color legend for conferences
│   └── *.css                  # Component-specific styles
├── services/
│   └── dataService.ts         # Data loading and parsing utilities
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Root component with router
├── main.tsx                   # Application entry point
└── *.css                      # Global styles
```

## Data

The dashboard uses data from `/data/fight-songs-538.csv`, which contains information about 65+ college fight songs including:
- School name and conference
- Song name, writers, and year
- BPM and duration metrics
- Various lyrical features (fight references, victory mentions, etc.)

## Usage

1. **View the Dashboard**: Navigate to the root URL `/`
2. **Select a School**: Click on any circle in the scatterplot to highlight it
   - The title will update to show "How [School]'s Fight Song Stacks Up"
   - The selected school will be highlighted with full opacity
   - Other schools will be faded to 15% opacity
   - The URL will update with `?school=[School Name]`
3. **Clear Selection**: Click the same school again to deselect and return to the global view
4. **Explore**: Use the legend to identify conferences and observe patterns in the data

## Tableau Compliance Checklist

### Dynamic Title Worksheet
- ✅ Custom view implementation with selection-aware text
- ✅ Title updates based on selected school
- ✅ Proper styling (Courier New, 15px, bold)

### Scatterplot Worksheet
- ✅ Circle marks with conference-based color encoding
- ✅ X-axis: Duration (in seconds) with proper axis title
- ✅ Y-axis: Beats per minute with proper axis title
- ✅ Fixed Y-axis domain: [60, 200]
- ✅ Dynamic X-axis domain based on data
- ✅ Reference lines at average BPM and duration (dashed)
- ✅ Quadrant annotations (Fast/Slow + Long/Short)
- ✅ Circle opacity: 0.55 (142/255)
- ✅ Click interaction for selection
- ✅ Hover tooltips with school names
- ✅ Highlight behavior on selection
- ✅ Auto-clear selection on re-click
- ✅ Conference legend with overlay positioning

### Dashboard Actions
- ✅ Filter action: Scatterplot selection filters all dashboard views
- ✅ Auto-clear behavior implemented
- ✅ Highlight bindings for conference field

### Layout
- ✅ Max-width: 1000px, Max-height: 800px
- ✅ Title zone at top (y: 1000, h: 8250)
- ✅ Scatterplot zone (y: 9250, h: 89750)
- ✅ Legend overlay positioned correctly

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- SVG
- CSS Grid and Flexbox

## License

This project was generated from a Vite template and is available for educational and demonstration purposes.
