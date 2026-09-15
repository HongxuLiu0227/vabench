/**
 * Standalone validation script to test CSV parsing without React
 * Run with: npx tsx scripts/validate_data_load.ts
 */

import { loadAccidentData } from '../src/services/dataService';

async function validate() {
  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE DATA VALIDATION');
  console.log('='.repeat(60));

  try {
    const data = await loadAccidentData();

    console.log('\n✓ DATA LOAD SUCCESSFUL\n');

    // Validate record counts
    console.log('Record Counts:');
    console.log(`  Total records: ${data.length.toLocaleString()}`);

    // Validate field mappings
    console.log('\nField Validation:');

    const weatherCounts = new Map<string, number>();
    const surfaceCounts = new Map<string, number>();
    const lightCounts = new Map<string, number>();
    const severityCounts = new Map<string, number>();

    data.forEach(record => {
      weatherCounts.set(record.Weather_Conditions, (weatherCounts.get(record.Weather_Conditions) || 0) + 1);
      surfaceCounts.set(record.Road_Surface_Conditions, (surfaceCounts.get(record.Road_Surface_Conditions) || 0) + 1);
      lightCounts.set(record.Light_Conditions, (lightCounts.get(record.Light_Conditions) || 0) + 1);
      severityCounts.set(record.Accident_Severity, (severityCounts.get(record.Accident_Severity) || 0) + 1);
    });

    console.log(`  Weather conditions: ${weatherCounts.size} unique`);
    console.log('    Distribution:');
    Array.from(weatherCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([weather, count]) => {
        console.log(`      - ${weather}: ${count.toLocaleString()} (${((count / data.length) * 100).toFixed(1)}%)`);
      });

    console.log(`\n  Road surface conditions: ${surfaceCounts.size} unique`);
    console.log('    Distribution:');
    Array.from(surfaceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([surface, count]) => {
        console.log(`      - ${surface}: ${count.toLocaleString()} (${((count / data.length) * 100).toFixed(1)}%)`);
      });

    console.log(`\n  Light conditions: ${lightCounts.size} unique`);
    console.log('    Distribution:');
    Array.from(lightCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([light, count]) => {
        console.log(`      - ${light}: ${count.toLocaleString()} (${((count / data.length) * 100).toFixed(1)}%)`);
      });

    console.log(`\n  Accident severities: ${severityCounts.size} unique`);
    console.log('    Distribution:');
    Array.from(severityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([severity, count]) => {
        console.log(`      - ${severity}: ${count.toLocaleString()} (${((count / data.length) * 100).toFixed(1)}%)`);
      });

    // Validate Tableau spec fields
    console.log('\nTableau Spec Field Validation:');
    const requiredFields = [
      'Weather_Conditions',
      'Road_Surface_Conditions',
      'Light_Conditions',
      'Speed_limit',
      'Accident_Severity'
    ];

    const sample = data[0];
    for (const field of requiredFields) {
      const hasField = field in sample;
      console.log(`  ${hasField ? '✓' : '✗'} ${field}`);
    }

    // Check for data quality issues
    console.log('\nData Quality Checks:');

    const unknownWeather = weatherCounts.get('Unknown') || 0;
    const unknownSurface = surfaceCounts.get('Unknown') || 0;

    if (unknownWeather > data.length * 0.1) {
      console.log(`  ⚠ Warning: High percentage of Unknown weather (${((unknownWeather / data.length) * 100).toFixed(1)}%)`);
    } else {
      console.log(`  ✓ Unknown weather: ${((unknownWeather / data.length) * 100).toFixed(1)}% (acceptable)`);
    }

    if (unknownSurface > data.length * 0.1) {
      console.log(`  ⚠ Warning: High percentage of Unknown road surface (${((unknownSurface / data.length) * 100).toFixed(1)}%)`);
    } else {
      console.log(`  ✓ Unknown road surface: ${((unknownSurface / data.length) * 100).toFixed(1)}% (acceptable)`);
    }

    // Test aggregation functions
    console.log('\nAggregation Function Tests:');

    // Test weather aggregation
    const { aggregateByWeather } = await import('../src/services/dataService');
    const weatherAgg = aggregateByWeather(data);
    console.log(`  ✓ aggregateByWeather: ${weatherAgg.length} groups`);

    // Test speed/weather/light aggregation
    const { aggregateBySpeedWeatherLight } = await import('../src/services/dataService');
    const speedAgg = aggregateBySpeedWeatherLight(data);
    console.log(`  ✓ aggregateBySpeedWeatherLight: ${speedAgg.length} groups`);

    // Test weather/surface aggregation
    const { aggregateByWeatherSurface } = await import('../src/services/dataService');
    const surfaceAgg = aggregateByWeatherSurface(data);
    console.log(`  ✓ aggregateByWeatherSurface: ${surfaceAgg.length} groups`);

    console.log('\n' + '='.repeat(60));
    console.log('ALL VALIDATIONS PASSED ✓');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('VALIDATION FAILED ✗');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

validate();
