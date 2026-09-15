# Tableau Dashboard - Synthetic Dashboard 190

A React-based dashboard implementation that strictly follows Tableau data-source policies and renders visualizations based on the Tableau specification contract.

## Data Source Policy

This project adheres to strict Tableau data-source policies:

- **Runtime Data Source**: All dashboard metrics and visuals are powered exclusively by files under `public/data/...`
- **Full Dataset Loading**: The application loads complete datasets via `fetch('/data/...')` - no synthesized or sample data
- **No Local Data Files**: CSV/JSON files are NOT placed under `src/data` or `src/mocks`
- **Data Location**: Dataset files are located only in `public/data/`

## Dataset

This dashboard uses the following dataset:
- **URL**: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`
- **Source**: Sample Superstore Orders data
- **Format**: CSV with full order history including Sales, Profit, Quantity, Discount, and customer information

## Worksheets

The dashboard implements 3 worksheets as specified in the Tableau contract:

### 1. Customer Overview (P1968__customer_overview)
- **Type**: Custom Tableau View (Table)
- **Rows**: Region
- **Columns**: Multiple Measures (Customer Count, Sales, Quantity, Profit, Profit Ratio)
- **Data Aggregation**:
  - Groups by Region
  - Counts distinct customers
  - Sums Sales, Quantity, Profit
  - Calculates Profit Ratio

### 2. Scatterplot (P121__scatterplot)
- **Type**: Circle Chart (Scatterplot)
- **X-Axis**: Sales
- **Y-Axis**: Profit
- **Size**: Quantity
- **Color**: Sales (continuous gradient)
- **Data Aggregation**:
  - Groups by Product Name
  - Sums Sales, Profit, Quantity

### 3. Discount Overview by Region (P2648__discount_overview_by_region)
- **Type**: Custom Tableau View (Table)
- **Rows**: Region
- **Columns**: Multiple Measures (Average Discount, Profit, Quantity, Sales, Profit Ratio)
- **Data Aggregation**:
  - Groups by Region
  - Calculates Average Discount
  - Sums Profit, Quantity, Sales
  - Calculates Profit Ratio

## Technical Implementation

### Data Loading
- CSV data is fetched via `fetch('/data/...')`
- Parsed using D3's CSV parser
- All numeric fields converted to numbers using `Number()` before aggregation
- Invalid dates handled gracefully with fallbacks

### Visualization Libraries
- **D3.js** (v3): Selection, scales, axes, arrays
- **React** (v19): Component framework
- **TypeScript**: Type safety
- **Vite**: Build tool

### Accessibility Features
- ARIA live regions for loading states
- ARIA alerts for error states
- Semantic HTML structure
- Full keyboard navigation support

### Layout
The dashboard follows the Tableau render contract zone specifications:
- **Top Row**: Customer Overview (left, 49.2% width) + Scatterplot (right, 49.2% width)
- **Bottom Row**: Discount Overview (full width, 98.4%)
- **Total Dimensions**: 1000px × 800px (as per contract)

## Installation & Running

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Build Verification

All builds are verified to pass:
- ✅ `pnpm install` - Dependency graph verification
- ✅ `pnpm lint` - ESLint compliance
- ✅ `pnpm build` - TypeScript compilation and production build

## Tableau Spec Compliance

This implementation strictly follows the Tableau specification contract:
- ✅ All worksheet fields implemented according to spec
- ✅ Chart types match `chart_type` and `chart_intent`
- ✅ Layout follows `dashboard_zones` coordinates
- ✅ No synthetic chrome or placeholder content
- ✅ All interactions are functional (no no-op handlers)
- ✅ Full dataset loaded and aggregated (no sample rows)
- ✅ Numeric fields properly converted before aggregation

## Worksheet Implementation Details

### P1968__customer_overview
- ✅ **chart_type**: Automatic → Custom Tableau View (Table)
- ✅ **rows**: Region
- ✅ **cols**: Measure Names × Multiple Values
- ✅ **series_field**: Calculation_5571209093911105
- ✅ **manual_sort**: Measure Names in ASC order
- ✅ **title_runs**: "Customer Overview"
- ✅ **zone**: x=0.8%, y=1%, w=49.2%, h=61.75%
- ✅ **style_rule_elements**: axis, mark, quick-filter
- ✅ Data: Full dataset aggregated by Region

### P121__scatterplot
- ✅ **chart_type**: Circle → Scatterplot
- ✅ **rows**: Profit
- ✅ **cols**: Sales
- ✅ **series_field**: Sales (color encoding)
- ✅ **size encoding**: Quantity
- ✅ **lod encoding**: Product Name
- ✅ **title_runs**: "Scatterplot"
- ✅ **zone**: x=50%, y=1%, w=49.2%, h=61.75%
- ✅ Data: Full dataset aggregated by Product Name

### P2648__discount_overview_by_region
- ✅ **chart_type**: Automatic → Custom Tableau View (Table)
- ✅ **rows**: Region
- ✅ **cols**: Measure Names × Multiple Values
- ✅ **series_field**: Discount (color encoding)
- ✅ **manual_sort**: Measure Names in ASC order
- ✅ **title_runs**: "Discount Overview by Region"
- ✅ **zone**: x=0.8%, y=62.75%, w=98.4%, h=36.25%
- ✅ **style_rule_elements**: axis, mark
- ✅ Data: Full dataset aggregated by Region

## Changes Made

### 1. Fixed Height Issue
- **Issue**: DiscountOverview component height was incorrectly set to 173px
- **Fix**: Updated to 363px to match render contract specification (36.25% of 1000px height)
- **Location**: `src/components/Dashboard.tsx`

### 2. Improved Loading States
- **Issue**: Loading states lacked accessibility features
- **Fix**: Added ARIA live regions, loading spinner animation, and proper semantic markup
- **Location**: `src/components/Dashboard.tsx`

### 3. Enhanced Error States
- **Issue**: Error states lacked accessibility features
- **Fix**: Added ARIA alert role and live region for screen readers
- **Location**: `src/components/Dashboard.tsx`

## Verification Summary

### Data Policy Compliance ✅
- ✅ No placeholders (TODO, Lorem ipsum, Coming soon, Sample data)
- ✅ Data file located at `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`
- ✅ Data loaded via `fetch('/data/...')`
- ✅ No data files in `src/data` or `src/mocks`
- ✅ All numeric fields converted to numbers before aggregation

### Implementation Quality ✅
- ✅ No placeholder toasts/log statements
- ✅ All navigation uses React Router (no inert links)
- ✅ No buttons/links with no-op handlers
- ✅ No synthetic chrome (hero titles, footers, watermarks)
- ✅ All components render meaningful data
- ✅ D3-based charts implemented
- ✅ Full dataset loaded and aggregated

### Accessibility ✅
- ✅ Loading states use ARIA live regions
- ✅ Error states use ARIA alerts
- ✅ Semantic HTML structure
- ✅ Loading spinner for visual feedback

### Build Verification ✅
- ✅ `pnpm install` - No dependency issues
- ✅ `pnpm lint` - No linting errors
- ✅ `pnpm build` - Successful production build
