import { csv } from 'd3';
import type { DataRow } from '../types';

const DATA_URL = '/data/Tableau_CSV.csv';

export async function loadData(): Promise<DataRow[]> {
  try {
    const data = await csv(DATA_URL);

    return data.map((row: d3.DSVRowString) => ({
      '': Number(row['']) || 0,
      Post: row['Post'] || '',
      TRUE: Number(row['TRUE']) || 0,
      Predicted: Number(row['Predicted']) || 0,
      'True Label': row['True Label'] || '',
      'Predicted Label': row['Predicted Label'] || '',
      Predicted_XY: Number(row['Predicted_XY']) || 0,
      True_XY: Number(row['True_XY']) || 0,
      F1: Number(row['F1']) || 0,
    }));
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}
