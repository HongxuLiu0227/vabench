import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { getUniqueStates } from '../services/dataLoader';

export const StateFilter: React.FC = () => {
  const { data, selectedStates, setSelectedStates } = useDashboard();
  const uniqueStates = getUniqueStates(data);

  const handleStateChange = (state: string, checked: boolean) => {
    const newStates = new Set(selectedStates);
    if (checked) {
      newStates.add(state);
    } else {
      newStates.delete(state);
    }
    setSelectedStates(newStates);
  };

  const handleSelectAll = () => {
    setSelectedStates(new Set(uniqueStates));
  };

  const handleClearAll = () => {
    setSelectedStates(new Set());
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        fontSize: '11px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
        Provider State Filter
      </div>

      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={handleSelectAll}
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            marginRight: '4px',
            cursor: 'pointer',
          }}
        >
          Select All
        </button>
        <button
          onClick={handleClearAll}
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      <div
        style={{
          maxHeight: '150px',
          overflowY: 'auto',
          border: '1px solid #eee',
          padding: '6px',
          backgroundColor: '#fafafa',
        }}
      >
        {uniqueStates.sort().map(state => (
          <div key={state} style={{ marginBottom: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedStates.has(state)}
                onChange={(e) => handleStateChange(state, e.target.checked)}
                style={{ marginRight: '6px' }}
              />
              <span>{state}</span>
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        Selected: {selectedStates.size} of {uniqueStates.length} states
      </div>
    </div>
  );
};
