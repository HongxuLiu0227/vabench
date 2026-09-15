import React, { useState, useEffect } from 'react';
import type { FightSongData, SelectedSchool } from '../types';
import { loadData } from '../services/dataService';
import DynamicTitle from './DynamicTitle';
import Scatterplot from './Scatterplot';
import ConferenceLegend from './ConferenceLegend';
import './Dashboard.css';

interface DashboardProps {
  selectedSchool?: SelectedSchool;
  onSchoolSelect?: (school: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedSchool: externalSelectedSchool,
  onSchoolSelect: externalOnSchoolSelect,
}) => {
  const [data, setData] = useState<FightSongData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use internal state if not controlled externally
  const [internalSelectedSchool, setInternalSelectedSchool] = useState<SelectedSchool>(null);

  const selectedSchool = externalSelectedSchool !== undefined ? externalSelectedSchool : internalSelectedSchool;
  const handleSchoolSelect = externalOnSchoolSelect || setInternalSelectedSchool;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const dataset = await loadData();
        setData(dataset);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Loading data...</div>
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="title-section">
          <DynamicTitle selectedSchool={selectedSchool} />
        </div>
        <div className="scatterplot-section">
          <div className="scatterplot-wrapper">
            <Scatterplot
              data={data}
              selectedSchool={selectedSchool}
              onSchoolSelect={handleSchoolSelect}
            />
            <ConferenceLegend data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
