# Tableau Field Mapping

## Overview

This document explains the mapping between Tableau spec fields and actual CSV source columns.

## Source Data Columns

The CSV file `public/data/1InsuranceRates.csv` contains **3 physical columns**:

1. **Age** (number) - Age of the insured person (16-25)
2. **Gender** (string) - Gender value: "Male" or "Female"
3. **6-month premium** (number) - Premium amount in USD (700-1400)

These are the only fields that exist in the source data.

## Tableau Calculated Fields

The `tableau_spec.json` references additional fields that are **Tableau-specific constructs**, not source columns:

### Set Fields

- **`[io:Set 1:nk]`** - A Tableau Set (calculated grouping based on Age & Gender)
  - **Does NOT exist in source CSV**
  - This is a Tableau calculated field created from combinations of Age and Gender
  - Used internally by Tableau for filtering/grouping
  - **Not required** for React implementation

### Group Fields

- **`[Age & Gender (group)]`** - A Tableau Group field
  - **Does NOT exist in source CSV**
  - This is a Tableau grouping construct
  - Implemented in React as data transformations (e.g., `groupByAgeAndGender()`)
  - **Not required** as a source column

### Aggregated Fields

Tableau spec references aggregated fields that are computed at runtime:

- **`[sum:6-month premium:ok]`** - SUM aggregation
- **`[avg:6-month premium:qk]`** - AVG aggregation
- **`[sum:Age:ok]`** - SUM of Age
- **`[avg:Age:ok]`** - AVG of Age
- **`[none:Age:ok]`** - Raw Age field (no aggregation)
- **`[none:Gender:nk]`** - Raw Gender field (no aggregation)
- **`[none:6-month premium:ok]`** - Raw premium field (no aggregation)

**All of these are computed from the 3 source columns**, not separate physical columns.

## Implementation Strategy

### For React Dashboard

1. **Load source data**: Use the 3 physical columns (Age, Gender, 6-month premium)
2. **Compute aggregations**: Use JavaScript/TypeScript to calculate SUM/AVG as needed
3. **Create groups**: Implement grouping logic in data utility functions
4. **Ignore Set/Group references**: These are Tableau-internal constructs

### Example Mapping

```
Tableau Spec                          →  CSV Column / Implementation
--------------------------------------------------------------------------------
[none:Age:ok]                        →  Age (direct column)
[none:Gender:nk]                     →  Gender (direct column)
[none:6-month premium:ok]            →  6-month premium (direct column)
[sum:6-month premium:ok]             →  data.reduce((sum, row) => sum + row['6-month premium'], 0)
[avg:6-month premium:qk]             →  totalPremium / rowCount
[io:Set 1:nk]                        →  NOT SOURCE COLUMN (Tableau calculated set)
[Age & Gender (group)]               →  NOT SOURCE COLUMN (computed grouping)
```

## Validation Notes

When validating data ingestion:

✅ **Required**: Age, Gender, 6-month premium (the 3 CSV columns)
❌ **NOT Required**: Set 1, Age & Gender (group) (Tableau-internal constructs)

The presence of `[io:Set 1:nk]` in the spec does **not** indicate a missing source column. It's a reference to a Tableau calculated set that doesn't exist in the raw data.

## Data Quality Validation

The actual CSV validation should check:

1. ✅ File exists at `/data/1InsuranceRates.csv`
2. ✅ Contains exactly 3 columns: Age, Gender, 6-month premium
3. ✅ All Age values are valid numbers (16-25 range)
4. ✅ All Gender values are "Male" or "Female"
5. ✅ All premium values are valid numbers (700-1400 range)
6. ✅ No NaN, null, or undefined values after parsing
7. ✅ Headers are normalized (BOM, quotes, whitespace removed)

## Summary

- **Source CSV**: 3 columns (Age, Gender, 6-month premium)
- **Tableau spec**: References 10+ fields (including calculated/aggregated fields)
- **Implementation**: Map spec fields to source columns + runtime computations
- **Validation**: Only validate the 3 physical columns exist and contain valid data

---

**Last Updated**: 2025-03-20
**Status**: ✅ ACCURATE
