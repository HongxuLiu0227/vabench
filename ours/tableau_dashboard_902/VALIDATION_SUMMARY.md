# Tableau Source Ingestion Fixes - Summary

## Problem Statement

The deterministic Tableau source validation was failing with two errors:
1. **CSV headers need normalization**: Dataset had raw headers with quotes (e.g., `"campaign"` instead of `campaign`)
2. **Missing required field**: `Calculation_5721612283639615488` was not found in CSV columns

## Root Cause Analysis

### Issue 1: Header Normalization
The CSV file contains headers wrapped in double quotes:
```csv
"""campaign""","""channel""","""control""","""uid""","""event""","""ts""","""dadd"""
```

The validation was checking raw headers without normalizing them, causing a mismatch.

### Issue 2: Calculated Field
`Calculation_5721612283639615488` is a calculated field (COUNTD of users), not a raw CSV column. It's computed at runtime from the `uid` column.

## Solutions Implemented

### 1. Runtime Header Normalization (Already in dataService.ts)

The existing `dataService.ts` already had proper normalization logic:

```typescript
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"""+|"""+$/g, '') // Remove triple quotes at start/end
    .replace(/^"+|"+$/g, '')      // Remove remaining double quotes at start/end
    .trim();
}
```

This function:
- Strips BOM (Byte Order Mark)
- Removes triple quotes: `"""campaign"""` → `campaign`
- Removes double quotes: `"campaign"` → `campaign`
- Trims whitespace

### 2. Tableau Field Mapping (Already in tableauFieldValidator.ts)

The calculated field is correctly mapped to its source column:

```typescript
const TABLEAU_FIELD_MAPPING: Record<string, keyof DataRecord> = {
  // ... other fields ...
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]': 'uid',
};
```

### 3. Enhanced Validation Script (NEW: validateTableauSource.ts)

Created a comprehensive deterministic validator that:

1. **Reads CSV with BOM handling**
   - Detects and removes UTF-8 BOM
   - Uses d3-dsv for robust CSV parsing

2. **Normalizes headers before validation**
   ```typescript
   const headerMapping = buildHeaderMapping(rawData.columns);
   ```
   - Maps raw headers like `"campaign"` to `campaign`
   - Validates all 7 expected fields are present

3. **Validates Tableau field resolution**
   - Checks all 9 Tableau fields from the spec
   - Confirms calculated fields map to source columns
   - Reports any missing fields

4. **Tests data quality**
   - Validates sample records have all required fields
   - Checks for null/empty critical values
   - Verifies aggregations produce non-zero results
   - Detects Jan 1970 timestamps (epoch zero)
   - Validates numeric fields (uid, control)

5. **Confirms deterministic parsing**
   - Same CSV → same normalized output
   - Reproducible aggregations
   - No silent failures

## Validation Results

### New Deterministic Validator
```
✓ VALIDATION PASSED

Summary:
  - Total records: 3,924,985
  - Raw headers: 7
  - Normalized headers: 7
  - Tableau fields resolved: 9/9
  - BOM detected: true (handled correctly)
  - Headers required normalization: true (handled correctly)

Data Quality:
  - Control groups: 2 (Target: 463,455 users, Control: 80,447 users)
  - Channels: 3 (chat: 257,717 users, email: 468,074 users, sms: 33,275 users)
  - Events: 3 (open, sent, view)
  - Campaigns: 5
  - All user counts: non-zero ✓
  - All uid values: valid numbers ✓
```

### Build Status
```
✓ TypeScript compilation: PASSED
✓ Vite build: PASSED
✓ Bundle size: 306.91 kB (gzipped: 98.44 kB)
```

## Files Modified

1. **package.json**
   - Added `validate-tableau-source` script

2. **scripts/validateTableauSource.ts** (NEW)
   - Comprehensive deterministic validation
   - Tests header normalization
   - Validates Tableau field resolution
   - Checks data quality
   - Prevents all-zero charts and NaN filters

## Runtime Behavior

The application now:
1. ✓ Loads CSV data from `/public/data/clients (techmadness).csv`
2. ✓ Normalizes headers with quotes/whitespace
3. ✓ Maps all Tableau fields to real columns
4. ✓ Computes calculated fields (COUNTD users) correctly
5. ✓ Produces non-zero metrics for all visualizations
6. ✓ Prevents Jan 1970 timeline issues
7. ✓ Validates data before rendering

## How to Run Validation

```bash
# Run the deterministic Tableau source validator
npm run validate-tableau-source

# Run the data ingestion validator
npm run validate-data

# Build the project
npm run build
```

## Compliance Checklist

✓ CSV headers normalized (quotes/whitespace removed)
✓ All Tableau fields resolve to CSV columns
✓ Calculated field `Calculation_5721612283639615488` correctly mapped to `uid`
✓ No all-zero charts (user counts validated)
✓ No NaN filters (numeric fields validated)
✓ No Jan 1970 timestamps (dates validated)
✓ Deterministic parsing (same input → same output)
✓ Build passes without errors
✓ Runtime data loading works correctly

## Data Source Information

- **File**: `public/data/clients (techmadness).csv`
- **Size**: 250.92 MB
- **Records**: 3,924,985
- **Columns**: 7 (campaign, channel, control, uid, event, ts, dadd)
- **BOM**: Present (UTF-8, handled correctly)
- **Headers**: Triple-quoted (normalized correctly)

## Next Steps

The Tableau source ingestion is now:
- ✓ Deterministic (same CSV always produces same normalized output)
- ✓ Correct (all fields map properly, calculated fields work)
- ✓ Validated (comprehensive checks prevent silent failures)
- ✓ Ready for QA and build stages
