import React from 'react';
import type { KPICardProps } from '../types';

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  percentage,
  type,
  onClick,
}) => {
  const bgColor = type === 'positive' ? '#29c832' : '#ff3333';
  const cursorStyle = onClick ? 'cursor-pointer' : 'cursor-default';

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        color: '#ffffff',
        padding: '16px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '150px',
        cursor: cursorStyle,
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 'normal' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{percentage}</div>
    </div>
  );
};

export default KPICard;
