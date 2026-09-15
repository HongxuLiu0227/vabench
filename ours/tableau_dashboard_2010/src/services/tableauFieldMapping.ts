import type { ABTestingDataWithAgeGroup } from '../types/data';

/**
 * Tableau Field Mapping Service
 *
 * This service maps Tableau's internal field references to actual CSV columns.
 * Tableau fields use the pattern: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[field_name:aggregation:type]
 *
 * The field mapping extracts the base field name and determines how to resolve it at runtime.
 */

export interface TableauFieldMapping {
  readonly columnName: keyof ABTestingDataWithAgeGroup;
  readonly aggregation: 'sum' | 'avg' | 'cnt' | 'ctd' | 'pcto' | 'none';
  readonly requiresCalculation: boolean;
}

/**
 * Parse a Tableau field reference and extract the field name and aggregation type
 * Examples:
 * - [federated.0rs4ltd193x5a718ruzc40qfpfhz].[cnt:client_id:qk] => client_id, cnt
 * - [federated.0rs4ltd193x5a718ruzc40qfpfhz].[avg:bal:qk] => bal, avg
 * - [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk] => Variation, none
 * - [federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)] => age_group, none
 */
export function parseTableauField(fieldRef: string): TableauFieldMapping | null {
  try {
    // Extract the field part between the last .] and the final ]
    const match = fieldRef.match(/\[([^\]]+)\]$/);
    if (!match) {
      console.warn(`Could not parse Tableau field: ${fieldRef}`);
      return null;
    }

    const fieldSpec = match[1];

    // Parse aggregation:type:field or field_name patterns
    // Pattern 1: [agg:field:type] e.g., [cnt:client_id:qk]
    // Pattern 2: [field name] e.g., [Clnt Age (group)]
    const parts = fieldSpec.split(':');

    let columnName: string;
    let aggregation: TableauFieldMapping['aggregation'] = 'none';

    if (parts.length >= 2) {
      // Has aggregation prefix
      aggregation = parts[0] as TableauFieldMapping['aggregation'];
      columnName = parts[1];

      // Handle special cases
      if (columnName === 'client_id' && aggregation === 'cnt') {
        columnName = 'client_id';
      } else if (columnName === 'bal' && aggregation === 'avg') {
        columnName = 'bal';
      }
    } else {
      // No aggregation, just field name
      columnName = fieldSpec;
    }

    // Map Tableau field names to CSV column names
    const csvColumn = mapTableauFieldToCSVColumn(columnName, aggregation);

    return {
      columnName: csvColumn,
      aggregation,
      requiresCalculation: aggregation !== 'none'
    };
  } catch (error) {
    console.error(`Error parsing Tableau field ${fieldRef}:`, error);
    return null;
  }
}

/**
 * Map Tableau field names to actual CSV column names
 */
function mapTableauFieldToCSVColumn(
  tableauField: string,
  _aggregation: string
): keyof ABTestingDataWithAgeGroup {
  const field = tableauField.toLowerCase();

  // Direct mappings
  const fieldMap: Record<string, keyof ABTestingDataWithAgeGroup> = {
    'client_id': 'client_id',
    'visitor_id': 'visitor_id',
    'visit_id': 'visit_id',
    'process_step': 'process_step',
    'date_time': 'date_time',
    'clnt_tenure_yr': 'clnt_tenure_yr',
    'clnt_tenure_mnth': 'clnt_tenure_mnth',
    'clnt_age': 'clnt_age',
    'gendr': 'gendr',
    'num_accts': 'num_accts',
    'bal': 'bal',
    'calls_6_mnth': 'calls_6_mnth',
    'logons_6_mnth': 'logons_6_mnth',
    'variation': 'Variation',
    'action (variation)': 'Variation',
    'clnt age (group)': 'age_group',
    // Calculated fields map to balance
    'calculation_503488417540866050': 'bal',
    'calculation_503488417541140484': 'bal',
    'cnt': 'client_id'
  };

  // Check direct mapping
  if (field in fieldMap) {
    return fieldMap[field];
  }

  // Handle calculated fields
  if (field.includes('calculation')) {
    // These are computed fields, map to the base field
    if (field.includes('bal') || field.includes('503488417540866050') || field.includes('503488417541140484')) {
      return 'bal';
    }
    // Default to client_id for other calculations
    return 'client_id';
  }

  // Handle cnt aggregation specifically
  if (field.includes('cnt')) {
    return 'client_id';
  }

  // Handle measure names (used in pivot tables)
  if (field.includes('measure names')) {
    return 'client_id'; // Placeholder, actual field depends on context
  }

  // Handle process step aliases
  if (field.includes('process_step') || field.includes('step')) {
    return 'process_step';
  }

  // Handle gender aliases
  if (field.includes('gendr') || field.includes('gender')) {
    return 'gendr';
  }

  // Handle variation aliases
  if (field.includes('variation') || field.includes('variation')) {
    return 'Variation';
  }

  // Default fallback
  console.warn(`Unknown Tableau field: ${tableauField}, mapping to client_id`);
  return 'client_id';
}

/**
 * Validate that all required Tableau fields from the spec can be resolved
 */
export function validateTableauFields(
  worksheetName: string,
  fieldRefs: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  fieldRefs.forEach(fieldRef => {
    const mapping = parseTableauField(fieldRef);
    if (!mapping) {
      errors.push(`Worksheet "${worksheetName}": Cannot resolve field ${fieldRef}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract all unique field references from a worksheet spec
 */
export function extractFieldRefs(worksheet: {
  rows?: { raw?: string };
  cols?: { raw?: string };
  slices?: string[];
  filter?: Array<{ column?: string }>;
}): string[] {
  const refs = new Set<string>();

  if (worksheet.rows?.raw) {
    refs.add(worksheet.rows.raw);
  }
  if (worksheet.cols?.raw) {
    refs.add(worksheet.cols.raw);
  }
  worksheet.slices?.forEach(slice => refs.add(slice));
  worksheet.filter?.forEach(f => {
    if (f.column) refs.add(f.column);
  });

  return Array.from(refs);
}

/**
 * Get a human-readable label for a Tableau field
 */
export function getTableauFieldLabel(fieldRef: string): string {
  const mapping = parseTableauField(fieldRef);
  if (!mapping) {
    return fieldRef;
  }

  const columnName = mapping.columnName;
  const aggregation = mapping.aggregation;

  // Format the label
  const labelMap: Record<string, string> = {
    'client_id': 'Client ID',
    'visitor_id': 'Visitor ID',
    'visit_id': 'Visit ID',
    'process_step': 'Process Step',
    'date_time': 'Date Time',
    'clnt_tenure_yr': 'Client Tenure (Years)',
    'clnt_tenure_mnth': 'Client Tenure (Months)',
    'clnt_age': 'Client Age',
    'gendr': 'Gender',
    'num_accts': 'Number of Accounts',
    'bal': 'Balance',
    'calls_6_mnth': 'Calls (6 Months)',
    'logons_6_mnth': 'Logons (6 Months)',
    'Variation': 'Variation',
    'age_group': 'Age Group'
  };

  let label = labelMap[columnName] || columnName;

  if (aggregation === 'cnt') {
    label = `Count of ${label}`;
  } else if (aggregation === 'avg') {
    label = `Average ${label}`;
  } else if (aggregation === 'sum') {
    label = `Sum of ${label}`;
  } else if (aggregation === 'pcto') {
    label = `Percent of ${label}`;
  }

  return label;
}
