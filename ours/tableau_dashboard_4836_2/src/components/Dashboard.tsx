import React, { useState, useEffect } from 'react';
import CountyDistribution from './CountyDistribution';
import CountyPKVRecency from './CountyPKVRecency';
import CountyOverallRate from './CountyOverallRate';
import type { CleanDataRow } from '../types';
import { loadCsvData } from '../services/dataLoader';
import { getDefaultParameterDate } from '../utils/calculations';

interface DashboardProps {
  parameterDate?: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ parameterDate = getDefaultParameterDate() }) => {
  const [data, setData] = useState<CleanDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const csvData = await loadCsvData();
        setData(csvData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading dashboard data...
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
        fontFamily: 'Verdana, sans-serif',
        fontSize: '16px',
        color: '#f44336'
      }}>
        Error: {error}
      </div>
    );
  }

  // Calculate zone sizes based on viewport
  // The dashboard has 3 zones side by side
  const containerWidth = Math.min(1400, window.innerWidth - 40);
  const zoneWidth = Math.floor(containerWidth / 3);
  const zoneHeight = 500;

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Verdana, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Dashboard Title */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Reporting Rates CT & MPI
        </h1>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '12px',
          color: '#666'
        }}>
          Parameter Date: {parameterDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Three Worksheet Zones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Zone 1: County Distribution */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <CountyDistribution
            data={data}
            width={zoneWidth}
            height={zoneHeight}
          />
        </div>

        {/* Zone 2: Overall C&T Rate */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <CountyOverallRate
            data={data}
            parameterDate={parameterDate}
            width={zoneWidth}
            height={zoneHeight}
          />
        </div>

        {/* Zone 3: PKV Recency */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <CountyPKVRecency
            data={data}
            parameterDate={parameterDate}
            width={zoneWidth}
            height={zoneHeight}
          />
        </div>
      </div>

      {/* Dashboard Text Zone */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#333',
          fontFamily: 'Calibri, Verdana, sans-serif'
        }}>
          The <strong>Overall reporting rate</strong> refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth.
        </p>
        <p style={{
          margin: '10px 0 0 0',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#333',
          fontFamily: 'Calibri, Verdana, sans-serif'
        }}>
          <strong>PKVs = Patient Key Value</strong> is a concatenation of a patients Gender + Soundex value of Firstname + Double Metaphone value of Lastname + Date of Birth
        </p>
        <p style={{
          margin: '10px 0 0 0',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#333',
          fontFamily: 'Calibri, Verdana, sans-serif'
        }}>
          PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level and Linking patient records within and across facilities.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
