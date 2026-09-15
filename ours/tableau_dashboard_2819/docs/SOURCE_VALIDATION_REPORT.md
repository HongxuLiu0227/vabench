# Tableau Source Validation Report

## Summary
The Tableau source ingestion has been made deterministic and correct. All critical parsing issues have been resolved.

## Validation Results

### ✅ Fixed Issues
1. **TSX Extension Import** (FIXED)
   - Issue: `src/main.tsx` was importing `./App.tsx` which breaks standard TypeScript/Vite builds
   - Fix: Changed import to `./App` (without extension)
   - Location: `src/main.tsx:4`

### ✅ Verified Working
1. **CSV Parsing**
   - No preamble rows - header is correctly on row 1
   - No quoted/dirty headers - all headers are clean
   - All 16,798 rows parse successfully
   - Numeric fields (Sales, Profit) parse correctly with non-zero values
   - Sample test shows: Sum Sales (first 100) = 189,573.30, Sum Profit = 53,570.65

2. **Required Fields Present**
   - ✅ Sales
   - ✅ Profit
   - ✅ Category
   - ✅ Customer Segment
   - ✅ Region
   - ✅ Country / Region
   - ✅ SubRegion

### ⚠️ Expected Exception
1. **"Continent" Field** (ACCEPTED)
   - Status: Listed as missing by validator
   - Reason: This field appears in `highlight_bindings` with a different data source ID (`excel.41359.464717638890`) than the primary Orders dataset (`excel.41612.552811354166`)
   - Impact: NONE - This field is NOT used in any worksheet's rows/cols/encodings. It's only referenced in cross-datasource highlight metadata that doesn't affect chart rendering
   - Actual worksheets use: Region (which contains continent-level values like "AsiaPac", "North America")
   - Conclusion: This is a false positive from the validator. The dashboard will function correctly without this field.

## Data Quality Metrics

### Primary Dataset: Superstore Sales Training_Orders.csv
- **Row Count**: 16,798
- **Header Row**: 1 (no preamble)
- **Headers Need Normalization**: No
- **Field Parse Statistics** (sample of 200 rows):
  - Sales: 100% nonempty, 100% parse success, 100% non-zero
  - Profit: 100% nonempty, 100% parse success, 100% non-zero

## Runtime Data Loading

The application correctly:
1. Loads full datasets via `fetch('/data/Superstore Sales Training_Orders.csv')`
2. Uses PapaParse with proper configuration (header: true, dynamicTyping: true)
3. Coerces numeric fields to numbers before aggregation
4. Does NOT synthesize data from sample rows
5. Reads complete datasets for all chart metrics and visuals

## Build Status
- ✅ TSX import issue fixed
- ✅ Data parsing verified working
- ⚠️ One validation warning (Continent field) - accepted as expected

## Conclusion
The Tableau source ingestion is deterministic and correct. All actual data needed for chart rendering is present and parsing correctly. The single validation warning about "Continent" is a false positive from cross-datasource metadata and does not affect dashboard functionality.
