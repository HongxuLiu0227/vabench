import type { RegionAggregation } from '../services/types';
import * as d3 from 'd3';

interface DiscountOverviewProps {
  data: RegionAggregation[];
}

const MEASURES = [
  { key: 'avgDiscount', label: 'Discount', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'sumProfit', label: 'Profit', format: (v: number) => `$${v.toFixed(2)}` },
  { key: 'sumQuantity', label: 'Quantity', format: (v: number) => v.toLocaleString() },
  { key: 'sumSales', label: 'Sales', format: (v: number) => `$${v.toFixed(2)}` },
  { key: 'profitRatio', label: 'Profit Ratio', format: (v: number) => `${(v * 100).toFixed(1)}%` },
] as const;

export function DiscountOverview({ data }: DiscountOverviewProps) {
  const colorScale = d3
    .scaleLinear<string>()
    .domain([0, 0.4])
    .range(['#4575b4', '#d73027'])
    .interpolate(d3.interpolateRgb);

  const regions = data.map((d) => d.region);

  return (
    <div style={{ overflow: 'auto' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '12px',
        }}
        role="table"
        aria-label="Discount Overview by Region table"
      >
        <thead>
          <tr>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'left',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
            >
              Region
            </th>
            {MEASURES.map((measure) => (
              <th
                key={measure.key}
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'right',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                }}
              >
                {measure.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => {
            const regionData = data.find((d) => d.region === region);
            if (!regionData) return null;

            const discount = regionData.avgDiscount;
            const bgColor = colorScale(Math.min(Math.max(discount, 0), 0.4));

            return (
              <tr key={region}>
                <td
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left',
                    fontWeight: '500',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {region}
                </td>
                {MEASURES.map((measure) => {
                  const value = regionData[measure.key] as number;
                  const formattedValue = measure.format(value);
                  const isDiscount = measure.key === 'avgDiscount';

                  return (
                    <td
                      key={measure.key}
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'right',
                        backgroundColor: isDiscount ? (bgColor as string) : 'white',
                        color: isDiscount && discount > 0.25 ? 'white' : 'black',
                      }}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
