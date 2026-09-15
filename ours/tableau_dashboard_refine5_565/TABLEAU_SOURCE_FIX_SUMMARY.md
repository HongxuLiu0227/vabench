# Tableau Source Ingestion Fix - Summary

## Problem Identified

The CSV data file (`/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`) had **4 preamble rows** before the actual header:
1. Line 1: "Super Store Date set for the worldwide sales..."
2. Line 2: Empty row
3. Line 3: "The data might need some cleaning up..."
4. Line 4: Empty row
5. Line 5: **Actual header row** (Row ID, Order ID, Order Date, etc.)
6. Line 6+: **Data rows**

The original parser used fragile heuristics (checking if first column is numeric) which could fail on edge cases.

## Changes Made

### 1. Updated `src/services/dataLoader.ts`

#### Key Improvements:

**a) Preamble Detection**
- Added explicit preamble row detection (`isPreambleRow()`)
- Checks for text descriptions vs numeric Row IDs
- Properly filters out comment rows before data parsing

**b) Header Normalization**
- Added `normalizeHeader()` function to handle:
  - BOM markers (﻿)
  - Quoted field names ("City, State")
  - Extra whitespace

**c) Column Mapping by Name**
- Replaced positional indexing (`row[keys[0]]`) with name-based lookup
- Added `getColumn()` helper that tries multiple possible header names
- Maps actual CSV columns to data structure:
  - CSV "Market" → `region`
  - CSV "Region" → `subRegion`
  - CSV "Shipping Cost" → `unknown1`

**d) Robust Parsing**
- Enhanced `parseDate()` to handle "YYYY-MM-DD HH:MM:SS" format
- Improved `safeNumber()` to handle empty strings gracefully
- Added comprehensive logging for debugging

**e) Data Validation**
- Added check for zero data rows after parsing
- Logs successful data load with row count
- Better error messages for debugging

### 2. CSV Structure Verified

**File:** `public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`
- **Total lines:** 51,295
- **Preamble rows:** 4
- **Header row:** 5
- **Data rows:** 51,290
- **Columns:** 23

**Column Headers:**
```
Row ID, Order ID, Order Date, Ship Date, Ship Mode, Customer ID,
Customer Name, Segment, "City, State", Country, Postal Code,
Market, Region, Product ID, Category, Sub-Category, Product Name,
Sales, Quantity, Discount, Profit, Shipping Cost, Order Priority
```

### 3. Required Tableau Fields Mapping

All required fields from `tableau_spec.json` are now correctly mapped:

| Tableau Field | CSV Column | Data Type | Status |
|--------------|------------|-----------|--------|
| sum:Sales:qk | Sales | number | ✓ |
| sum:Profit:qk | Profit | number | ✓ |
| sum:Quantity:qk | Quantity | number | ✓ |
| none:Category:nk | Category | string | ✓ |
| none:Sub-Category:nk | Sub-Category | string | ✓ |
| yr:Order Date:ok | Order Date | Date | ✓ |
| tmn:Order Date:qk | Order Date | Date | ✓ |
| none:Product Name:nk | Product Name | string | ✓ |

## Testing & Validation

### Build Status
✅ Build successful (TypeScript + Vite)
```
dist/index.html                   0.46 kB │ gzip:   0.30 kB
dist/assets/index-BvKmb_6_.css    0.32 kB │ gzip:   0.25 kB
dist/assets/index--qnJ_Ga8.js   340.04 kB │ gzip: 109.22 kB
✓ built in 1.71s
```

### CSV Parsing Test
✅ All tests passed:
- Preamble rows correctly identified and skipped
- Header row correctly parsed (23 columns)
- Quoted fields handled properly ("City, State", "Product Name")
- All required Tableau fields present and accessible
- Data values correctly extracted (Sales: 13.08, Profit: 4.56, Quantity: 3)

### Data Policy Compliance
✅ Verified compliance:
- No data files under `src/data` or `src/mocks`
- All data loaded via `fetch('/data/...')`
- No synthesized dashboard data
- Runtime charts read full data from `/data/...`

## Deterministic Tableau Source Validator

The updated data loader ensures:
1. **Deterministic parsing**: Same CSV always produces same data
2. **Correct field resolution**: All Tableau fields map to real columns
3. **No silent failures**: Errors are logged and thrown
4. **Data quality**: Proper type coercion (numbers, dates)
5. **No all-zero charts**: Valid data prevents empty visualizations
6. **No NaN filters**: Proper number handling prevents invalid filters
7. **No Jan 1970 timelines**: Proper date parsing prevents epoch fallback

## Files Modified

1. **src/services/dataLoader.ts** - Complete rewrite of CSV parsing logic
   - Added preamble detection
   - Added header normalization
   - Added column mapping by name
   - Enhanced error handling and logging

## Next Steps

The Tableau source ingestion is now deterministic and correct. The application is ready for:
- QA validation
- Build stage
- Deployment

No additional changes needed for data parsing/bootstrap.
