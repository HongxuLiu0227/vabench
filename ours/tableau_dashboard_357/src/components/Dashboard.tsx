/**
 * Dashboard Component
 * Main dashboard container with all three worksheets
 */

import { useState, useEffect } from 'react';
import ScatterPlot from './ScatterPlot';
import BarChart from './BarChart';
import Legend from './Legend';
import type { TransformedData, FilterState } from '../types';

interface DashboardProps {
  data: TransformedData[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [filterState, setFilterState] = useState<FilterState>({
    selectedIndices: new Set<number>(),
    sourceSheet: null
  });

  // Auto-clear filter when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('svg') && filterState.selectedIndices.size > 0) {
        setFilterState({
          selectedIndices: new Set(),
          sourceSheet: null
        });
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [filterState.selectedIndices]);

  // Color scales
  const classColorScale = new Map<string, string>([
    ['Iris-setosa', '#4e79a7'],
    ['Iris-versicolor', '#edc948'],
    ['Iris-virginica', '#e15759']
  ]);

  const clusterColorScale = new Map<string, string>([
    ['1', '#4e79a7'],
    ['2', '#f28e2b'],
    ['3', '#e15759']
  ]);

  // Get unique categories
  const uniqueClasses = Array.from(new Set(data.map(d => d.F5)));
  const uniqueClusters = Array.from(new Set(data.map(d => String(d.tableauCluster)))).sort();

  // Calculate dimensions based on viewport
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 100,
    height: window.innerHeight - 100
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 100
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zone proportions from tableau_spec.json (normalized)
  // Sheet 3: x=0.0069, w=0.2119 (leftmost)
  // Sheet 1: x=0.2188, w=0.3387 (middle-left)
  // Sheet 2: x=0.5576, w=0.2970 (middle-right)
  // Legends: x=0.8545, w=0.1385 (rightmost)

  const sheet3Width = Math.floor(dimensions.width * 0.20);
  const sheet1Width = Math.floor(dimensions.width * 0.32);
  const sheet2Width = Math.floor(dimensions.width * 0.28);
  const legendWidth = Math.floor(dimensions.width * 0.13);
  const chartHeight = dimensions.height;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '8px',
      padding: '8px',
      backgroundColor: '#fff',
      alignItems: 'flex-start'
    }}>
      {/* Sheet 3: Bar Chart */}
      <div style={{ flexShrink: 0 }}>
        <BarChart
          data={data}
          width={sheet3Width}
          height={chartHeight}
          title="Original vs Tableau Cluster"
          categoryField="calculation1"
          filterState={filterState}
          highlightField="calculation1"
        />
      </div>

      {/* Sheet 1: Original Cluster */}
      <div style={{ flexShrink: 0 }}>
        <ScatterPlot
          data={data}
          width={sheet1Width}
          height={chartHeight}
          title="Original Cluster"
          xField="F4"
          yField="F3"
          colorField="F5"
          colorScale={classColorScale}
          filterState={filterState}
          onSelectionChange={(indices) => {
            setFilterState({
              selectedIndices: indices,
              sourceSheet: 'Original Cluster'
            });
          }}
          disabled={false}
        />
      </div>

      {/* Sheet 2: Tableau Generated Cluster */}
      <div style={{ flexShrink: 0 }}>
        <ScatterPlot
          data={data}
          width={sheet2Width}
          height={chartHeight}
          title="Tableau Generated Cluster"
          xField="F4"
          yField="F3"
          colorField="tableauCluster"
          colorScale={clusterColorScale}
          filterState={filterState}
          onSelectionChange={(indices) => {
            setFilterState({
              selectedIndices: indices,
              sourceSheet: 'Tableau Generated Cluster'
            });
          }}
          disabled={filterState.sourceSheet === 'Original Cluster' && filterState.selectedIndices.size > 0}
        />
      </div>

      {/* Legends */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: `${legendWidth}px`
      }}>
        <Legend
          title="Class"
          categories={uniqueClasses}
          colorScale={classColorScale}
        />
        <Legend
          title="Cluster"
          categories={uniqueClusters}
          colorScale={clusterColorScale}
        />
      </div>
    </div>
  );
};

export default Dashboard;
