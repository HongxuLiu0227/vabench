import React, { useEffect, useState } from 'react';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { Scatterplot } from './Scatterplot';
import { useDashboard } from '../contexts/DashboardContext';
import {
  loadOrdersData,
  aggregateByCategoryAndSubCategory,
  aggregateByDate,
  aggregateByProduct,
  filterData
} from '../services/dataService';
import type { OrderRecord } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filter, clearFilter } = useDashboard();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadOrdersData();
        setAllData(data);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter data based on selection
  const filteredData = React.useMemo(() => {
    if (!filter.category && !filter.subCategory) return allData;
    return filterData(allData, filter.category, filter.subCategory);
  }, [allData, filter]);

  // Aggregate data for charts
  const barData = React.useMemo(() => {
    return aggregateByCategoryAndSubCategory(filteredData);
  }, [filteredData]);

  const lineData = React.useMemo(() => {
    return aggregateByDate(filteredData);
  }, [filteredData]);

  const scatterData = React.useMemo(() => {
    return aggregateByProduct(filteredData);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard 1</h1>
      </div>

      <div className="dashboard-grid">
        {/* Top Row: 62% height */}
        <div className="dashboard-row top-row">
          {/* Bar Chart - Left */}
          <div className="dashboard-cell bar-cell">
            <div className="worksheet">
              <BarChart data={barData} width={480} height={450} />
            </div>
          </div>

          {/* Line Chart - Right */}
          <div className="dashboard-cell line-cell">
            <div className="worksheet">
              <LineChart data={lineData} width={480} height={450} />
            </div>
          </div>
        </div>

        {/* Bottom Row: 38% height */}
        <div className="dashboard-row bottom-row">
          {/* Scatterplot - Full width */}
          <div className="dashboard-cell scatter-cell">
            <div className="worksheet">
              <Scatterplot data={scatterData} width={980} height={280} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter indicator */}
      {(filter.category || filter.subCategory) && (
        <div className="filter-indicator">
          <span>
            Filtered by: {filter.category}
            {filter.subCategory && ` > ${filter.subCategory}`}
          </span>
          <button
            onClick={clearFilter}
            className="clear-filter-btn"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};
