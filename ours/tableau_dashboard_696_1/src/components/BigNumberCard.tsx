import type { MaxPriceInfo } from '../types/stockData';

interface BigNumberCardProps {
  label: string;
  maxInfo: MaxPriceInfo | null;
  loading?: boolean;
}

export function BigNumberCard({ label, maxInfo, loading }: BigNumberCardProps) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#b4b4b4',
        fontFamily: 'Calibri, sans-serif',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          marginBottom: '10px',
          textAlign: 'left',
        }}
      >
        {label}
      </div>
      {loading ? (
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      ) : maxInfo ? (
        <>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '5px',
              lineHeight: '1.2',
            }}
          >
            {formatCurrency(maxInfo.value)}
          </div>
          <div
            style={{
              fontSize: '12px',
              opacity: 0.8,
            }}
          >
            {formatDate(maxInfo.date)}
          </div>
        </>
      ) : (
        <div style={{ fontSize: '14px', color: '#666' }}>No data</div>
      )}
    </div>
  );
}
