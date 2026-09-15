import type React from 'react';

interface ProfitLegendProps {
  minProfit: number;
  maxProfit: number;
}

export const ProfitLegend: React.FC<ProfitLegendProps> = ({ minProfit, maxProfit }) => {
  return (
    <div
      style={{
        padding: '8px',
        background: '#fff',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#333',
        }}
      >
        SUM(Profit)
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '10px',
          color: '#333',
        }}
      >
        <span style={{ marginRight: '6px' }}>{minProfit.toFixed(0)}</span>
        <div
          style={{
            flex: 1,
            height: '12px',
            background: 'linear-gradient(to right, #a50026, #d73027, #f46d43, #fdae61, #fee08b, #d9ef8b, #a6d96a, #66bd63, #1a9850, #006837)',
            borderRadius: '2px',
          }}
        />
        <span style={{ marginLeft: '6px' }}>{maxProfit.toFixed(0)}</span>
      </div>
      <div
        style={{
          fontSize: '9px',
          color: '#666',
          marginTop: '2px',
          textAlign: 'center',
        }}
      >
        Low → High
      </div>
    </div>
  );
};
