import React, { useState, useEffect } from 'react';
import { FilterProvider } from '../contexts/FilterContext';
import { useFilters } from '../hooks/useFilters';
import { Sheet2 } from './Sheet2';
import { Sheet3 } from './Sheet3';
import { Sheet4 } from './Sheet4';
import { Sheet5 } from './Sheet5';
import {
  loadData,
  applyFilters,
  aggregateControlGroups,
  aggregateChannels,
  aggregateFunnel,
  aggregateCampaigns,
} from '../services/dataService';
import type { DataRecord, ControlGroupData, ChannelData, FunnelData, CampaignData } from '../types/data';

/**
 * Inner dashboard component that uses the filter context
 */
function DashboardContent() {
  const [allData, setAllData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilters();

  // Load data on mount
  useEffect(() => {
    loadData()
      .then((data) => {
        setAllData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    return applyFilters(allData, filters);
  }, [allData, filters]);

  // Aggregate data for each sheet
  const sheet4Data: ControlGroupData[] = React.useMemo(() => {
    return aggregateControlGroups(filteredData);
  }, [filteredData]);

  const sheet3Data: ChannelData[] = React.useMemo(() => {
    return aggregateChannels(filteredData);
  }, [filteredData]);

  const sheet2Data: FunnelData[] = React.useMemo(() => {
    return aggregateFunnel(filteredData);
  }, [filteredData]);

  const sheet5Data: CampaignData[] = React.useMemo(() => {
    return aggregateCampaigns(filteredData);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard 1</h1>
        <div className="filter-status">
          {filters.control !== null && (
            <span className="filter-tag">
              Control: {filters.control === 0 ? 'Целевая' : 'Контрольная'}
            </span>
          )}
          {filters.channel !== null && (
            <span className="filter-tag">Channel: {filters.channel}</span>
          )}
          {filters.campaign !== null && (
            <span className="filter-tag">Campaign: {filters.campaign}</span>
          )}
          {(filters.control !== null || filters.channel !== null || filters.campaign !== null) && (
            <button className="clear-filters-btn">Clear All</button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Top-Left: Sheet 4 (Группы) */}
        <div className="dashboard-cell dashboard-cell-tl">
          <Sheet4 data={sheet4Data} />
        </div>

        {/* Top-Right: Sheet 3 (Каналы) */}
        <div className="dashboard-cell dashboard-cell-tr">
          <Sheet3 data={sheet3Data} />
        </div>

        {/* Bottom-Left: Sheet 2 (Воронка) */}
        <div className="dashboard-cell dashboard-cell-bl">
          <Sheet2 data={sheet2Data} />
        </div>

        {/* Bottom-Right: Sheet 5 (Кампании) */}
        <div className="dashboard-cell dashboard-cell-br">
          <Sheet5 data={sheet5Data} />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard 1
 * 2x2 grid layout:
 * - Top-Left: Sheet 4 (Группы)
 * - Top-Right: Sheet 3 (Каналы)
 * - Bottom-Left: Sheet 2 (Воронка)
 * - Bottom-Right: Sheet 5 (Кампании)
 */
export function Dashboard() {
  return (
    <FilterProvider>
      <DashboardWithClear />
    </FilterProvider>
  );
}

function DashboardWithClear() {
  const { clearAllFilters } = useFilters();

  useEffect(() => {
    // Add clear button handler
    const clearBtn = document.querySelector('.clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllFilters);
    }
    return () => {
      if (clearBtn) {
        clearBtn.removeEventListener('click', clearAllFilters);
      }
    };
  }, [clearAllFilters]);

  return <DashboardContent />;
}

// Add global styles
const styles = `
  .dashboard-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 16px;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .filter-status {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-tag {
    padding: 4px 8px;
    background: #e1f5fe;
    color: #0277bd;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .clear-filters-btn {
    padding: 6px 12px;
    background: #0078d4;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .clear-filters-btn:hover {
    background: #005a9e;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-cell {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .loading-state,
  .error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    font-size: 16px;
    color: #666;
  }

  .error-state {
    color: #d13438;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
