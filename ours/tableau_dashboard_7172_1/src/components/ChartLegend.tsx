import type { LegendItem } from '../types';

interface ChartLegendProps {
  title: string;
  items: LegendItem[];
  position?: 'right' | 'bottom' | 'left' | 'top';
}

export function ChartLegend({ title, items, position = 'right' }: ChartLegendProps) {
  return (
    <div className={`chart-legend legend-${position}`}>
      {title && <div className="legend-title">{title}</div>}
      <div className="legend-items">
        {items.map((item) => (
          <div key={item.label} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: item.color }}
            />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
