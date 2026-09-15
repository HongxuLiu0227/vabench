/**
 * Main Dashboard component
 * Displays all worksheets and manages data state
 */

import React, { useState, useEffect } from 'react';
import DateParameterSelector from './DateParameterSelector';
import PartnerDistribution from './worksheets/PartnerDistribution';
import PartnerOverall from './worksheets/PartnerOverall';
import PartnerRecency from './worksheets/PartnerRecency';
import DashboardTextZone from './DashboardTextZone';
import { loadDashboardData, reloadDashboardWithData, fetchDashboardData } from '../services/dataService';
import type { DashboardData, DataRow } from '../types';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await loadDashboardData();
        const raw = await fetchDashboardData();
        setDashboardData(data);
        setRawData(raw);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDateChange = async (newDate: string) => {
    if (!dashboardData) return;

    try {
      // Reload data with new date
      const newData = await reloadDashboardWithData(rawData, newDate);
      setDashboardData(newData);
    } catch (err) {
      console.error('Error changing date:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '14px',
        color: '#666666',
      }}>
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '14px',
        color: '#c00',
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="dashboard" style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Verdana, sans-serif',
    }}>
      {/* Dashboard Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e0e0e0',
      }}>
        <h1 style={{
          fontFamily: 'Verdana, sans-serif',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333333',
          margin: '0 0 10px 0',
        }}>
          Reporting Rates CT + MPI
        </h1>
        <p style={{
          fontFamily: 'Verdana, sans-serif',
          fontSize: '12px',
          color: '#666666',
          margin: 0,
        }}>
          By Partner Dashboard
        </p>
      </div>

      {/* Date Parameter Selector */}
      <DateParameterSelector
        availableDates={dashboardData.availableDates}
        selectedDate={dashboardData.selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Worksheets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {/* Partner: Distributon */}
        <div className="worksheet-container" style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#ffffff',
          minHeight: '400px',
        }}>
          <PartnerDistribution data={dashboardData.partners} />
        </div>

        {/* Partner: Overall */}
        <div className="worksheet-container" style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#ffffff',
          minHeight: '400px',
        }}>
          <PartnerOverall
            data={dashboardData.overallUploads}
            selectedDate={dashboardData.selectedDate}
          />
        </div>

        {/* Partner: Recency */}
        <div className="worksheet-container" style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#ffffff',
          minHeight: '400px',
        }}>
          <PartnerRecency
            data={dashboardData.recencyUploads}
            selectedDate={dashboardData.selectedDate}
          />
        </div>
      </div>

      {/* Dashboard Text Zone */}
      <DashboardTextZone />
    </div>
  );
};

export default Dashboard;
