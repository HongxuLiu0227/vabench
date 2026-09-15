import { HighlightState, LABEL_COLORS } from '../../types';

interface CustomTableauViewProps {
  data: Array<{ flag: string; label: string; value: number }>;
  width: number;
  height: number;
  title?: string;
  highlight?: HighlightState;
}

export function CustomTableauView({
  data,
  width,
  height,
  title,
  highlight
}: CustomTableauViewProps) {
  // Check if cell is dimmed
  const isDimmed = (flag: string, label: string): boolean => {
    if (!highlight?.enabled) return false;
    if (highlight.label && label !== highlight.label) return true;
    if (highlight.flag && flag !== highlight.flag) return true;
    return false;
  };

  // Group data by flag (rows) and label (columns)
  const flags = ['Kirchner', 'Macri', 'Lavagna'];
  const labels = ['negative', 'neutral', 'positive', 'error'];

  // Create lookup map
  const dataMap = new Map<string, number>();
  data.forEach(d => {
    const key = `${d.flag}-${d.label}`;
    dataMap.set(key, d.value);
  });

  const cellWidth = (width - 100) / labels.length;
  const cellHeight = (height - 60) / flags.length;

  return (
    <div style={{ width, height }}>
      {title && (
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {title}
        </h3>
      )}
      <div style={{ marginLeft: '80px', position: 'relative' }}>
        {/* Column headers */}
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          {labels.map(label => (
            <div
              key={label}
              style={{
                width: cellWidth,
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {flags.map(flag => (
          <div key={flag} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            {/* Row header */}
            <div
              style={{
                position: 'absolute',
                left: '-80px',
                width: '75px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'right',
                paddingRight: '8px'
              }}
            >
              {flag}
            </div>

            {/* Cells */}
            {labels.map(label => {
              const key = `${flag}-${label}`;
              const value = dataMap.get(key) || 0;
              const color = LABEL_COLORS[label] || '#cccccc';

              return (
                <div
                  key={key}
                  style={{
                    width: cellWidth,
                    height: cellHeight,
                    backgroundColor: color,
                    opacity: isDimmed(flag, label) ? 0.2 : 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '4px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                    {value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {labels.map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: LABEL_COLORS[label],
                  border: '1px solid #ddd'
                }}
              />
              <span style={{ fontSize: '12px', color: '#333' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
