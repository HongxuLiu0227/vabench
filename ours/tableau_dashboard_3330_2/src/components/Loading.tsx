import React from 'react';
import './Loading.css';

export const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading data...</div>
    </div>
  );
};
