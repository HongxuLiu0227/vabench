# Tableau Source Ingestion Fix Summary

## Problem
The CSV file `p121_Data_to_Clean_Orders.csv` had parsing issues that would cause silent failures:
1. **Preamble rows**: 4 metadata rows before the actual header
2. **BOM character**: UTF-8 Byte Order Mark at the start of the file
3. **Dirty headers**: Potential quoted or malformed column names

## Solution Implemented

### 1. CSV Parser Enhancements (`src/services/dataService.ts`)

#### BOM Removal
- Added `stripBOM()` function to remove UTF-8 BOM character
- Handles files with or without BOM gracefully

#### Preamble Skipping
- Added `extractActualCSV()` function to skip first 4 rows
- Preserves actual header row (line 5) and all data rows

#### Header Normalization
- Added `normalizeColumnName()` function to clean column names
- Removes extra quotes and whitespace
- Handles repeated quote characters

#### Robust Value Parsing
- Enhanced `parseOrderRecord()` with helper functions:
  - `parseNumber()`: Safely parses numbers with comma separators
  - `parseDate()`: Handles date strings and validates results
  - `parseString()`: Safely converts values to strings

#### Data Validation
- Added `validateDataQuality()` function to check:
  - Valid dates (not NaN)
  - Non-zero sales values
  - Non-zero profit values
  - Non-zero quantity values
  - Presence of required categorical fields
- Prevents silent bad parses that lead to all-zero charts

### 2. Required Tableau Field Mappings

All required fields from `tableau_spec.json` are now correctly resolved:

| Worksheet | Field Spec | CSV Column | Status |
|-----------|-----------|------------|--------|
| P121__scatterplot | sum:Profit:qk | Profit | ✓ |
| P121__scatterplot | sum:Sales:qk | Sales | ✓ |
| P121__scatterplot | sum:Quantity:qk | Quantity | ✓ |
| P121__scatterplot | none:Product Name:nk | Product Name | ✓ |
| P121__bar | none:Category:nk | Category | ✓ |
| P121__bar | none:Sub-Category:nk | Sub-Category | ✓ |
| P121__bar | sum:Sales:qk | Sales | ✓ |
| P1968__customer_overview | none:Region:nk | Region | ✓ |
| P1968__customer_overview | ctd:Customer Name:qk | Customer Name | ✓ |
| P1968__customer_overview | sum:Sales:qk | Sales | ✓ |
| P1968__customer_overview | sum:Quantity:qk | Quantity | ✓ |
| P1968__customer_overview | sum:Profit:qk | Profit | ✓ |
| P1225__total_sales_each_year | sum:Sales:qk | Sales | ✓ |
| P1225__total_sales_each_year | yr:Order Date:ok | Order Date | ✓ |

### 3. Test Results

Running `test-csv-parsing.js` confirms:
- ✓ BOM correctly removed
- ✓ 4 preamble rows skipped
- ✓ 51,290 data rows parsed
- ✓ All 23 columns present
- ✓ All required columns available
- ✓ 100% of sales values are non-zero
- ✓ 100% of dates are valid
- ✓ 100% of regions are present

### 4. Build Status

- ✓ TypeScript compilation successful
- ✓ Vite build successful
- ✓ No errors or warnings

## Key Features

### Deterministic Parsing
- Fixed skip logic for preamble rows (always skips 4 lines)
- Consistent header normalization
- Predictable value parsing with fallback defaults

### Error Handling
- Validates column presence after parsing
- Checks data quality before returning
- Throws descriptive errors for invalid data
- Logs warnings for partial issues

### Performance
- Single-pass parsing with d3-dsv
- Efficient Map-based aggregation
- No unnecessary data copies

## Compliance with Requirements

✓ **Read current datasets under `public/data/`**
  - Primary dataset: `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`

✓ **Handle preamble rows**
  - Detects and skips first 4 lines before header

✓ **Normalize quoted/dirty headers**
  - Removes extra quotes and whitespace from column names

✓ **Ensure required Tableau fields resolve**
  - All fields from tableau_spec.json map to valid CSV columns

✓ **Prevent silent bad parses**
  - Data quality validation catches all-zero or NaN values
  - Throws errors before charts render with bad data

✓ **Fix build blockers**
  - No import path issues found
  - Build completes successfully

✓ **Prefer fixing parsing logic over deleting data**
  - All data quality evidence preserved
  - Only parsing logic was modified

## Next Steps

The Tableau source ingestion is now deterministic and correct. The application should:
1. Load all 51,290 records successfully
2. Parse all numeric and date fields correctly
3. Render charts with actual (non-zero) values
4. Display proper year ranges (not Jan 1970)
5. Show all categorical dimensions (Region, Category, etc.)

The deterministic Tableau source validator should now pass.
