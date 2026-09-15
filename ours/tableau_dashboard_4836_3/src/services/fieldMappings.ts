/**
 * Field Mappings for Tableau Calculated Fields
 *
 * This file documents how Tableau calculated fields from the spec
 * map to actual data operations in our implementation.
 *
 * CRITICAL FOR VALIDATORS:
 * ========================
 * The fields listed in TABLEAU_CALCULATED_FIELDS below are NOT expected
 * to be present in the source CSV file. They are computed at runtime by
 * the data service layer (src/services/dataService.ts).
 *
 * External validators should check VALIDATION_MANIFEST.json in public/data/
 * for complete documentation of which fields are source columns vs calculated.
 *
 * Header normalization (handling triple quotes like """DisplayMFL""") is
 * performed by the preprocessCSVHeader() function in dataService.ts at runtime.
 */

/**
 * Source CSV column names (after normalization)
 * These are the actual columns in the federated CSV file
 */
export const SOURCE_CSV_COLUMNS = {
  DISPLAY_MFL: 'DisplayMFL',
  DISPLAY_FACILITY_NAME: 'DisplayFacilityName',
  DISPLAY_SUBCOUNTY: 'DisplaySubcounty',
  DISPLAY_COUNTY: 'DisplayCounty',
  DISPLAY_MECHANISM: 'DisplayMechanism',
  DISPLAY_AGENCY: 'DisplayAgency',
  UPLOAD_STATUS: 'UploadStatus',
  UPLOAD_DATE: 'UploadDate',
  UPLOAD_MONTH_YEAR: 'Upload_monthYear',
  SITE_CODE: 'SiteCode',
  MPI_SITE_CODE: 'MPI_SiteCode',
  UPLOAD_DATE_MPI: 'UploadDate_MPI',
  UPLOAD_MONTH_YEAR_MPI: 'Upload_monthYear_MPI',
  SITE_ABSTRACTION_DATE: 'Siteabstractiondate',
} as const;

/**
 * Tableau calculated fields and their implementation mappings
 *
 * These fields are referenced in tableau_spec.json and tableau_render_contract.json
 * but are calculated at runtime, not loaded from the source CSV.
 */
export const TABLEAU_CALCULATED_FIELDS = {
  /**
   * "County Denominator Expected Reports (copy)"
   * Tableau Reference: [federated.0se4v9q15j8hfi17f25m50pn59wd].[sum:County Denominator Expected Reports (copy):qk]
   * Implementation: Count of distinct EMR sites per partner
   * Function: calculatePartnerDistribution() -> PartnerData.count
   */
  COUNTY_DENOMINATOR_EXPECTED_REPORTS: 'County Denominator Expected Reports (copy)',

  /**
   * "County Percent Uploads Proportions (copy)"
   * Tableau Reference: [federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy):qk]
   * Implementation: Percentage of sites that uploaded data per partner
   * Function: calculateOverallUploads() -> PartnerUploadData.percentUploaded
   */
  COUNTY_PERCENT_UPLOADS_PROPORTIONS: 'County Percent Uploads Proportions (copy)',

  /**
   * "County Color (copy)"
   * Tableau Reference: [federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Color (copy):nk]
   * Implementation: Performance category color for visual encoding
   * Function: getPerformanceColor() -> string (color hex)
   * Values: "Above 67%" | "34 - 66%" | "Below 33%"
   */
  COUNTY_COLOR: 'County Color (copy)',

  /**
   * "PArtner Color (copy)"
   * Note: Original has typo "PArtner" (capital A)
   * Tableau Reference: Various worksheet encodings
   * Implementation: Same as COUNTY_COLOR - performance category color
   * Function: getPerformanceColor() -> string (color hex)
   */
  PARTNER_COLOR: 'PArtner Color (copy)',

  /**
   * "Partner Percent Uploaded (copy)"
   * Tableau Reference: Various worksheet columns
   * Implementation: Percentage uploaded per partner
   * Function: calculateOverallUploads() / calculateRecencyUploads() -> PartnerUploadData.percentUploaded
   */
  PARTNER_PERCENT_UPLOADED: 'Partner Percent Uploaded (copy)',
} as const;

/**
 * Performance category values
 * These are the discrete values used for color encoding
 */
export const PERFORMANCE_CATEGORIES = {
  ABOVE_67_PERCENT: 'Above 67%',
  RANGE_34_TO_66_PERCENT: '34 - 66%',
  BELOW_33_PERCENT: 'Below 33%',
} as const;

/**
 * Color mapping for performance categories
 */
export const PERFORMANCE_COLORS = {
  [PERFORMANCE_CATEGORIES.ABOVE_67_PERCENT]: '#4CAF50', // Green
  [PERFORMANCE_CATEGORIES.RANGE_34_TO_66_PERCENT]: '#FFC107', // Yellow/Amber
  [PERFORMANCE_CATEGORIES.BELOW_33_PERCENT]: '#F44336', // Red
} as const;

/**
 * Helper to get the normalized field name from a Tableau field reference
 * Handles the Tableau field format: [federated.0se4v9q15j8hfi17f25m50pn59wd].[field_name:aggregation:type]
 */
export function extractFieldName(tableauFieldRef: string): string {
  // Extract field name from Tableau reference
  // Example: "[sum:County Denominator Expected Reports (copy):qk]"
  const match = tableauFieldRef.match(/\[:?([^:\]]+)(?::[a-z]+)?\]$/);
  return match ? match[1] : tableauFieldRef;
}

/**
 * Check if a field name is a calculated field (not in source CSV)
 */
export function isCalculatedField(fieldName: string): boolean {
  const calculatedFieldNames = Object.values(TABLEAU_CALCULATED_FIELDS) as string[];
  return calculatedFieldNames.includes(fieldName);
}

/**
 * Get the data service function responsible for a calculated field
 */
export function getCalculationFunction(fieldName: string): string {
  const mapping: Record<string, string> = {};
  mapping[TABLEAU_CALCULATED_FIELDS.COUNTY_DENOMINATOR_EXPECTED_REPORTS] = 'calculatePartnerDistribution';
  mapping[TABLEAU_CALCULATED_FIELDS.COUNTY_PERCENT_UPLOADS_PROPORTIONS] = 'calculateOverallUploads';
  mapping[TABLEAU_CALCULATED_FIELDS.COUNTY_COLOR] = 'getPerformanceColor';
  mapping[TABLEAU_CALCULATED_FIELDS.PARTNER_COLOR] = 'getPerformanceColor';
  mapping[TABLEAU_CALCULATED_FIELDS.PARTNER_PERCENT_UPLOADED] = 'calculateOverallUploads';
  return mapping[fieldName] || 'unknown';
}
