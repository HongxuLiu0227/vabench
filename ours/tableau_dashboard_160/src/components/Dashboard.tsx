import React, { useState, useEffect } from 'react';
import type { SwimmerData } from '../types/swimming';
import { loadSwimmingData, getUniqueValues } from '../services/dataLoader';
import SwimmersByAge from './SwimmersByAge';
import SwimmersByCountry from './SwimmersByCountry';
import SwimmersByRank from './SwimmersByRank';
import MultiSelectFilter from './MultiSelectFilter';
import GenderLegend from './GenderLegend';
import './Dashboard.css';

interface DashboardProps {
  width?: number;
  height?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  width = 1169,
  height = 827
}) => {
  const [data, setData] = useState<SwimmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCountrySwimmers, setSelectedCountrySwimmers] = useState<string[]>([]);
  const [selectedCompCountry, setSelectedCompCountry] = useState<string[]>([]);

  // Interaction states (from SwimmersByRank click action)
  const [selectedRankSwimmer, setSelectedRankSwimmer] = useState<string | null>(null);
  const [selectedRankTrainer, setSelectedRankTrainer] = useState<string | null>(null);

  // Highlight states
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Unique values for filters
  const [countrySwimmersOptions, setCountrySwimmersOptions] = useState<string[]>([]);
  const [compCountryOptions, setCompCountryOptions] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const swimmingData = await loadSwimmingData();
        setData(swimmingData);

        // Set filter options
        setCountrySwimmersOptions(getUniqueValues(swimmingData, 'CountrySwimmers'));
        setCompCountryOptions(getUniqueValues(swimmingData, 'Сountry'));
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load swimming competition data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle cell click in SwimmersByRank (filter action)
  const handleRankCellClick = (rankSwimmer: string | null, rankTrainer: string | null) => {
    setSelectedRankSwimmer(rankSwimmer);
    setSelectedRankTrainer(rankTrainer);
  };

  // Handle gender click in SwimmersByAge (highlight interaction)
  const handleGenderClick = (gender: string | null) => {
    setSelectedGender(gender);
  };

  // Handle country click in SwimmersByCountry (highlight interaction)
  const handleCountryClick = (country: string | null) => {
    setSelectedCountry(country);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ width, height }}>
      {/* Dashboard Title */}
      <div className="dashboard-title">Swimmers Overview</div>

      <div className="dashboard-grid">
        {/* Top Section: Swimmers by Rank with CountrySwimmers filter */}
        <div className="dashboard-row top-row">
          <div className="chart-section rank-section">
            <SwimmersByRank
              data={data}
              filters={{
                selectedCountrySwimmers: selectedCountrySwimmers.length > 0
                  ? selectedCountrySwimmers
                  : countrySwimmersOptions
              }}
              onCellClick={handleRankCellClick}
              selectedRankSwimmer={selectedRankSwimmer}
              selectedRankTrainer={selectedRankTrainer}
              width={790}
              height={280}
            />
          </div>

          <div className="filter-section">
            <MultiSelectFilter
              title="Swimmer Country"
              options={countrySwimmersOptions}
              selectedValues={selectedCountrySwimmers}
              onChange={setSelectedCountrySwimmers}
              width={150}
            />
          </div>
        </div>

        {/* Bottom Section: Swimmers by Country and Swimmers by Age */}
        <div className="dashboard-row bottom-row">
          {/* Swimmers by Country - Left */}
          <div className="chart-section country-section">
            <SwimmersByCountry
              data={data}
              filters={{
                selectedRankSwimmer,
                selectedRankTrainer
              }}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry}
              width={420}
              height={550}
            />
          </div>

          {/* Swimmers by Age - Right */}
          <div className="chart-section age-section">
            <div className="age-filter-section">
              <MultiSelectFilter
                title="Competition Country"
                options={compCountryOptions}
                selectedValues={selectedCompCountry}
                onChange={setSelectedCompCountry}
                width={150}
              />
            </div>

            <SwimmersByAge
              data={data}
              filters={{
                selectedCompCountry: selectedCompCountry.length > 0
                  ? selectedCompCountry
                  : compCountryOptions,
                selectedRankSwimmer,
                selectedRankTrainer
              }}
              onGenderClick={handleGenderClick}
              selectedGender={selectedGender}
              width={490}
              height={400}
            />

            <div className="age-legend-section">
              <GenderLegend
                onGenderClick={handleGenderClick}
                selectedGender={selectedGender}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
