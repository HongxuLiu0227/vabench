import React, { useState, useEffect, useCallback } from 'react';
import UsertypeByAgeChart from './UsertypeByAgeChart';
import UsertypeByGenderChart from './UsertypeByGenderChart';
import type { BikeTripData, DashboardFilter } from '../types';
import {
  loadBikeData,
  aggregateUsertypeByAge,
  aggregateUsertypeByGender,
  applyFilters,
} from '../services/dataLoader';

const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<BikeTripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsertype, setSelectedUsertype] = useState<'Subscriber' | 'Customer' | null>(null);

  // Computed filtered data
  const filteredData = React.useMemo(() => {
    if (!allData.length) return [];

    const filters: DashboardFilter = {};
    if (selectedUsertype) {
      filters.usertype = selectedUsertype;
    }

    return applyFilters(allData, filters);
  }, [allData, selectedUsertype]);

  // Aggregated data for charts
  const ageData = React.useMemo(() => {
    return aggregateUsertypeByAge(filteredData);
  }, [filteredData]);

  const genderData = React.useMemo(() => {
    return aggregateUsertypeByGender(filteredData);
  }, [filteredData]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadBikeData();
        setAllData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load bike data:', err);
        setError('Failed to load bike trip data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle usertype selection with auto-clear (Tableau behavior)
  const handleUsertypeSelect = useCallback((usertype: 'Subscriber' | 'Customer' | null) => {
    setSelectedUsertype(usertype);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Loading bike trip data...
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
          height: '100vh',
          fontSize: '16px',
          color: '#d32f2f',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      {/* Dashboard Title */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: '#333',
          }}
        >
          CityBike Challenge
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '14px',
            color: '#666',
          }}
        >
          CitiBike Trip Data Analysis - Jersey City 2020
        </p>
      </div>

      {/* Dashboard Container */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
        }}
      >
        {/* Usertype by Age Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
            }}
          >
            Usertype by Age
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'auto',
            }}
          >
            <UsertypeByAgeChart
              data={ageData}
              width={600}
              height={250}
              onUsertypeSelect={handleUsertypeSelect}
              selectedUsertype={selectedUsertype}
            />
          </div>
          {selectedUsertype && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1976d2',
              }}
            >
              Filter: <strong>{selectedUsertype}</strong> selected{' '}
              <button
                onClick={() => handleUsertypeSelect(null)}
                style={{
                  marginLeft: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Usertype by Gender Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
            }}
          >
            Usertype by Gender
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'auto',
            }}
          >
            <UsertypeByGenderChart
              data={genderData}
              width={600}
              height={350}
              selectedUsertype={selectedUsertype}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Total Trips
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              {filteredData.length.toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Avg Trip Duration
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              {filteredData.length > 0
                ? Math.round(
                    filteredData.reduce((sum, d) => sum + d.tripduration, 0) / filteredData.length
                  )
                : 0}
              s
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Avg Age
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              {filteredData.length > 0
                ? (
                    filteredData.reduce((sum, d) => sum + d.age, 0) / filteredData.length
                  ).toFixed(1)
                : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
