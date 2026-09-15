import React from 'react';
import type { AggregatedData } from '../../types';
import { formatNumber } from '../../utils/chartUtils';

interface CustomTableViewProps {
  data: AggregatedData[];
  title?: string;
  rowsField: 'productName' | 'category' | 'subCategory';
  showCategory?: boolean;
  showSubCategory?: boolean;
}

export const CustomTableView: React.FC<CustomTableViewProps> = ({
  data,
  title,
  rowsField,
  showCategory = false,
  showSubCategory = false,
}) => {
  const getLabel = (d: AggregatedData) => {
    if (rowsField === 'productName') return d.productName || '';
    if (rowsField === 'category') return d.category || '';
    if (rowsField === 'subCategory') return d.subCategory || '';
    return '';
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#666',
          marginBottom: '10px',
          fontFamily: 'Tableau Book, Arial, sans-serif',
        }}>
          {title}
        </h3>
      )}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
            {showCategory && (
              <th style={{
                padding: '8px',
                textAlign: 'left',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
              }}>
                Category
              </th>
            )}
            {showSubCategory && (
              <th style={{
                padding: '8px',
                textAlign: 'left',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
              }}>
                Sub-Category
              </th>
            )}
            <th style={{
              padding: '8px',
              textAlign: 'left',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              backgroundColor: '#f5f5f5',
            }}>
              {rowsField === 'productName' ? 'Product Name' :
               rowsField === 'category' ? 'Category' :
               rowsField === 'subCategory' ? 'Sub-Category' : ''}
            </th>
            <th style={{
              padding: '8px',
              textAlign: 'right',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              backgroundColor: '#f5f5f5',
            }}>
              Sales
            </th>
            <th style={{
              padding: '8px',
              textAlign: 'right',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              backgroundColor: '#f5f5f5',
            }}>
              Profit
            </th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #eee',
                backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
              }}
            >
              {showCategory && (
                <td style={{ padding: '8px' }}>{item.category}</td>
              )}
              {showSubCategory && (
                <td style={{ padding: '8px' }}>{item.subCategory}</td>
              )}
              <td style={{ padding: '8px' }}>{getLabel(item)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                {formatNumber(item.sales)}
              </td>
              <td style={{
                padding: '8px',
                textAlign: 'right',
                color: item.profit >= 0 ? '#2c7bb6' : '#d7191c',
              }}>
                {formatNumber(item.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
