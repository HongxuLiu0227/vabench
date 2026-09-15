import type { HospitalData, FacilityWithMeasures, StateRecord } from '../types';

export class DataService {
  private data: HospitalData[] = [];
  private loaded = false;

  async loadData(): Promise<void> {
    if (this.loaded) return;

    try {
      const response = await fetch('/data/tg1.csv');
      const csvText = await response.text();

      this.data = this.parseCSV(csvText);
      this.loaded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Normalize CSV header by stripping BOM, quotes, and whitespace
   * This is required for quoted/dirty headers like """facility_name"""
   */
  private normalizeHeader(header: string): string {
    // Strip BOM if present
    let text = header.replace('\ufeff', '');
    // Strip triple quotes
    text = text.replace(/^"""/, '').replace(/"""$/, '');
    // Strip single quotes
    text = text.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  private parseCSV(csvText: string): HospitalData[] {
    // Strip UTF-8 BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      console.warn('CSV has insufficient lines');
      return [];
    }

    // Normalize headers - strip triple quotes and extra quotes
    const headerLine = lines[0];
    const headers = this.parseCSVLine(headerLine).map(h => this.normalizeHeader(h));

    const data: HospitalData[] = [];
    let skippedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);

      if (values.length < headers.length) {
        skippedRows++;
        continue;
      }

      const facilityName = values[0] || '';
      const row: HospitalData = {
        facility_name: facilityName,
        'facility_name (questao5)': facilityName, // Alias field for Tableau interactions
        city: values[1] || '',
        state: values[2] || '',
        score_avg_infection: this.parseNumeric(values[3]),
        score_avg_eficacia: this.parseNumeric(values[4]),
        Number_of_Records: 1, // Tableau standard field for counting records
      };

      // Only add valid rows
      if (row.facility_name && row.state) {
        data.push(row);
      }
    }

    if (skippedRows > 0) {
      console.warn(`Skipped ${skippedRows} malformed rows during CSV parsing`);
    }

    console.log(`Parsed ${data.length} valid rows from CSV`);

    return data;
  }

  /**
   * Parse a CSV line handling quoted fields with commas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quotes
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());

    return result;
  }

  /**
   * Parse a numeric value, returning NaN for invalid numbers
   */
  private parseNumeric(value: string): number {
    const cleaned = value.trim().replace(/^"|"$/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  getAllData(): HospitalData[] {
    return [...this.data];
  }

  getFacilitiesWithMeasures(): FacilityWithMeasures[] {
    return this.data.map(row => ({
      facility_name: row.facility_name,
      measures: [
        { measure_name: 'score_avg_infection', value: row.score_avg_infection },
        { measure_name: 'score_avg_eficacia', value: row.score_avg_eficacia },
      ],
    }));
  }

  getStateRecords(): StateRecord[] {
    const stateMap = new Map<string, { count: number; total_infection: number }>();

    this.data.forEach(row => {
      const existing = stateMap.get(row.state) || { count: 0, total_infection: 0 };
      stateMap.set(row.state, {
        count: existing.count + 1,
        total_infection: existing.total_infection + row.score_avg_infection,
      });
    });

    return Array.from(stateMap.entries())
      .map(([state, stats]) => ({
        state,
        count: stats.count,
        avg_infection: stats.total_infection / stats.count,
      }))
      .sort((a, b) => b.avg_infection - a.avg_infection);
  }

  filterByState(state: string): HospitalData[] {
    return this.data.filter(row => row.state === state);
  }

  filterByFacility(facilityName: string): HospitalData[] {
    return this.data.filter(row => row.facility_name === facilityName);
  }

  getInfectionRanges(): { range: string; count: number }[] {
    const ranges = [
      { min: 0, max: 1650, label: '0-1650' },
      { min: 1650, max: 2650, label: '1650-2650' },
      { min: 2650, max: 3700, label: '2650-3700' },
      { min: 3700, max: 4700, label: '3700-4700' },
      { min: 4700, max: 6300, label: '4700-6300' },
    ];

    return ranges.map(range => ({
      range: range.label,
      count: this.data.filter(
        row => row.score_avg_infection >= range.min && row.score_avg_infection < range.max
      ).length,
    }));
  }

  getAverageInfection(): number {
    if (this.data.length === 0) return 0;
    const total = this.data.reduce((sum, row) => sum + row.score_avg_infection, 0);
    return total / this.data.length;
  }

  getAboveAverageCount(): number {
    const avg = this.getAverageInfection();
    return this.data.filter(row => row.score_avg_infection > avg).length;
  }
}

export const dataService = new DataService();
