import { useMemo } from 'react';
import { HorizontalRankedBarChart } from './HorizontalRankedBarChart';
import { ChartLegend } from './ChartLegend';
import type { BrokerChartData, LegendItem } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface UsedVsNewWorksheetProps {
  data: BrokerChartData[];
}

export function UsedVsNewWorksheet({ data }: UsedVsNewWorksheetProps) {
  const { selection, setSelection, highlightedWorksheets } = useDashboard();
  const worksheetName = 'Number of Boats Sold By Brokers(Used vs New)';
  const isHighlighted = highlightedWorksheets.has(worksheetName);

  const colorMap = useMemo<Map<string, string>>(() => {
    return new Map([
      ['Used', '#91dcea'],
      ['New', '#fd6f30'],
    ]);
  }, []);

  const categoryOrder = useMemo<string[]>(() => {
    return ['Used', 'New'];
  }, []);

  const legendItems: LegendItem[] = useMemo(() => {
    return [
      { label: 'Used', color: '#91dcea' },
      { label: 'New', color: '#fd6f30' },
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
          title="Number of Boats Sold By Brokers(Used vs New)"
          axisTitle="Number of Boats Sold"
          colorMap={colorMap}
          categoryOrder={categoryOrder}
          selection={selection}
          onSelectionChange={handleSelectionChange}
          worksheetName={worksheetName}
          isHighlighted={isHighlighted}
          seriesField="boatCondition"
        />
      </div>
      <div className="worksheet-legend">
        <ChartLegend title="" items={legendItems} position="right" />
      </div>
    </div>
  );
}
