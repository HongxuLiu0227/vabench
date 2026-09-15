import Papa from 'papaparse';
import type { TwitterData } from '../types';

const DATA_URL = '/data/πé¡πââπâêπé½πââπâê.csv';

/**
 * Tableau Data Ingestion Service
 *
 * IMPORTANT: Tableau calculated fields are generated at runtime, not present in source CSV.
 *
 * Source CSV fields (from public/data/πé¡πââπâêπé½πââπâê.csv):
 *   - 投稿日時 (date string in YYYY/MM/DD format)
 *   - 媒体 (string)
 *   - ユーザプロフィールURL (string)
 *   - 投稿URL/キャプチャー (string)
 *   - 投稿内容 (string)
 *   - コメント数 (numeric string, may be quoted)
 *   - リツイート数 (numeric string, may be quoted)
 *   - いいね数 (numeric string, may be quoted)
 *   - 検索ワード (string)
 *
 * Runtime-generated Tableau fields (added by this service):
 *   - Number of Records: Always 1 (Tableau system field for row counting)
 *   - Calculation_269090137308614656: Maps to 投稿URL/キャプチャー (used in いいね数 worksheet)
 *   - Calculation_269090137310105601: Maps to 投稿URL/キャプチャー (used in リツイート数 worksheet)
 *   - Calculation_269090137311887363: Maps to 投稿URL/キャプチャー (used in コメント数 worksheet)
 *
 * See public/data/.tableau-schema.json for complete field documentation.
 */
export async function loadTwitterData(): Promise<TwitterData[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  let csvText = await response.text();

  // Remove UTF-8 BOM if present (deterministic BOM handling)
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  // Normalize quoted headers by removing extra quotes
  // This handles headers like ""Order Date"" or "Order Date"
  csvText = csvText.replace(/^"([^"]+)"(?=,)/gm, '$1').replace(/,"([^"]+)"(?=,|\n)/g, ',$1');

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Remove any remaining quotes from headers
        return header.replace(/^"|"$/g, '').trim();
      },
      complete: (results) => {
        try {
          // Track parsing statistics
          let successfulDateParses = 0;
          let totalRows = results.data.length;
          const actualHeaders = results.meta.fields || [];

          // Log parsing results for debugging
          console.log('[Data Ingestion] CSV parsed successfully:', {
            totalRows,
            errors: results.errors.length,
            meta: results.meta,
            sourceFields: actualHeaders,
            runtimeFields: ['Number of Records', 'Calculation_269090137308614656', 'Calculation_269090137310105601', 'Calculation_269090137311887363']
          });

          // Log any parsing errors
          if (results.errors.length > 0) {
            console.warn('[Data Ingestion] Parse errors detected:', results.errors);
          }

          const data = results.data.map((row: unknown) => {
            const record = row as Record<string, string>;

            // Parse date field and track success
            const dateValue = record['投稿日時'] || record['\uFEFF投稿日時'] || '';
            const parsedDate = parseDate(dateValue);
            if (parsedDate && !isNaN(parsedDate.getTime()) && parsedDate.getTime() > 0) {
              successfulDateParses++;
            }

            // Parse base fields
            const postUrl = record['投稿URL/キャプチャー'] || record['投稿URL/キャプチャ'] || '';
            const likesCount = parseNumber(record['いいね数']);
            const retweetsCount = parseNumber(record['リツイート数']);
            const commentsCount = parseNumber(record['コメント数']);

            // Use exact field names with fallbacks for robustness
            // After BOM removal and normalization, headers should match exactly
            return {
              投稿日時: parsedDate,
              媒体: record['媒体'] || '',
              ユーザプロフィールURL: record['ユーザプロフィールURL'] || '',
              投稿URLキャプチャー: postUrl,
              投稿内容: record['投稿内容'] || '',
              コメント数: commentsCount,
              リツイート数: retweetsCount,
              いいね数: likesCount,
              検索ワード: record['検索ワード'] || '',
              // Tableau calculated fields for compatibility
              'Number of Records': 1,
              // These Calculation fields are used for highlight interactions in Tableau
              // We'll use the post URL as a stable identifier for grouping
              'Calculation_269090137308614656': postUrl, // Used with いいね数 in "いいね数" worksheet
              'Calculation_269090137310105601': postUrl, // Used with リツイート数 in "リツイート数" worksheet
              'Calculation_269090137311887363': postUrl, // Used with コメント数 in "コメント数" worksheet
            };
          }).filter((row): row is TwitterData => {
            // Filter out completely empty rows that might have slipped through
            return row.投稿日時 && !isNaN(row.投稿日時.getTime());
          });

          const dateParseRatio = totalRows > 0 ? successfulDateParses / totalRows : 0;

          // Log final data quality metrics
          console.log('[Data Ingestion] Data processed:', {
            validRows: data.length,
            dateParseRatio: dateParseRatio.toFixed(2),
            dateParseStats: { successful: successfulDateParses, total: totalRows },
            dateRange: data.length > 0 ? {
              earliest: new Date(Math.min(...data.map(d => d.投稿日時.getTime()))).toISOString(),
              latest: new Date(Math.max(...data.map(d => d.投稿日時.getTime()))).toISOString()
            } : null,
            metrics: data.length > 0 ? {
              totalLikes: data.reduce((sum, d) => sum + d.いいね数, 0),
              totalRetweets: data.reduce((sum, d) => sum + d.リツイート数, 0),
              totalComments: data.reduce((sum, d) => sum + d.コメント数, 0)
            } : null
          });

          resolve(data);
        } catch (err) {
          console.error('[Data Ingestion] Error processing data:', err);
          reject(err);
        }
      },
      error: (err: unknown) => {
        console.error('[Data Ingestion] Parse error:', err);
        reject(err);
      }
    });
  });
}

function parseDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('[Date Parsing] Invalid date string, using current date:', dateStr);
    return new Date();
  }

  // Clean the string - remove quotes, trim whitespace
  const cleaned = dateStr.replace(/^"|"$/g, '').trim();

  if (!cleaned) {
    console.warn('[Date Parsing] Empty date string after cleaning, using current date');
    return new Date();
  }

  // Handle formats like "2019/11/28" (YYYY/MM/DD) - most common in Japanese data
  const parts = cleaned.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      // Validate the date is reasonable
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        // Log successful parse for debugging
        console.log('[Date Parsing] Successfully parsed:', cleaned, '->', date.toISOString());
        return date;
      }
    }
  }

  // Fallback to native Date parsing for other formats
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) {
    console.warn('[Date Parsing] Failed to parse date, using current date:', cleaned);
    return new Date();
  }

  console.log('[Date Parsing] Parsed with fallback:', cleaned, '->', date.toISOString());
  return date;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  if (!value) return 0;

  // Convert to string and clean
  const strValue = String(value).replace(/^"|"$/g, '').trim();

  if (!strValue) return 0;

  const parsed = parseFloat(strValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function filterData(
  data: TwitterData[],
  selectedUser: string | null,
  selectedPost: string | null,
  selectedDate: Date | null
): TwitterData[] {
  return data.filter((row) => {
    if (selectedUser && row.ユーザプロフィールURL !== selectedUser) {
      return false;
    }
    if (selectedPost && row.投稿URLキャプチャー !== selectedPost) {
      return false;
    }
    if (selectedDate) {
      const rowDate = new Date(row.投稿日時);
      rowDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(selectedDate);
      compareDate.setHours(0, 0, 0, 0);
      if (rowDate.getTime() !== compareDate.getTime()) {
        return false;
      }
    }
    return true;
  });
}

export function aggregateByUser(data: TwitterData[]): Map<string, TwitterData[]> {
  const grouped = new Map<string, TwitterData[]>();
  data.forEach((row) => {
    const user = row.ユーザプロフィールURL;
    if (!grouped.has(user)) {
      grouped.set(user, []);
    }
    grouped.get(user)!.push(row);
  });
  return grouped;
}

export function aggregateByPost(data: TwitterData[]): Map<string, TwitterData[]> {
  const grouped = new Map<string, TwitterData[]>();
  data.forEach((row) => {
    const post = row.投稿URLキャプチャー;
    if (!grouped.has(post)) {
      grouped.set(post, []);
    }
    grouped.get(post)!.push(row);
  });
  return grouped;
}

export function aggregateByDate(data: TwitterData[]): Map<string, TwitterData[]> {
  const grouped = new Map<string, TwitterData[]>();
  data.forEach((row) => {
    const date = new Date(row.投稿日時);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(row);
  });
  return grouped;
}
