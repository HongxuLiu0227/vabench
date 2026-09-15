/**
 * Tableau Field Validator
 * Validates that all required Tableau fields from the spec resolve to real columns at runtime
 */

import type { DataRecord } from '../types/data';

/**
 * Maps Tableau field names from the spec to actual CSV column names
 */
const TABLEAU_FIELD_MAPPING: Record<string, keyof DataRecord> = {
  // Campaign field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk]': 'campaign',

  // Channel field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]': 'channel',

  // Control field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok]': 'control',
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:nk]': 'control',

  // Event field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]': 'event',

  // UID field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:uid:nk]': 'uid',

  // Timestamp field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:ts:nk]': 'ts',

  // Date field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:dadd:nk]': 'dadd',

  // Calculated field (COUNTD users)
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]': 'uid', // Uses uid for COUNTD
};

/**
 * Validate that a sample record has all required Tableau fields
 */
export function validateTableauFields(sampleRecord: DataRecord): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all mapped fields have valid values
  Object.entries(TABLEAU_FIELD_MAPPING).forEach(([tableauField, dataField]) => {
    const value = sampleRecord[dataField];

    if (value === undefined || value === null || value === '') {
      errors.push(
        `Tableau field "${tableauField}" maps to "${dataField}" but has no value in sample record`
      );
    }

    // Type validation for numeric fields
    if (dataField === 'control' || dataField === 'uid') {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(
          `Tableau field "${tableauField}" maps to numeric field "${dataField}" but value is not a valid number: ${value}`
        );
      }
    }
  });

  // Check for specific data quality issues
  if (sampleRecord.campaign === undefined || sampleRecord.campaign === '') {
    errors.push('Campaign field is empty - this will cause all charts to fail');
  }

  if (sampleRecord.channel === undefined || sampleRecord.channel === '') {
    errors.push('Channel field is empty - this will cause Sheet 3 and Sheet 5 to fail');
  }

  if (sampleRecord.event === undefined || sampleRecord.event === '') {
    errors.push('Event field is empty - this will cause Sheet 2 (Funnel) to fail');
  }

  if (sampleRecord.control !== 0 && sampleRecord.control !== 1) {
    warnings.push(
      `Control field has unexpected value: ${sampleRecord.control}. Expected 0 (Target) or 1 (Control)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get a list of all required Tableau fields from the spec
 */
export function getRequiredTableauFields(): string[] {
  return Object.keys(TABLEAU_FIELD_MAPPING);
}

/**
 * Map a Tableau field name to the actual data field name
 */
export function mapTableauField(tableauField: string): keyof DataRecord | null {
  return TABLEAU_FIELD_MAPPING[tableauField] || null;
}
