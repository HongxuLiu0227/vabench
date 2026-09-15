import { useMemo } from 'react';
import * as d3 from 'd3';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import type { ABTestingDataWithAgeGroup, ProcessStep, Gender as GenderType } from '../../types/data';
import { countByCategory, filterData } from '../../services/dataAggregator';
import { useDashboardContext } from '../../contexts/DashboardContext';

interface GenderProps {
  data: ABTestingDataWithAgeGroup[];
  width: number;
  height: number;
}

export function Gender({
  data,
  width,
  height
}: GenderProps) {
  const { selectedVariation } = useDashboardContext();
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

    // Count by gendr and Variation
    return countByCategory(filteredData, 'gendr' as keyof ABTestingDataWithAgeGroup, 'Variation');
  }, [data, selectedVariation]);

  const colorScale = useMemo(() => {
    return d3.scaleOrdinal<string, string>()
      .domain(['Control', 'Test'])
      .range(['#4e79a7', '#f28e2b']);
  }, []);

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Total Number of Participants per Gender: Control vs Test"
      groupBySeries={true}
      categoryOrder={genderOrder}
      seriesOrder={['Control', 'Test']}
      colorScale={colorScale}
      showLabels={true}
      selectedSeries={selectedVariation}
    />
  );
}
