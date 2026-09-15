import type { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  width?: number;
  height?: number;
}

export function ChartContainer({ title, children, width, height }: ChartContainerProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        margin: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(width && { width }),
        ...(height && { height }),
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: 'bold',
          borderBottom: '1px solid #eee',
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
