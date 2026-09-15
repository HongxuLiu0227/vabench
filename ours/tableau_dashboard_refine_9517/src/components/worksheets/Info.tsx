import { useMemo } from 'react';
import type { ParsedOrder } from '../../types';

interface InfoProps {
  data: ParsedOrder[];
}

export function Info({ data }: InfoProps) {
  const metrics = useMemo(() => {
    const totalSales = data.reduce((sum, row) => sum + row['Sales'], 0);
    const totalProfit = data.reduce((sum, row) => sum + row['Profit'], 0);
    const totalOrders = new Set(data.map((row) => row['Order ID'])).size;
    const avgOrderValue = totalSales / totalOrders;
    const profitRatio = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalProfit,
      totalOrders,
      avgOrderValue,
      profitRatio,
    };
  }, [data]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold' }}>
        Dashboard Overview
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <MetricCard
          label="Total Sales"
          value={metrics.totalSales}
          format="currency"
        />
        <MetricCard
          label="Total Profit"
          value={metrics.totalProfit}
          format="currency"
        />
        <MetricCard
          label="Total Orders"
          value={metrics.totalOrders}
          format="number"
        />
        <MetricCard
          label="Avg Order Value"
          value={metrics.avgOrderValue}
          format="currency"
        />
        <MetricCard
          label="Profit Ratio"
          value={metrics.profitRatio}
          format="percentage"
        />
      </div>

      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
        }}
      >
        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
          <strong>Tip:</strong> Click on any bar or circle to filter the dashboard.
          Click again to clear the filter.
        </p>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percentage';
}

function MetricCard({ label, value, format }: MetricCardProps) {
  const formattedValue = (() => {
    switch (format) {
      case 'currency':
        return value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      case 'number':
        return value.toLocaleString('en-US');
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return String(value);
    }
  })();

  return (
    <div
      style={{
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}
    >
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{formattedValue}</div>
    </div>
  );
}
