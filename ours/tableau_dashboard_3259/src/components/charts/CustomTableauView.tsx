import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  size = 'medium',
}) => {
  return (
    <div className="kpi-card" style={{
      padding: '16px',
      textAlign: 'center',
      background: '#fff',
      borderRadius: '4px',
    }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{
        fontSize: size === 'small' ? '28px' : size === 'medium' ? '32px' : '40px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: subtitle ? '8px' : '0',
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '14px', color: '#999' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

interface TextDisplayProps {
  label: string;
  value: string;
  size?: 'small' | 'medium' | 'large';
}

export const TextDisplay: React.FC<TextDisplayProps> = ({
  label,
  value,
  size = 'medium',
}) => {
  const fontSize = size === 'small' ? '16px' : size === 'medium' ? '20px' : '28px';

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      {label && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          {label}
        </div>
      )}
      <div style={{ fontSize, fontWeight: 'bold', color: '#333' }}>
        {value}
      </div>
    </div>
  );
};

interface DataCountProps {
  count: number;
  label?: string;
}

export const DataCount: React.FC<DataCountProps> = ({ count, label }) => {
  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#333',
      }}>
        {count.toLocaleString()}
      </div>
      {label && (
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          {label}
        </div>
      )}
    </div>
  );
};

interface DateRangeProps {
  minDate: Date;
  maxDate: Date;
  label?: string;
}

export const DateRange: React.FC<DateRangeProps> = ({
  minDate,
  maxDate,
  label,
}) => {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      {label && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: '16px', color: '#333' }}>
        {formatDate(minDate)} ~ {formatDate(maxDate)}
      </div>
    </div>
  );
};
