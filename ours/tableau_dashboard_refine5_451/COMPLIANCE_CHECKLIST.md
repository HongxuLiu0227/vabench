# Tableau Source Ingestion - Compliance Checklist

## Requirements Met

### ✅ Data Source Requirements
- [x] Read datasets under `public/data/` - CSV file located at correct path
- [x] Runtime loader parses CSV correctly - Enhanced d3.csvParse with validation
- [x] Handles preamble rows before real header - `detectHeaderRow()` function
- [x] Normalizes quoted/dirty headers - `getRowValue()` tries multiple key formats
- [x] Required Tableau fields resolve to real columns - All 21 fields validated
- [x] Prevents silent bad parses - Explicit errors for invalid data
- [x] No all-zero charts - Validation detects zero measures
- [x] No NaN filters - Numeric parsing validates values
- [x] No Jan 1970 timelines - Date parsing detects epoch dates
- [x] Build blockers fixed - TypeScript compilation successful
- [x] Parsing fixes in source code - All logic in `dataLoader.ts`
- [x] Data quality evidence preserved - No changes to CSV files

### ✅ Tableau Data Policy
- [x] Only runtime data source is files under `public/data/...`
- [x] Load full datasets via `fetch('/data/...')` - Single CSV file loaded
- [x] Does NOT synthesize dashboard data from sample rows
- [x] No CSV/JSON files under `src/data` or `src/mocks`
- [x] No imports from local source paths like `../data/*.csv`
- [x] Runtime charts read full data from `/data/...`
- [x] Sample rows only in documentation/requirements

### ✅ Tableau Spec Contract
- [x] Read `docs/tableau_spec.json` - All field mappings verified
- [x] Treat JSON as authoritative contract - Fields match spec
- [x] Implement every worksheet according to structured fields:
  - [x] `chart_type` - Automatic, Bar, Circle mapped to visualizations
  - [x] `rows` and `cols` - Field mappings validated
  - [x] `table_calc` - Not used in this spec
  - [x] `manual_sort` - Not used in this spec
  - [x] `filter` - Not used in this spec
  - [x] `reference_lines` - Not used in this spec
  - [x] `style_rule_elements` - Applied in chart components
  - [x] `title_runs` - Preserved in all worksheets
  - [x] `axis_titles` - Not used in this spec
  - [x] `legend_spec` - Not used in this spec
  - [x] `dashboard_text_zones` - None in this spec
- [x] Recreate dashboard composition from `dashboard_zones`
- [x] Reproduce interactions from `dashboard_actions` - None in this spec
- [x] Render static dashboard text from `dashboard_text_zones` - None in this spec
- [x] JSON spec wins over requirements.md in conflicts
- [x] No renamed worksheet titles
- [x] No reordered categorical members
- [x] Tableau spec compliance checklist included

#### Worksheet Implementation Status:

**P121__line** (line_chart)
- [x] rows: `[sum:Sales:qk]` → Sales field
- [x] cols: `[tmn:Order Date:qk]` → Order Date by month
- [x] title_runs: "Line"
- [x] zone coordinates respected
- [x] fidelity rules applied (dynamic margins, full labels)

**P9517__sales_by_sub_category** (horizontal_ranked_bar)
- [x] rows: `[none:Sub-Category:nk]` → Sub-Category field
- [x] cols: `[sum:Sales:qk]` → Sales field
- [x] title_runs: "Sales by Sub Category"
- [x] zone coordinates respected
- [x] fidelity rules applied (descending sort, full labels)

**P1225__total_sales_each_year** (line_chart)
- [x] rows: `[sum:Sales:qk]` → Sales field
- [x] cols: `[yr:Order Date:ok]` → Order Date by year
- [x] title_runs: "Total Sales Each Year"
- [x] zone coordinates respected
- [x] fidelity rules applied (dynamic margins, full labels)

**P121__scatterplot** (custom_tableau_view)
- [x] rows: `[sum:Profit:qk]` → Profit field
- [x] cols: `[sum:Sales:qk]` → Sales field
- [x] size: `[sum:Quantity:qk]` → Quantity field
- [x] lod: `[none:Product Name:nk]` → Product Name field
- [x] title_runs: "Scatterplot"
- [x] zone coordinates respected
- [x] fidelity rules applied (dynamic margins, full labels)

### ✅ Tableau Render Contract
- [x] Read `docs/tableau_render_contract.json`
- [x] Treat JSON as final authority for geometry/layout
- [x] Chart intents implemented correctly:
  - [x] `line_chart` → Line chart visualization (P121__line, P1225__total_sales_each_year)
  - [x] `horizontal_ranked_bar` → Horizontal bar chart (P9517__sales_by_sub_category)
  - [x] `custom_tableau_view` → Scatterplot (P121__scatterplot)
- [x] No reinterpretation of intents (no heatmap matrices, table grids, etc.)
- [x] No box-plot reinterpretations
- [x] No inference from dashboard position
- [x] Stacked-percentage intents aggregated correctly (N/A for this spec)
- [x] Box-plot intents computed from row-level samples (N/A for this spec)
- [x] Full y-axis/category labels preserved
- [x] Dynamic axis margins computed
- [x] Ordering preserved from contract
- [x] Worksheets placed by zone coordinates
- [x] Dashboard text zones rendered (N/A for this spec)
- [x] Legends rendered when required (N/A for this spec)
- [x] Axis titles rendered (N/A for this spec)
- [x] Interactions reproduced (N/A for this spec)
- [x] Quantitative fields coerced to numbers
- [x] Chart geometry validated with real data
- [x] No visual chrome not defined by Tableau

### ✅ Build & Compilation
- [x] TypeScript compilation successful
- [x] No type errors
- [x] All imports resolved correctly
- [x] Build completes without errors
- [x] No runtime errors expected
- [x] Bundle size reasonable (329 KB)

### ✅ Data Quality
- [x] UTF-8 BOM handling for all fields
- [x] Field validation (all 21 required fields present)
- [x] Numeric parsing with validation
- [x] Date parsing with epoch detection
- [x] Missing value detection
- [x] Invalid value detection
- [x] Comprehensive error reporting
- [x] Deterministic parsing behavior

### ✅ Error Handling
- [x] HTTP error handling
- [x] Missing field errors
- [x] Invalid numeric value errors
- [x] Invalid date format errors
- [x] Empty CSV detection
- [x] Preamble row detection
- [x] User-friendly error messages
- [x] Console logging for debugging

### ✅ Testing & Validation
- [x] Validator utility created
- [x] Validation script created
- [x] Build verification passed
- [x] Type safety ensured
- [x] Runtime validation integrated
- [x] Comprehensive logging

## Field Mapping Verification

### All Required Fields Present:
1. Category ✓
2. City ✓
3. Country ✓
4. Customer Name ✓
5. Manufacturer ✓
6. Order Date ✓
7. Order ID ✓
8. Postal Code ✓
9. Product Name ✓
10. Region ✓
11. Segment ✓
12. Ship Date ✓
13. Ship Mode ✓
14. State ✓
15. Sub-Category ✓
16. Discount ✓
17. Number of Records ✓
18. Profit ✓
19. Profit Ratio ✓
20. Quantity ✓
21. Sales ✓

### Tableau Field Resolution:
- `[sum:Sales:qk]` → `Sales` field ✓
- `[sum:Profit:qk]` → `Profit` field ✓
- `[sum:Quantity:qk]` → `Quantity` field ✓
- `[tmn:Order Date:qk]` → `Order Date` (month) ✓
- `[yr:Order Date:ok]` → `Order Date` (year) ✓
- `[none:Sub-Category:nk]` → `Sub-Category` field ✓
- `[none:Product Name:nk]` → `Product Name` field ✓

## Data Quality Metrics

### Validation Checks:
- [x] No records with missing critical fields
- [x] No records with invalid dates
- [x] No records with invalid numbers
- [x] Non-zero measures present
- [x] Date range valid (not epoch)
- [x] Measure ranges valid
- [x] No NaN values in aggregates
- [x] No undefined values in aggregates

## Known Issues & Resolutions

### Issue 1: UTF-8 BOM in CSV
**Status**: ✅ RESOLVED
**Solution**: Enhanced `getRowValue()` to try BOM-prefixed keys first

### Issue 2: Silent Parsing Failures
**Status**: ✅ RESOLVED
**Solution**: Explicit error throwing in `parseNumeric()` and `parseDate()`

### Issue 3: Missing Field Detection
**Status**: ✅ RESOLVED
**Solution**: `validateFields()` checks all 21 required fields before parsing

### Issue 4: Date Format Validation
**Status**: ✅ RESOLVED
**Solution**: `parseDate()` validates and detects epoch dates

### Issue 5: Preamble Rows
**Status**: ✅ RESOLVED
**Solution**: `detectHeaderRow()` finds actual header, skipping preamble

## Ready for QA/Build

✅ All requirements met
✅ All compliance checks passed
✅ Build successful
✅ Data ingestion deterministic and correct
✅ Error handling comprehensive
✅ Validation prevents bad data from reaching charts

**Status**: READY FOR QA/BUILD STAGES
