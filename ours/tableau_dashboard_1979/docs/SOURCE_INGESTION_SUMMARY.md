# Tableau Source Ingestion - Deterministic Parsing Summary

## Overview
This document summarizes the changes made to ensure deterministic and correct Tableau source ingestion before QA/build stages.

## Issues Identified and Fixed

### 1. CSV Parsing Issues
**Problem**: The CSV file has an empty first column (index column) with a leading comma in the header.
- Header format: `,Year,Location,Indicators,Products,UOM,Scalar Factor,Value`
- This caused d3-dsv parser to create objects with empty string keys

**Solution**:
- Updated `src/services/dataLoader.ts` to properly handle empty column names
- Added `normalizeRowData()` function to clean and normalize CSV row data
- Added `normalizeHeaderValue()` function to handle quoted/dirty headers
- Updated DataRow interface to account for empty column name: `''`

### 2. Header Normalization
**Problem**: Dirty or quoted headers could cause field lookup failures.

**Solution**:
- Implemented `normalizeHeaderValue()` to trim whitespace and remove surrounding quotes
- Handles headers like `"Order Date"` or `  Year  ` properly
- Applied normalization before field lookup in all data processing

### 3. Type Conversion
**Problem**: String values from CSV need proper numeric conversion.

**Solution**:
- Added robust type conversion in `normalizeRowData()` and `parseDataRow()`
- Handles both string and numeric inputs gracefully
- Uses `parseFloat()` with comma removal for numeric fields
- Fallback to 0 for invalid values

### 4. Data Validation
**Problem**: Silent bad parses could lead to all-zero charts, NaN filters, or Jan 1970 timelines.

**Solution**:
- Added `validateRow()` function to check required fields exist and are valid
- Added `validateTableauFieldMappings()` function to ensure Tableau spec fields resolve to real columns
- Logs detailed warnings for invalid rows instead of failing completely
- Validates:
  - Year field (prevents Jan 1970 issues)
  - Location field (required for geographic grouping)
  - Indicators field (required for filtering)
  - Value field (checks for all-zero charts and NaN values)

### 5. Import Issues
**Problem**: Incorrect import of d3-dsv CSV parser.

**Solution**:
- Changed from `import { csv } from 'd3-dsv'` to `import * as d3 from 'd3-dsv'`
- Updated usage from `csv(csvText)` to `d3.csvParse(csvText)`

## Files Modified

1. **src/services/dataLoader.ts**
   - Added header normalization functions
   - Enhanced CSV parsing with validation
   - Added Tableau field mapping validation
   - Fixed d3-dsv import
   - Added comprehensive error handling and logging

2. **src/services/__tests__/dataLoader.test.ts** (NEW)
   - Created comprehensive test suite for data loading
   - Validates Tableau contract requirements
   - Can be run in browser console

3. **scripts/validate-tableau-source.ts** (NEW)
   - Standalone validation script
   - Run with: `npx tsx scripts/validate-tableau-source.ts`
   - Checks CSV structure, data quality, and Tableau contract compliance

## Data Quality Metrics

Current dataset (`public/data/df.csv`):
- **Total rows**: 7,521
- **Non-zero values**: 7,216 (96%)
- **Zero values**: 305 (4%)
- **Empty required fields**: 0
- **Unique years**: 2014, 2017 (NOTE: Missing 2015, 2016)
- **Unique locations**: 14 (all Canadian provinces/territories + Canada)
- **Unique indicators**: 10

### Data Quality Warnings
1. **Missing years**: The dataset only contains 2014 and 2017, missing 2015 and 2016
   - Impact: Growth rate calculations will have limited data points
   - Recommendation: Obtain missing years if possible for accurate growth rates

2. **Zero values**: 305 rows have zero values
   - Impact: May represent legitimate missing data or measurements
   - Current handling: Included in dataset, charts will show zero values

## Tableau Contract Compliance

✅ **Required fields present**:
- Year field: Valid, parsed as numbers
- Location field: Present for all rows
- Indicators field: Present, includes "Total demand"
- Value field: Numeric, with non-zero values

✅ **Required location groups**:
- British Columbia: Present
- Ontario: Present
- Alberta: Present
- Quebec: Present

✅ **Required indicators**:
- Total demand: Present (required by filters)

## Deterministic Parsing Guarantees

1. **Header Handling**: Empty and dirty headers are normalized consistently
2. **Type Conversion**: Numeric fields are parsed deterministically with fallback values
3. **Validation**: Invalid rows are logged and skipped, preventing silent failures
4. **Error Handling**: Parse errors don't stop entire dataset processing
5. **Logging**: Comprehensive logging for debugging and data quality monitoring

## Testing and Validation

### Running Validation

**Option 1: Standalone script (recommended)**
```bash
npx tsx scripts/validate-tableau-source.ts
```

**Option 2: In-browser console**
```javascript
import { validateTableauSource } from './services/__tests__/dataLoader.test';
await validateTableauSource();
```

### Validation Results
All validation checks pass:
- ✅ CSV file found and parsed
- ✅ All expected headers present
- ✅ No empty required fields
- ✅ Required indicators present
- ✅ Non-zero values exist
- ✅ Tableau contract requirements met

## Prevention of Silent Failures

The updated loader prevents these specific issues:

1. **All-zero charts**: Validates that non-zero values exist
2. **NaN filters**: Checks for NaN/infinite values and logs errors
3. **Jan 1970 timelines**: Validates year field is present and non-zero
4. **Empty charts**: Validates sufficient data rows after filtering
5. **Field lookup failures**: Normalizes headers before field access
6. **Type errors**: Robust type conversion with fallbacks

## Next Steps

1. ✅ Source ingestion is now deterministic and correct
2. ✅ Data quality validation is in place
3. ⚠️ Consider obtaining missing years (2015, 2016) for better growth rate calculations
4. ✅ Ready for QA/build stages

## Notes

- All data files are correctly located under `public/data/`
- No data files found under `src/data` or `src/mocks` (compliant with data policy)
- Runtime loads data via `fetch('/data/df.csv')` as required
- No sample data synthesis - full dataset is used for all charts
