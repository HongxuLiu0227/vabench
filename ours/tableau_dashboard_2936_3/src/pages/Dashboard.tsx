import { useState, useEffect, useMemo } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import LineChart from '../components/LineChart';
import ColorLegend from '../components/ColorLegend';
import {
  loadCitiBikeData,
  aggregateTripsByYear,
  filterByMonths,
  calculatePercentGrowth,
  toLineChartData,
  toGrowthLineChartData,
} from '../services/dataService';
import type { LineChartData } from '../types';
import './Dashboard.css';

interface DashboardProps {
  onYearSelect?: (year: number | null) => void;
  selectedYear?: number | null;
}

export default function Dashboard({ onYearSelect, selectedYear }: DashboardProps) {
  const [tripsData, setTripsData] = useState<LineChartData[]>([]);
  const [tripsFirstQuarterData, setTripsFirstQuarterData] = useState<LineChartData[]>([]);
  const [growthData, setGrowthData] = useState<LineChartData[]>([]);
  const [growthFirstQuarterData, setGrowthFirstQuarterData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart dimensions (based on contract zones ~44514 x 49022, roughly 0.91 aspect ratio)
  const chartWidth = 440;
  const chartHeight = 400;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const trips = await loadCitiBikeData();

        // Sheet 13: Total Recorded Trips (all data)
        const allTripsByYear = aggregateTripsByYear(trips);
        setTripsData(toLineChartData(allTripsByYear));

        // Sheet 13 (2): Total Recorded Trips - First Quarter (months 1-4)
        const firstQuarterTrips = filterByMonths(trips, [1, 2, 3, 4]);
        const firstQuarterByYear = aggregateTripsByYear(firstQuarterTrips);
        setTripsFirstQuarterData(toLineChartData(firstQuarterByYear));

        // Sheet 13 (3): Percent Ridership Growth
        const growthByYear = calculatePercentGrowth(allTripsByYear);
        setGrowthData(toGrowthLineChartData(growthByYear));

        // Sheet 13 (4): Percent Ridership Growth - First Quarter
        const firstQuarterGrowth = calculatePercentGrowth(firstQuarterByYear);
        setGrowthFirstQuarterData(toGrowthLineChartData(firstQuarterGrowth));

        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Create color scales
  const tripsColorScale = useMemo(() => {
    const minValue = Math.min(...tripsData.map((d) => d.value));
    const maxValue = Math.max(...tripsData.map((d) => d.value));
    return scaleSequential(interpolateRdBu).domain([minValue, maxValue]);
  }, [tripsData]);

  const firstQuarterTripsColorScale = useMemo(() => {
    const minValue = Math.min(...tripsFirstQuarterData.map((d) => d.value));
    const maxValue = Math.max(...tripsFirstQuarterData.map((d) => d.value));
    return scaleSequential(interpolateRdBu).domain([minValue, maxValue]);
  }, [tripsFirstQuarterData]);

  const growthColorScale = useMemo(() => {
    const values = growthData.map((d) => d.value).filter((v) => v !== 0);
    const absMax = Math.max(...values.map(Math.abs));
    return scaleSequential(interpolateRdBu).domain([-absMax, absMax]);
  }, [growthData]);

  const firstQuarterGrowthColorScale = useMemo(() => {
    const values = growthFirstQuarterData.map((d) => d.value).filter((v) => v !== 0);
    const absMax = Math.max(...values.map(Math.abs));
    return scaleSequential(interpolateRdBu).domain([-absMax, absMax]);
  }, [growthFirstQuarterData]);

  const handleYearClick = (year: number) => {
    if (onYearSelect) {
      // Toggle selection
      const newSelection = selectedYear === year ? null : year;
      onYearSelect(newSelection);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Loading Citi Bike data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const legendMin = Math.min(...tripsData.map((d) => d.value));
  const legendMax = Math.max(...tripsData.map((d) => d.value));

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Sheet 13: Total Recorded Trips - Top Left */}
        <div className="chart-container">
          <LineChart
            data={tripsData}
            title="Total Recorded Trips"
            width={chartWidth}
            height={chartHeight}
            colorScale={tripsColorScale}
            selectedYear={selectedYear}
            onYearClick={handleYearClick}
          />
        </div>

        {/* Sheet 13 (3): Percent Ridership Growth - Top Right */}
        <div className="chart-container">
          <LineChart
            data={growthData}
            title="Percent Ridership Growth"
            width={chartWidth}
            height={chartHeight}
            colorScale={growthColorScale}
            selectedYear={selectedYear}
            onYearClick={handleYearClick}
            isPercentage={true}
          />
        </div>

        {/* Sheet 13 (2): Total Recorded Trips - First Quarter - Bottom Left */}
        <div className="chart-container">
          <LineChart
            data={tripsFirstQuarterData}
            title="Total Recorded Trips - First Quarter"
            width={chartWidth}
            height={chartHeight}
            colorScale={firstQuarterTripsColorScale}
            selectedYear={selectedYear}
            onYearClick={handleYearClick}
          />
        </div>

        {/* Sheet 13 (4): Percent Ridership Growth - First Quarter - Bottom Right */}
        <div className="chart-container">
          <LineChart
            data={growthFirstQuarterData}
            title="Percent Ridership Growth - First Quarter"
            width={chartWidth}
            height={chartHeight}
            colorScale={firstQuarterGrowthColorScale}
            selectedYear={selectedYear}
            onYearClick={handleYearClick}
            isPercentage={true}
          />
        </div>
      </div>

      {/* Legend - Right Sidebar */}
      <div className="legend-sidebar">
        <ColorLegend
          minValue={legendMin}
          maxValue={legendMax}
          title="Total Recorded Trips"
          height={150}
        />
      </div>
    </div>
  );
}
