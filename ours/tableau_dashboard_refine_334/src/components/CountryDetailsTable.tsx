import type { CountryDetail } from '../types/libraryData';

interface CountryDetailsTableProps {
  data: CountryDetail[];
}

export const CountryDetailsTable: React.FC<CountryDetailsTableProps> = ({
  data,
}) => {
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '8px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Country
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Expenditures (US Dollars)
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Total Users
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Total Volumes
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.Country}
              style={{
                borderBottom: index < data.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <td
                style={{
                  padding: '8px',
                  textAlign: 'left',
                  color: '#333',
                }}
              >
                {item.Country}
              </td>
              <td
                style={{
                  padding: '8px',
                  textAlign: 'right',
                  color: '#333',
                }}
              >
                {formatNumber(item['Expenditures  (US Dollars)'])}
              </td>
              <td
                style={{
                  padding: '8px',
                  textAlign: 'right',
                  color: '#333',
                }}
              >
                {formatNumber(item['Total Users'])}
              </td>
              <td
                style={{
                  padding: '8px',
                  textAlign: 'right',
                  color: '#333',
                }}
              >
                {formatNumber(item['Total Volumes'])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
