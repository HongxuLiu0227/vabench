import { useState, useEffect } from 'react';
import { GameSalesOverviewChart } from './worksheets/GameSalesOverviewChart';
import { GameSalesOverviewLegend } from './worksheets/GameSalesOverviewLegend';
import { AveragedGlobalSalesByGenreChart } from './worksheets/AveragedGlobalSalesByGenreChart';
import { PopularVideoGamesPieChart } from './worksheets/PopularVideoGamesPieChart';
import { PublisherSalesPerformanceChart } from './worksheets/PublisherSalesPerformanceChart';
import {
  DashboardTextZone1,
  DashboardTextZone2,
  DashboardTextZone3,
  DashboardTextZone4,
} from './DashboardTextZones';
import { useFilters } from '../hooks/useFilters';
import { loadGameData, filterData } from '../services/dataService';
import type { GameData } from '../types';

export function Dashboard() {
  const [data, setData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    selectedGenres,
    selectedPublishers,
    selectedPlatforms,
    selectedYears,
    setGenres,
    setPublishers,
    resetFilters,
  } = useFilters();

  useEffect(() => {
    async function loadData() {
      try {
        const gameData = await loadGameData();
        setData(gameData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter data based on current filter state
  const filteredData = filterData(data, selectedGenres, selectedPublishers, selectedPlatforms, selectedYears);

  // Handle genre click from any chart
  const handleGenreClick = (genre: string) => {
    // Auto-clear behavior: toggle the genre
    if (selectedGenres.includes(genre)) {
      setGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setGenres([...selectedGenres, genre]);
    }
  };

  // Handle publisher click
  const handlePublisherClick = (publisher: string) => {
    if (selectedPublishers.includes(publisher)) {
      setPublishers(selectedPublishers.filter((p) => p !== publisher));
    } else {
      setPublishers([...selectedPublishers, publisher]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          Dashboard: A look at the sales trend of Games from 1980-2016
        </h1>
      </div>

      {/* Main Dashboard Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 280px',
          gridTemplateRows: 'auto auto auto auto',
          gap: '15px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Row 1: Game sales overview (left) + Averaged Global sales (center) + Legend + Filters text (right) */}
        <div style={{ gridColumn: '1', gridRow: '1' }}>
          <GameSalesOverviewChart
            data={filteredData}
            width={420}
            height={380}
            onGenreClick={handleGenreClick}
          />
        </div>

        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <AveragedGlobalSalesByGenreChart
            data={filteredData}
            width={420}
            height={380}
            onGenreClick={handleGenreClick}
          />
        </div>

        <div style={{ gridColumn: '3', gridRow: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <DashboardTextZone4 />
          <GameSalesOverviewLegend onGenreClick={handleGenreClick} />
        </div>

        {/* Row 2: Text zones */}
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <DashboardTextZone1 />
        </div>

        <div style={{ gridColumn: '2 / 4', gridRow: '2' }}>
          <DashboardTextZone2 />
        </div>

        {/* Row 3: Pie charts + Publisher chart */}
        <div style={{ gridColumn: '1', gridRow: '3' }}>
          <PopularVideoGamesPieChart
            data={filteredData}
            width={420}
            height={380}
            yearRange={{ start: 1980, end: 1999 }}
            title="Popular Video Games between 1980-1999"
            onGenreClick={handleGenreClick}
          />
        </div>

        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <PopularVideoGamesPieChart
            data={filteredData}
            width={420}
            height={380}
            yearRange={{ start: 1999, end: 2016 }}
            title="Popular Video Games between 1999-2016"
            onGenreClick={handleGenreClick}
          />
        </div>

        <div style={{ gridColumn: '3', gridRow: '3' }}>
          <DashboardTextZone3 />
        </div>

        {/* Row 4: Publisher chart */}
        <div style={{ gridColumn: '1 / 3', gridRow: '4' }}>
          <PublisherSalesPerformanceChart
            data={filteredData}
            width={860}
            height={380}
            onPublisherClick={handlePublisherClick}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedGenres.length > 0 ||
        selectedPublishers.length > 0 ||
        selectedPlatforms.length > 0 ||
        selectedYears.length > 0) && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '300px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Active Filters:</div>
          {selectedGenres.length > 0 && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Genres:</strong> {selectedGenres.join(', ')}
            </div>
          )}
          {selectedPublishers.length > 0 && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Publishers:</strong> {selectedPublishers.join(', ')}
            </div>
          )}
          {selectedPlatforms.length > 0 && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Platforms:</strong> {selectedPlatforms.join(', ')}
            </div>
          )}
          {selectedYears.length > 0 && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Years:</strong> {selectedYears.join(', ')}
            </div>
          )}
          <button
            onClick={resetFilters}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#e15759',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
