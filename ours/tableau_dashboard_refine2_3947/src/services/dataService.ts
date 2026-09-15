import * as d3Dsv from 'd3-dsv';
import type { ScotusVote, AggregatedVoteData, PrecedentData, CareerVotesData, VoteDirection, IssueArea } from '../types';

const DATA_URL = '/data/TEMP_17c8nuo10pkc6t16hq2ut064xifx.csv';

let cachedData: ScotusVote[] | null = null;

/**
 * Normalizes CSV headers by removing extra quotes
 * Handles cases like """F1""" or "justice" -> F1, justice
 */
function normalizeHeader(header: string): string {
  // Remove triple quotes: """F1""" -> F1
  let normalized = header.replace(/^"""/g, '').replace(/"""$/g, '');
  // Remove double quotes: "justice" -> justice
  normalized = normalized.replace(/^"/g, '').replace(/"$/g, '');
  return normalized.trim();
}

/**
 * Normalizes all column names in a parsed CSV row
 */
function normalizeRowKeys(row: d3Dsv.DSVRowString): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeHeader(key);
    normalized[normalizedKey] = value;
  }
  return normalized;
}

export async function loadScotusData(): Promise<ScotusVote[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Parse the CSV - d3-dsv handles quoted fields correctly
    const parsed = d3Dsv.csvParse(csvText);

    cachedData = parsed.map((row: d3Dsv.DSVRowString) => {
      // Normalize headers with triple quotes
      const normalizedRow = normalizeRowKeys(row);
      const vote: ScotusVote = {
        F1: Number(normalizedRow.F1 || 0),
        justice: Number(normalizedRow.justice || 0),
        justiceName: String(normalizedRow.justiceName || ''),
        majVotes: Number(normalizedRow.majVotes || 0),
        minVotes: Number(normalizedRow.minVotes || 0),
        decisionDirection: Number(normalizedRow.decisionDirection || 0),
        majority: Number(normalizedRow.majority || 0),
        caseId: String(normalizedRow.caseId || ''),
        term: Number(normalizedRow.term || 0),
        partyWinning: Number(normalizedRow.partyWinning || 0),
        precedentAlteration: Number(normalizedRow.precedentAlteration || 0),
        vote: Number(normalizedRow.vote || 0),
        issueArea: Number(normalizedRow.issueArea || 0) as IssueArea,
        vote_direction: Number(normalizedRow.vote_direction || 0) as VoteDirection,
      };
      return vote;
    });

    return cachedData;
  } catch (error) {
    console.error('Error loading SCOTUS data:', error);
    throw error;
  }
}

export function filterData(
  data: ScotusVote[],
  issueAreas?: Set<IssueArea>,
  justiceNames?: Set<string>,
  voteDirections?: Set<VoteDirection>
): ScotusVote[] {
  return data.filter((row) => {
    if (issueAreas && issueAreas.size > 0 && !issueAreas.has(row.issueArea as IssueArea)) {
      return false;
    }
    if (justiceNames && justiceNames.size > 0 && !justiceNames.has(row.justiceName)) {
      return false;
    }
    if (voteDirections && voteDirections.size > 0 && !voteDirections.has(row.vote_direction as VoteDirection)) {
      return false;
    }
    return true;
  });
}

export function aggregateVotesByJusticeAndDirection(
  data: ScotusVote[]
): AggregatedVoteData[] {
  const grouped = new Map<string, Map<VoteDirection, number>>();

  data.forEach((d) => {
    if (!grouped.has(d.justiceName)) {
      grouped.set(d.justiceName, new Map());
    }
    const justiceMap = grouped.get(d.justiceName)!;
    justiceMap.set(d.vote_direction as VoteDirection, (justiceMap.get(d.vote_direction as VoteDirection) || 0) + 1);
  });

  const result: AggregatedVoteData[] = [];
  grouped.forEach((directions, justiceName) => {
    directions.forEach((count, vote_direction) => {
      result.push({
        justiceName,
        vote_direction,
        count,
      });
    });
  });

  return result;
}

export function aggregatePrecedentByJusticeAndIssue(
  data: ScotusVote[]
): PrecedentData[] {
  const grouped = new Map<string, Map<IssueArea, Map<VoteDirection, number>>>();

  data.forEach((d) => {
    if (!grouped.has(d.justiceName)) {
      grouped.set(d.justiceName, new Map());
    }
    const justiceMap = grouped.get(d.justiceName)!;
    if (!justiceMap.has(d.issueArea as IssueArea)) {
      justiceMap.set(d.issueArea as IssueArea, new Map());
    }
    const areaMap = justiceMap.get(d.issueArea as IssueArea)!;
    areaMap.set(d.vote_direction as VoteDirection, (areaMap.get(d.vote_direction as VoteDirection) || 0) + d.precedentAlteration);
  });

  const result: PrecedentData[] = [];
  grouped.forEach((issues, justiceName) => {
    issues.forEach((directions, issueArea) => {
      directions.forEach((sum, vote_direction) => {
        if (sum > 0) {
          result.push({
            justiceName,
            issueArea,
            vote_direction,
            sum,
          });
        }
      });
    });
  });

  return result;
}

export function aggregateCareerVotesByTerm(
  data: ScotusVote[]
): CareerVotesData[] {
  const grouped = new Map<string, Map<number, Map<VoteDirection, number>>>();

  data.forEach((d) => {
    if (!grouped.has(d.justiceName)) {
      grouped.set(d.justiceName, new Map());
    }
    const justiceMap = grouped.get(d.justiceName)!;
    if (!justiceMap.has(d.term)) {
      justiceMap.set(d.term, new Map());
    }
    const termMap = justiceMap.get(d.term)!;
    termMap.set(d.vote_direction as VoteDirection, (termMap.get(d.vote_direction as VoteDirection) || 0) + 1);
  });

  const result: CareerVotesData[] = [];
  grouped.forEach((terms, justiceName) => {
    terms.forEach((directions, term) => {
      directions.forEach((count, vote_direction) => {
        result.push({
          justiceName,
          term,
          vote_direction,
          count,
        });
      });
    });
  });

  return result;
}

export function getAllIssueAreas(data: ScotusVote[]): IssueArea[] {
  const areas = new Set(data.map((d) => d.issueArea));
  return Array.from(areas).sort((a, b) => a - b) as IssueArea[];
}

export function getAllJusticeNames(data: ScotusVote[]): string[] {
  const names = new Set(data.map((d) => d.justiceName));
  return Array.from(names).sort();
}

export function getAllTerms(data: ScotusVote[]): number[] {
  const terms = new Set(data.map((d) => d.term));
  return Array.from(terms).sort((a, b) => a - b);
}
