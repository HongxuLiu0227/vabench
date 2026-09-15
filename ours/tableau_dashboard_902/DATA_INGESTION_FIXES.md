# Tableau Source Ingestion Fixes

## Summary

Fixed deterministic and correct Tableau source ingestion by implementing robust CSV parsing that handles BOM (Byte Order Mark) and triple-quoted headers. All required Tableau fields now resolve correctly at runtime, preventing silent bad parses that could lead to all-zero charts, NaN filters, or Jan 1970 timelines.

## Issues Fixed

### 1. CSV Header Parsing Issues
**Problem**: The CSV file had triple-quoted headers (e.g., `"""campaign"""`, `"""channel"""`) that were not being parsed correctly by d3-dsv's `csvParse` function.

**Solution**: Implemented a two-stage header normalization process:
- Stage 1: Remove triple quotes: `"""campaign"""` → `"campaign"`
- Stage 2: Remove remaining double quotes: `"campaign"` → `campaign`

### 2. BOM (Byte Order Mark) Handling
**Problem**: The CSV file started with a UTF-8 BOM (﻿) which could interfere with parsing.

**Solution**: Added BOM detection and removal at the start of CSV text processing.

### 3. Fragile Field Mapping
**Problem**: The original code used fallback patterns like `getValue('"""campaign"""') || getValue('campaign')` which was fragile and could fail silently.

**Solution**: Implemented a robust header mapping system that:
- Builds a mapping from raw headers to normalized field names
- Validates that all expected fields are found
- Provides clear error messages if mapping fails

### 4. Missing Runtime Validation
**Problem**: No validation that Tableau fields from the spec actually resolve to real columns at runtime.

**Solution**: Created a comprehensive field validator that:
- Maps all Tableau field names from the spec to actual CSV columns
- Validates field presence and types on sample records
- Checks for common data quality issues

## Changes Made

### 1. `src/services/dataService.ts`
- Added `removeBOM()` function to strip UTF-8 BOM
- Added `normalizeHeader()` function to clean triple-quoted headers
- Added `buildHeaderMapping()` to create robust field mappings
- Rewrote `normalizeRow()` to use header mapping
- Enhanced `loadData()` with comprehensive validation
- Added runtime Tableau field validation

### 2. `src/types/data.ts`
- Removed incorrect `RawDataRow` interface with hardcoded quoted field names
- Added documentation about CSV source and header normalization

### 3. `src/utils/tableauFieldValidator.ts` (NEW)
- Created comprehensive Tableau field mapping
- Implemented `validateTableauFields()` for runtime validation
- Added `mapTableauField()` for field name resolution
- Included all required Tableau fields from the spec

### 4. `scripts/validateDataIngestion.ts` (NEW)
- Created standalone validation script
- Tests CSV parsing, header mapping, and data normalization
- Validates all aggregations (control groups, channels, events, campaigns)
- Checks for common issues (all-zero counts, NaN values, Jan 1970 timestamps)

### 5. `package.json`
- Added `tsx` as dev dependency for running TypeScript validation scripts
- Added `validate-data` script: `npm run validate-data`

## Validation Results

```
============================================================
✓ VALIDATION PASSED
============================================================

Summary:
  - Total records: 3,924,985
  - Control groups: 2 (Целевая: 463,455 users, Контрольная: 80,447 users)
  - Channels: 3 (chat: 257,717 users, email: 468,074 users, sms: 33,275 users)
  - Events: 3 (open, sent, view)
  - Campaigns: 5 (campaign_1 through campaign_5)
```

## Tableau Field Mapping

All required Tableau fields from the spec now resolve correctly:

| Tableau Field | CSV Column | Type |
|--------------|------------|------|
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk]` | `campaign` | string |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]` | `channel` | string |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok]` | `control` | number (0 or 1) |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]` | `event` | string |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:uid:nk]` | `uid` | number |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:ts:nk]` | `ts` | timestamp |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:dadd:nk]` | `dadd` | date |
| `[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]` | `uid` | COUNTD calculation |

## Data Quality Checks

✓ No null/empty values in critical fields (campaign, channel, event)
✓ All user counts are non-zero
✓ No NaN values in aggregations
✓ No Jan 1970 timestamps (Unix epoch 0)
✓ All control values are valid (0 or 1)
✓ Build passes without errors

## Usage

### Running the Validator
```bash
npm run validate-data
```

### Building the Project
```bash
npm run build
```

### Data Loading (Runtime)
Data is automatically loaded from `/data/clients (techmadness).csv` when the dashboard initializes. The loader now:
1. Fetches the CSV file
2. Removes BOM if present
3. Parses with d3-dsv
4. Normalizes triple-quoted headers
5. Maps to clean field names
6. Validates all Tableau fields
7. Returns clean, typed data records

## Compliance with Requirements

✓ Read datasets under `public/data/` - **DONE** (CSV is at `/data/clients (techmadness).csv`)
✓ Runtime loader parses them correctly - **DONE** (3.9M records parsed successfully)
✓ Detect and skip preamble rows - **N/A** (no preamble rows in this dataset)
✓ Normalize quoted/dirty headers - **DONE** (triple quotes normalized)
✓ Required Tableau fields resolve to real columns - **DONE** (all 7 fields mapped)
✓ Prevent silent bad parses - **DONE** (comprehensive validation)
✓ Fix build blockers - **DONE** (build passes)
✓ Prefer fixing parsing logic over deleting data - **DONE** (all data preserved)
✓ Deterministic Tableau source validator passes - **DONE**

## Files Modified

1. `src/services/dataService.ts` - Enhanced CSV parsing with BOM removal and header normalization
2. `src/types/data.ts` - Updated type definitions
3. `src/utils/tableauFieldValidator.ts` - NEW: Tableau field validation
4. `scripts/validateDataIngestion.ts` - NEW: Standalone validation script
5. `package.json` - Added validation script and tsx dependency
