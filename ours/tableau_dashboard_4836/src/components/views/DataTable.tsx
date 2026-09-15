import React, { useState } from 'react';
import type { FacilityDetail } from '../../types';

interface DataTableProps {
  data: FacilityDetail[];
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  pageSize = 50
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = data.slice(startIndex, endIndex);

  const getUploadStatusColor = (status: string): string => {
    switch (status) {
      case 'CT & PKVs Uploaded':
        return '#4CAF50';
      case 'Only CT Uploaded; No PKVs':
        return '#FFC107';
      case 'Not Uploaded this month':
        return '#FF9800';
      case 'Never Uploaded to DWH':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRecencyColor = (recency: string): string => {
    switch (recency) {
      case 'Good':
        return '#4CAF50';
      case 'Average':
        return '#FFC107';
      case 'Bad':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #ddd',
              }}
            >
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                MFL Code
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                Facility Name
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                County
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                Partner
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                Upload Status
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                Recency
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                Last Upload Date
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, index) => (
              <tr
                key={`${row.mflCode}-${index}`}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#333',
                  }}
                >
                  {row.mflCode}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#333',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.facilityName}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#333',
                  }}
                >
                  {row.county}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#333',
                  }}
                >
                  {row.partner}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      backgroundColor: getUploadStatusColor(row.uploadStatus),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.uploadStatus}
                  </span>
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      backgroundColor: getRecencyColor(row.recency),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}
                  >
                    {row.recencyMonths >= 0 ? `${row.recencyMonths} months` : 'Never'}
                  </span>
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#333',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.lastUploadDate || 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #ddd',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#666',
            }}
          >
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === 0 ? '#ccc' : '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage >= totalPages - 1 ? '#ccc' : '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
