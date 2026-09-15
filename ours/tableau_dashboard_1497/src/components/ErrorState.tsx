import React from 'react';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div
      className="dashboard-container"
      role="alert"
      aria-live="assertive"
    >
      <div className="error">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          aria-hidden="true"
          style={{ marginRight: '15px' }}
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="#d32f2f"
            stroke="#b71c1c"
            strokeWidth="2"
          />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
          >
            !
          </text>
        </svg>
        <span>Error: {message}</span>
      </div>
    </div>
  );
};
