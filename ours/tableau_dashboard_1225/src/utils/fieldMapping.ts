/**
 * Field mapping utilities for Tableau spec to CSV column resolution
 *
 * Maps Tableau's internal field references to actual CSV column names.
 * This ensures deterministic field resolution at runtime.
 */

/**
 * Extract the base field name from Tableau's federated field references
 *
 * Examples:
 * - [federated.xxx].[sum:Sales:qk] -> Sales
 * - [federated.xxx].[yr:Order Date:ok] -> Order Date
 * - [federated.xxx].[none:Category:nk] -> Category
 * - [federated.xxx].[none:Sub-Category:nk] -> Sub-Category
 * - [federated.xxx].[sum:Profit:qk] -> Profit
 */
export function extractFieldName(tableauField: string): string {
  // Match patterns like [sum:Sales:qk], [yr:Order Date:ok], [none:Category:nk]
  const match = tableauField.match(/\[([a-z]+):([^:]+):[a-z]+\]/i);
  if (match && match[2]) {
    return match[2];
  }

  // Fallback: extract the last part after the last dot or bracket
  const parts = tableauField.split(/[.\]]+/);
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/^["']+|["']+$/g, ''); // Remove quotes
}

/**
 * Map of all required Tableau fields from the spec to their CSV column names
 * This is extracted from tableau_spec.json worksheets
 */
export const TABLEAU_FIELD_MAPPING: Record<string, string> = {
  // Date fields
  'Order Date': 'Order Date',
  'Ship Date': 'Ship Date',

  // Dimension fields
  'Category': 'Category',
  'Sub-Category': 'Sub-Category',
  'Row ID': 'Row ID',
  'Order ID': 'Order ID',
  'Ship Mode': 'Ship Mode',
  'Customer ID': 'Customer ID',
  'Customer Name': 'Customer Name',
  'Segment': 'Segment',
  'Country/Region': 'Country/Region',
  'City': 'City',
  'State': 'State',
  'Postal Code': 'Postal Code',
  'Region': 'Region',
  'Product ID': 'Product ID',
  'Product Name': 'Product Name',

  // Measure fields
  'Sales': 'Sales',
  'Profit': 'Profit',
  'Quantity': 'Quantity',
  'Discount': 'Discount',
};

/**
 * Validate that all required Tableau fields exist in the CSV data
 * @param dataSample - A sample row from the parsed CSV data
 * @returns Object with validation result and missing fields
 */
export function validateTableauFields(dataSample: Record<string, any>): {
  isValid: boolean;
  missingFields: string[];
  availableFields: string[];
} {
  const availableFields = Object.keys(dataSample);
  const missingFields: string[] = [];

  for (const [tableauField, csvColumn] of Object.entries(TABLEAU_FIELD_MAPPING)) {
    if (!availableFields.includes(csvColumn)) {
      missingFields.push(tableauField);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    availableFields,
  };
}

/**
 * Get the CSV column name for a Tableau field reference
 * @param tableauField - The Tableau field reference (e.g., [federated.xxx].[sum:Sales:qk])
 * @returns The CSV column name (e.g., 'Sales')
 */
export function getCsvColumnName(tableauField: string): string {
  const fieldName = extractFieldName(tableauField);
  return TABLEAU_FIELD_MAPPING[fieldName] || fieldName;
}
