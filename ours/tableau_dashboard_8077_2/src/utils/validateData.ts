/**
 * Deterministic Tableau Source Validator
 * Validates that CSV parsing is working correctly and all required fields are present
 */

import { loadCitiBikeData } from '../services/dataLoader';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRecords: number;
    uniqueStartStations: number;
    uniqueEndStations: number;
    hasValidDates: boolean;
    hasValidCoordinates: boolean;
  };
}

export async function validateTableauSource(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Load the data
    const data = await loadCitiBikeData();

    // Check if we have any data
    if (data.length === 0) {
      errors.push('No records loaded from CSV');
      return {
        isValid: false,
        errors,
        warnings,
        summary: {
          totalRecords: 0,
          uniqueStartStations: 0,
          uniqueEndStations: 0,
          hasValidDates: false,
          hasValidCoordinates: false,
        },
      };
    }

    // Validate required fields from Tableau spec
    const requiredFields = [
      'tripduration',
      'starttime',
      'stoptime',
      'start station id',
      'start station name',
      'start station latitude',
      'start station longitude',
      'end station id',
      'end station name',
      'end station latitude',
      'end station longitude',
      'bikeid',
      'usertype',
      'birth year',
      'gender',
    ];

    const firstRecord = data[0];
    for (const field of requiredFields) {
      if (!(field in firstRecord)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check for valid dates (not Jan 1970 which indicates parsing failure)
    const validDates = data.filter(
      (trip) => trip.starttime.getFullYear() > 2000 && trip.stoptime.getFullYear() > 2000
    );

    if (validDates.length === 0) {
      errors.push('All dates appear to be invalid (parsed as Jan 1970 or earlier)');
    }

    // Check for valid coordinates (not all zeros)
    const validCoords = data.filter(
      (trip) =>
        trip['start station latitude'] !== 0 &&
        trip['start station longitude'] !== 0 &&
        trip['end station latitude'] !== 0 &&
        trip['end station longitude'] !== 0
    );

    if (validCoords.length === 0) {
      errors.push('All coordinates appear to be zero (parsing failure)');
    }

    // Check for NaN values in numeric fields
    const hasNaN = data.some(
      (trip) =>
        isNaN(trip.tripduration as number) ||
        isNaN(trip['start station id'] as number) ||
        isNaN(trip['start station latitude'] as number) ||
        isNaN(trip['start station longitude'] as number) ||
        isNaN(trip['end station id'] as number) ||
        isNaN(trip['end station latitude'] as number) ||
        isNaN(trip['end station longitude'] as number) ||
        isNaN(trip.bikeid as number)
    );

    if (hasNaN) {
      errors.push('NaN values found in numeric fields (parsing failure)');
    }

    // Count unique stations
    const uniqueStartStations = new Set(data.map((trip) => trip['start station name'])).size;
    const uniqueEndStations = new Set(data.map((trip) => trip['end station name'])).size;

    // Check for empty station names
    const emptyStartStations = data.filter((trip) => !trip['start station name'] || trip['start station name'].trim() === '').length;
    const emptyEndStations = data.filter((trip) => !trip['end station name'] || trip['end station name'].trim() === '').length;

    if (emptyStartStations > 0) {
      warnings.push(`${emptyStartStations} records have empty start station names`);
    }

    if (emptyEndStations > 0) {
      warnings.push(`${emptyEndStations} records have empty end station names`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRecords: data.length,
        uniqueStartStations,
        uniqueEndStations,
        hasValidDates: validDates.length > 0,
        hasValidCoordinates: validCoords.length > 0,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed with error: ${error instanceof Error ? error.message : String(error)}`],
      warnings,
      summary: {
        totalRecords: 0,
        uniqueStartStations: 0,
        uniqueEndStations: 0,
        hasValidDates: false,
        hasValidCoordinates: false,
      },
    };
  }
}
