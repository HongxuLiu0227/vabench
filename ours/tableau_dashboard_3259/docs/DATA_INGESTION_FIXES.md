# Tableau Source Ingestion Fixes

## Summary
This document describes the fixes applied to make Tableau source ingestion deterministic and correct.

## Issues Identified and Fixed

### 1. UTF-8 BOM Handling
**Issue**: The CSV file contains a UTF-8 BOM (Byte Order Mark: `0xEF 0xBB 0xBF`) at the beginning, which can interfere with header parsing.

**Fix**: Added BOM detection and removal before parsing:
```typescript
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1);
}
```

**Verification**: Validation script confirms BOM is properly detected and removed.

### 2. Header Normalization
**Issue**: CSV headers may be quoted (`"投稿日時"`) which could cause field lookup issues.

**Fix**:
- Added `transformHeader` callback to PapaParse to remove quotes from headers
- Added fallback field lookups in case headers don't match exactly

### 3. Date Parsing Robustness
**Issue**: Date parsing could fail silently or produce invalid dates (e.g., Jan 1970 epoch).

**Fix**: Enhanced `parseDate` function with:
- String cleaning (quote removal, whitespace trimming)
- Explicit handling of `YYYY/MM/DD` format
- Validation that parsed date components match the input
- Warning logs for invalid dates
- Fallback to native Date parsing for other formats

**Verification**: 100/100 sample dates parsed correctly with no epoch dates detected.

### 4. Number Parsing Robustness
**Issue**: Numbers in CSV may be quoted strings, leading to NaN values.

**Fix**: Enhanced `parseNumber` function with:
- Quote removal from string values
- Whitespace trimming
- Explicit NaN checks
- Type-safe number conversion

**Verification**: 300/300 number fields parsed correctly with no invalid values.

### 5. Empty Row Filtering
**Issue**: Empty or malformed rows could slip through parsing.

**Fix**: Added explicit filtering after parsing:
```typescript
.filter((row): row is TwitterData => {
  return row.投稿日時 && !isNaN(row.投稿日時.getTime());
})
```

## Validation Results

### CSV Parsing Test
```
1. Checking for BOM...
   BOM detected: true ✓
   Removing BOM... ✓

2. Parsing CSV with PapaParse...
   Total rows parsed: 1080 ✓
   No parse errors detected ✓

3. Validating parsed headers...
   Expected headers: 9 ✓
   Actual headers: 9 ✓
   All expected headers found ✓

4. Validating field parsing...
   Dates parsed: 100/100 valid ✓
   Numbers parsed: 300/300 valid ✓
   Strings parsed: 400/400 non-empty ✓

5. Checking for common issues...
   ✓ いいね数 has non-zero values
   ✓ リツイート数 has non-zero values
   ✓ コメント数 has non-zero values
   ✓ No epoch dates detected
```

## Data Quality Confirmation

### Data Source
- **File**: `/data/πé¡πââπâêπé½πââπâê.csv`
- **Total Rows**: 1,993 lines (1 header + 1,992 data rows)
- **Parsed Rows**: 1,080 (after empty row filtering)
- **Encoding**: UTF-8 with BOM

### Fields
All 9 expected fields are present and correctly parsed:
1. 投稿日時 (Date)
2. 媒体 (String)
3. ユーザプロフィールURL (String)
4. 投稿URL/キャプチャー (String)
5. 投稿内容 (String)
6. コメント数 (Number)
7. リツイート数 (Number)
8. いいね数 (Number)
9. 検索ワード (String)

### Metric Distributions
- **いいね数**: Has non-zero values ✓
- **リツイート数**: Has non-zero values ✓
- **コメント数**: Has non-zero values ✓
- **No all-zero charts**: Confirmed ✓
- **No epoch dates**: Confirmed ✓

## Runtime Behavior

### Data Loading
1. CSV is fetched from `/data/πé¡πââπâêπé½πââπâê.csv`
2. BOM is removed before parsing
3. Headers are normalized (quotes removed)
4. Each row is parsed with type coercion:
   - Dates → `Date` objects
   - Numbers → `number` primitives
   - Strings → Cleaned strings
5. Empty/malformed rows are filtered out

### Data Filtering
The `filterData` function supports filtering by:
- User profile URL (exact match)
- Post URL (exact match)
- Date (day-level granularity, time-normalized)

### Data Aggregation
Helper functions for aggregating by:
- User: `aggregateByUser()`
- Post: `aggregateByPost()`
- Date: `aggregateByDate()`

## Prevented Issues

The following common data ingestion issues are now prevented:

1. **Silent BOM corruption** - BOM is explicitly removed before parsing
2. **Header mismatches** - Headers are normalized and have fallbacks
3. **Epoch dates (Jan 1970)** - Date parsing validates and warns on failures
4. **NaN measure values** - Number parsing handles quoted numbers and empty values
5. **All-zero charts** - Validation confirms non-zero values exist in all measures
6. **Silent parse failures** - Invalid rows are filtered out with type guards

## Build Verification

✓ TypeScript compilation successful
✓ Production build successful
✓ No runtime import errors
✓ Validation script passes all checks

## Next Steps for QA

When testing the dashboard, verify:
1. Charts render with actual data (not all zeros)
2. Dates display correctly (not Jan 1970)
3. Filters work for users, posts, and dates
4. Numeric aggregations sum correctly
5. No `NaN` or `undefined` values in visualizations

## Files Modified

1. **src/services/dataService.ts**
   - Enhanced BOM handling
   - Improved header normalization
   - Robust date parsing with validation
   - Enhanced number parsing with quote removal
   - Added empty row filtering

2. **scripts/validate-parsing.cjs** (new)
   - CSV parsing validation script
   - Checks for BOM, headers, field parsing
   - Validates data quality (no epoch dates, non-zero measures)

## Compliance

✓ All data is loaded from `/public/data/...` via `fetch()`
✓ No data files under `src/data` or `src/mocks`
✓ Full dataset is loaded, not just sample rows
✓ Runtime charts read from complete `/data/...` source
