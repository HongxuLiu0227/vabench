import React, { useState, useEffect } from 'react';
import { NumbCritWorksheet, NumbMetaWorksheet, NumbUsersWorksheet } from './worksheets';
import type { GameData, CriticMetrics, UserMetrics, MetascoreTimeSeries } from '../types/data';
import {
  loadGameData,
  aggregateCriticMetrics,
  aggregateUserMetrics,
  aggregateMetascoreByMonth,
  filterDataBySelection,
} from '../services/dataLoader';
import { useDashboard } from '../contexts/DashboardContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { selection } = useDashboard();
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const [criticMetrics, setCriticMetrics] = useState<CriticMetrics[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [metascoreTimeSeries, setMetascoreTimeSeries] = useState<MetascoreTimeSeries[]>([]);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadGameData();
        setGameData(data);

        // Compute initial aggregations
        setCriticMetrics(aggregateCriticMetrics(data));
        setUserMetrics(aggregateUserMetrics(data));
        setMetascoreTimeSeries(aggregateMetascoreByMonth(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update aggregations when selection changes
  useEffect(() => {
    if (gameData.length === 0) return;

    const filteredData = filterDataBySelection(gameData, selection);
    setCriticMetrics(aggregateCriticMetrics(filteredData));
    setUserMetrics(aggregateUserMetrics(filteredData));
    setMetascoreTimeSeries(aggregateMetascoreByMonth(filteredData));
  }, [gameData, selection]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* numb_meta - Top section - Line chart */}
        <div className="dashboard-zone zone-meta">
          <NumbMetaWorksheet
            data={metascoreTimeSeries}
            width={950}
            height={380}
          />
        </div>

        {/* Bottom section - Two tables side by side */}
        <div className="dashboard-bottom-row">
          {/* numb_crit - Bottom left */}
          <div className="dashboard-zone zone-crit">
            <NumbCritWorksheet
              data={criticMetrics}
              width={475}
              height={350}
            />
          </div>

          {/* numb_users - Bottom right */}
          <div className="dashboard-zone zone-users">
            <NumbUsersWorksheet
              data={userMetrics}
              width={475}
              height={350}
            />
          </div>
        </div>

        {/* Text zones at bottom */}
        <div className="dashboard-footer">
          <div className="text-zone text-zone-left">
            Source:{' '}
            <a
              href="https://www.kaggle.com/skateddu/metacritic-games-stats-20112019"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c0c0c0' }}
            >
              https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
            </a>
          </div>
          <div className="text-zone text-zone-right" style={{ textAlign: 'right', color: '#c0c0c0' }}>
            Created by Sergio Funes
          </div>
        </div>
      </div>
    </div>
  );
};
