import { useState, useEffect } from 'react';
import type { ParsedGameData } from '../types';
import { getGameData } from '../services/dataService';
import { GameMetaChart } from './GameMetaChart';
import { GameCritTable } from './GameCritTable';
import { GameUsersTable } from './GameUsersTable';
import { useFilter } from '../contexts/FilterContext';

export function Dashboard() {
  const [data, setData] = useState<ParsedGameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filterContext = useFilter();
  const { clearSelection, selection } = filterContext;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const gameData = await getGameData();
        setData(gameData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666'
        }}
      >
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#dc3545'
        }}
      >
        <div style={{ marginBottom: '16px' }}>Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px', backgroundColor: '#f8f8f8', minHeight: '100vh' }}>
      {/* Main container matching Tableau layout */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        {/* Dashboard title */}
        <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#333' }}>
            Metacritic Games Dashboard
          </h1>
        </div>

        {/* Clear selection button */}
        {selection.games.size > 0 && (
          <div style={{ padding: '8px 16px', backgroundColor: '#f0f8ff' }}>
            <button
              onClick={clearSelection}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Selection ({selection.games.size} games selected)
            </button>
          </div>
        )}

        {/* Main content area */}
        <div style={{ padding: '8px' }}>
          {/* Top: Game Meta Chart (full width) */}
          <div style={{ marginBottom: '8px' }}>
            <GameMetaChart data={data} width={984} height={350} />
          </div>

          {/* Bottom row: split 50/50 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Game Crit Table (left) */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <GameCritTable data={data} maxHeight={320} />
            </div>

            {/* Game Users Table (right) */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <GameUsersTable data={data} maxHeight={320} />
            </div>
          </div>
        </div>

        {/* Footer text zones */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid #eee',
            fontSize: '11px',
            color: '#c0c0c0'
          }}
        >
          <div>
            Source:{' '}
            <a
              href="https://www.kaggle.com/sketeddu/metacritic-games-stats-20112019"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c0c0c0', textDecoration: 'underline' }}
            >
              https://www.kaggle.com/sketeddu/metacritic-games-stats-20112019
            </a>
          </div>
          <div style={{ textAlign: 'right' }}>Created by Sergio Funes</div>
        </div>
      </div>
    </div>
  );
}
