# Tableau Source Validation Fixes

## Problem
The deterministic Tableau source validator was failing with the error:
```
[csv_missing_required_fields] Primary dataset is missing required Tableau fields: Year (copy)_413205318226034688
```

This was because the validator was looking for Tableau internal field names (like `Year (copy)_413205318226034688`) that don't exist in the raw CSV, instead of mapping them to the actual CSV column names.

## Root Cause
1. **Tableau Internal Field Names**: When Tableau creates calculated fields or copies, it generates internal field names like `Year (copy)_413205318226034688` which are referenced in the spec files as `[federated.xxx].[none:Year (copy)_413205318226034688:qk]`

2. **No Field Mapping Logic**: The validator was checking if these internal field names existed directly in the CSV, which they don't.

3. **No Spec File Parsing**: The validator wasn't reading the `tableau_spec.json` and `tableau_render_contract.json` files to understand what fields were actually being used.

## Solution
Updated `/src/utils/validateTableauSource.ts` with the following fixes:

### 1. Enhanced Field Name Extraction
Added `extractBaseFieldName()` function that:
- Parses Tableau field references like `[federated.xxx].[none:Year (copy)_413205318226034688:qk]`
- Extracts the base field name: `Year (copy)_413205318226034688` → `Year`
- Handles various Tableau internal formats:
  - `[federated.xxx].[none:Field:...]`
  - `[avg:Global_Sales:qk]`
  - `[attr:Platform:nk]`

### 2. Spec File Integration
Added functions to:
- Load and parse `tableau_spec.json` and `tableau_render_contract.json`
- Extract all field references from the spec files using recursive traversal
- Map all referenced fields to their base field names
- Validate that all required fields exist in the CSV

### 3. Cross-Environment Support
- **Node/Test Environment**: Uses filesystem to read spec files directly
- **Browser Environment**: Uses `fetch()` to load spec files from `/docs/`

### 4. Improved Field Matching
Updated `findCsvColumnForTableauField()` to:
- Try direct match first (normalized)
- Extract base field name and try matching again
- Log all field mappings for debugging

## Results

### Before
```
❌ VALIDATION FAILED
Missing required fields: Year (copy)_413205318226034688
```

### After
```
✅ VALIDATION PASSED
[Field Mapper] Mapping "[federated.xxx].[none:Year (copy)_413205318226034688:qk]" -> "Year (copy)_413205318226034688" -> "Year"

📊 SUMMARY:
  Total Rows: 616
  Columns Found: 12
  - Rank, Name, Platform, Year, Genre, Publisher, NA_Sales, EU_Sales, JP_Sales, Other_Sales, Global_Sales, Averaged_Sales

📈 NUMERIC FIELD STATISTICS:
  All fields validated with proper min/max/avg values
  No NaN or infinite values
  No all-zero metrics

⚠️ WARNINGS:
  - Field "Publisher" has 1 empty values (0.2%)
  - Field "Year" has 5 empty values (0.8%)
  - Duplicate game names detected: 85 duplicates found
```

## Files Modified
- `/src/utils/validateTableauSource.ts` - Main validation logic
  - Added `extractBaseFieldName()` function
  - Added `extractFieldsFromSpec()` function
  - Added `loadRequiredFieldsFromSpecs()` function
  - Updated `findCsvColumnForTableauField()` function
  - Updated main validation flow to use spec files

## Validation
- ✅ Validator passes with 0 errors
- ✅ All Tableau spec fields mapped correctly
- ✅ Build succeeds (`npm run build`)
- ✅ Data quality checks pass (no NaN, infinity, or all-zero metrics)
- ✅ Field mapping logged for transparency

## Data Quality Notes
The validation revealed these acceptable data quality issues:
- 1 empty Publisher value (0.2%) - likely legitimate missing data
- 5 empty Year values (0.8%) - likely legitimate missing data
- 85 duplicate game names - expected as games can appear on multiple platforms

These are not errors but warnings about the dataset quality, which is acceptable for this dashboard.
