import { useMemo } from 'react';
import * as d3 from 'd3';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import type { ABTestingDataWithAgeGroup, Variation } from '../../types/data';
import { countByCategory, filterData } from '../../services/dataAggregator';

interface NumberOfParticipantsProps {
  data: ABTestingDataWithAgeGroup[];
  width: number;
  height: number;
  selectedVariation?: Variation | null;
}

export function NumberOfParticipants({
  data,
  width,
  height,
  selectedVariation
}: NumberOfParticipantsProps) {
  const processStepOrder = ['start', 'step_1', 'step_2', 'step_3', 'confirm'];
  const variationOrder = ['Control', 'Test'];

  const chartData = useMemo(() => {
    let filteredData = data;

    // Apply filter if a variation is selected
    if (selectedVariation) {
      filteredData = filterData(data, { variation: selectedVariation });
    }

    // Count by process_step and Variation
    return countByCategory(filteredData, 'process_step' as keyof ABTestingDataWithAgeGroup, 'Variation');
  }, [data, selectedVariation, variationOrder]);

  const colorScale = useMemo(() => {
    return d3.scaleOrdinal<string, string>()
      .domain(variationOrder)
      .range(['#4e79a7', '#f28e2b']);
  }, [variationOrder]);

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Participants at Each Stage: Control vs Test"
      groupBySeries={true}
      categoryOrder={processStepOrder}
      seriesOrder={variationOrder}
      colorScale={colorScale}
      showLabels={true}
      selectedSeries={selectedVariation}
    />
  );
}
