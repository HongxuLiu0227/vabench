import React from 'react';
import type { RegionMetrics } from '../types';

interface DiscountOverviewProps {
  data: RegionMetrics[];
  title: string;
  width: number;
  height: number;
}

export const DiscountOverview: React.FC<DiscountOverviewProps> = ({ data, title, width, height }) => {
  // Define the measures to display based on the manual_sort in tableau_spec.json
  const measures = [
    { key: 'avgDiscount', label: 'Avg Discount', format: (v: number) => (v * 100).toFixed(2) + '%' },
    { key: 'sumProfit', label: 'Total Profit', format: (v: number) => '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'sumQuantity', label: 'Total Quantity', format: (v: number) => v.toLocaleString() },
    { key: 'sumSales', label: 'Total Sales', format: (v: number) => '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'countCustomers', label: 'Customer Count', format: (v: number) => v.toLocaleString() },
  ];

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  const cellStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    textAlign: 'left',
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  };

  const numberCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: 'right',
  };

  return (
    <div style={{ width, height, overflow: 'auto', padding: '10px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>{title}</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Region</th>
            {measures.map((measure) => (
              <th key={measure.key} style={{ ...headerCellStyle, textAlign: 'right' }}>
                {measure.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((region) => (
            <tr key={region.region}>
              <td style={cellStyle}>{region.region}</td>
              {measures.map((measure) => {
                const value = region[measure.key as keyof RegionMetrics] as number;
                return (
                  <td key={measure.key} style={numberCellStyle}>
                    {measure.format(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
