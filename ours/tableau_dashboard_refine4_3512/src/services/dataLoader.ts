import type { DataRow, DataPoint } from '../types/data';

export const loadData = async (url: string = '/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv'): Promise<DataPoint[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  let csvText = await response.text();

  // Remove BOM (Byte Order Mark) if present at the start
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    return [];
  }

  // Parse header line (handle triple quotes, double quotes, and extra spaces)
  const headerLine = lines[0];
  const rawHeaders: string[] = [];
  let currentHeader = '';
  let inQuotes = false;
  let quoteCount = 0;

  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      quoteCount++;
      inQuotes = quoteCount % 2 !== 0;
    } else if (char === ',' && !inQuotes) {
      // Remove all surrounding quotes (handles triple quotes like """Field Name""")
      rawHeaders.push(currentHeader.trim().replace(/^"+|"+$/g, ''));
      currentHeader = '';
      quoteCount = 0;
    } else {
      currentHeader += char;
    }
  }
  // Handle last header
  rawHeaders.push(currentHeader.trim().replace(/^"+|"+$/g, ''));

  // Normalize headers: trim whitespace, remove extra quotes, and ensure exact field name matching
  const headers = rawHeaders.map(h => {
    let normalized = h.trim();
    // Remove any remaining quote characters (handles cases like ""field"" or ""field)
    normalized = normalized.replace(/^"+|"+$/g, '');
    // Remove any extra internal whitespace
    normalized = normalized.replace(/\s+/g, ' ');
    return normalized;
  });

  // Validate that required fields exist
  const requiredFields = ['Date Made Public', 'Company', 'Location', 'Type of breach',
                          'Type of organization', 'Records Breached', 'Total Records',
                          'Description of incident', 'Information Source', 'Source URL'];

  const missingFields = requiredFields.filter(field => !headers.includes(field));
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    console.error('Available headers:', headers);
    throw new Error(`CSV missing required fields: ${missingFields.join(', ')}`);
  }

  // Parse data rows
  const data: DataPoint[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: DataRow = {} as DataRow;
    headers.forEach((header, index) => {
      row[header as keyof DataRow] = values[index] || '';
    });

    // Parse date (try multiple formats)
    const dateStr = row['Date Made Public'];
    if (!dateStr || dateStr.trim() === '') {
      skippedRows++;
      continue; // Skip rows with missing dates
    }

    let date: Date | null = null;

    // Try YYYY-MM-DD first
    let parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }

    // Try MM/DD/YYYY
    if (!date) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        parsed = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        if (!isNaN(parsed.getTime())) {
          date = parsed;
        }
      }
    }

    if (!date || isNaN(date.getTime())) {
      skippedRows++;
      continue; // Skip invalid dates
    }

    // Parse records breached (handle "Unknown" and empty strings)
    const recordsBreachedStr = row['Records Breached'];
    let recordsBreached: number | null = null;
    if (recordsBreachedStr && recordsBreachedStr !== 'Unknown' && recordsBreachedStr !== '') {
      const cleaned = recordsBreachedStr.replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        recordsBreached = num;
      }
    }

    // Parse total records
    const totalRecordsStr = row['Total Records'];
    let totalRecords = 0;
    if (totalRecordsStr && totalRecordsStr !== '') {
      const cleaned = totalRecordsStr.replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        totalRecords = num;
      }
    }

    data.push({
      date,
      year: date.getFullYear(),
      company: row.Company || '',
      location: row.Location || '',
      breachType: row['Type of breach'] || '',
      orgType: row['Type of organization'] || '',
      recordsBreached,
      totalRecords,
      description: row['Description of incident'] || '',
      infoSource: row['Information Source'] || '',
      sourceUrl: row['Source URL'] || '',
    });
  }

  if (data.length === 0) {
    throw new Error(`No valid data rows found. Skipped ${skippedRows} rows due to parsing errors.`);
  }

  if (skippedRows > 0) {
    console.warn(`Skipped ${skippedRows} rows with invalid or missing dates`);
  }

  return data;
};
