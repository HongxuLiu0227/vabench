import { formatCurrency, formatPercent } from '../utils/formatters';

interface KPICardProps {
  title: string;
  value: number;
  format: 'currency' | 'percent' | 'number';
}

/**
 * KPI Card component for displaying summary metrics
 */
export const KPICard = ({ title, value, format }: KPICardProps) => {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
        return val.toLocaleString();
      default:
        return val.toString();
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        padding: '16px',
        margin: '8px',
        minWidth: '200px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
          fontFamily: 'sans-serif'
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'sans-serif'
        }}
      >
        {formatValue(value)}
      </div>
    </div>
  );
};
