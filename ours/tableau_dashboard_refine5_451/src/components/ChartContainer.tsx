import React, { useRef, useEffect, useState } from 'react';

interface ChartContainerProps {
  title: string;
  children: (width: number, height: number) => React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          fontWeight: '600',
          fontSize: '14px',
          color: '#333',
          fontFamily: 'sans-serif'
        }}
      >
        {title}
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          padding: '8px'
        }}
      >
        {children(dimensions.width - 16, dimensions.height - 40)}
      </div>
    </div>
  );
};
