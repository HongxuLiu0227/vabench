import React, { useEffect, useState, useMemo } from 'react';
import type { BarChartData, DataRow } from '../types';
import { loadData, getAvailableMonths } from '../services/dataLoader';
import {
  getThreeMonthWindow,
  aggregateByCounty,
  aggregateByPartner,
  createFacilityDetails,
  calculateOverallStats,
  filterByCounty,
  filterByPartner,
  getPerformanceColor,
} from '../services/dataCalculations';
import RankedBarChart from './charts/RankedBarChart';
import Legend from './charts/Legend';
import KPIStat from './views/KPIStat';
import DataTable from './views/DataTable';

const Dashboard: React.FC = () => {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('January 2021');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadDataAsync = async () => {
      try {
        setIsLoading(true);
        const data = await loadData();
        setRawData(data);

        const months = getAvailableMonths(data);
        setAvailableMonths(months);

        if (months.length > 0) {
          // Default to the most recent month
          setSelectedDate(months[months.length - 1]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDataAsync();
  }, []);

  // Calculate 3-month window
  const window = useMemo(() => {
    return getThreeMonthWindow(selectedDate);
  }, [selectedDate]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let data = rawData;

    if (selectedCounty) {
      data = filterByCounty(data, selectedCounty);
    }

    if (selectedPartner) {
      data = filterByPartner(data, selectedPartner);
    }

    return data;
  }, [rawData, selectedCounty, selectedPartner]);

  // Calculate aggregations
  const countyAggregations = useMemo(() => {
    return aggregateByCounty(filteredData, window);
  }, [filteredData, window]);

  const partnerAggregations = useMemo(() => {
    return aggregateByPartner(filteredData, window);
  }, [filteredData, window]);

  const facilityDetails = useMemo(() => {
    return createFacilityDetails(filteredData, window);
  }, [filteredData, window]);

  const overallStats = useMemo(() => {
    return calculateOverallStats(filteredData, window);
  }, [filteredData, window]);

  // Transform data for charts
  const countyBarData = useMemo((): BarChartData[] => {
    return countyAggregations.map(agg => ({
      label: agg.county,
      value: agg.uploadRateCT,
      category: agg.performanceColor,
      color: getPerformanceColor(agg.performanceColor),
    }));
  }, [countyAggregations]);

  const partnerBarData = useMemo((): BarChartData[] => {
    return partnerAggregations.map(agg => ({
      label: agg.partner,
      value: agg.uploadRateCT,
      category: agg.performanceColor,
      color: getPerformanceColor(agg.performanceColor),
    }));
  }, [partnerAggregations]);

  const partnerRecencyBarData = useMemo((): BarChartData[] => {
    return partnerAggregations.map(agg => ({
      label: agg.partner,
      value: agg.uploadRateMPI,
      category: agg.performanceColor,
      color: getPerformanceColor(agg.performanceColor),
    }));
  }, [partnerAggregations]);

  const partnerDistributionBarData = useMemo((): BarChartData[] => {
    return partnerAggregations.map(agg => ({
      label: agg.partner,
      value: agg.totalFacilities,
      category: agg.agency,
      color: '#2196F3',
    }));
  }, [partnerAggregations]);

  // Clear filters
  const clearFilters = () => {
    setSelectedCounty(null);
    setSelectedPartner(null);
  };

  if (isLoading) {
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
        Loading dashboard...
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
          fontSize: '18px',
          color: '#F44336',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            margin: '0 0 15px 0',
            fontSize: '24px',
            color: '#333',
          }}
        >
          Reporting Rates CT & MPI
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          <label
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Upload Period - 3 Months:
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              backgroundColor: '#fff',
              minWidth: '200px',
            }}
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {(selectedCounty || selectedPartner) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Window info */}
        <div
          style={{
            marginTop: '10px',
            fontSize: '13px',
            color: '#666',
          }}
        >
          3-Month Window: {window.join(', ')}
        </div>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        <KPIStat
          title="Total Expected Sites"
          value={overallStats.totalExpected}
        />
        <KPIStat
          title="Sites Uploaded (CT)"
          value={overallStats.uploadedCT}
          subtitle={`${(overallStats.reportingRateCT * 100).toFixed(1)}%`}
          color="#4CAF50"
        />
        <KPIStat
          title="Sites Uploaded (MPI)"
          value={overallStats.uploadedMPI}
          subtitle={`${(overallStats.reportingRateMPI * 100).toFixed(1)}%`}
          color="#2196F3"
        />
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* County Overall Rate */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <RankedBarChart
            data={countyBarData}
            width={500}
            height={400}
            orientation="horizontal"
            xAxisTitle="% C&T Uploads"
            onBarClick={(label) => {
              setSelectedCounty(selectedCounty === label ? null : label);
              setSelectedPartner(null);
            }}
            selectedLabel={selectedCounty}
          />
          <Legend
            categories={['Above 67%', '34 - 66%', 'Below 34%']}
            colors={['#4CAF50', '#FFC107', '#F44336']}
            title="Performance"
            orientation="horizontal"
          />
        </div>

        {/* Partner Overall Rate */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <RankedBarChart
            data={partnerBarData}
            width={500}
            height={400}
            orientation="horizontal"
            xAxisTitle="% C&T Uploads"
            onBarClick={(label) => {
              setSelectedPartner(selectedPartner === label ? null : label);
              setSelectedCounty(null);
            }}
            selectedLabel={selectedPartner}
          />
          <Legend
            categories={['Above 67%', '34 - 66%', 'Below 33%']}
            colors={['#4CAF50', '#FFC107', '#F44336']}
            title="Performance"
            orientation="horizontal"
          />
        </div>
      </div>

      {/* Second Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Partner Distribution */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333',
            }}
          >
            Partner: Distribution
          </h3>
          <RankedBarChart
            data={partnerDistributionBarData}
            width={500}
            height={300}
            orientation="horizontal"
            xAxisTitle="Number of EMR Sites by Partner"
          />
        </div>

        {/* Partner Recency */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333',
            }}
          >
            Partner: Recency
          </h3>
          <RankedBarChart
            data={partnerRecencyBarData}
            width={500}
            height={300}
            orientation="horizontal"
            xAxisTitle="% PKV Uploads"
          />
          <Legend
            categories={['Above 67%', '34 - 66%', 'Below 33%']}
            colors={['#4CAF50', '#FFC107', '#F44336']}
            title="Performance"
            orientation="horizontal"
          />
        </div>
      </div>

      {/* Dashboard Text Zones */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#555',
          lineHeight: '1.5',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
          }}
        >
          Definitions
        </h3>
        <p style={{ marginBottom: '10px' }}>
          <strong>EMR Recency Date</strong> is an indicator of when the EMR was last updated. If the date is 4 months ago, it either means that that's the last time a facility had a patient, or the last time the EMR was updated.
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>Latest Upload Date:</strong> Is the last time the EMR was uploaded to the DWH
        </p>
        <p>
          <strong>Latest PKV Date:</strong> Is the last time the PKVs were uploaded to the DWH
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#555',
          lineHeight: '1.5',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
          }}
        >
          About Overall Reporting Rate
        </h3>
        <p>
          The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname + Double Metaphone value of Lastname + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level and Linking patient records within and across facilities.
        </p>
      </div>

      {/* Facility Details Table */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333',
          }}
        >
          EMR Facilities Upload Status - {selectedDate}
        </h3>
        <DataTable
          data={facilityDetails}
          pageSize={50}
        />
      </div>
    </div>
  );
};

export default Dashboard;
