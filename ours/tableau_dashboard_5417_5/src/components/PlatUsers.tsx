import type { PlatformMetrics } from '../types';

interface PlatUsersProps {
  data: PlatformMetrics[];
}

export function PlatUsers({ data }: PlatUsersProps) {
  return (
    <div className="plat-users-container">
      <h3
        style={{
          color: '#c0c0c0',
          fontSize: '11px',
          marginBottom: '10px',
        }}
      >
        Users
      </h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 4px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              Platform
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px 4px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              Positive
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px 4px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              Neutral
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px 4px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              Negative
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px 4px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((platform) => (
            <tr
              key={platform.platform}
              style={{
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <td
                style={{
                  padding: '8px 4px',
                  fontWeight: '500',
                  color: '#333',
                }}
              >
                {platform.platform}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px 4px',
                  color: '#28a745',
                }}
              >
                {platform.positive_users.toLocaleString()}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px 4px',
                  color: '#ffc107',
                }}
              >
                {platform.neutral_users.toLocaleString()}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px 4px',
                  color: '#dc3545',
                }}
              >
                {platform.negative_users.toLocaleString()}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px 4px',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                {platform.total_users.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
