import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onReset?: () => void;
}

export function DashboardHeader({ onReset }: DashboardHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: '#b4b4b4',
        color: '#000000',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '15px',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 'normal' }}>
        Exploring data patterns
      </div>
      <Link
        to="/"
        onClick={onReset}
        style={{
          color: '#000000',
          fontSize: '15px',
          textDecoration: 'none',
          cursor: 'pointer',
          fontFamily: 'Calibri, sans-serif',
        }}
      >
        &lt;Home&gt;
      </Link>
    </div>
  );
}
