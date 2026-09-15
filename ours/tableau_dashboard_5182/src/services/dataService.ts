import * as d3 from 'd3';
import type { FightSongData } from '../types';

const DATA_URL = '/data/fight-songs-538.csv';

export async function loadData(): Promise<FightSongData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const data = d3.csvParse(csvText).map((row): FightSongData => {
      // Parse numeric fields explicitly
      const conference = row.conference || '';
      const school = row.school || '';

      return {
        school: school,
        conference: conference,
        song_name: row.song_name || '',
        writers: row.writers || '',
        year: row.year || '',
        student_writer: row.student_writer || '',
        official_song: row.official_song || '',
        contest: row.contest || '',
        bpm: Number(row.bpm) || 0,
        sec_duration: Number(row.sec_duration) || 0,
        fight: row.fight || '',
        number_fights: Number(row.number_fights) || 0,
        victory: row.victory || '',
        win_won: row.win_won || '',
        victory_win_won: row.victory_win_won || '',
        rah: row.rah || '',
        nonsense: row.nonsense || '',
        colors: row.colors || '',
        men: row.men || '',
        opponents: row.opponents || '',
        spelling: row.spelling || '',
        trope_count: Number(row.trope_count) || 0,
        spotify_id: row.spotify_id || '',
        // Tableau calculated field for action filter combining conference and school
        Calculation_1314769640457560064: `${conference}, ${school}`,
      };
    });

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

export function getConferences(data: FightSongData[]): string[] {
  return Array.from(new Set(data.map((d) => d.conference))).sort();
}

export function getAverageBPM(data: FightSongData[]): number {
  return d3.mean(data, (d) => d.bpm) || 0;
}

export function getAverageDuration(data: FightSongData[]): number {
  return d3.mean(data, (d) => d.sec_duration) || 0;
}
