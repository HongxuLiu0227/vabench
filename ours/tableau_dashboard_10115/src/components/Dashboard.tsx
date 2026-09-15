import { useEffect, useState } from 'react';
import { Sheet1 } from './Sheet1';
import { Sheet2 } from './Sheet2';
import { Sheet3 } from './Sheet3';
import { Sheet4 } from './Sheet4';
import { loadSuicideData, aggregateByYear, aggregateByGenerationAndSex, aggregateByAge, aggregateByGDP, applyFilters } from '../services/dataService';
import type { SuicideData, YearlyData, GenerationSexData, AgeData, GDPData } from '../types';
import { useFilters } from '../contexts/FilterContext';
import { runFullValidation } from '../utils/dataValidator';

export function Dashboard() {
  const [ rawData, setRawData ] = useState<SuicideData[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);
  const [ validationRun, setValidationRun ] = useState(false);
  const { filters } = useFilters();

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadSuicideData();
        setRawData(data);
        setError(null);

        // Run validation in development mode
        if (import.meta.env.DEV && data.length > 0) {
          console.log('Running development mode data validation...');
          setValidationRun(true);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Apply filters to raw data
  const filteredData = applyFilters(rawData, filters);

  // Aggregate filtered data for each sheet
  const sheet1Data: YearlyData[] = aggregateByYear(filteredData);
  const sheet2Data: GenerationSexData[] = aggregateByGenerationAndSex(filteredData);
  const sheet3Data: AgeData[] = aggregateByAge(filteredData);
  const sheet4Data: GDPData[] = aggregateByGDP(filteredData);

  // Run validation once when data is loaded
  useEffect(() => {
    if (validationRun && rawData.length > 0) {
      runFullValidation(rawData, sheet1Data, sheet2Data, sheet3Data, sheet4Data);
    }
  }, [validationRun, rawData, sheet1Data, sheet2Data, sheet3Data, sheet4Data]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f3fa',
        fontFamily: 'Prompt, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#75a1c7', marginBottom: '10px' }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f3fa',
        fontFamily: 'Prompt, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#d32f2f' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f3fa',
      padding: '20px',
      fontFamily: 'Prompt, sans-serif'
    }}>
      {/* Dashboard Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px'
      }}>
        <h1 style={{
          color: '#75a1c7',
          fontFamily: 'Prompt SemiBold, sans-serif',
          fontWeight: 'bold',
          fontSize: '36px',
          margin: 0
        }}>
          Suicide Trends In Thailand
        </h1>
      </div>

      {/* Dashboard Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Sheet 1: Suicide Rates Per Year - Top Left */}
        <div style={{
          backgroundColor: '#f3faf9',
          border: '1px solid #75a1c7',
          borderRadius: '4px',
          padding: '15px',
          gridColumn: '1',
          gridRow: '1'
        }}>
          <Sheet1 data={sheet1Data} width={600} height={400} />
        </div>

        {/* Sheet 3: Suicide Rates By Ages - Top Right */}
        <div style={{
          backgroundColor: '#f3faf9',
          border: '1px solid #75a1c7',
          borderRadius: '4px',
          padding: '15px',
          gridColumn: '2',
          gridRow: '1'
        }}>
          <Sheet3 data={sheet3Data} width={400} height={350} />
        </div>

        {/* Sheet 4: Suicide Rates By GDP - Bottom Left */}
        <div style={{
          backgroundColor: '#f3faf9',
          border: '1px solid #a0cbe8',
          borderRadius: '4px',
          padding: '15px',
          gridColumn: '1',
          gridRow: '2'
        }}>
          <Sheet4 data={sheet4Data} width={600} height={400} />
        </div>

        {/* Sheet 2: Suicide Rates Between Sex and Generations - Bottom Right */}
        <div style={{
          backgroundColor: '#f3faf9',
          border: '1px solid #75a1c7',
          borderRadius: '4px',
          padding: '15px',
          gridColumn: '2',
          gridRow: '2'
        }}>
          <Sheet2 data={sheet2Data} width={400} height={400} />
        </div>
      </div>

      {/* Filter Status Display */}
      {(filters.selectedYear || filters.selectedGeneration || filters.selectedSex || filters.selectedAge || filters.selectedGDP) && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #75a1c7',
          borderRadius: '4px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontFamily: 'Prompt, sans-serif',
          fontSize: '13px',
          maxWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#75a1c7' }}>Active Filters:</div>
          {filters.selectedYear && <div>Year: {filters.selectedYear}</div>}
          {filters.selectedGeneration && <div>Generation: {filters.selectedGeneration}</div>}
          {filters.selectedSex && <div>Sex: {filters.selectedSex}</div>}
          {filters.selectedAge && <div>Age: {filters.selectedAge}</div>}
          {filters.selectedGDP && <div>GDP: ${(filters.selectedGDP / 1e9).toFixed(1)}B</div>}
        </div>
      )}
    </div>
  );
}
