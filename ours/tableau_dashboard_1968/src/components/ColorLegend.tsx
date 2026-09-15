import { scaleDiverging } from 'd3-scale';
import { formatPercentage } from '../utils/chartUtils';

export function ColorLegend() {
  // Create the same color scale as used in charts
  const colorScale = scaleDiverging<string>()
    .domain([-0.5, 0, 0.5])
    .range(['#d7191c', '#ffffbf', '#1a9641']);

  const steps = 9;
  const min = -0.5;
  const max = 0.5;
  const stepSize = (max - min) / (steps - 1);

  return (
    <div className="color-legend" style={{ padding: '10px' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
        Profit Ratio
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[...Array(steps)].map((_, i) => {
          const value = min + i * stepSize;
          const color = colorScale(value);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '12px',
                  backgroundColor: color,
                  border: '1px solid #ccc',
                }}
              />
              <span style={{ fontSize: '10px', color: '#666' }}>
                {formatPercentage(value)}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#999' }}>
        <div>Red: Negative</div>
        <div>Green: Positive</div>
      </div>
    </div>
  );
}
