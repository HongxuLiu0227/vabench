interface KPICardProps {
  title: string;
  value: number;
  format: 'currency' | 'number' | 'percent';
}

export function KPICard({ title, value, format }: KPICardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${(value * 100).toFixed(2)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        {formatValue()}
      </div>
    </div>
  );
}
