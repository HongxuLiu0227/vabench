import { useMemo } from 'react';
import Scatterplot from './Scatterplot';
import HorizontalBar from './HorizontalBar';
import DiscountOverview from './DiscountOverview';
import type { ProductAggregation, CategoryAggregation, RegionAggregation } from '../types/data';

interface DashboardProps {
  productData: ProductAggregation[];
  categoryData: CategoryAggregation[];
  regionData: RegionAggregation[];
  containerWidth: number;
  containerHeight: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  productData,
  categoryData,
  regionData,
  containerWidth,
  containerHeight,
}) => {
  // Calculate dimensions based on zone specifications
  // Top row: 62% height, split into two equal columns
  // Bottom row: 38% height, full width
  const topRowHeight = containerHeight * 0.62;
  const bottomRowHeight = containerHeight * 0.38;
  const leftColWidth = containerWidth * 0.5;
  const rightColWidth = containerWidth * 0.5;

  const scatterplotDimensions = useMemo(
    () => ({
      width: leftColWidth - 16, // Account for margin
      height: topRowHeight - 16,
    }),
    [leftColWidth, topRowHeight]
  );

  const barDimensions = useMemo(
    () => ({
      width: rightColWidth - 16,
      height: topRowHeight - 16,
    }),
    [rightColWidth, topRowHeight]
  );

  const discountDimensions = useMemo(
    () => ({
      width: containerWidth - 16,
      height: bottomRowHeight - 16,
    }),
    [containerWidth, bottomRowHeight]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: 'flex',
          height: `${topRowHeight}px`,
          marginBottom: '8px',
        }}
      >
        {/* Left: Scatterplot */}
        <div
          style={{
            flex: '1',
            marginRight: '4px',
            backgroundColor: '#ffffff',
            border: 'none',
            borderWidth: '0',
            margin: '4px',
            overflow: 'hidden',
          }}
        >
          <Scatterplot
            data={productData}
            width={scatterplotDimensions.width}
            height={scatterplotDimensions.height}
          />
        </div>

        {/* Right: Bar Chart */}
        <div
          style={{
            flex: '1',
            marginLeft: '4px',
            backgroundColor: '#ffffff',
            border: 'none',
            borderWidth: '0',
            margin: '4px',
            overflow: 'hidden',
          }}
        >
          <HorizontalBar
            data={categoryData}
            width={barDimensions.width}
            height={barDimensions.height}
          />
        </div>
      </div>

      {/* Bottom Row: Discount Overview */}
      <div
        style={{
          height: `${bottomRowHeight}px`,
          backgroundColor: '#ffffff',
          border: 'none',
          borderWidth: '0',
          margin: '4px',
          overflow: 'hidden',
        }}
      >
        <DiscountOverview
          data={regionData}
          width={discountDimensions.width}
          height={discountDimensions.height}
        />
      </div>
    </div>
  );
};

export default Dashboard;
