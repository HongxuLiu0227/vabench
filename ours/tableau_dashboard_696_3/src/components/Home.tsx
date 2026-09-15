/**
 * Home Component
 * Simple landing page
 */

import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Calibri, sans-serif',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        Stock Prediction Dashboard
      </h1>
      <p style={{ fontSize: '16px', color: '#b4b4b4', marginBottom: '30px' }}>
        View model accuracy and predictions
      </p>
      <Link
        to="/dashboard"
        style={{
          backgroundColor: '#4a4a4a',
          color: '#fff',
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '2px',
          fontSize: '16px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5a5a5a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4a4a4a';
        }}
      >
        View Dashboard
      </Link>
    </div>
  );
};

export default Home;
