import React, { useState, useEffect } from 'react';
import type { HourlyData, TripTimeType, HighlightState } from './types';
import { loadDashboardData } from './utils/data';
import PeakHoursLineChart from './components/PeakHoursLineChart';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [startHourlyData, setStartHourlyData] = useState<HourlyData[]>([]);
  const [endHourlyData, setEndHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<HighlightState>({ hour: null, source: null });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadDashboardData();
        setStartHourlyData(data.startHourlyData);
        setEndHourlyData(data.endHourlyData);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load data. Please refresh the page to try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle hover on chart data points
  const handleHourHover = (hour: number | null, source: TripTimeType) => {
    setHighlight({ hour, source });
  };

  // Auto-clear highlight after mouse leaves chart area (simulating auto-clear behavior)
  const handleMouseLeave = () => {
    setHighlight({ hour: null, source: null });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading CitiBike trip data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" onMouseLeave={handleMouseLeave}>
      <div className="dashboard-header">
        <h1>Dashboard-Start&End time</h1>
        <p className="dashboard-subtitle">Peak Hours Analysis for CitiBike Trips</p>
      </div>

      <div className="dashboard-grid">
        {/* Top Chart: Peak hours for trip start */}
        <div className="chart-zone chart-zone-top">
          <PeakHoursLineChart
            data={startHourlyData}
            title="Peak hours for trip start"
            type="start"
            highlightedHour={highlight.source === 'end' ? null : highlight.hour}
            onHourHover={(hour) => handleHourHover(hour, 'start')}
          />
        </div>

        {/* Bottom Chart: Peak hours for trip end */}
        <div className="chart-zone chart-zone-bottom">
          <PeakHoursLineChart
            data={endHourlyData}
            title="Peak hours for trip end"
            type="end"
            highlightedHour={highlight.source === 'start' ? null : highlight.hour}
            onHourHover={(hour) => handleHourHover(hour, 'end')}
          />
        </div>
      </div>

      {/* Legend/Info */}
      <div className="dashboard-info">
        <p>
          <strong>Interaction:</strong> Hover over data points to highlight specific hours across both charts.
          Highlighting automatically clears when you move your mouse away.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
