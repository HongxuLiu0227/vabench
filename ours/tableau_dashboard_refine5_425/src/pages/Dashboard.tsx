import React, { useState, useEffect } from 'react';
import { LineChart } from '../components/LineChart';
import { DiscountOverview } from '../components/DiscountOverview';
import { Filters } from '../components/Filters';
import {
  loadData,
  filterData,
  aggregateSalesByMonth,
  aggregateSalesByYear,
  aggregateByRegion,
  getUniqueRegions,
  getUniqueCategories,
  getUniqueSegments,
} from '../services/dataService';
import type { OrderData, FilterState } from '../types';

export const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<OrderData[]>([]);
  const [filteredData, setFilteredData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    loadData()
      .then((data) => {
        setAllData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setFilteredData(filterData(allData, filters));
  }, [allData, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px' }}>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'red', fontSize: '16px' }}>Error: {error}</div>
      </div>
    );
  }

  const regions = getUniqueRegions(allData);
  const categories = getUniqueCategories(allData);
  const segments = getUniqueSegments(allData);

  const salesByMonth = aggregateSalesByMonth(filteredData);
  const salesByYear = aggregateSalesByYear(filteredData);
  const regionMetrics = aggregateByRegion(filteredData);

  // Dashboard layout based on zone coordinates from tableau_spec.json
  // The dashboard is 1000x800 (minwidth/minheight from dashboard_size)
  // Zone layout:
  // - Top row (y=0.01 to y=0.6275): Two columns
  //   - Left (x=0.008 to x=0.5): P121__line
  //   - Right (x=0.5 to x=0.992): P1225__total_sales_each_year
  // - Bottom row (y=0.6275 to y=0.99): P2648__discount_overview_by_region (full width)

  const dashboardContainerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  };

  const worksheetsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto',
    flex: 1,
    padding: '8px',
    gap: '8px',
  };

  const worksheetCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const fullWorksheetStyle: React.CSSProperties = {
    gridColumn: '1 / -1',
  };

  return (
    <div style={dashboardContainerStyle}>
      {/* Filters */}
      <Filters filters={filters} onFilterChange={handleFilterChange} regions={regions} categories={categories} segments={segments} />

      {/* Worksheets */}
      <div style={worksheetsContainerStyle}>
        {/* P121__line - Top Left */}
        <div style={worksheetCardStyle}>
          <LineChart
            data={salesByMonth}
            title="Line"
            width={492}
            height={617}
            timeFormat="month"
          />
        </div>

        {/* P1225__total_sales_each_year - Top Right */}
        <div style={worksheetCardStyle}>
          <LineChart
            data={salesByYear}
            title="Total Sales Each Year"
            width={492}
            height={617}
            timeFormat="year"
          />
        </div>

        {/* P2648__discount_overview_by_region - Bottom Full Width */}
        <div style={{ ...worksheetCardStyle, ...fullWorksheetStyle }}>
          <DiscountOverview
            data={regionMetrics}
            title="Discount Overview by Region"
            width={984}
            height={362}
          />
        </div>
      </div>
    </div>
  );
};
