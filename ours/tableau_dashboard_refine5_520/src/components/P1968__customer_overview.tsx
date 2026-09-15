import { useState } from 'react';
import * as d3 from 'd3';
import type { RegionMetrics } from '../types';

interface P1968CustomerOverviewProps {
  data: RegionMetrics[];
}

const P1968CustomerOverview: React.FC<P1968CustomerOverviewProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  // Create color scale for Profit Ratio (-0.5 to 0.5)
  const colorScale = d3.scaleDiverging<string, string>(d3.interpolateRdBu)
    .domain([0.5, 0, -0.5]);

  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const handleCellHover = (
    event: React.MouseEvent<HTMLTableCellElement>,
    region: string,
    measureName: string,
    measureValue: number,
    metrics: RegionMetrics
  ) => {
    setTooltip({
      visible: true,
      x: event.pageX + 10,
      y: event.pageY - 10,
      content: `
        <div style="font-weight: bold; margin-bottom: 4px;">${region}</div>
        <div>Number of Customers: ${metrics.CustomerCount}</div>
        <div style="margin-top: 4px;"><strong>${measureName}:</strong> ${measureName === 'Profit Ratio' ? formatPercentage(measureValue) : formatCurrency(measureValue)}</div>
        ${measureName !== 'Sales' ? `<div>Sales: ${formatCurrency(metrics.Sales)}</div>` : ''}
        ${measureName !== 'Quantity' ? `<div>Quantity: ${metrics.Quantity}</div>` : ''}
        ${measureName !== 'Profit' ? `<div>Profit: ${formatCurrency(metrics.Profit)}</div>` : ''}
        ${measureName !== 'Profit Ratio' ? `<div>Profit Ratio: ${formatPercentage(metrics.ProfitRatio)}</div>` : ''}
      `,
    });
  };

  const handleCellLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
  };

  // Measures in order as specified in the spec manual_sort
  const measures: Array<{ key: keyof RegionMetrics; label: string; isCurrency: boolean }> = [
    { key: 'Sales', label: 'Sales', isCurrency: true },
    { key: 'Quantity', label: 'Quantity', isCurrency: false },
    { key: 'Profit', label: 'Profit', isCurrency: true },
    { key: 'ProfitRatio', label: 'Profit Ratio', isCurrency: false },
  ];

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Customer Overview</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
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
                  padding: '8px',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                }}
              >
                Region
              </th>
              {measures.map((measure) => (
                <th
                  key={measure.key}
                  style={{
                    border: '1px solid #ccc',
                    padding: '8px',
                    textAlign: 'right',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    minWidth: '100px',
                  }}
                >
                  {measure.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((metrics) => (
              <tr key={metrics.Region}>
                <td
                  style={{
                    border: '1px solid #ccc',
                    padding: '8px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {metrics.Region}
                </td>
                {measures.map((measure) => {
                  const value = metrics[measure.key] as number;
                  const displayValue = measure.isCurrency ? formatCurrency(value) : (measure.key === 'ProfitRatio' ? formatPercentage(value) : value.toString());

                  // Apply color based on Profit Ratio for all cells
                  const bgColor = measure.key === 'ProfitRatio' ? colorScale(value) : 'transparent';
                  const textColor = measure.key === 'ProfitRatio' ? (Math.abs(value) > 0.25 ? '#fff' : '#000') : '#000';

                  return (
                    <td
                      key={measure.key}
                      style={{
                        border: '1px solid #ccc',
                        padding: '8px',
                        textAlign: 'right',
                        backgroundColor: bgColor,
                        color: textColor,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        handleCellHover(e, metrics.Region, measure.label, value, metrics)
                      }
                      onMouseLeave={handleCellLeave}
                      onMouseMove={(e) =>
                        setTooltip((prev) => ({
                          ...prev,
                          x: e.pageX + 10,
                          y: e.pageY - 10,
                        }))
                      }
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {/* Legend */}
      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
        <span style={{ fontWeight: 'bold' }}>Profit Ratio:</span>
        <span>Positive (High)</span>
        <div
          style={{
            width: '100px',
            height: '12px',
            background: `linear-gradient(to right, ${colorScale(0.5)}, ${colorScale(0)}, ${colorScale(-0.5)})`,
            border: '1px solid #ccc',
          }}
        />
        <span>Negative (Low)</span>
      </div>
    </div>
  );
};

export default P1968CustomerOverview;
