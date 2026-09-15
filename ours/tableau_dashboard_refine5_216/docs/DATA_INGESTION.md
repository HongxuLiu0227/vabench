# Deterministic Tableau Source Ingestion

This document describes how the dashboard loads and parses Tableau data sources deterministically.

## Data Source Policy

**MANDATORY**: The only runtime data source for dashboard metrics/visuals must be files under `public/data/...`.

- Load full datasets via `fetch('/data/...')`
- Do NOT synthesize dashboard data from sample rows
- Do NOT place CSV/JSON files under `src/data` or `src/mocks`
- Runtime charts and tables must read full data from `/data/...`

## Current Dataset

**URL**: `/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv`

**Format**: CSV with 21 columns and 9,994 data rows

**Required Fields**:
- Row ID, Order ID, Order Date, Ship Date
- Ship Mode, Customer ID, Customer Name, Segment
- Country, City, State, Postal Code, Region
- Product ID, Category, Sub-Category, Product Name
- Sales, Quantity, Discount, Profit

## Parsing Strategy

### 1. CSV Parsing
- Uses `d3-dsv` library for robust CSV parsing
- Automatically handles quoted fields and escaped characters
- Skips empty rows and normalizes whitespace

### 2. Type Coercion
All numeric fields are coerced with validation:
- `Sales`, `Quantity`, `Discount`, `Profit` → `number`
- Invalid numeric values default to `0` with console warnings
- Prevents string aggregation which would cause silent failures

Date fields are parsed with validation:
- `Order Date`, `Ship Date` → `Date` objects
- Invalid dates result in row being skipped
- Prevents "Jan 1970" timeline issues

### 3. Preamble Row Detection
The parser automatically detects and skips preamble rows:
- Scans first 10 rows for valid numeric data
- Starts parsing from first row with valid Sales/Quantity values
- Logs number of skipped rows for transparency

### 4. Error Handling
- Invalid rows are logged but don't stop parsing
- Critical errors throw with descriptive messages
- All parsing steps log progress for debugging

### 5. Data Validation
After aggregation, data is validated:
- Checks for all-zero values (indicates parsing failure)
- Checks for NaN values (indicates type coercion failure)
- Validates all worksheets have non-empty data
- Logs summary statistics for verification

## Field Mappings

### Tableau Spec → CSV Columns

| Tableau Field | CSV Column | Type | Notes |
|--------------|------------|------|-------|
| `sum:Sales:qk` | `Sales` | number | Coerced from string |
| `sum:Profit:qk` | `Profit` | number | Can be negative |
| `sum:Quantity:qk` | `Quantity` | number | Integer values |
| `yr:Order Date:ok` | `Order Date` | date | Extracted year |
| `none:Region:nk` | `Region` | string | Categorical |
| `none:Category:nk` | `Category` | string | Categorical |
| `none:Sub-Category:nk` | `Sub-Category` | string | Categorical |
| `ctd:Customer Name:qk` | `Customer Name` | string | Count distinct |

## Aggregation Logic

### Total Sales Each Year (Line Chart)
```typescript
// Group by year from Order Date
// Sum Sales per year
// Sort by year ascending
```

### Customer Overview (Table)
```typescript
// Group by Region
// Aggregate: sum(Sales), sum(Quantity), sum(Profit)
// Count distinct Customer Name
// Calculate: salesPerCustomer, profitRatio
```

### Scatterplot (Scatter Plot)
```typescript
// Group by Product Name
// Aggregate: sum(Sales), sum(Profit), sum(Quantity)
// Sort by Sales descending
```

### Bar Chart (Horizontal Ranked Bar)
```typescript
// Group by Category and Sub-Category
// Aggregate: sum(Sales)
// Sort by Sales descending
```

## Validation

Run the deterministic validator:
```bash
node scripts/validate-data-ingestion.cjs
```

This checks:
- ✅ CSV parsing works correctly
- ✅ All required fields present
- ✅ Data types coerce properly
- ✅ No preamble rows interfere
- ✅ No all-zero rows (parsing failure)
- ✅ No quoted header issues

## Runtime Verification

The data loader logs detailed progress:
```
Loading dashboard data from: /data/...
CSV file loaded: 2435344 bytes
Parsed 9994 rows from CSV (skipped 0 preamble rows)
Successfully parsed 9994 valid rows
✅ Data validation passed
   - Yearly sales: 4 years, total: $2297200.86
   - Customer overview: 4 regions
   - Scatterplot: 1849 products
   - Bar chart: 17 categories
```

## Troubleshooting

### Issue: All charts show zero values
**Cause**: CSV parsing failed silently
**Solution**: Check browser console for parsing warnings

### Issue: "Jan 1970" in timeline
**Cause**: Invalid date parsing
**Solution**: Verify Order Date format in CSV (should be YYYY-MM-DD)

### Issue: NaN in filters
**Cause**: Type coercion failed for numeric fields
**Solution**: Check for non-numeric values in measure columns

### Issue: Build fails with "Cannot find module"
**Cause**: Import path issues
**Solution**: Ensure data loads via `/data/...` not relative paths

## Testing

To test data loading in development:
```bash
npm run dev
# Open browser DevTools Console
# Look for data loading logs
# Verify all charts render with non-zero values
```

## Compliance

✅ **Tableau Data Policy**: All data loaded from `/data/...`
✅ **Tableau Spec Compliance**: All fields map to correct columns
✅ **Deterministic Parsing**: Same input produces same output
✅ **Error Handling**: Graceful degradation with logging
✅ **Type Safety**: TypeScript validates field mappings
