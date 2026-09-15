import { useMemo } from 'react';
import * as d3 from 'd3';
import { VerticalStackedPercentageBar } from '../charts/VerticalStackedPercentageBar';
import type { ABTestingDataWithAgeGroup, ProcessStep, Gender as GenderType } from '../../types/data';
import { countByCategory, filterData } from '../../services/dataAggregator';
import { useDashboardContext } from '../../contexts/DashboardContext';

interface GenderPercentProps {
  data: ABTestingDataWithAgeGroup[];
  width: number;
  height: number;
}

export function GenderPercent({
  data,
  width,
  height
}: GenderPercentProps) {
  const { selectedVariation } = useDashboardContext();
  const variationOrder = ['Control', 'Test'];
  const genderOrder: GenderType[] = ['F', 'M'];

  const chartData = useMemo(() => {
    let filteredData = data;

    // Apply filters
    filteredData = filterData(filteredData, {
      process_step: 'start' as ProcessStep
    });

    // Further filter by selected variation
    if (selectedVariation) {
      filteredData = filterData(filteredData, { variation: selectedVariation });
    }

    // Only keep F and M genders
    filteredData = filteredData.filter(d => d.gendr === 'F' || d.gendr === 'M');

    // Count by Variation and gendr
    return countByCategory(filteredData, 'Variation', 'gendr' as keyof ABTestingDataWithAgeGroup);
  }, [data, selectedVariation, genderOrder]);

  const colorScale = useMemo(() => {
    return d3.scaleOrdinal<string, string>()
      .domain(genderOrder)
      .range(['#e15759', '#59a14f']);
  }, [genderOrder]);

  return (
    <VerticalStackedPercentageBar
      data={chartData}
      width={width}
      height={height}
      title="Total Number of Participants per Gender: Control vs Test"
      categoryOrder={variationOrder}
      seriesOrder={genderOrder}
      colorScale={colorScale}
      showLabels={true}
      selectedCategory={selectedVariation}
    />
  );
}
