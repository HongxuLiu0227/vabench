/**
 * GoToHomeButton Component
 * A navigation button that appears in the dashboard header
 */

import { useNavigate } from 'react-router-dom';

const GoToHomeButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: '#4a4a4a',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        fontFamily: 'Calibri',
        fontSize: '14px',
        cursor: 'pointer',
        borderRadius: '2px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#5a5a5a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#4a4a4a';
      }}
    >
      Go to home
    </button>
  );
};

export default GoToHomeButton;
