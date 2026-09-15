import React from 'react';
import './GenderLegend.css';

interface GenderLegendProps {
  onGenderClick?: (gender: string | null) => void;
  selectedGender?: string | null;
}

const GENDER_COLORS: Record<string, string> = {
  'M': '#aec7e8',
  'F': '#ff9da7',
  '': '#4e79a7',
  'Unknown': '#4e79a7'
};

const GENDER_LABELS: Record<string, string> = {
  'M': 'Male',
  'F': 'Female',
  '': 'Unknown',
  'Unknown': 'Unknown'
};

export const GenderLegend: React.FC<GenderLegendProps> = ({
  onGenderClick,
  selectedGender
}) => {
  const genders = ['M', 'F', ''];

  return (
    <div className="gender-legend">
      <div className="legend-title">Gender</div>
      {genders.map(gender => (
        <div
          key={gender}
          className={`legend-item ${selectedGender !== null && selectedGender !== gender ? 'dimmed' : ''}`}
          onClick={() => onGenderClick && onGenderClick(selectedGender === gender ? null : gender)}
          style={{ cursor: onGenderClick ? 'pointer' : 'default' }}
        >
          <div
            className="legend-color"
            style={{ backgroundColor: GENDER_COLORS[gender] }}
          />
          <div className="legend-label">{GENDER_LABELS[gender]}</div>
        </div>
      ))}
    </div>
  );
};

export default GenderLegend;
