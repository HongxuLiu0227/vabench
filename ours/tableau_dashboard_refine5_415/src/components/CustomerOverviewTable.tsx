import type { CustomerOverviewData } from '../types';

interface CustomerOverviewTableProps {
  data: CustomerOverviewData[];
  width: number;
  height: number;
  title?: string;
}

export const CustomerOverviewTable: React.FC<CustomerOverviewTableProps> = ({ data, width, height, title }) => {
  const tableWidth = width - 40;
  const colWidth = tableWidth / 5;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      style={{
        width,
        height,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', width: colWidth }}>Region</th>
              <th style={{ padding: '10px', textAlign: 'right', width: colWidth }}>Sales</th>
              <th style={{ padding: '10px', textAlign: 'right', width: colWidth }}>Quantity</th>
              <th style={{ padding: '10px', textAlign: 'right', width: colWidth }}>Profit</th>
              <th style={{ padding: '10px', textAlign: 'right', width: colWidth }}>Customer Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.region}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>{row.region}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${formatNumber(row.sales)}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{row.quantity.toLocaleString()}</td>
                <td
                  style={{
                    padding: '10px',
                    textAlign: 'right',
                    color: row.profit >= 0 ? '#2ca02c' : '#d62728',
                  }}
                >
                  ${formatNumber(row.profit)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{row.customerCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
