# Tableau Field Mappings to CSV Columns

This document maps the Tableau spec fields to the actual CSV columns in the Superstore Orders dataset.

## Dataset Information
- **CSV Path**: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`
- **Total Rows**: 9,994
- **Total Columns**: 21

## Field Mappings

### Measures (Numeric Fields)

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[sum:Sales:qk]` | `Sales` | number | Sales amount |
| `[sum:Profit:qk]` | `Profit` | number | Profit amount |
| `[sum:Quantity:qk]` | `Quantity` | number | Quantity sold |
| `[sum:Discount:qk]` | `Discount` | number | Discount applied |

### Dimensions (Categorical/Text Fields)

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[none:Region:nk]` | `Region` | string | Geographic region (East, West, Central, South) |
| `[none:Product Name:nk]` | `Product Name` | string | Name of the product |
| `[ctd:Customer Name:qk]` | `Customer Name` | string | Customer name |
| `[:Measure Names]` | *Computed* | string | Measure names for table calculations |
| `[Multiple Values]` | *Computed* | string | Multiple values field |

### Time Dimensions

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[tmn:Order Date:qk]` | `Order Date` | date (YYYY-MM-DD) | Order date (month-level granularity) |
| `[yr:Order Date:ok]` | `Order Date` | date (YYYY-MM-DD) | Order date (year-level granularity) |
| `[Ship Date]` | `Ship Date` | date (YYYY-MM-DD) | Ship date |

### Customer Dimensions

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[Customer ID]` | `Customer ID` | string | Unique customer identifier |
| `[Customer Name]` | `Customer Name` | string | Customer name |
| `[Segment]` | `Segment` | string | Customer segment (Consumer, Corporate, Home Office) |

### Product Dimensions

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[Product ID]` | `Product ID` | string | Unique product identifier |
| `[Category]` | `Category` | string | Product category (Furniture, Office Supplies, Technology) |
| `[Sub-Category]` | `Sub-Category` | string | Product sub-category |

### Geographic Dimensions

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[Country]` | `Country` | string | Country (United States) |
| `[State]` | `State` | string | State name |
| `[City]` | `City` | string | City name |
| `[Postal Code]` | `Postal Code` | number | Postal code |

### Order Dimensions

| Tableau Field | CSV Column | Data Type | Description |
|--------------|-----------|-----------|-------------|
| `[Order ID]` | `Order ID` | string | Unique order identifier |
| `[Row ID]` | `Row ID` | number | Row identifier |
| `[Ship Mode]` | `Ship Mode` | string | Shipping mode (First Class, Second Class, Standard Class, Same Day) |

## Calculated Fields

The following fields are computed at runtime:

### `[usr:Sales:qk]`
- **Type**: User-defined calculation
- **Source**: `Sales` column
- **Usage**: Display in customer overview table

### `[usr:Calculation_5571209093911105:qk]`
- **Type**: User-defined calculation (ID indicates Tableau-generated)
- **Usage**: Color encoding in customer overview
- **Implementation**: This appears to be a Tableau-generated calculation, likely related to measure values

## Data Quality Notes

1. **No preamble rows**: CSV has a clean header row with no preamble
2. **No quoted headers**: Headers are clean (not wrapped in quotes)
3. **Date format**: All dates are in YYYY-MM-DD format
4. **Numeric fields**: All numeric fields contain valid numbers
5. **Missing values**: Some fields may have empty values (11 found across 9,994 rows - 0.11%)
6. **No all-zero metrics**: All 9,994 rows have valid Sales values

## Validation

All field mappings have been validated using the deterministic Tableau source validator:

```bash
pnpm validate:tableau
```

This ensures:
- ✅ All required fields exist in the CSV
- ✅ Numeric fields parse correctly
- ✅ Date fields parse correctly (no Jan 1970 issues)
- ✅ No NaN values in critical fields
- ✅ No silent data loss from filtering
