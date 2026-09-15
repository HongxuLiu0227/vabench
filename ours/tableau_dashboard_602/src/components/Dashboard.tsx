import React, { useState, useEffect } from 'react';
import PremiumsFallChart from './PremiumsFallChart';
import GenderGapChart from './GenderGapChart';
import GenderLegend from './GenderLegend';
import type { AgeGroupData, GenderAgeData } from '../utils/data';

interface DashboardProps {
  ageGroupData: AgeGroupData[];
  genderAgeData: GenderAgeData[];
}

const Dashboard: React.FC<DashboardProps> = ({ ageGroupData, genderAgeData }) => {
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | null>(null);

  const handleGenderSelect = (gender: 'Male' | 'Female' | null) => {
    setSelectedGender(gender);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedGender !== null) {
        setSelectedGender(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedGender, setSelectedGender]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
          }}
        >
          <PremiumsFallChart
            data={ageGroupData}
            selectedGender={selectedGender}
            width={900}
            height={400}
          />
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
          }}
        >
          <GenderGapChart
            data={genderAgeData}
            selectedGender={selectedGender}
            onGenderSelect={handleGenderSelect}
            width={900}
            height={400}
          />
          <GenderLegend
            selectedGender={selectedGender}
            onGenderSelect={handleGenderSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
