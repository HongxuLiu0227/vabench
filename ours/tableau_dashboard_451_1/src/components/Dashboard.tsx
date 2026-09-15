import React, { useState, useEffect, useMemo } from 'react';
import { loadSalesData, filterDataByYear } from '../services/dataService';
import type { SalesData } from '../services/dataService';
import MapSale from './MapSale';
import SaleRegion from './SaleRegion';
import YearFilter from './YearFilter';
import NavButton from './NavButton';

const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<SalesData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2017);
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize filtered data to avoid setState in useEffect
  const filteredData = useMemo(() => {
    return filterDataByYear(allData, selectedYear);
  }, [allData, selectedYear]);

  useEffect(() => {
    loadSalesData()
      .then(data => {
        setAllData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please check the data file.');
        setLoading(false);
      });
  }, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleRegionHover = (region: string | null) => {
    setHighlightedRegion(region);
  };

  const handleStateHover = () => {
    // State hover is tracked by the parent component for future interactions
    // No action required at this time
  };

  const handleResetView = () => {
    // Reset to default year and clear any highlights
    setSelectedYear(2017);
    setHighlightedRegion(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '800px',
          fontFamily: 'Arial',
          fontSize: '16px'
        }}
      >
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '800px',
          fontFamily: 'Arial',
          fontSize: '16px',
          color: 'red'
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '1000px',
        height: '800px',
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      }}
    >
      {/* Map Sale - Top Left */}
      <div
        style={{
          position: 'absolute',
          left: '1.5%',
          top: '1.5%',
          width: '75%',
          height: '63.5%',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <MapSale
          data={filteredData}
          highlightedRegion={highlightedRegion}
          onStateHover={handleStateHover}
        />
      </div>

      {/* Sale Region - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          left: '1.6%',
          top: '65.5%',
          width: '50.8%',
          height: '16%',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          padding: '10px',
          boxSizing: 'border-box'
        }}
      >
        <SaleRegion
          data={filteredData}
          onRegionHover={handleRegionHover}
        />
      </div>

      {/* Year Filter - Right Side */}
      <div
        style={{
          position: 'absolute',
          left: '83%',
          top: '51%',
          width: '16%',
          height: '14%',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          boxSizing: 'border-box'
        }}
      >
        <YearFilter
          data={allData}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
      </div>

      {/* Nav Button - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          left: '83.3%',
          top: '93%',
          width: '16.4%',
          height: '6.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <NavButton onReset={handleResetView} />
      </div>
    </div>
  );
};

export default Dashboard;
