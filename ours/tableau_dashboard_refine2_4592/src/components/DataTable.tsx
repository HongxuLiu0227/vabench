import { useMemo } from 'react';
import { OfficeSupplyData, TableMeasure } from '../types';
import { useDashboardFilters } from '../contexts/DashboardContext';

interface Props {
  data: OfficeSupplyData[];
}

export function DataTable({ data }: Props) {
  const { filters, setItem } = useDashboardFilters();

  // Aggregate data by Item
  const tableData = useMemo(() => {
    const grouped = new Map<string, TableMeasure>();

    data.forEach(row => {
      const item = row.Item;

      if (!grouped.has(item)) {
        grouped.set(item, {
          Item: item,
          Revenue: 0,
          'Units Sold': 0,
        });
      }

      const measure = grouped.get(item)!;
      measure.Revenue += Number(row.Revenue);
      measure['Units Sold'] += Number(row['Units Sold']);
    });

    // Convert to array and sort by Revenue descending
    return Array.from(grouped.values()).sort((a, b) => b.Revenue - a.Revenue);
  }, [data]);

  const handleRowClick = (item: string) => {
    // Auto-clear behavior: if clicking same row, clear filter
    if (filters.selectedItem === item) {
      setItem(null);
    } else {
      setItem(item);
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
            <th
              style={{
                padding: '8px',
                textAlign: 'left',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
              }}
            >
              Item
            </th>
            <th
              style={{
                padding: '8px',
                textAlign: 'right',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
              }}
            >
              Revenue
            </th>
            <th
              style={{
                padding: '8px',
                textAlign: 'right',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
              }}
            >
              Units Sold
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => {
            const isSelected = filters.selectedItem === row.Item;
            return (
              <tr
                key={row.Item}
                onClick={() => handleRowClick(row.Item)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f28e2b' : 'transparent',
                  opacity: filters.selectedItem && !isSelected ? 0.3 : 1,
                  borderBottom: '1px solid #eee',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <td
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: isSelected ? '#fff' : '#333',
                  }}
                >
                  {row.Item}
                </td>
                <td
                  style={{
                    padding: '8px',
                    textAlign: 'right',
                    color: isSelected ? '#fff' : '#333',
                  }}
                >
                  ${row.Revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td
                  style={{
                    padding: '8px',
                    textAlign: 'right',
                    color: isSelected ? '#fff' : '#333',
                  }}
                >
                  {row['Units Sold'].toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: '10px',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        Click a row to filter by Item
      </div>
    </div>
  );
}
