import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CustomerOverviewData, MeasureType } from '../../types/dashboard';

interface CustomerOverviewProps {
  data: CustomerOverviewData[];
}

const MEASURES: MeasureType[] = ['salesPerCustomer', 'sales', 'quantity', 'profit', 'profitRatio'];

const MEASURE_LABELS: Record<MeasureType, string> = {
  salesPerCustomer: 'Sales per Customer',
  sales: 'Sales',
  quantity: 'Quantity',
  profit: 'Profit',
  profitRatio: 'Profit Ratio',
};

function formatValue(measure: MeasureType, value: number): string {
  switch (measure) {
    case 'salesPerCustomer':
    case 'sales':
    case 'profit':
      return d3.format(',.2f')(value);
    case 'quantity':
      return d3.format(',.0f')(value);
    case 'profitRatio':
      return d3.format('.2%')(value);
    default:
      return String(value);
  }
}

function getTextColor(value: number): string {
  // Black text for very light backgrounds, white for dark
  if (Math.abs(value) < 0.1) {
    return '#000000';
  }
  return '#000000';
}

export function CustomerOverview({ data }: CustomerOverviewProps) {
  // Color scale for profit ratio (-0.5 to 0.5)
  const colorScale = useMemo(
    () =>
      d3.scaleDiverging<string>([-0.5, 0, 0.5], ['#d7191c', '#ffffbf', '#2c7bb6']),
    []
  );

  return (
    <div className="worksheet" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
        Customer Overview
      </h3>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '12px',
          fontFamily: 'sans-serif',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '6px',
                textAlign: 'left',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
            >
              Region
            </th>
            {MEASURES.map((measure) => (
              <th
                key={measure}
                style={{
                  border: '1px solid #ccc',
                  padding: '6px',
                  textAlign: 'right',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  minWidth: '80px',
                }}
              >
                {MEASURE_LABELS[measure]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.region}>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '6px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  backgroundColor: '#fafafa',
                }}
              >
                {row.region}
              </td>
              {MEASURES.map((measure) => {
                const value = row[measure];
                const backgroundColor =
                  measure === 'profitRatio' ? colorScale(value) : 'transparent';
                const textColor = getTextColor(value);

                return (
                  <td
                    key={measure}
                    style={{
                      border: '1px solid #ccc',
                      padding: '6px',
                      textAlign: 'right',
                      backgroundColor,
                      color: textColor,
                      cursor: 'pointer',
                    }}
                    title={`${row.region}\n${MEASURE_LABELS[measure]}: ${formatValue(measure, value)}\nCustomers: ${row.customerCount}\nSales: ${d3.format(',.2f')(row.sales)}\nQuantity: ${d3.format(',.0f')(row.quantity)}\nProfit: ${d3.format(',.2f')(row.profit)}\nProfit Ratio: ${d3.format('.2%')(row.profitRatio)}`}
                  >
                    {formatValue(measure, value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
