import type { CustomerOverviewData } from '../../types';

interface P1968CustomerOverviewProps {
  data: CustomerOverviewData[];
  width?: number;
  height?: number;
}

export function P1968__customer_overview({ data, width = 400, height = 400 }: P1968CustomerOverviewProps) {
  // Sort regions in a logical order
  const sortedData = [...data].sort((a, b) => a.region.localeCompare(b.region));

  return (
    <div style={{ width, height, overflow: 'auto' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Customer Overview</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          border: '1px solid #ddd'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Region</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Sales</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Quantity</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Profit</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Profit Ratio</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={row.region}
              style={{
                backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                borderBottom: '1px solid #eee'
              }}
            >
              <td style={{ padding: '8px', textAlign: 'left' }}>{row.region}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                ${row.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                {row.quantity.toLocaleString()}
              </td>
              <td style={{
                padding: '8px',
                textAlign: 'right',
                color: row.profit >= 0 ? 'green' : 'red'
              }}>
                ${row.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{
                padding: '8px',
                textAlign: 'right',
                color: row.profitRatio >= 0 ? 'green' : 'red'
              }}>
                {(row.profitRatio * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
