import React from 'react';
import { aggregateByRegion, formatCurrency, formatPercentage } from '../services/dataService';
import type { SalesData } from '../services/dataService';

interface SaleRegionProps {
  data: SalesData[];
  onRegionHover: (region: string | null) => void;
}

const SaleRegion: React.FC<SaleRegionProps> = ({ data, onRegionHover }) => {
  const regionData = aggregateByRegion(data);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#72b966'
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: '3px solid #00ffc7',
                padding: '8px',
                textAlign: 'left',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0'
              }}
            >
              Region
            </th>
            <th
              style={{
                border: '3px solid #00ffc7',
                padding: '8px',
                textAlign: 'right',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0'
              }}
            >
              Sales
            </th>
            <th
              style={{
                border: '3px solid #00ffc7',
                padding: '8px',
                textAlign: 'right',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0'
              }}
            >
              Profit
            </th>
            <th
              style={{
                border: '3px solid #00ffc7',
                padding: '8px',
                textAlign: 'right',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0'
              }}
            >
              Profit Ratio
            </th>
          </tr>
        </thead>
        <tbody>
          {regionData.map((row, index) => (
            <tr
              key={row.Region}
              onMouseEnter={() => onRegionHover(row.Region)}
              onMouseLeave={() => onRegionHover(null)}
              style={{
                cursor: 'pointer',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9'
              }}
            >
              <td
                style={{
                  border: '3px solid #00ffc7',
                  padding: '8px',
                  textAlign: 'left'
                }}
              >
                {row.Region}
              </td>
              <td
                style={{
                  border: '3px solid #00ffc7',
                  padding: '8px',
                  textAlign: 'right'
                }}
              >
                {formatCurrency(row.Sales)}
              </td>
              <td
                style={{
                  border: '3px solid #00ffc7',
                  padding: '8px',
                  textAlign: 'right'
                }}
              >
                {formatCurrency(row.Profit)}
              </td>
              <td
                style={{
                  border: '3px solid #00ffc7',
                  padding: '8px',
                  textAlign: 'right'
                }}
              >
                {formatPercentage(row.ProfitRatio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SaleRegion;
