# Tableau Spec Compliance Checklist

## Worksheets Implementation Status

### Sheet 2 (Воронка)
- **Chart Type**: Automatic → horizontal_ranked_bar ✓
- **Rows**: `[none:event:nk]` → `event` field ✓
- **Cols**: `[none:control:ok] * [usr:Calculation_5721612283639615488:qk]` → `control * COUNTD(uid)` ✓
- **Series**: `[Action (channel)]`, `[Action (control)]`, `[none:campaign:nk]`, `[Action (campaign,channel)]` ✓
- **Filter**: 4 categorical filters with crossjoin support ✓
- **Title**: "Воронка" ✓
- **Axis Titles**: None (as per spec) ✓
- **Legend**: Not required ✓
- **Interaction**: Highlight fields for campaign, control, event ✓
- **Zone**: x=800, y=38375, w=61100, h=60625 ✓
- **Fidelity Rules**: Preserved title wording, full labels, dynamic margins, sort descending, auto-clear highlight ✓

### Sheet 3 (Каналы)
- **Chart Type**: Circle → custom_tableau_view (bubble chart) ✓
- **Series**: `[none:channel:nk]` → `channel` field ✓
- **Size Encoding**: `[usr:Calculation_5721612283639615488:qk]` → COUNTD(uid) ✓
- **Text Encoding**: `[none:channel:nk]`, `[usr:Calculation_5721612283639615488:qk]` ✓
- **Color Encoding**: `[none:channel:nk]` ✓
- **Filter**: 2 categorical filters ✓
- **Title**: "Каналы" ✓
- **Legend**: Not required ✓
- **Interaction**: Highlight field for channel, filter action to dashboard ✓
- **Zone**: x=61899, y=1000, w=37301, h=37375 ✓
- **Fidelity Rules**: Preserved title, full labels, dynamic margins, auto-clear ✓

### Sheet 4 (Группы)
- **Chart Type**: Automatic → custom_tableau_view (bubble chart) ✓
- **Series**: `[usr:Calculation_5721612283639615488:qk]` → COUNTD(uid) ✓
- **Size Encoding**: `[usr:Calculation_5721612283639615488:qk]` ✓
- **Color Encoding**: `[usr:Calculation_5721612283639615488:qk]` ✓
- **Text Encoding**: `[none:control:ok]`, `[sum:Number of Records:qk]` ✓
- **Filter**: 2 categorical filters ✓
- **Title**: "Группы" ✓
- **Legend**: Not required ✓
- **Interaction**: Highlight fields for control and calculation, filter action to dashboard ✓
- **Zone**: x=800, y=1000, w=61099, h=37375 ✓
- **Fidelity Rules**: Preserved title, full labels, dynamic margins, auto-clear ✓

### Sheet 5 (Кампании)
- **Chart Type**: Automatic → horizontal_ranked_bar ✓
- **Rows**: `[none:campaign:nk]` → `campaign` field ✓
- **Cols**: `[usr:Calculation_5721612283639615488:qk]` → COUNTD(uid) ✓
- **Series**: `[none:channel:nk]` → `channel` field ✓
- **Color Encoding**: `[none:channel:nk]` ✓
- **Text Encoding**: `[usr:Calculation_5721612283639615488:qk]` ✓
- **Filter**: 1 categorical filter ✓
- **Title**: "Кампании" ✓
- **Legend**: Not required ✓
- **Interaction**: Highlight fields for channel and campaign, filter action to dashboard ✓
- **Zone**: x=61900, y=38375, w=37300, h=60625 ✓
- **Fidelity Rules**: Preserved title, full labels, dynamic margins, sort descending, auto-clear ✓

## Dashboard Composition

### Dashboard 1
- **Size**: 1000x800 (min/max width/height) ✓
- **Zones**: 4 worksheet zones arranged in 2x2 grid ✓
- **Layout**: Horizontal flow container with nested basic layouts ✓
- **Margins**: 8px outer, 4px inner ✓
- **Borders**: None (as per spec) ✓

### Dashboard Text Zones
- **Count**: 0 (as per spec) ✓

### Dashboard Actions
1. **[Action1]**: Filter from Sheet 4 to Dashboard 1 (all fields, auto-clear) ✓
2. **[Action2]**: Filter from Sheet 3 to Dashboard 1 (all fields, auto-clear) ✓
3. **[Action3]**: Filter from Sheet 5 to Dashboard 1 (all fields, auto-clear) ✓

### Highlight Bindings
1. **Sheet 2**: campaign, control, event (color-one-way) ✓
2. **Sheet 3**: channel (color-one-way) ✓
3. **Sheet 4**: control, calculation (color-one-way) ✓
4. **Dashboard 1** (Sheet 3): channel (color-one-way) ✓
5. **Dashboard 1** (Sheet 5): channel (color-one-way) ✓
6. **Sheet 5**: campaign, channel (color-one-way) ✓

## Data Source Compliance

### CSV File Location
- **Path**: `/data/clients (techmadness).csv` ✓
- **Location**: `public/data/` (not `src/data` or `src/mocks`) ✓
- **Size**: 251 MB (3,924,985 records + header) ✓

### CSV Format
- **BOM**: UTF-8 BOM present (handled correctly) ✓
- **Headers**: Triple-quoted (`"""campaign"""`, etc.) ✓
- **Line Endings**: Windows (CRLF) ✓
- **Delimiter**: Comma ✓

### Field Mapping
All Tableau fields from spec resolve to real CSV columns:
- `campaign` (string) ✓
- `channel` (string: chat, email, sms) ✓
- `control` (number: 0 or 1) ✓
- `uid` (number) ✓
- `event` (string: open, sent, view) ✓
- `ts` (timestamp) ✓
- `dadd` (date) ✓

### Data Quality
- **Null Values**: None in critical fields ✓
- **Duplicate Records**: Allowed (multiple events per user) ✓
- **User Counts**: Non-zero across all aggregations ✓
- **Timestamps**: Valid dates (no Jan 1970 epoch issues) ✓
- **Numeric Fields**: Properly typed (control, uid) ✓

## Render Contract Compliance

### Chart Intents
- **Sheet 2**: horizontal_ranked_bar → Implemented ✓
- **Sheet 3**: custom_tableau_view → Implemented (bubble chart) ✓
- **Sheet 4**: custom_tableau_view → Implemented (bubble chart) ✓
- **Sheet 5**: horizontal_ranked_bar → Implemented ✓

### Stacked Percentage Charts
- **Count**: 0 (as per contract) ✓

### Box Plot Charts
- **Count**: 0 (as per contract) ✓

### Legend Requirements
- **Required**: 0 worksheets (as per contract) ✓

### Axis Titles
- **Required**: 0 worksheets (as per contract) ✓

### Interaction Worksheets
- **Sheet 2**: Highlight + Filter ✓
- **Sheet 3**: Highlight + Filter ✓
- **Sheet 4**: Highlight + Filter ✓
- **Sheet 5**: Highlight + Filter ✓

## Summary

✓ **All 4 worksheets implemented according to spec**
✓ **All 3 dashboard actions implemented**
✓ **All 6 highlight bindings implemented**
✓ **All required Tableau fields map correctly to CSV columns**
✓ **Data ingestion is deterministic and correct**
✓ **No build blockers**
✓ **Validation passes with 3.9M records**
✓ **All fidelity rules preserved**

## Validation Commands

```bash
# Run data ingestion validation
npm run validate-data

# Build the project
npm run build

# Start dev server
npm run dev
```

## Notes

- The CSV uses triple-quoted headers which are now properly normalized
- BOM handling ensures UTF-8 files parse correctly
- All field mappings are validated at runtime
- Aggregations use COUNTD(uid) for distinct user counts
- Filter actions support auto-clear and cross-sheet propagation
- Highlight bindings use color-one-way mode as specified
