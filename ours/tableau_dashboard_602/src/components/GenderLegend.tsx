import React from 'react';

interface GenderLegendProps {
  selectedGender?: 'Male' | 'Female' | null;
  onGenderSelect?: (gender: 'Male' | 'Female' | null) => void;
}

const GENDER_COLORS: Record<'Male' | 'Female', string> = {
  Male: '#4e79a7',
  Female: '#f28e2b',
};

const GenderLegend: React.FC<GenderLegendProps> = ({
  selectedGender = null,
  onGenderSelect,
}) => {
  const genders: Array<'Male' | 'Female'> = ['Male', 'Female'];

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}
    >
      {genders.map((gender) => (
        <div
          key={gender}
          onClick={() => onGenderSelect && onGenderSelect(selectedGender === gender ? null : gender)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: gender === 'Male' ? '6px' : '0',
            cursor: 'pointer',
            opacity: !selectedGender || selectedGender === gender ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            if (onGenderSelect) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (onGenderSelect && selectedGender && selectedGender !== gender) {
              e.currentTarget.style.opacity = '0.4';
            }
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: GENDER_COLORS[gender],
              marginRight: '6px',
              border: selectedGender === gender ? '2px solid #333' : 'none',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'sans-serif',
              color: '#333333',
              fontWeight: selectedGender === gender ? 'bold' : 'normal',
            }}
          >
            {gender}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GenderLegend;
