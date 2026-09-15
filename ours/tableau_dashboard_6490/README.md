# Tableau Dashboard - Confusion Matrix and View Posts

This is an interactive dashboard built with React, TypeScript, and D3.js that replicates a Tableau workbook for visualizing classification model performance and individual post predictions.

## Features

- **Confusion Matrix**: Interactive heatmap showing the relationship between True Labels and Predicted Labels with row-wise percentages
- **View Posts**: Scatter plot visualization of individual posts with:
  - X-axis: Predicted values (Predicted_XY)
  - Y-axis: True values (True_XY)
  - Color: Encodes Predicted Label
  - Shape: Encodes True Label
  - Size: Encodes F1 score
- **Interactive Filtering**: Click on any cell in the confusion matrix to filter the scatter plot
- **Auto-clear Behavior**: Click again on the selected cell to clear the filter
- **Tooltips**: Hover over points to see detailed information

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js v7** - Data visualization (d3-scale, d3-shape, d3-axis, d3-selection, d3-dsv)
- **React Router DOM** - Client-side routing

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev
```

The dashboard will be available at `http://localhost:5173/`

## Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Linting

```bash
# Run ESLint
pnpm lint
```

## Project Structure

```
src/
├── components/
│   ├── ConfusionMatrix.tsx    # Confusion matrix heatmap visualization
│   ├── ViewPosts.tsx          # Scatter plot with interactive filtering
│   └── Dashboard.tsx          # Main dashboard layout and state management
├── services/
│   └── dataService.ts         # Data loading from /data/Tableau_CSV.csv
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # React Router setup
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## Data Source

The dashboard loads data from `/public/data/Tableau_CSV.csv` which contains:
- Post content and metadata
- True labels vs Predicted labels
- F1 scores
- Predicted_XY and True_XY coordinates

## Tableau Spec Compliance Checklist

### Worksheet: Confusion Matrix
- ✅ `chart_type`: Bar (implemented as heatmap/matrix visualization)
- ✅ `rows`: True Label
- ✅ `cols`: Predicted Label
- ✅ `table_calc`: PctTotal (row-wise percentage calculation)
- ✅ `encodings.size`: Number of Records (cell count)
- ✅ `encodings.text`: Percentage displayed in cells
- ✅ `style_rule_elements`: axis, cell, header, pane
- ✅ `interactions`: Click to filter with auto-clear behavior
- ✅ `highlight_fields`: Predicted Label, True Label
- ✅ `zone`: Positioned at top of dashboard (~52% height)

### Worksheet: View Posts
- ✅ `chart_type`: Automatic (implemented as scatter plot)
- ✅ `rows`: True_XY (Y-axis)
- ✅ `cols`: Predicted_XY (X-axis)
- ✅ `encodings.color`: Predicted Label (with exact color palette)
- ✅ `encodings.shape`: True Label (using D3 symbol types)
- ✅ `encodings.lod`: F1 (size encoding)
- ✅ `encodings.tooltip`: Post content
- ✅ `axis_titles`: "True" for Y-axis, "Predicted" for X-axis
- ✅ `filter`: Action filter from Confusion Matrix
- ✅ `highlight_fields`: True Label, Post, Predicted Label
- ✅ `zone`: Positioned at bottom of dashboard (~45% height)

### Dashboard Composition
- ✅ Single dashboard layout with vertical flexbox
- ✅ Confusion Matrix at top (~55% height)
- ✅ View Posts at bottom (remaining height)
- ✅ No decorative chrome or card shadows beyond basic styling
- ✅ Clean, data-dense aesthetic matching Tableau

### Interactions
- ✅ Dashboard action: Filter 1 (generated)
  - Source: Confusion Matrix
  - Target: Dashboard (all worksheets)
  - Activation: on-select
  - Auto-clear: true
- ✅ Highlight bindings implemented for both worksheets
- ✅ Click on confusion matrix cells filters scatter plot
- ✅ Click again on selected cell clears filter

### Routing
- ✅ React Router DOM with BrowserRouter
- ✅ Dashboard rendered at `/`
- ✅ `/dashboard` route as alias
- ✅ Wildcard route redirects to `/`

### Data Loading
- ✅ Full dataset loaded from `/data/Tableau_CSV.csv`
- ✅ Using fetch API and d3.csvParse
- ✅ Numeric measures parsed explicitly with Number()
- ✅ No data files under src/data or src/mocks

## License

MIT
