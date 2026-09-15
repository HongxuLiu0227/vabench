import React, { useState, useEffect } from 'react';
import {
  loadData,
  transformLineChartData,
  transformMeanLineChartData,
  transformScatterData,
  transformComparisonData
} from '../services/dataService';
import type { DataRow } from '../services/types';
import HorizontalBarChart from './charts/HorizontalBarChart';
import MultiLineChart from './charts/MultiLineChart';
import ScatterPlot from './charts/ScatterPlot';
import MeanLineChart from './charts/MeanLineChart';
import ComparisonChart from './charts/ComparisonChart';
import Legend from './Legend';
import ShapeLegend from './ShapeLegend';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleArtistSelect = (artist: string | null) => {
    setSelectedArtist(artist);
  };

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const lineChartData = transformLineChartData(data);
  const meanLineChartData = transformMeanLineChartData(data, selectedArtist);
  const scatterData = transformScatterData(data);
  const comparisonData = transformComparisonData(data, selectedArtist);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Recognizability of 90's Artists in 2020 by Millenials and Gen-Zs - Andrew Liawan</h1>
      </div>

      <div className="dashboard-grid">
        <div className="charts-area">
          {/* Top Left: Number of Songs in the 90s */}
          <div className="chart-card">
            <div className="chart-title">Number of Songs in the 90s</div>
            <HorizontalBarChart
              data={data}
              selectedArtist={selectedArtist}
              onArtistSelect={handleArtistSelect}
            />
          </div>

          {/* Top Right: Recognizability by Age When Song Was Released */}
          <div className="chart-card">
            <div className="chart-title">Recognizability by Age When Song Was Released</div>
            <MultiLineChart data={lineChartData} selectedArtist={selectedArtist} />
          </div>

          {/* Middle Left: Number of Songs vs. Recognizability */}
          <div className="chart-card">
            <div className="chart-title">Number of Songs vs. Recognizability</div>
            <ScatterPlot data={scatterData} selectedArtist={selectedArtist} />
          </div>

          {/* Middle Right: Mean Recognizability by Age When Song Was Released */}
          <div className="chart-card">
            <div className="chart-title">Mean Recognizability by Age When Song Was Released</div>
            <MeanLineChart data={meanLineChartData} />
          </div>

          {/* Bottom: Millenials vs. Gen-Zs */}
          <div className="chart-card full-width">
            <div className="chart-title">Millenials vs. Gen-Zs</div>
            <ComparisonChart data={comparisonData} />
          </div>
        </div>

        {/* Sidebar with legends */}
        <div className="sidebar">
          <div className="legend-container">
            <Legend data={data} selectedArtist={selectedArtist} onArtistSelect={handleArtistSelect} />
          </div>
          <div className="legend-container">
            <ShapeLegend />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
