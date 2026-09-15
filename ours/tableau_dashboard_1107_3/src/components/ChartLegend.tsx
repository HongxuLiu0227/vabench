interface LegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightedItem?: string | null;
  onItemClick?: (item: string) => void;
}

export function ChartLegend({
  items,
  title,
  position = 'right',
  highlightedItem,
  onItemClick,
}: ChartLegendProps) {
  const flexDirection = position === 'left' || position === 'right' ? 'column' : 'row';
  const alignItems = position === 'left' || position === 'right' ? 'flex-start' : 'center';

  return (
    <div
      className="chart-legend"
      style={{
        display: 'flex',
        flexDirection: flexDirection as 'column' | 'row',
        gap: '8px',
        padding: '8px',
        alignItems: alignItems,
      }}
    >
      {title && (
        <div
          className="legend-title"
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: flexDirection === 'column' ? '4px' : '0',
            marginRight: flexDirection === 'row' ? '8px' : '0',
          }}
        >
          {title}
        </div>
      )}
      {items.map((item) => {
        const isHighlighted = highlightedItem === null || highlightedItem === item.label;
        const opacity = isHighlighted ? 1 : 0.3;

        return (
          <div
            key={item.label}
            className="legend-item"
            onClick={() => onItemClick?.(item.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: onItemClick ? 'pointer' : 'default',
              opacity,
              transition: 'opacity 0.2s',
            }}
          >
            <div
              className="legend-color"
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: item.color,
                border: '1px solid #ccc',
                borderRadius: '2px',
              }}
            />
            <div
              className="legend-label"
              style={{
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
