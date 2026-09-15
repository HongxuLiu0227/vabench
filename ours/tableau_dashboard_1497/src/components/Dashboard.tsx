import React, { useState, useEffect } from 'react';
import { SalesTypesChart } from './SalesTypesChart';
import { SalesWithItemsChart } from './SalesWithItemsChart';
import { ItemsWithCategoryChart } from './ItemsWithCategoryChart';
import { PayTypeWithYearChart } from './PayTypeWithYearChart';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import {
  loadData,
  aggregateSalesTypes,
  aggregateSalesWithItems,
  aggregateItemsWithCategory,
  aggregatePayTypeWithYear,
} from '../services/dataService';
import type { SalesTypeData, SalesWithItemsData, ItemsWithCategoryData, PayTypeWithYearData } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesTypesData, setSalesTypesData] = useState<SalesTypeData[]>([]);
  const [salesWithItemsData, setSalesWithItemsData] = useState<SalesWithItemsData[]>([]);
  const [itemsWithCategoryData, setItemsWithCategoryData] = useState<ItemsWithCategoryData[]>([]);
  const [payTypeWithYearData, setPayTypeWithYearData] = useState<PayTypeWithYearData[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const data = await loadData();

        setSalesTypesData(aggregateSalesTypes(data));
        setSalesWithItemsData(aggregateSalesWithItems(data));
        setItemsWithCategoryData(aggregateItemsWithCategory(data));
        setPayTypeWithYearData(aggregatePayTypeWithYear(data));

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Top Left: Sales Types (Bubble Chart) */}
        <div className="chart-zone zone-top-left">
          <div className="chart-wrapper">
            <SalesTypesChart data={salesTypesData} width={400} height={350} />
          </div>
        </div>

        {/* Top Right: Sales with Items (Vertical Bar Chart) */}
        <div className="chart-zone zone-top-right">
          <div className="chart-wrapper">
            <SalesWithItemsChart data={salesWithItemsData} width={400} height={350} />
          </div>
        </div>

        {/* Bottom Left: Items with Category (Vertical Stacked Bar Chart) */}
        <div className="chart-zone zone-bottom-left">
          <div className="chart-wrapper">
            <ItemsWithCategoryChart data={itemsWithCategoryData} width={450} height={350} />
          </div>
        </div>

        {/* Bottom Right: Pay type with year (Horizontal Bar Chart) */}
        <div className="chart-zone zone-bottom-right">
          <div className="chart-wrapper">
            <PayTypeWithYearChart data={payTypeWithYearData} width={450} height={350} />
          </div>
        </div>
      </div>
    </div>
  );
};
