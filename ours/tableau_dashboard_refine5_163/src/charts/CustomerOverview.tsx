import { useState } from 'react';
import * as d3 from 'd3';
import type { RegionAggregation } from '../types/data';

interface CustomerOverviewProps {
  data: RegionAggregation[];
}

interface TooltipData {
  region: string;
  countCustomers: number;
  sumSales: number;
  sumQuantity: number;
  sumProfit: number;
  profitRatio: number;
  x: number;
  y: number;
}

export function CustomerOverview({ data }: CustomerOverviewProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Diverging color scale for profit ratio (red to blue, centered at 0)
  const profitRatioColorScale = d3.scaleDiverging<string>()
    .domain([-0.5, 0, 0.5])
    .interpolator(d3.interpolateRdBu);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleMouseEnter = (event: React.MouseEvent, row: RegionAggregation) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      region: row.region,
      countCustomers: row.countCustomers,
      sumSales: row.sumSales,
      sumQuantity: row.sumQuantity,
      sumProfit: row.sumProfit,
      profitRatio: row.profitRatio,
      x: rect.right + 10,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Handle empty data gracefully
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: '#666',
          fontSize: '14px',
        }}
      >
        No data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Region</th>
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
              onMouseEnter={(e) => handleMouseEnter(e, row)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              <td style={{ padding: '8px', textAlign: 'left' }}>{row.region}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(row.sumSales)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{row.sumQuantity.toLocaleString()}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(row.sumProfit)}</td>
              <td
                style={{
                  padding: '8px',
                  textAlign: 'right',
                  backgroundColor: profitRatioColorScale(row.profitRatio),
                }}
              >
                {formatPercent(row.profitRatio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
            {tooltip.region}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            <strong>Number of Customers:</strong> {tooltip.countCustomers}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            <strong>Sales:</strong> {formatCurrency(tooltip.sumSales)}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            <strong>Profit:</strong> {formatCurrency(tooltip.sumProfit)}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            <strong>Quantity:</strong> {tooltip.sumQuantity.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Profit Ratio:</strong> {formatPercent(tooltip.profitRatio)}
          </div>
        </div>
      )}
    </div>
  );
}
