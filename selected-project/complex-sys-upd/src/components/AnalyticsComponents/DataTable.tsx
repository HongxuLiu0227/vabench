import React from 'react';

type Column = {
  header: string;
  accessor: string;
  format?: (value: any) => string;
};

type DataTableProps<T> = {
  columns: Column[];
  data: T[];
};

export default function DataTable(props: DataTableProps<any>) {
  const { columns, data } = props;

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.format 
                    ? column.format(row[column.accessor]) 
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// CSS should be added to your global styles or component-specific styles
// Example CSS:
// .data-table-container {
//   overflow-x: auto;
// }
// .data-table {
//   width: 100%;
//   border-collapse: collapse;
// }
// .data-table th, .data-table td {
//   padding: 12px 15px;
//   text-align: left;
//   border-bottom: 1px solid #ddd;
// }
// .data-table th {
//   background-color: #f8f9fa;
//   font-weight: 600;
// }