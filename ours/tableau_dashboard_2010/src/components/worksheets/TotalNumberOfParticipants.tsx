import { useMemo } from 'react';
import * as d3 from 'd3';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import type { ABTestingDataWithAgeGroup, Variation, ProcessStep } from '../../types/data';
import { countByCategory, filterData } from '../../services/dataAggregator';
import { useDashboardContext } from '../../contexts/DashboardContext';

interface TotalNumberOfParticipantsProps {
  data: ABTestingDataWithAgeGroup[];
  width: number;
  height: number;
}

export function TotalNumberOfParticipants({
  data,
  width,
  height
}: TotalNumberOfParticipantsProps) {
  const { selectedVariation, setSelectedVariation } = useDashboardContext();
  const variationOrder: Variation[] = ['Control', 'Test'];

  const chartData = useMemo(() => {
    // Filter to 'start' step only
    const startData = filterData(data, { process_step: 'start' as ProcessStep });

    // Count by Variation
    return countByCategory(startData, 'Variation');
  }, [data]);

  const colorScale = useMemo(() => {
    return d3.scaleOrdinal<string, string>()
      .domain(variationOrder)
      .range(['#4e79a7', '#f28e2b']);
  }, [variationOrder]);

  const handleBarClick = (category: string) => {
    // Toggle selection
    if (selectedVariation === category) {
      setSelectedVariation(null); // Deselect
    } else {
      setSelectedVariation(category as Variation);
    }
  };

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Total Number of Participants: Control vs Test"
      groupBySeries={false}
      categoryOrder={variationOrder}
      colorScale={colorScale}
      showLabels={true}
      onBarClick={handleBarClick}
      selectedCategory={selectedVariation}
    />
  );
}
