import React, { useState, useEffect } from 'react';
import type { ParsedCovidData } from '../types/data';
import type { HighlightState } from '../types/data';
import { fetchCovidData } from '../services/dataService';
import DailyCases from './worksheets/DailyCases';
import Top10 from './worksheets/Top10';
import TotalCases from './worksheets/TotalCases';
import TotalDeaths from './worksheets/TotalDeaths';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ParsedCovidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightState, setHighlightState] = useState<HighlightState>({
    highlightedCategories: new Set(),
    sourceWorksheet: undefined,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const covidData = await fetchCovidData();
        setData(covidData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHighlight = (category: string) => {
    setHighlightState({
      highlightedCategories: new Set([category]),
      sourceWorksheet: undefined,
    });
  };

  const handleClearHighlight = () => {
    setHighlightState({
      highlightedCategories: new Set(),
      sourceWorksheet: undefined,
    });
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard data"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ fontSize: '16px', color: '#333' }}>Loading COVID-19 data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ color: '#d32f2f', fontSize: '16px' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Main Dashboard Content - Matching Tableau zone coordinates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.36fr 0.32fr 0.32fr',
          gridTemplateRows: '0.47fr 0.53fr',
          gap: '4px',
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
      >
        {/* Dashboard Text Zone - Positioned according to Tableau spec */}
        <div
          style={{
            position: 'absolute',
            top: '51%',
            left: '36%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#333' }}>
            Purvit Vashishtha
          </h2>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#222' }}>
            COVID-19 Analysis Dashboard
          </h1>
        </div>

        {/* Top 10 - Top Left (zone: x=643, y=11262, w=35903, h=40223) */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '0',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <Top10
            rawData={data}
            highlightedCategories={highlightState.highlightedCategories}
            onHighlight={handleHighlight}
            onClearHighlight={handleClearHighlight}
          />
        </div>

        {/* Total Cases - Top Middle (zone: x=36546, y=11262, w=31486, h=40223) */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '0',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalCases
            rawData={data}
            highlightedCategories={highlightState.highlightedCategories}
            onHighlight={handleHighlight}
            onClearHighlight={handleClearHighlight}
          />
        </div>

        {/* Total Deaths - Top Right (zone: x=68032, y=11262, w=31325, h=40223) */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '0',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalDeaths
            rawData={data}
            highlightedCategories={highlightState.highlightedCategories}
            onHighlight={handleHighlight}
            onClearHighlight={handleClearHighlight}
          />
        </div>

        {/* Daily Cases - Bottom (spans all columns) (zone: x=643, y=51485, w=98714, h=47525) */}
        <div
          style={{
            gridColumn: '1 / -1',
            backgroundColor: '#fff',
            borderRadius: '0',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <DailyCases
            rawData={data}
            highlightedCategories={highlightState.highlightedCategories}
            onHighlight={handleHighlight}
            onClearHighlight={handleClearHighlight}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
