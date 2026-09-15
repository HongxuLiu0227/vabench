import type { AccidentRecord, AggregatedData } from '../types/data';

export function parseTimeToHour(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  // Sanitize: remove any carriage returns or other control characters
  const sanitized = timeStr.trim().replace(/[\r\n\t]/g, '');
  const parts = sanitized.split(':');
  const hour = parseInt(parts[0] || '0', 10);
  // Validate hour is in valid range 0-23
  return isNaN(hour) ? 0 : Math.max(0, Math.min(23, hour));
}

export function parseDateToQuarter(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Unknown';
  // Sanitize: remove any carriage returns or other control characters
  const sanitized = dateStr.trim().replace(/[\r\n\t]/g, '');
  const parts = sanitized.split('-');
  if (parts.length < 2) return 'Unknown';

  const month = parseInt(parts[1], 10);
  // Validate month is in valid range 1-12
  if (isNaN(month) || month < 1 || month > 12) return 'Unknown';

  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

export function parseDateToYear(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  // Sanitize: remove any carriage returns or other control characters
  const sanitized = dateStr.trim().replace(/[\r\n\t]/g, '');
  const parts = sanitized.split('-');
  const year = parseInt(parts[2] || '0', 10);
  // Validate year is reasonable (e.g., between 1900 and 2100)
  if (isNaN(year) || year < 1900 || year > 2100) return 0;
  return year;
}

export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek % 7] || 'Unknown';
}

export function getLightConditionsName(code: number): string {
  const conditions: Record<number, string> = {
    1: 'Daylight',
    4: 'Darkness - lights lit',
    5: 'Darkness - lights unlit',
    6: 'Darkness - no lighting',
    7: 'Darkness - lighting unknown',
  };
  return conditions[code] || `Condition ${code}`;
}

export function getAccidentSeverityName(code: number): string {
  const severities: Record<number, string> = {
    1: 'Fatal',
    2: 'Serious',
    3: 'Slight',
  };
  return severities[code] || `Severity ${code}`;
}

export function getUrbanOrRuralName(code: number): string {
  const areas: Record<number, string> = {
    1: 'Urban',
    2: 'Rural',
  };
  return areas[code] || `Area ${code}`;
}

export function aggregateByCategoryAndSeries(
  data: AccidentRecord[],
  categoryFn: (record: AccidentRecord) => string,
  seriesFn: (record: AccidentRecord) => string,
  measureFn: (record: AccidentRecord) => number
): AggregatedData[] {
  const map = new Map<string, Map<string, number>>();

  data.forEach((record) => {
    const category = categoryFn(record);
    const series = seriesFn(record);
    const value = measureFn(record);

    if (!map.has(category)) {
      map.set(category, new Map());
    }
    const seriesMap = map.get(category)!;
    seriesMap.set(series, (seriesMap.get(series) || 0) + value);
  });

  const result: AggregatedData[] = [];
  map.forEach((seriesMap, category) => {
    seriesMap.forEach((value, series) => {
      result.push({ category, series, value });
    });
  });

  return result;
}

export function filterByHighlight(
  data: AccidentRecord[],
  highlights: Record<string, Set<string | number>>
): AccidentRecord[] {
  if (Object.keys(highlights).length === 0) {
    return data;
  }

  return data.filter((record) => {
    return Object.entries(highlights).every(([field, values]) => {
      const recordValue = getFieldValue(record, field);
      return values.has(recordValue);
    });
  });
}

function getFieldValue(record: AccidentRecord, field: string): string | number {
  switch (field) {
    case 'hr:Time:ok':
      return parseTimeToHour(record.Time);
    case 'none:Light_Conditions:nk':
      return record.Light_Conditions;
    case 'none:Accident_Severity:nk':
      return record.Accident_Severity;
    case 'none:Day_of_Week:qk':
      return record.Day_of_Week;
    case 'none:Urban_or_Rural_Area:nk':
      return record.Urban_or_Rural_Area;
    case 'yr:Date:ok':
      return parseDateToYear(record.Date);
    case 'qr:Date:ok':
      return parseDateToQuarter(record.Date);
    default:
      return '';
  }
}

export function applyDayOfWeekFilter(data: AccidentRecord[], selectedDays: Set<number>): AccidentRecord[] {
  if (selectedDays.size === 0) {
    return data;
  }
  return data.filter((record) => selectedDays.has(record.Day_of_Week));
}
