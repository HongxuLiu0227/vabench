/**
 * Main Dashboard Component
 * Implements the "Reporting Rates_Optimization:Dashboard: Facility Upload Status (CT + PKV)"
 *
 * Layout based on Tableau zones:
 * - Summary Stats (horizontal ranked bar chart): Left side
 * - EMR Sites Table (hierarchical view): Right side
 * - Dashboard Text Zones: Title and definitions
 */

import { useState, useMemo } from 'react';
import { formatMonthYear } from '../utils/calculations';
import { useDashboardData } from '../services/dataService';
import {
  aggregateSummaryStats,
} from '../utils/calculations';
import SummaryStatsChart from './SummaryStatsChart';
import EMRSitesTable from './EMRSitesTable';
import type { UploadStatusCategory, SummaryStatsData } from '../types';

// Default date from requirements
const DEFAULT_DATE = new Date('2021-01-06');

export const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(DEFAULT_DATE);
  const [selectedCategories, setSelectedCategories] = useState<UploadStatusCategory[]>([]);

  // Load dashboard data
  const { facilities, loading, error } = useDashboardData(selectedDate);

  // Aggregate data for Summary Stats chart
  const summaryStatsData = useMemo((): SummaryStatsData[] => {
    const counts = aggregateSummaryStats(facilities);
    const total = facilities.length;

    return Array.from(counts.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [facilities]);

  // Handle category click from Summary Stats chart
  const handleCategoryClick = (category: UploadStatusCategory) => {
    // Toggle category selection
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Auto-clear behavior: if clicking the same category, clear the filter
        return prev.filter((c) => c !== category);
      } else {
        // Add category to filter
        return [...prev, category];
      }
    });
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
    // Clear category filter when date changes
    setSelectedCategories([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Dashboard Title Zone */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold" style={{ color: '#911a1c' }}>
          EMR Facilities Upload Status - <span className="font-medium">{formatMonthYear(selectedDate)}</span>
        </h1>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Upload Period - 3 Months:
          </label>
          <input
            type="month"
            value={selectedDate.toISOString().slice(0, 7)}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded cursor-pointer hover:bg-red-200"
                onClick={() => handleCategoryClick(cat)}
              >
                {cat} ✕
              </span>
            ))}
            <button
              onClick={() => setSelectedCategories([])}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid - Matching Tableau zones */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats - Left Panel */}
        <div className="col-span-4">
          <div className="border border-gray-200 rounded p-4">
            <div className="mb-2">
              <h2 className="text-base font-bold text-gray-900">Summary Statistics</h2>
              <p className="text-xs text-red-800 italic mt-1">
                Click on bars to filter
              </p>
            </div>
            <div className="flex justify-center">
              <SummaryStatsChart
                data={summaryStatsData}
                onCategoryClick={handleCategoryClick}
                selectedCategories={selectedCategories}
                width={320}
                height={350}
              />
            </div>
            {/* Legend/Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4caf50' }}></div>
                  <span>≥67%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ff9800' }}></div>
                  <span>34-66%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f44336' }}></div>
                  <span>&lt;34%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EMR Sites Table - Right Panel */}
        <div className="col-span-8">
          <div className="border border-gray-200 rounded p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#911a1c' }}>
                EMR Sites / DWH CT & PKV Uploads Last 3 Months
              </h2>
              <p className="text-xs text-gray-700 mt-1">
                Recency Date: Is the latest visit date in the EMR DB that shows the last interaction in the EMR
              </p>
            </div>
            <EMRSitesTable
              facilities={facilities}
              selectedCategories={selectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Definitions Text Zone */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded text-xs">
        <h3 className="font-bold underline mb-2">Definitions</h3>
      </div>
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-t-0 border-t-0 text-xs text-gray-700">
        <p className="mb-2">
          <span className="font-bold">EMR Recency Date</span> is an indicator of when the EMR was last updated. If the date is 4 months ago, it either means that that's the last time a facility had a patient, or the last time the EMR was updated.
        </p>
        <p className="mb-2">
          <span className="font-bold">Latest Upload Date:</span> Is the last time the EMR was uploaded to the DWH
        </p>
        <p>
          <span className="font-bold">Latest PKV Date:</span> Is the last time the PKVs were uploaded to the DWH
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
