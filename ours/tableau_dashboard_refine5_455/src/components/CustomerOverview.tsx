import { useState } from 'react';
import { scaleDiverging } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import type { CustomerOverviewData } from '../types';

interface CustomerOverviewProps {
  data: CustomerOverviewData[];
  width: number;
  height: number;
}

export function CustomerOverview({ data, width, height }: CustomerOverviewProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });

  // Create diverging color scale for profit ratio (-0.5 to 0.5)
  const colorScale = scaleDiverging<string>()
    .domain([-0.5, 0, 0.5])
    .interpolator(interpolateRdYlGn);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatRatio = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div style={{ position: 'relative', width, height, overflow: 'auto' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Customer Overview</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          border: '1px solid #e0e0e0',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Region</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Number of Customers</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Sales</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Quantity</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Profit</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Profit Ratio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.region}
              style={{ borderBottom: '1px solid #eee' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: rect.right + 10,
                  y: rect.top,
                  content: (
                    <div style={{ padding: '8px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>{row.region}</div>
                      <div style={{ marginBottom: '4px' }}>Number of Customers: {formatNumber(row.numberOfCustomers)}</div>
                      <div style={{ marginBottom: '4px' }}>Sales: {formatCurrency(row.sales)}</div>
                      <div style={{ marginBottom: '4px' }}>Quantity: {formatNumber(row.quantity)}</div>
                      <div style={{ marginBottom: '4px' }}>Profit: {formatCurrency(row.profit)}</div>
                      <div>Profit Ratio: {formatRatio(row.profitRatio)}</div>
                    </div>
                  ),
                });
              }}
              onMouseMove={(e) => {
                setTooltip((prev) => ({
                  ...prev,
                  x: e.clientX + 10,
                  y: e.clientY,
                }));
              }}
              onMouseLeave={() => {
                setTooltip((prev) => ({ ...prev, visible: false }));
              }}
            >
              <td style={{ padding: '8px', textAlign: 'left' }}>{row.region}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(row.numberOfCustomers)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(row.sales)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(row.quantity)}</td>
              <td style={{ padding: '8px', textAlign: 'right', backgroundColor: colorScale(Math.max(-0.5, Math.min(0.5, row.profitRatio))) }}>
                {formatCurrency(row.profit)}
              </td>
              <td style={{ padding: '8px', textAlign: 'right', backgroundColor: colorScale(Math.max(-0.5, Math.min(0.5, row.profitRatio))) }}>
                {formatRatio(row.profitRatio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
