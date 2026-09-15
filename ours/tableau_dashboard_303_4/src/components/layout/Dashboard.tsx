import React, { useState, useEffect, useMemo } from 'react';
import { Q2WeatherChart } from '../charts/Q2WeatherChart';
import { Q7SpeedChart } from '../charts/Q7SpeedChart';
import { Sheet28Chart } from '../charts/Sheet28Chart';
import { Sheet29Chart } from '../charts/Sheet29Chart';
import type { ParsedAccidentRecord } from '../../types/data';
import { DataService } from '../../services/dataService';
import { useDashboard } from '../../contexts/DashboardContext';
import { LoadingSpinner, ErrorDisplay } from '../common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<ParsedAccidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, clearAllFilters, isFiltered } = useDashboard();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const accidentData = await DataService.loadAccidentData();
        setData(accidentData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load accident data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate filtered data count
  const filteredData = useMemo(() => {
    return DataService.filterData(data, filters);
  }, [data, filters]);

  // Generate filter summary text
  const filterSummary = useMemo(() => {
    const activeFilters: string[] = [];
    if (filters.selectedLightConditions.length > 0) {
      activeFilters.push(`${filters.selectedLightConditions.length} Light Conditions`);
    }
    if (filters.selectedSpeedLimits.length > 0) {
      activeFilters.push(`${filters.selectedSpeedLimits.length} Speed Limits`);
    }
    if (filters.selectedWeatherConditions.length > 0) {
      activeFilters.push(`${filters.selectedWeatherConditions.length} Weather Conditions`);
    }
    if (filters.selectedRoadSurfaceConditions.length > 0) {
      activeFilters.push(`${filters.selectedRoadSurfaceConditions.length} Road Surface Conditions`);
    }
    if (filters.selectedAccidentSeverities.length > 0) {
      activeFilters.push(`${filters.selectedAccidentSeverities.length} Severities`);
    }
    if (filters.selectedDayOfWeek.length > 0) {
      activeFilters.push(`${filters.selectedDayOfWeek.length} Days`);
    }
    return activeFilters.join(', ');
  }, [filters]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading dashboard..."
        subMessage="Please wait while we load the accident data"
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message="Error Loading Dashboard"
        details={error}
      />
    );
  }

  return (
    <div style={dashboardStyles}>
      <div style={headerStyles}>
        Critical Factors Responsible for Large Number of Accidents
      </div>

      {/* Filter Control Bar */}
      {isFiltered && (
        <div style={filterBarStyles}>
          <div style={filterInfoStyles}>
            <span style={filterCountStyles}>
              {filteredData.length.toLocaleString()} / {data.length.toLocaleString()} records
            </span>
            {filterSummary && (
              <span style={filterSummaryStyles}>
                Filters: {filterSummary}
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            style={clearButtonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#820000'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a02525'}
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div style={contentStyles}>
        <div style={gridStyles}>
          {/* Top Row */}
          <div style={chartContainerStyles}>
            <Q2WeatherChart data={data} width={450} height={320} />
          </div>
          <div style={chartContainerStyles}>
            <Sheet29Chart data={data} width={450} height={320} />
          </div>

          {/* Bottom Row */}
          <div style={chartContainerStyles}>
            <Q7SpeedChart data={data} width={450} height={320} />
          </div>
          <div style={chartContainerStyles}>
            <Sheet28Chart data={data} width={450} height={320} />
          </div>
        </div>
      </div>
    </div>
  );
};

const dashboardStyles: React.CSSProperties = {
  backgroundColor: '#e0d490',
  minHeight: '100vh',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyles: React.CSSProperties = {
  color: '#820000',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: '20px',
  flexShrink: 0
};

const contentStyles: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  gap: '20px'
};

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gap: '20px',
  flex: 1
};

const chartContainerStyles: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '8px',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto'
};

const filterBarStyles: React.CSSProperties = {
  backgroundColor: 'rgba(130, 0, 0, 0.1)',
  border: '1px solid #820000',
  borderRadius: '8px',
  padding: '10px 15px',
  marginBottom: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0
};

const filterInfoStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const filterCountStyles: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#820000'
};

const filterSummaryStyles: React.CSSProperties = {
  fontSize: '12px',
  color: '#666'
};

const clearButtonStyles: React.CSSProperties = {
  backgroundColor: '#a02525',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  whiteSpace: 'nowrap'
};
