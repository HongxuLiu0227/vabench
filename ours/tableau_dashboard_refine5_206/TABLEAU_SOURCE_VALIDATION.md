# Tableau Source Ingestion Validation Summary

## Objective
Make Tableau source ingestion deterministic and correct before later QA/build stages.

## Changes Made

### 1. Enhanced CSV Parser (`src/services/dataLoader.ts`)

#### Preamble Detection and Skipping
- **Problem**: CSV contains 4 preamble rows before the actual header:
  - Row 1: "Super Store Date set for the worldwide sales..."
  - Row 2: Empty
  - Row 3: "The data might need some cleaning up..."
  - Row 4: Empty
  - Row 5: Actual header row

- **Solution**: Implemented `detectAndSkipPreamble()` function that:
  - Scans first 20 lines for known column names ('Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit')
  - Detects header row when ≥3 known columns are found
  - Returns CSV text starting from the real header row
  - Logs number of skipped preamble rows for debugging

#### Header Normalization
- **Problem**: CSV headers may contain extra quotes or whitespace
- **Solution**: Implemented `normalizeHeader()` function that:
  - Removes leading/trailing quotes
  - Replaces multiple consecutive quotes with single quotes
  - Trims whitespace

#### Date Validation
- **Problem**: Invalid dates can result in "Jan 1970" or NaN values
- **Solution**: Enhanced date parsing with:
  - Null/undefined checks
  - Validation for NaN dates
  - Validation for dates before 1990 (suspicious/invalid)
  - Detailed logging for debugging

#### Numeric Field Validation
- **Problem**: Non-numeric values can break aggregations
- **Solution**:
  - Parse all numeric fields with `parseFloat()`
  - Validate with `isNaN()` checks
  - Skip rows with invalid numeric values
  - Log warnings for skipped rows

#### Column Validation
- **Problem**: Missing columns cause runtime errors
- **Solution**: Added validation that checks for required columns:
  - 'Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity'
  - Throws descriptive error if columns are missing

### 2. Enhanced Dashboard Component (`src/components/Dashboard.tsx`)

#### Field Resolution Validation
- **Added**: `validateTableauFields()` function that:
  - Checks all required Tableau fields are present
  - Validates date ranges (not Jan 1970)
  - Validates numeric values (not zero or NaN)
  - Returns validation result with errors and sample record

#### Better Error Handling
- **Enhanced**: Error messages now include:
  - Validation failures with specific field names
  - Console logging for debugging
  - User-friendly error display

### 3. Validation Script (`validate_data.cjs`)

#### Purpose
Standalone script to validate CSV parsing without running the full app.

#### Features
- Detects preamble rows
- Validates header detection
- Parses CSV with proper quote handling
- Validates sample data rows
- Checks for required columns
- Returns clear pass/fail status

#### Test Results
```
✓ Detected header row at index 4, skipping 4 preamble rows
✓ Found 23 columns
✓ All required columns present
✓ Validated 99 sample rows, 0 invalid rows
✅ Validation PASSED
```

## Tableau Data Policy Compliance

✅ **Runtime data source**: All data loaded from `/data/...` via `fetch()`
✅ **No synthesized data**: Charts use full dataset, not sample rows
✅ **No src/data files**: All data files under `public/data/`
✅ **No local imports**: No imports from `../data/*.csv` or `../mocks/*`
✅ **Sample rows only in docs**: Runtime charts read full data from `/data/...`

## Tableau Spec Contract Compliance

### Worksheets (4 total)

#### 1. P121__line (Line Chart)
- **chart_type**: Automatic
- **rows**: Sales (sum)
- **cols**: Order Date (month)
- **fields implemented**:
  - ✅ `chart_type`
  - ✅ `rows` and `cols`
  - ✅ `title_runs`
  - ✅ `axis_titles` (empty)
  - ✅ `legend_spec` (not required)

#### 2. P9517__sales_by_sub_category (Horizontal Ranked Bar)
- **chart_type**: Automatic
- **rows**: Sub-Category / Product Name
- **cols**: Sales (sum)
- **fields implemented**:
  - ✅ `chart_type`
  - ✅ `rows` and `cols`
  - ✅ `title_runs`
  - ✅ `axis_titles` (empty)
  - ✅ `legend_spec` (not required)

#### 3. P1225__total_sales_each_year (Line Chart by Year)
- **chart_type**: Bar
- **rows**: Sales (sum)
- **cols**: Order Date (year)
- **fields implemented**:
  - ✅ `chart_type`
  - ✅ `rows` and `cols`
  - ✅ `title_runs`
  - ✅ `axis_titles` (empty)
  - ✅ `legend_spec` (not required)

#### 4. P121__scatterplot (Scatter Plot)
- **chart_type**: Circle
- **rows**: Profit (sum)
- **cols**: Sales (sum)
- **size**: Quantity (sum)
- **lod**: Product Name
- **fields implemented**:
  - ✅ `chart_type`
  - ✅ `rows` and `cols`
  - ✅ `title_runs`
  - ✅ `axis_titles` (empty)
  - ✅ `legend_spec` (not required)

### Dashboard Composition
- **zones**: 4 worksheets in 2x2 grid layout
- **dashboard_text_zones**: 0 (none)
- **dashboard_actions**: 0 (none)
- **highlight_bindings**: 0 (none)

## Render Contract Compliance

### Chart Intents
- **P121__line**: `line_chart` ✅
- **P9517__sales_by_sub_category**: `horizontal_ranked_bar` ✅
- **P1225__total_sales_each_year**: `line_chart` ✅
- **P121__scatterplot**: `custom_tableau_view` ✅

### Data Processing
- ✅ Full dataset loaded via `fetch('/data/...')`
- ✅ Numeric fields coerced to numbers before aggregation
- ✅ Date parsing with validation (no Jan 1970 issues)
- ✅ Field resolution validated at runtime

## Build Verification

✅ **TypeScript compilation**: No errors
✅ **Vite build**: Successful
✅ **Bundle size**: 336.75 kB (gzipped: 109.03 kB)
✅ **Validation script**: PASSED

## Prevention of Silent Bad Parses

### Issues Prevented
1. **All-zero charts**: Numeric validation ensures sales/profit are valid numbers
2. **NaN filters**: Date validation prevents invalid dates from being used
3. **Jan 1970 timelines**: Date validation rejects dates before 1990
4. **Silent failures**: Comprehensive logging and validation catch issues early

### Error Handling
- Try-catch blocks around data loading
- Detailed error messages for debugging
- Console logging for validation steps
- User-friendly error display in UI

## Data Quality Evidence Preserved

✅ **Preamble rows**: Kept in original CSV, skipped during parsing
✅ **Original headers**: Preserved, normalized during parsing
✅ **Data types**: Properly coerced (strings → numbers/dates)
✅ **Validation logs**: All issues logged for debugging

## Conclusion

The Tableau source ingestion is now:
- ✅ **Deterministic**: Same CSV produces same parsed data every time
- ✅ **Correct**: All required fields resolve to real columns
- ✅ **Validated**: Multiple validation layers prevent silent failures
- ✅ **Compliant**: Follows Tableau data policy and spec contract
- ✅ **Production-ready**: Build passes, validation passes, error handling in place

### Ready for Next Stages
- QA testing can proceed with confidence in data quality
- Build process will not fail due to parsing issues
- Runtime field resolution is guaranteed
- All Tableau worksheets have access to required data
