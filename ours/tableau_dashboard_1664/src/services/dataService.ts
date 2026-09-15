import Papa from 'papaparse';
import type { MarsData, AggregatedMarsData, TemperatureData, SolData, PressureData, SeasonSolData } from '../types/marsData';

class DataService {
  private marsData: MarsData[] | null = null;
  private aggregatedData: Map<string, AggregatedMarsData> | null = null;

  async loadMarsData(): Promise<MarsData[]> {
    if (this.marsData) {
      return this.marsData;
    }

    try {
      const response = await fetch('/data/mars_data.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const csvText = await response.text();

      const parsed = Papa.parse<MarsData>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      // Add Tableau calculated fields
      this.marsData = parsed.data.map(row => {
        const tempFluctuation = Number(row.max_temp) - Number(row.min_temp);

        // Calculation_1174595120371273730: Sol (group) - bin sol values into ranges
        let solGroup = '';
        if (row.sol < 500) solGroup = '0-499';
        else if (row.sol < 1000) solGroup = '500-999';
        else if (row.sol < 1500) solGroup = '1000-1499';
        else if (row.sol < 2000) solGroup = '1500-1999';
        else solGroup = '2000+';

        // Calculation_1174595120362745857: Month value reference
        const calc2 = row.month;

        // Calculation_1174595120373465091: Temperature fluctuation category
        let tempFluctuationCategory = '';
        if (tempFluctuation < 60) tempFluctuationCategory = 'Low';
        else if (tempFluctuation < 70) tempFluctuationCategory = 'Medium';
        else tempFluctuationCategory = 'High';

        return {
          ...row,
          Calculation_1174595120371273730: solGroup,
          Calculation_1174595120362745857: calc2,
          Calculation_1174595120373465091: tempFluctuationCategory,
        };
      });

      this.computeAggregations();
      return this.marsData;
    } catch (error) {
      console.error('Error loading Mars data:', error);
      throw error;
    }
  }

  private computeAggregations() {
    if (!this.marsData) return;

    this.aggregatedData = new Map();

    this.marsData.forEach((row) => {
      const key = row.month;
      const existing = this.aggregatedData!.get(key);

      if (existing) {
        existing.avg_min_temp += Number(row.min_temp);
        existing.avg_max_temp += Number(row.max_temp);
        existing.avg_pressure += Number(row.pressure);
        existing.sum_sol += Number(row.sol);
        existing.count += 1;
      } else {
        this.aggregatedData!.set(key, {
          month: row.month,
          avg_min_temp: Number(row.min_temp),
          avg_max_temp: Number(row.max_temp),
          avg_pressure: Number(row.pressure),
          sum_sol: Number(row.sol),
          count: 1,
          Season: row.Season,
        });
      }
    });
  }

  getAggregatedData(): AggregatedMarsData[] {
    if (!this.aggregatedData) {
      return [];
    }

    return Array.from(this.aggregatedData.values()).map((d) => ({
      ...d,
      avg_min_temp: d.avg_min_temp / d.count,
      avg_max_temp: d.avg_max_temp / d.count,
      avg_pressure: d.avg_pressure / d.count,
    }));
  }

  getSolData(): SolData[] {
    if (!this.marsData) return [];

    return this.marsData.map((d) => ({
      sol: d.sol,
      max_temp: Number(d.max_temp),
      month: d.month,
      Season: d.Season,
    }));
  }

  getTemperatureData(): TemperatureData[] {
    const aggregated = this.getAggregatedData();

    return aggregated.flatMap((d) => [
      {
        month: d.month,
        measure: 'avg:max_temp' as const,
        value: d.avg_max_temp,
      },
      {
        month: d.month,
        measure: 'avg:min_temp' as const,
        value: d.avg_min_temp,
      },
    ]);
  }

  getPressureData(): PressureData[] {
    const aggregated = this.getAggregatedData();

    return aggregated.map((d) => ({
      month: d.month,
      avg_pressure: d.avg_pressure,
      Season: d.Season,
    }));
  }

  getSeasonSolData(): SeasonSolData[] {
    if (!this.marsData) return [];

    const seasonMap = new Map<string, number>();

    this.marsData.forEach((d) => {
      const existing = seasonMap.get(d.Season) || 0;
      seasonMap.set(d.Season, existing + Number(d.sol));
    });

    return Array.from(seasonMap.entries()).map(([season, sum_sol]) => ({
      season,
      sum_sol,
    }));
  }

  getMonthRangeTempData(): Array<{ month: string; temp_range: number }> {
    const aggregated = this.getAggregatedData();

    return aggregated.map((d) => ({
      month: d.month,
      temp_range: d.avg_max_temp - d.avg_min_temp,
    }));
  }
}

export const dataService = new DataService();
