import React, { useState, useEffect } from 'react';
import './Table.css';

type Column = {
  title: string;
  dataIndex: string;
  key: string;
  render?: (text: string, record: any) => React.ReactNode;
};

type TableProps = {
  columns: Column[];
  data: any[];
  variant?: 'default' | 'striped' | 'bordered';
  onRowClick?: (record: any) => void;
};

const Table: React.FC<TableProps> = ({ columns, data, variant = 'default', onRowClick }) => {
  const [sortedData, setSortedData] = useState<any[]>(data);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSortedData(sorted);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'striped':
        return 'table-striped';
      case 'bordered':
        return 'table-bordered';
      default:
        return '';
    }
  };

  return (
    <div className={`table-container ${getVariantClass()}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                onClick={() => requestSort(column.dataIndex)}
                className={sortConfig?.key === column.dataIndex ? `sorted-${sortConfig.direction}` : ''}
              >
                {column.title}
                {sortConfig?.key === column.dataIndex && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable-row' : ''}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;