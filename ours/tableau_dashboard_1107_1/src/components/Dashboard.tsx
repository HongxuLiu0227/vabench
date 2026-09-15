import { useState, useEffect } from 'react';
import { useSelection } from '../hooks/useSelection';
import OverallYOYChart from './OverallYOYChart';
import FemaleTripYOYChart from './FemaleTripYOYChart';
import UserTypeGenderYOYChart from './UserTypeGenderYOYChart';
import GenderLegend from './GenderLegend';
import { loadData } from '../services/dataService';
import {
  processTripData,
  calculateOverallYOY,
  calculateFemaleYOY,
  processUserTypeGenderYear
} from '../utils/dataProcessor';
import { validateTripData, validateYearExtraction } from '../utils/dataValidator';
import type { YearData, YearGenderData, UserTypeGenderYearData } from '../types';
import type { GenderText } from '../types';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallData, setOverallData] = useState<YearData[]>([]);
  const [femaleData, setFemaleData] = useState<YearGenderData[]>([]);
  const [userTypeGenderData, setUserTypeGenderData] = useState<UserTypeGenderYearData[]>([]);

  const { selection, setGenderSelection, clearSelection } = useSelection();

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const rawData = await loadData();

        // Validate the raw data
        const validation = validateTripData(rawData);
        if (!validation.isValid) {
          console.error('Data validation errors:', validation.errors);
          setError(`Data validation failed: ${validation.errors.join(', ')}`);
          setLoading(false);
          return;
        }

        if (validation.warnings.length > 0) {
          console.warn('Data validation warnings:', validation.warnings);
        }

        // Validate year extraction
        const yearValidation = validateYearExtraction(rawData);
        if (!yearValidation.isValid) {
          console.error('Year extraction errors:', yearValidation.errors);
          setError(`Year extraction failed: ${yearValidation.errors.join(', ')}`);
          setLoading(false);
          return;
        }

        const processed = processTripData(rawData);
        const overall = calculateOverallYOY(processed);
        const female = calculateFemaleYOY(processed);
        const userTypeGender = processUserTypeGenderYear(rawData);

        console.log('Processed data summary:', {
          totalRecords: rawData.length,
          overallYears: overall.length,
          femaleYears: female.length,
          userTypeGenderCombinations: userTypeGender.length
        });

        setOverallData(overall);
        setFemaleData(female);
        setUserTypeGenderData(userTypeGender);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleGenderClick = (gender: GenderText | null) => {
    setGenderSelection(gender);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" onClick={(e) => {
      if (e.target === e.currentTarget) {
        clearSelection();
      }
    }}>
      <div className="dashboard-title">FemaleRidershipDashboard</div>

      <div className="dashboard-top-row">
        <div className="chart-card">
          <FemaleTripYOYChart
            data={femaleData}
            selectedGender={selection.gender}
          />
        </div>
        <div className="chart-card">
          <OverallYOYChart
            data={overallData}
          />
        </div>
      </div>

      <div className="dashboard-main-row">
        <div className="chart-card main-chart">
          <UserTypeGenderYOYChart
            data={userTypeGenderData}
            selectedGender={selection.gender}
            onGenderClick={handleGenderClick}
          />
        </div>
        <div className="legend-card">
          <GenderLegend
            selectedGender={selection.gender}
            onGenderClick={handleGenderClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
