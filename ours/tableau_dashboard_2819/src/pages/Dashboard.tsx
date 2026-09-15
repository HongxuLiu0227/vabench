import React, { useState, useEffect, useMemo } from 'react';
import { SalesBySegmentChart } from '../components/SalesBySegmentChart';
import { PlotOfSalesChart } from '../components/PlotOfSalesChart';
import { SalesByRegionChart } from '../components/SalesByRegionChart';
import { SegmentLegend } from '../components/SegmentLegend';
import { ProfitLegend } from '../components/ProfitLegend';
import { RegionFilter } from '../components/RegionFilter';
import { loadOrdersData } from '../services/dataService';
import {
  processSalesBySegmentData,
  processPlotOfSalesData,
  processSalesByRegionData,
  getUniqueRegions,
  getUniqueSegments,
} from '../services/dataProcessor';
import type { FilterState, OrderData } from '../types';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    selectedSegment: null,
    selectedRegion: null,
  });

  // Highlight state for cross-worksheet interactions
  const [highlightState, setHighlightState] = useState<{
    segment: string | null;
    region: string | null;
    category: string | null;
    country: string | null;
  }>({
    segment: null,
    region: null,
    category: null,
    country: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const ordersData = await loadOrdersData();
        setData(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Process data for each worksheet
  const salesBySegmentData = useMemo(
    () => processSalesBySegmentData(data, filters),
    [data, filters]
  );

  const plotOfSalesData = useMemo(
    () => processPlotOfSalesData(data, filters),
    [data, filters]
  );

  const salesByRegionData = useMemo(
    () => processSalesByRegionData(data, filters),
    [data, filters]
  );

  const uniqueRegions = useMemo(() => getUniqueRegions(data), [data]);
  const uniqueSegments = useMemo(() => getUniqueSegments(data), [data]);

  const handleSegmentClick = (segment: string | null) => {
    // Filter action [Action1]: on-select filter from Sales by Segment
    // targets the entire Dashboard 1 with auto-clear behavior
    setFilters(prev => ({
      ...prev,
      selectedSegment: segment,
      // Also clear region filter when segment changes to match Tableau's filter action behavior
      selectedRegion: segment ? null : prev.selectedRegion
    }));
  };

  const handleRegionChange = (region: string | null) => {
    setFilters(prev => ({ ...prev, selectedRegion: region }));
  };

  // Highlight handlers for cross-worksheet interactions
  const handleSegmentHighlight = (segment: string | null) => {
    setHighlightState(prev => ({
      ...prev,
      segment,
    }));
  };

  const handleCategoryHighlight = (category: string | null) => {
    setHighlightState(prev => ({
      ...prev,
      category,
    }));
  };

  const handleCountryHighlight = (country: string | null) => {
    setHighlightState(prev => ({
      ...prev,
      country,
    }));
  };

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
          fontSize: '16px',
          color: '#666',
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#d32f2f',
        }}
      >
        Error: {error}
      </div>
    );
  }

  // Calculate profit range for legend
  const minProfit = salesByRegionData.length > 0
    ? Math.min(...salesByRegionData.map(d => d.profit))
    : 0;
  const maxProfit = salesByRegionData.length > 0
    ? Math.max(...salesByRegionData.map(d => d.profit))
    : 0;

  return (
    <div
      style={{
        width: '1000px',
        height: '800px',
        margin: '0 auto',
        padding: '8px',
        background: '#fff',
        boxSizing: 'border-box',
      }}
    >
      {/* Main Dashboard Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '820px 160px',
          gridTemplateRows: '465px 465px',
          gap: '8px',
          height: 'calc(100% - 16px)',
        }}
      >
        {/* Left Column - Worksheets */}
        <div
          style={{
            gridColumn: '1',
            gridRow: '1 / 3',
            display: 'grid',
            gridTemplateColumns: '325px 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '8px',
          }}
        >
          {/* Sales by Segment - Top Left */}
          <div
            style={{
              gridColumn: '1',
              gridRow: '1',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '8px',
              background: '#fafafa',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Sales by Segment
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <SalesBySegmentChart
                data={salesBySegmentData}
                selectedSegment={filters.selectedSegment}
                onSegmentClick={handleSegmentClick}
                onSegmentHighlight={handleSegmentHighlight}
                highlightState={highlightState}
                width={280}
                height={320}
              />
            </div>
          </div>

          {/* Plot of Sales - Top Right */}
          <div
            style={{
              gridColumn: '2',
              gridRow: '1',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '8px',
              background: '#fafafa',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Plot of Sales
            </div>
            <PlotOfSalesChart
              data={plotOfSalesData}
              selectedSegment={filters.selectedSegment}
              onCategoryHighlight={handleCategoryHighlight}
              onSegmentHighlight={handleSegmentHighlight}
              highlightState={highlightState}
              width={480}
              height={320}
            />
          </div>

          {/* Sales by Region - Bottom Full Width */}
          <div
            style={{
              gridColumn: '1 / 3',
              gridRow: '2',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '8px',
              background: '#fafafa',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Sales by Region
            </div>
            <SalesByRegionChart
              data={salesByRegionData}
              onCountryHighlight={handleCountryHighlight}
              highlightState={highlightState}
              width={800}
              height={320}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div
          style={{
            gridColumn: '2',
            gridRow: '1 / 3',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Customer Segment Legend */}
          <div
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '4px',
              background: '#fafafa',
            }}
          >
            <SegmentLegend segments={uniqueSegments} />
          </div>

          {/* Region Filter */}
          <div
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '4px',
              background: '#fafafa',
            }}
          >
            <RegionFilter
              regions={uniqueRegions}
              selectedRegion={filters.selectedRegion}
              onRegionChange={handleRegionChange}
            />
          </div>

          {/* Profit Legend */}
          <div
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '4px',
              background: '#fafafa',
            }}
          >
            <ProfitLegend minProfit={minProfit} maxProfit={maxProfit} />
          </div>
        </div>
      </div>
    </div>
  );
};
