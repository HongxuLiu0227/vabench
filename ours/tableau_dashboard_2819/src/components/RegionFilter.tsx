import React from 'react';

interface RegionFilterProps {
  regions: string[];
  selectedRegion: string | null;
  onRegionChange: (region: string | null) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({
  regions,
  selectedRegion,
  onRegionChange,
}) => {
  return (
    <div
      style={{
        padding: '8px',
        background: '#fff',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#333',
        }}
      >
        Region Filter
      </div>
      <div
        style={{
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        <label
          key="All"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            checked={selectedRegion === null}
            onChange={() => onRegionChange(null)}
            style={{ marginRight: '6px' }}
          />
          <span style={{ color: '#333' }}>All Regions</span>
        </label>
        {regions.map(region => (
          <label
            key={region}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              checked={selectedRegion === region}
              onChange={() => onRegionChange(region)}
              style={{ marginRight: '6px' }}
            />
            <span style={{ color: '#333' }}>{region}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
