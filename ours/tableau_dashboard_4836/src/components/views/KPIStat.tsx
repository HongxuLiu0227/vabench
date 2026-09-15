import React from 'react';

interface KPIStatProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

const KPIStat: React.FC<KPIStatProps> = ({
  title,
  value,
  subtitle,
  color = '#2196F3'
}) => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        textAlign: 'center',
        minWidth: '150px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
          fontWeight: '500',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color,
          marginBottom: subtitle ? '4px' : '0',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '12px',
            color: '#999',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default KPIStat;
