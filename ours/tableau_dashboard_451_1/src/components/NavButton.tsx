import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavButtonProps {
  onReset?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ onReset }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Reset any filters and navigate to home
    if (onReset) {
      onReset();
    }
    navigate('/', { replace: true });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-block',
        backgroundColor: '#f28e2b',
        color: '#f1ce63',
        border: '1px dashed #000000',
        padding: '10px 20px',
        fontFamily: 'Arial',
        fontSize: '11px',
        cursor: 'pointer',
        textAlign: 'center',
        borderRadius: '2px'
      }}
    >
      Reset View
    </button>
  );
};

export default NavButton;
