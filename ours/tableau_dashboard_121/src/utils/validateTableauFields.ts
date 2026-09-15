/**
 * Validation utility to ensure Tableau spec fields can be resolved to actual CSV columns
 */

export interface FieldMapping {
  tableauField: string;
  csvColumn: string;
  found: boolean;
  sampleValue?: any;
}

/**
 * Extract field name from Tableau's federated field notation
 * Example: "[federated.0azm2i115epm0e12562z51akj8sy].[none:Category:nk]"
 * Returns: "Category"
 */
export const extractFieldName = (tableauField: string): string => {
  const match = tableauField.match(/\[none:([^:]+):nk\]|\[sum:([^:]+):qk\]|\[tmn:([^:]+):qk\]|\[ctd:([^:]+):ok\]|\[yr:([^:]+):ok\]/);
  if (match) {
    // Return the first capturing group that matched
    return match[1] || match[2] || match[3] || match[4] || match[5] || '';
  }
  return '';
};

/**
 * Validate that all required Tableau fields from the spec can be resolved to CSV columns
 */
export const validateTableauFields = (
  data: any[],
  tableauFields: string[]
): FieldMapping[] => {
  if (data.length === 0) {
    throw new Error('No data available for validation');
  }

  const sampleRow = data[0];
  const csvColumns = Object.keys(sampleRow);

  return tableauFields.map(tableauField => {
    const fieldName = extractFieldName(tableauField);
    const found = csvColumns.includes(fieldName);

    return {
      tableauField,
      csvColumn: fieldName,
      found,
      sampleValue: found ? sampleRow[fieldName] : undefined
    };
  });
};

/**
 * Log validation results
 */
export const logValidationResults = (mappings: FieldMapping[]): void => {
  console.log('\n=== Tableau Field Validation ===');

  const allFound = mappings.every(m => m.found);

  mappings.forEach(mapping => {
    const status = mapping.found ? '✓' : '✗';
    const sample = mapping.sampleValue !== undefined
      ? ` (sample: ${JSON.stringify(mapping.sampleValue).slice(0, 50)})`
      : '';
    console.log(`${status} ${mapping.tableauField} -> "${mapping.csvColumn}"${sample}`);
  });

  console.log(`\n${allFound ? '✓ All fields resolved successfully' : '✗ Some fields could not be resolved'}\n`);
};

/**
 * Get all unique field references from Tableau spec
 */
export const extractFieldsFromSpec = (spec: any): string[] => {
  const fields = new Set<string>();

  // Extract from worksheets
  if (spec.worksheets) {
    spec.worksheets.forEach((worksheet: any) => {
      // Rows
      if (worksheet.rows?.fields) {
        worksheet.rows.fields.forEach((f: string) => fields.add(f));
      }
      // Cols
      if (worksheet.cols?.fields) {
        worksheet.cols.fields.forEach((f: string) => fields.add(f));
      }
      // Encodings
      if (worksheet.encodings) {
        Object.values(worksheet.encodings).forEach((encoding: any) => {
          if (Array.isArray(encoding)) {
            encoding.forEach((e: any) => {
              if (e.column) fields.add(e.column);
            });
          }
        });
      }
      // Filters (not present in current spec but good to have)
      if (worksheet.filter?.fields) {
        worksheet.filter.fields.forEach((f: string) => fields.add(f));
      }
    });
  }

  return Array.from(fields);
};
