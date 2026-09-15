import type { RegionalMetrics } from '../types';

interface RegionalTableProps {
  data: RegionalMetrics[];
  title: string;
}

export function RegionalTable({ data, title }: RegionalTableProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="regional-table-container">
      <h3 className="chart-title">{title}</h3>
      <table className="regional-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Avg Discount</th>
            <th>Total Profit</th>
            <th>Total Sales</th>
            <th>Quantity</th>
            <th>Customers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.region}>
              <td>{row.region}</td>
              <td>{formatPercent(row.avgDiscount)}</td>
              <td>{formatCurrency(row.sumProfit)}</td>
              <td>{formatCurrency(row.sumSales)}</td>
              <td>{formatNumber(row.sumQuantity)}</td>
              <td>{formatNumber(row.customerCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
