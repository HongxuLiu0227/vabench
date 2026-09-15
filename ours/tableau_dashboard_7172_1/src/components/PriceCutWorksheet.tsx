import { useMemo } from 'react';
import { HorizontalRankedBarChart } from './HorizontalRankedBarChart';
import { ChartLegend } from './ChartLegend';
import type { BrokerChartData, LegendItem } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface PriceCutWorksheetProps {
  data: BrokerChartData[];
}

export function PriceCutWorksheet({ data }: PriceCutWorksheetProps) {
  const { selection, setSelection, highlightedWorksheets } = useDashboard();
  const worksheetName = 'Number of Boats Sold By Brokers(Price Cut)';
  const isHighlighted = highlightedWorksheets.has(worksheetName);

  const colorMap = useMemo<Map<string, string>>(() => {
    return new Map([
      ['No Price Cut', '#59a14f'],
      ['Price Cut', '#edc948'],
    ]);
  }, []);

  const categoryOrder = useMemo<string[]>(() => {
    return ['No Price Cut', 'Price Cut'];
  }, []);

  const legendItems: LegendItem[] = useMemo(() => {
    return [
      { label: 'No Price Cut', color: '#59a14f' },
      { label: 'Price Cut', color: '#edc948' },
    ];
  }, []);

  const handleSelectionChange = (updates: Partial<typeof selection>) => {
    setSelection(updates);
  };

  return (
    <div className="worksheet-wrapper">
      <div className="worksheet-content">
        <HorizontalRankedBarChart
          data={data}
          title="Number of Boats Sold By Brokers(Price Cut)"
          axisTitle="Number of Boats Sold"
          colorMap={colorMap}
          categoryOrder={categoryOrder}
          selection={selection}
          onSelectionChange={handleSelectionChange}
          worksheetName={worksheetName}
          isHighlighted={isHighlighted}
          seriesField="hasPriceCut"
        />
      </div>
      <div className="worksheet-legend">
        <ChartLegend title="" items={legendItems} position="right" />
      </div>
    </div>
  );
}
