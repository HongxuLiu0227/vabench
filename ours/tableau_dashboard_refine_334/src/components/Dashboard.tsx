import { useState, useEffect } from 'react';
import { TotalLibrariesChart } from './TotalLibrariesChart';
import { CountryDetailsTable } from './CountryDetailsTable';
import type { LibraryData, RegionSummary, CountryDetail } from '../types/libraryData';
import {
  fetchData,
  aggregateByRegion,
  getCountryDetails,
} from '../services/dataService';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<LibraryData[]>([]);
  const [regionSummaries, setRegionSummaries] = useState<RegionSummary[]>([]);
  const [countryDetails, setCountryDetails] = useState<CountryDetail[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>('Middle East');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchData();
        setData(rawData);

        const summaries = aggregateByRegion(rawData);
        setRegionSummaries(summaries);

        const details = getCountryDetails(rawData, 'Middle East');
        setCountryDetails(details);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const details = getCountryDetails(data, selectedRegion);
    setCountryDetails(details);
  }, [selectedRegion, data]);

  const handleRegionSelect = (region: string) => {
    // Auto-clear behavior: if clicking the same region, clear selection
    if (selectedRegion === region) {
      setSelectedRegion(null);
    } else {
      setSelectedRegion(region);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard data"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div aria-hidden="true" style={{ marginBottom: '10px' }}>
            Loading dashboard...
          </div>
        </div>
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
        padding: '8px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Dashboard content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Total Libraries by Region */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <TotalLibrariesChart
              data={regionSummaries}
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
            />
          </div>
        </div>

        {/* Country Details */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <CountryDetailsTable data={countryDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};
