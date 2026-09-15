import type { ABTestingDataWithAgeGroup } from '../../types/data';

interface BalanceAgeTableProps {
  data: ABTestingDataWithAgeGroup[];
  avgGroupBalance: number;
  width: number;
  height: number;
  title?: string;
}

export function BalanceAgeTable({
  data,
  avgGroupBalance,
  width,
  height,
  title
}: BalanceAgeTableProps) {
  // Calculate delta for each row
  const tableData = data.map(row => ({
    client_id: row.client_id,
    balance: row.bal,
    avgGroupBalance: avgGroupBalance,
    delta: row.bal - avgGroupBalance
  }));

  return (
    <div style={{ width, height, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          flexShrink: 0
        }}>
          {title}
        </div>
      )}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        flex: 1,
        overflow: 'auto'
      }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Client ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>AVG(bal)</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Avg. Group Balance</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Delta</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={row.client_id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.client_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                {row.balance.toFixed(2)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                {row.avgGroupBalance.toFixed(2)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                {row.delta.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
