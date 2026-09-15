import React, { useRef, useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // React.lazy imports for worksheets
  const P121Bar = React.lazy(() => import('./worksheets/P121Bar'));
  const P121Line = React.lazy(() => import('./worksheets/P121Line'));
  const P1225TotalSalesEachYear = React.lazy(() => import('./worksheets/P1225TotalSalesEachYear'));
  const P121Scatterplot = React.lazy(() => import('./worksheets/P121Scatterplot'));

  // Calculate chart dimensions based on container size
  // Using the zone ratios from the spec
  const chartWidth = dimensions.width > 0 ? dimensions.width / 2 - 16 : 400;
  const chartHeight = dimensions.height > 0 ? dimensions.height / 2 - 16 : 300;

  return (
    <div
      ref={containerRef}
      className={`dashboard-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <React.Suspense fallback={<LoadingSpinner />}>
        {/* Top-Left: P121__bar */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <P121Bar width={chartWidth} height={chartHeight} />
        </div>

        {/* Top-Right: P121__line */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <P121Line width={chartWidth} height={chartHeight} />
        </div>

        {/* Bottom-Left: P1225__total_sales_each_year */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <P1225TotalSalesEachYear width={chartWidth} height={chartHeight} />
        </div>

        {/* Bottom-Right: P121__scatterplot */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <P121Scatterplot width={chartWidth} height={chartHeight} />
        </div>
      </React.Suspense>
    </div>
  );
};

export default Dashboard;
