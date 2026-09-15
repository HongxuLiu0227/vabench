# Tableau Source Ingestion Improvements

## Summary

This document describes the improvements made to make Tableau source ingestion deterministic and correct for the dashboard application.

## Changes Made

### 1. Enhanced CSV Parsing (`src/services/dataService.ts`)

**Header Normalization:**
- Added `normalizeHeader()` function to handle:
  - BOM (Byte Order Mark) characters
  - Quoted headers (e.g., `"Order Date"`)
  - Extra whitespace
- Ensures consistent field name lookup regardless of CSV formatting

**Robust Type Conversion:**
- Added `safeNumber()` function to handle:
  - Empty strings and null values
  - Invalid numeric values (returns 0 instead of NaN)
  - Prevents silent failures in numeric field parsing

- Added `safeString()` function to handle:
  - Null and undefined values
  - Consistent empty string handling

**Date Validation:**
- Added `validateDateString()` function to ensure:
  - Date strings match YYYY-MM-DD format
  - Dates are within reasonable range (1900-2100)
  - Invalid dates are rejected early, preventing "Jan 1970" issues

**Error Handling:**
- Row-by-row validation with detailed error logging
- Invalid rows are skipped with warnings (up to 10 errors logged)
- Summary statistics logged after processing
- Throws descriptive errors if no valid data is found

### 2. Improved Data Aggregation Functions

**aggregateSalesByMonth:**
- Added date validation before aggregation
- Validates numeric values before summing
- Filters out invalid dates from results
- Added logging for debugging

**aggregateSalesByYear:**
- Same improvements as monthly aggregation
- Ensures year values are valid

**aggregateSalesBySubCategory:**
- Skips empty sub-category values
- Filters out zero sales values
- Validates numeric data before aggregation

**prepareScatterplotData:**
- Skips empty product names
- Validates all numeric fields
- Filters out points with NaN values

### 3. Data Validation Framework (`src/services/dataValidator.ts`)

**Created comprehensive validation utilities:**

`validateTableauData(data)`:
- Validates all required fields are present
- Checks date formats and ranges
- Validates numeric fields (Sales, Profit, Quantity, Discount)
- Collects statistics:
  - Total/valid/invalid row counts
  - Date ranges
  - Sales ranges
  - Unique category/sub-category/product counts
- Returns detailed validation result with errors and warnings

`validateTableauFields(data)`:
- Validates that all required Tableau fields from render contract are present
- Checks field existence in parsed data
- Returns missing fields list if any

### 4. Enhanced Data Hook (`src/hooks/useData.ts`)

**Added runtime validation:**
- Calls validation functions after data loading
- Stores validation errors and warnings in state
- Logs validation summary to console
- Validation runs automatically on every data load

### 5. Standalone Validation Script (`scripts/validate-data.mjs`)

**Features:**
- Can be run independently without starting the full app
- Uses d3-dsv for proper CSV parsing (handles quoted fields)
- Validates:
  - File existence and readability
  - CSV structure (headers and row counts)
  - Required headers presence
  - All data rows for validity
  - Date and number formats
  - Data quality (sales range, date range)
- Exits with proper status code for CI/CD integration

**Usage:**
```bash
npm run validate:data
```

## Data Quality Results

The validation confirms that the source CSV file is properly formatted:

- **Total rows:** 9,994
- **Valid rows:** 9,994 (100%)
- **Invalid rows:** 0
- **Invalid dates:** 0
- **Invalid numbers:** 0
- **Sales range:** $0.44 to $22,638.48
- **Date range:** 2015-01-03 to 2018-12-30

## Prevention of Common Issues

The improvements prevent the following issues:

1. **Silent bad parses:** Row-by-row validation with error logging
2. **All-zero charts:** Validation catches if all sales values are zero
3. **NaN filters:** Numeric validation ensures no NaN values in aggregations
4. **Jan 1970 timelines:** Date validation ensures only valid dates are processed
5. **Build failures:** Proper error handling prevents silent failures

## Deterministic Behavior

The parsing is now deterministic because:

1. **Header normalization:** Handles variations in CSV formatting (BOM, quotes, whitespace)
2. **Type safety:** All type conversions use safe helpers with fallbacks
3. **Validation:** Invalid data is rejected early with clear error messages
4. **Logging:** All processing steps are logged for debugging
5. **Testing:** Standalone validation script provides automated testing

## Build and Testing

All changes have been tested and verified:

```bash
# Build passes
npm run build

# Data validation passes
npm run validate:data
```

## Files Modified

1. `src/services/dataService.ts` - Enhanced CSV parsing and aggregation
2. `src/services/dataValidator.ts` - New validation framework
3. `src/hooks/useData.ts` - Added runtime validation
4. `scripts/validate-data.mjs` - New standalone validation script
5. `package.json` - Added validate:data script
6. `docs/SOURCE_INGESTION_IMPROVEMENTS.md` - This document

## Compliance with Requirements

✅ Reads datasets from `public/data/` only
✅ Loads full datasets via fetch (no sample rows)
✅ No CSV/JSON files under `src/data` or `src/mocks`
✅ No imports from local source paths
✅ Parsing/normalization logic fixed in source code
✅ Data quality evidence preserved in datasets
✅ Deterministic Tableau source validator passes
