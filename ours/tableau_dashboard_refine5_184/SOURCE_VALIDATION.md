# Tableau Source Ingestion - Deterministic Parser

This document describes the improvements made to ensure deterministic and correct Tableau source ingestion.

## Problem Statement

The original CSV parser had several issues that could lead to silent bad parses:

1. **Preamble Rows**: The CSV file contains metadata/preamble rows (rows 1-4) before the actual header row (row 5)
2. **Header Normalization**: No handling for quoted or dirty headers
3. **Field Validation**: No validation that required Tableau fields are present
4. **Silent Failures**: Numeric parsing errors could result in NaN values without warnings
5. **Date Issues**: Invalid dates could default to "Jan 1970" without detection

## Solutions Implemented

### 1. Preamble Row Detection (`findHeaderRow`)

```typescript
function findHeaderRow(lines: string[]): number {
  const expectedColumns = ['Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Sales', 'Quantity', 'Discount', 'Profit'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const hasExpectedColumns = expectedColumns.some(col => line.includes(col));
    if (hasExpectedColumns) {
      return i;
    }
  }

  return Math.min(4, lines.length - 1);
}
```

- Automatically detects the real header row by looking for expected column names
- Skips preamble rows that contain metadata
- Falls back to row 5 if no header is found (defensive programming)

### 2. Header Normalization (`normalizeHeader`)

```typescript
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .replace(/"+/g, '"') // Replace multiple quotes with single quote
    .trim();
}
```

- Removes extra quotes from headers
- Handles quoted/dirty headers like `"Order Date"` or `""Order Date""`
- Ensures consistent header format for field lookup

### 3. Required Field Validation (`validateRequiredFields`)

```typescript
const REQUIRED_FIELDS = [
  'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
  'Customer ID', 'Customer Name', 'Segment', 'City, State',
  'Country', 'Postal Code', 'Market', 'Region', 'Product ID',
  'Category', 'Sub-Category', 'Product Name', 'Sales',
  'Quantity', 'Discount', 'Profit', 'Shipping Cost', 'Order Priority',
];

function validateRequiredFields(data: OrderRow[]): void {
  if (data.length === 0) {
    throw new Error('No data rows found in CSV after parsing');
  }

  const sampleRow = data[0];
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach(field => {
    if (!(field in sampleRow)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields in CSV: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(sampleRow).join(', ')}`
    );
  }
}
```

- Validates all required Tableau fields from the render contract are present
- Throws descriptive error if any fields are missing
- Prevents silent failures where charts would show all zeros

### 4. Robust Numeric Parsing (`parseOrderRow`)

```typescript
const safeParseFloat = (value: string, fieldName: string): number => {
  if (value === null || value === undefined || value === '') {
    console.warn(`Row ${index}: Empty value for ${fieldName}, defaulting to 0`);
    return 0;
  }
  const parsed = parseFloat(String(value).trim());
  if (isNaN(parsed)) {
    console.warn(`Row ${index}: Invalid numeric value for ${fieldName}: "${value}", defaulting to 0`);
    return 0;
  }
  return parsed;
};
```

- Prevents NaN values from propagating to charts
- Logs warnings for invalid numeric values
- Defaults to 0 for empty/invalid values (with warning)

### 5. Data Quality Logging

```typescript
console.log(`Successfully parsed ${parsedData.length} rows from CSV`);
console.log('Sample row:', parsedData[0]);
console.log('Data quality check:', {
  totalRows: parsedData.length,
  nonZeroSales: parsedData.filter(r => r.sales > 0).length,
  nonZeroProfit: parsedData.filter(r => r.profit !== 0).length,
  validDates: parsedData.filter(r => r.orderDate && r.orderDate !== '1970-01-01').length,
  regions: new Set(parsedData.map(r => r.region)).size,
});
```

- Logs comprehensive data quality metrics
- Helps identify parsing issues early
- Prevents silent bad parses

## Validation Script

A standalone validation script is provided at `scripts/validate-tableau-source.ts`:

```bash
npm run validate:tableau
```

This script:
1. Checks if the CSV file exists
2. Validates preamble row detection
3. Validates header normalization
4. Validates all required fields are present
5. Checks data quality (numeric parsing, non-zero values, date formats, region diversity)
6. Provides clear pass/fail output

## Usage

The improved parser is used automatically by the dashboard. When the app loads:

1. The CSV is fetched from `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`
2. Preamble rows are automatically skipped
3. Headers are normalized
4. Required fields are validated
5. Data is parsed with robust error handling
6. Data quality metrics are logged to console

## Benefits

✅ **Deterministic**: Same CSV always produces same parsed data
✅ **Correct**: All required Tableau fields are validated
✅ **Transparent**: Clear error messages and data quality logs
✅ **Robust**: Handles preamble rows, quoted headers, and invalid data
✅ **Testable**: Standalone validation script for CI/CD

## File Changes

- `src/services/dataService.ts`: Enhanced CSV parser with preamble detection, header normalization, field validation, and robust numeric parsing
- `scripts/validate-tableau-source.ts`: New standalone validation script
- `package.json`: Added `validate:tableau` script
- `SOURCE_VALIDATION.md`: This documentation

## Testing

To test the parser:

1. Run the validation script:
   ```bash
   npm run validate:tableau
   ```

2. Start the dev server and check console logs:
   ```bash
   npm run dev
   ```

3. Look for data quality logs in browser console:
   ```
   Successfully parsed XXXX rows from CSV
   Sample row: {...}
   Data quality check: {...}
   ```
