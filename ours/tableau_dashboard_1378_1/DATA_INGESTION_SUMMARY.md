# Tableau Source Ingestion - Deterministic Parsing Fix Summary

## Date: 2026-03-22

## Objective
Make Tableau source ingestion deterministic and correct before later QA/build stages.

## Changes Implemented

### 1. CSV Parsing Robustness (`src/services/dataLoader.ts`)

#### Problem Identified
- CSV file contains UTF-8 BOM (Byte Order Mark)
- Headers use triple quotes: `"""DRG Definition"""`
- Some columns have trailing spaces: `Total Discharges `
- d3-dsv's csvParse needs proper BOM handling

#### Solution Implemented
Created robust CSV parsing with:

1. **BOM Removal**: Automatically strips UTF-8 BOM before parsing
2. **Field Mapping**: Intelligent field key matching that handles:
   - Triple quotes: `"""Field Name"""`
   - Single quotes: `"Field Name"`
   - Clean names: `Field Name`
   - Normalized matching (strips quotes and trims whitespace)

3. **Diagnosis Extraction**: Proper parsing of DRG Definition format:
   - Input: `"470 - MAJOR JOINT REPLACEMENT OR REATTACHMENT OF LOWER EXTREMITY W/O MCC"`
   - Output: `"MAJOR JOINT REPLACEMENT OR REATTACHMENT OF LOWER EXTREMITY W/O MCC"`

4. **Numeric Coercion**: Safe parseFloat with fallback to 0 to prevent NaN

### 2. Type Safety (`src/types/dashboard.ts`)

Updated `DiagnosisData` interface:
- Added `avgTotalPayments` field (was calculated but not in interface)
- Added optional `actionDiagnosis` field for future filter/action support

### 3. Validation Script (`scripts/validateData.ts`)

Created comprehensive validation script that:
- Tests BOM removal
- Validates CSV parsing with d3-dsv
- Confirms field mapping
- Tests diagnosis extraction
- Validates numeric parsing
- Performs aggregation test on sample data

## Validation Results

### CSV Structure Validation
```
✓ CSV file exists (37MB)
✓ UTF-8 BOM detected and removed
✓ 163,066 total lines (163,065 data rows + 1 header)
✓ Triple-quoted headers confirmed
✓ 18 fields detected
```

### Field Mapping Validation
All required fields successfully mapped:
```
✓ "DRG Definition" -> ""DRG Definition""
✓ "Total Discharges " -> ""Total Discharges ""
✓ "Average Covered Charges " -> ""Average Covered Charges ""
✓ "Average Total Payments " -> ""Average Total Payments ""
✓ "Average Medicare Payments" -> ""Average Medicare Payments""
```

### Data Extraction Test
```
DRG Definition: "470 - MAJOR JOINT REPLACEMENT OR REATTACHMENT OF LOWER EXTREMITY W/O MCC"
Extracted diagnosis: "MAJOR JOINT REPLACEMENT OR REATTACHMENT OF LOWER EXTREMITY W/O MCC"
Total Discharges: 100
Average Covered Charges: 72140.61
```

### Aggregation Test
```
✓ Processed 1,000 rows in sample
✓ Found 11 unique diagnoses
Sample top diagnoses:
  - 137x - MEDICAL BACK PROBLEMS W/O MCC
  - 136x - HIP & FEMUR PROCEDURES EXCEPT MAJOR JOINT W CC
  - 124x - CELLULITIS W/O MCC
  - 93x - FRACTURES OF HIP & PELVIS W/O MCC
  - 89x - FX, SPRN, STRN & DISL EXCEPT FEMUR, HIP, PELVIS & ...
```

## Build Verification

### Production Build
```bash
npm run build
```
✓ TypeScript compilation successful
✓ Vite build successful
✓ Output:
  - dist/index.html: 0.46 kB
  - dist/assets/*.css: 0.37 kB
  - dist/assets/*.js: 303.74 kB (gzip: 99.04 kB)

### Linting
```bash
npm run lint
```
✓ No linting errors in source code

## Data Quality Assurance

### Prevented Issues
1. **Silent Bad Parses**: No more all-zero charts due to failed field lookups
2. **NaN Filters**: Proper numeric coercion prevents NaN in filters
3. **Jan 1970 Timelines**: Not applicable (no date fields in this dataset)
4. **Encoding Issues**: UTF-8 BOM properly handled

### Deterministic Guarantees
1. **Field Mapping**: Same fields map correctly every time
2. **Diagnosis Extraction**: Consistent diagnosis name extraction
3. **Aggregation**: Same input always produces same grouped results
4. **Numeric Values**: Safe parsing prevents unexpected NaN/Infinity

## Tableau Data Policy Compliance

✓ Runtime data source: `/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv`
✓ Full dataset loaded via `fetch('/data/...')`
✓ No synthesized data from sample rows
✓ No CSV/JSON files under `src/data` or `src/mocks`
✓ Runtime charts read full data from `/data/...`

## Tableau Spec Contract Compliance

### Worksheets Implemented
1. **G: Number of Records per Diagnosis** (custom_tableau_view)
   - Uses count field
   - Filter: 613-3023 range
   - Legend: required

2. **G: Total Discharges vs Diagnosis** (vertical_ranked_bar)
   - Uses totalDischarges field
   - Sorting: descending by totalDischarges

### Fields Correctly Resolved
- `[sum:Number of Records:qk]` → `count`
- `[sum:Total Discharges :qk]` → `totalDischarges`
- `[sum:Average Covered Charges :qk]` → `avgCoveredCharges`
- `[sum:Average Medicare Payments:qk]` → `avgMedicarePayments`

### Dashboard Actions
- Filter 2 (generated): Kind=filter_action, Source=G: Number of Records per Diagnosis

### Highlight Bindings
- G: Total Discharges vs Diagnosis: DRG Definition, Provider State
- G: Number of Records per Diagnosis: Sepsis, DRG Definition, Provider State

## Next Steps (QA/Build Stage)

The Tableau source ingestion is now:
1. ✓ Deterministic: Same input → same output
2. ✓ Correct: All fields properly mapped and parsed
3. ✓ Validated: CSV structure and data extraction tested
4. ✓ Build-ready: Production build succeeds
5. ✓ Compliant: Follows Tableau data policy and spec contract

Ready for:
- Integration testing
- Visual regression testing
- Performance testing
- Production deployment

## Files Modified

1. `src/services/dataLoader.ts` - Complete rewrite with robust CSV parsing
2. `src/types/dashboard.ts` - Updated DiagnosisData interface
3. `scripts/validateData.ts` - New validation script (not part of build)

## Files Verified (No Changes Needed)

1. `src/App.tsx` - Routing correct
2. `src/main.tsx` - Entry point correct
3. `src/components/Dashboard.tsx` - Data usage correct
4. `src/components/BubbleChart.tsx` - Filtering correct
5. `src/components/VerticalRankedBar.tsx` - Sorting correct
6. `src/components/Legend.tsx` - Legend implementation correct

## Validation Command

To re-validate CSV parsing at any time:
```bash
npx tsx scripts/validateData.ts
```

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Type checking
npx tsc -b
```

---

**Status**: ✅ COMPLETE - Tableau source ingestion is deterministic and correct.
