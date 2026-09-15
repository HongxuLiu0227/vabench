import { useState, useEffect } from 'react';
import { AvgMoviePie } from './AvgMoviePie';
import { DMovie } from './DMovie';
import { DMovieYear } from './DMovieYear';
import { loadData, filterByYearRange, filterByStudio, aggregateByStudio, aggregateByStudioAndYear } from '../services/dataService';
import type { MovieData, FilterState } from '../types';

export function Dashboard() {
  const [allData, setAllData] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState<FilterState>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadData();
        setAllData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle click on pie slice with auto-clear behavior
  const handleStudioSelect = (studio: string | null) => {
    setSelectedStudio(studio);
  };

  // Handle click outside to clear selection (auto-clear behavior)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('svg')) {
        setSelectedStudio(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif'
        }}
      >
        Loading dashboard data...
      </div>
    );
  }

  // Prepare data for each worksheet

  // AvgMoviePie: Filter years 2014-2018, aggregate by studio
  const pieFilteredData = filterByYearRange(allData, 2014, 2018);
  const pieData = aggregateByStudio(pieFilteredData);

  // DMovie: Filter by selected studio, aggregate by studio
  const dMovieFilteredData = filterByStudio(allData, selectedStudio);
  const dMovieData = aggregateByStudio(dMovieFilteredData);

  // DMovieYear: Filter by selected studio, aggregate by studio and year
  const dMovieYearFilteredData = filterByStudio(allData, selectedStudio);
  const dMovieYearData = aggregateByStudioAndYear(dMovieYearFilteredData);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '8px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '49.2% 49.2%',
        gridTemplateRows: '44.4% 44.4%',
        gap: '1.6%',
        height: 'calc(100vh - 16px)',
        minHeight: '784px'
      }}>
        {/* Top Left: AvgMoviePie */}
        <div style={{
          border: 'none',
          padding: '4px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gridColumn: '1',
          gridRow: '1'
        }}>
          <AvgMoviePie
            data={pieData}
            selectedStudio={selectedStudio}
            onStudioSelect={handleStudioSelect}
          />
        </div>

        {/* Bottom Left: DMovie */}
        <div style={{
          border: 'none',
          padding: '4px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gridColumn: '1',
          gridRow: '2'
        }}>
          <DMovie
            data={dMovieData}
            selectedStudio={selectedStudio}
          />
        </div>

        {/* Right: DMovieYear (spans full height) */}
        <div style={{
          gridColumn: '2',
          gridRow: '1 / span 2',
          border: 'none',
          padding: '4px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <DMovieYear
            data={dMovieYearData}
            selectedStudio={selectedStudio}
          />
        </div>
      </div>
    </div>
  );
}
