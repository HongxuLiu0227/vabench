import React, { useEffect, useState } from 'react';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { aggregateByProjectAndLeft } from '../../services/dataService';
import type { HRData, FilterState, AggregatedData } from '../../types/hrData';

interface ProjectCountTurnoverProps {
  data: HRData[];
  width?: number;
  height?: number;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

const LEFT_COLORS: Record<string, string> = {
  '0': '#4e79a7', // Stayed
  '1': '#e15759', // Left
};

export const ProjectCountTurnover: React.FC<ProjectCountTurnoverProps> = ({
  data,
  width = 700,
  height = 300,
  filters = {},
  onFilterChange,
}) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(filters.numberProject ? String(filters.numberProject) : undefined);
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>(filters.left !== undefined ? String(filters.left) : undefined);

  useEffect(() => {
    const aggregated = aggregateByProjectAndLeft(data);
    setAggregatedData(aggregated);
  }, [data]);

  useEffect(() => {
    setSelectedCategory(filters.numberProject ? String(filters.numberProject) : undefined);
    setSelectedSeries(filters.left !== undefined ? String(filters.left) : undefined);
  }, [filters.numberProject, filters.left]);

  const handleBarClick = (category: string, series?: string) => {
    const newCategory = selectedCategory === category && !series ? undefined : category;
    const newSeries = series !== undefined ? (selectedSeries === series ? undefined : series) : undefined;

    setSelectedCategory(newCategory);
    setSelectedSeries(newSeries);

    if (onFilterChange) {
      onFilterChange({
        ...filters,
        numberProject: newCategory !== undefined ? Number(newCategory) : undefined,
        left: newSeries !== undefined ? Number(newSeries) : undefined,
      });
    }
  };

  const getColor = (_: string, series?: string) => {
    if (!series) return '#4e79a7';
    return LEFT_COLORS[series] || '#4e79a7';
  };

  const selectedCategories = selectedCategory
    ? new Set([selectedCategory])
    : new Set<string>();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width, height }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          Employee Project Count Turnover Distribution
        </div>
        <VerticalBarChart
          data={aggregatedData}
          width={width - 120}
          height={height - 40}
          getColor={getColor}
          stacked={true}
          onBarClick={handleBarClick}
          selectedCategories={selectedCategories}
        />
      </div>
      <div style={{ width: 100, paddingLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>Left</div>
        {Object.entries(LEFT_COLORS).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: color,
                marginRight: '8px',
                border: '1px solid #ccc',
              }}
            />
            <span style={{ fontSize: '11px' }}>{key === '0' ? 'Stayed' : 'Left'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
