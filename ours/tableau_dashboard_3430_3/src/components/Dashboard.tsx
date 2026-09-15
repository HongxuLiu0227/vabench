import { useEffect, useState, useMemo } from 'react';
import { Top10Start } from './worksheets/Top10Start';
import { Top10End } from './worksheets/Top10End';
import { Bottom10Start } from './worksheets/Bottom10Start';
import { Bottom10End } from './worksheets/Bottom10End';
import { CitymapStart } from './worksheets/CitymapStart';
import { CitymapEnd } from './worksheets/CitymapEnd';
import type { WorksheetData } from '../types';
import { loadData, processRawCsvData, normalizeCsvHeaders } from '../services/dataService';
import { useDashboard } from '../hooks/useDashboard';
import './Dashboard.css';

export function Dashboard() {
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null);
  const [rawData, setRawData] = useState<Array<Record<string, string>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { filters, setStartStation, setEndStation, clearFilters } = useDashboard();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await loadData();
        setWorksheetData(data);

        // Also load raw data for filtering
        const response = await fetch('/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv');
        const csvText = await response.text();
        const { csvParse } = await import('d3-dsv');
        // Normalize headers to handle BOM and triple quotes
        const normalizedCsv = normalizeCsvHeaders(csvText);
        const parsed = csvParse(normalizedCsv) as Array<Record<string, string>>;

        setRawData(parsed);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Apply filters when filter state changes
  const filteredData = useMemo(() => {
    if (!rawData) return null;

    let filtered = rawData;

    if (filters.startStation) {
      filtered = filtered.filter((trip: Record<string, string>) =>
        trip['start station name'] === filters.startStation
      );
    }

    if (filters.endStation) {
      filtered = filtered.filter((trip: Record<string, string>) =>
        trip['end station name'] === filters.endStation
      );
    }

    // Process filtered data
    return processRawCsvData(filtered);
  }, [rawData, filters]);

  const handleStartStationClick = (stationName: string) => {
    // Auto-clear behavior: clicking same station clears the filter
    if (filters.startStation === stationName) {
      setStartStation(null);
    } else {
      setStartStation(stationName);
    }
  };

  const handleEndStationClick = (stationName: string) => {
    // Auto-clear behavior: clicking same station clears the filter
    if (filters.endStation === stationName) {
      setEndStation(null);
    } else {
      setEndStation(stationName);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading CitiBike trip data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!worksheetData || !filteredData) {
    return <div>No data available</div>;
  }

  const hasFilters = filters.startStation !== null || filters.endStation !== null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Station Use DB</h1>
        {hasFilters && (
          <div className="filter-status">
            <span>Active Filters:</span>
            {filters.startStation && (
              <span className="filter-tag">
                Start: {filters.startStation}
                <button onClick={() => setStartStation(null)}>×</button>
              </span>
            )}
            {filters.endStation && (
              <span className="filter-tag">
                End: {filters.endStation}
                <button onClick={() => setEndStation(null)}>×</button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Row 1: Citymaps */}
        <div className="grid-citymap-start">
          <CitymapStart
            data={filteredData.citymapStart}
            highlightedStation={filters.startStation}
          />
        </div>
        <div className="grid-citymap-end">
          <CitymapEnd
            data={filteredData.citymapEnd}
            highlightedStation={filters.endStation}
          />
        </div>

        {/* Row 2: Top 10 */}
        <div className="grid-top-start">
          <Top10Start
            data={filteredData.top10Start}
            highlightedStation={filters.startStation}
            onStationClick={handleStartStationClick}
            isFiltered={hasFilters}
          />
        </div>
        <div className="grid-top-end">
          <Top10End
            data={filteredData.top10End}
            highlightedStation={filters.endStation}
            onStationClick={handleEndStationClick}
            isFiltered={hasFilters}
          />
        </div>

        {/* Row 3: Bottom 10 */}
        <div className="grid-bottom-start">
          <Bottom10Start
            data={filteredData.bottom10Start}
            highlightedStation={filters.startStation}
            onStationClick={handleStartStationClick}
            isFiltered={hasFilters}
          />
        </div>
        <div className="grid-bottom-end">
          <Bottom10End
            data={filteredData.bottom10End}
            highlightedStation={filters.endStation}
            onStationClick={handleEndStationClick}
            isFiltered={hasFilters}
          />
        </div>
      </div>
    </div>
  );
}
