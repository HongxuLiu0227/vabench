/**
 * Dashboard Text Zone component
 * Renders informational text at the bottom of the dashboard
 */

import React from 'react';

const DashboardTextZone: React.FC = () => {
  return (
    <div className="dashboard-text-zone" style={{
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      fontSize: '10px',
      fontFamily: 'Calibri, sans-serif',
      color: '#000000',
      lineHeight: '1.5',
    }}>
      <p style={{ margin: '0 0 8px 0' }}>
        The <strong>Overall reporting rate</strong> refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth.
      </p>
      <p style={{ margin: '0 0 8px 0' }}>
        <strong>PKVs = Patient Key Value</strong> is a concatenation of a patients Gender + Soundex value of Firstname + Double Metaphone value of Lastname + Date of Birth
      </p>
      <p style={{ margin: '0' }}>
        PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level and Linking patient records within and across facilities.
      </p>
    </div>
  );
};

export default DashboardTextZone;
