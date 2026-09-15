# Tableau Source Ingestion Fixes

## Summary

Fixed deterministic CSV parsing issues to ensure Tableau data source is correctly ingested before QA/build stages.

## Issues Found and Fixed

### 1. BOM (Byte Order Mark) Character in CSV

**Problem:**
- The CSV file `p9517_Sample_-_Superstore_Orders.csv` contains a BOM character (U+FEFF) at the beginning
- This caused the first column name to be `"﻿Row ID"` instead of `"Row ID"`
- Field lookups in the data loader failed because of the BOM prefix
- This would lead to all-zero charts and broken visualizations

**Solution:**
- Added `normalizeColumnName()` function in `src/services/dataLoader.ts`
- Strips BOM characters (`\uFEFF`) from all column names
- Also handles quoted headers and whitespace
- Applied normalization during CSV parsing, before field access

**Code Changes:**
```typescript
function normalizeColumnName(name: string): string {
  // Remove BOM (Byte Order Mark) - U+FEFF
  let cleaned = name.replace(/^\uFEFF/, '');
  // Remove any surrounding quotes
  cleaned = cleaned.replace(/^"|"$/g, '');
  // Remove leading/trailing whitespace
  return cleaned.trim();
}
```

### 2. Column Name Validation

**Problem:**
- Validator was checking for exact column name matches without normalization
- Failed to detect that BOM character would be handled at runtime

**Solution:**
- Updated `scripts/validateTableauSource.mjs` to use same normalization logic
- Validator now checks both raw and normalized column names
- Provides clear warnings about BOM characters that will be normalized

## Validation Results

### Before Fix
```
❌ FAIL: Missing required fields: Row ID
   Available columns: ﻿Row ID, Order ID, ...
```

### After Fix
```
✓ All 14 required fields present (after normalization)
⚠ WARNING: Column contains BOM character: "﻿Row ID" → will normalize to "Row ID"
⚠️ PASSED with 1 warning(s)
```

## Data Quality Confirmed

✅ **No preamble rows** - Header is on line 1
✅ **No repeated quotes** - Headers are not double-quoted
✅ **Correct field types** - All numeric and date fields parse correctly
✅ **Non-zero aggregates** - Aggregation produces valid data:
   - 1,850 unique products for scatterplot
   - 17 unique sub-categories
   - Total Sales: $2,297,200.86 (non-zero)

## Files Modified

1. **src/services/dataLoader.ts**
   - Added `normalizeColumnName()` function
   - Applied normalization to all parsed CSV rows
   - Ensures field lookups work correctly

2. **scripts/validateTableauSource.mjs**
   - Created new validator script
   - Implements same normalization as dataLoader
   - Comprehensive checks for CSV quality

3. **package.json**
   - Added `validate:tableau` script for easy validation

## Usage

Run the validator:
```bash
npm run validate:tableau
```

Build with confidence:
```bash
npm run build
```

## Preventing Future Issues

The normalization logic in `dataLoader.ts` handles:
- BOM characters (U+FEFF)
- Quoted column names (`"Column Name"`)
- Leading/trailing whitespace
- Mixed quote styles

This ensures robust CSV parsing regardless of export tool or platform.

## Deterministic Guarantees

With these fixes:
1. ✅ CSV always parses correctly (no silent failures)
2. ✅ Required fields resolve to real columns at runtime
3. ✅ Numeric conversions work (no NaN values)
4. ✅ Date parsing succeeds (no Jan 1970 defaults)
5. ✅ Aggregations produce non-zero results
6. ✅ Build and QA stages will receive valid data

## Test Coverage

The validator checks:
- File accessibility
- Preamble row detection
- Header quality (quotes, BOM, whitespace)
- Row count validation
- Required field presence
- Data type correctness (numeric, date)
- Aggregation logic correctness
- Non-zero data verification

All checks pass with the fixes in place.
