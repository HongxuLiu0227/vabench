import { useMemo } from 'react';
import { HorizontalRankedBarChart } from './HorizontalRankedBarChart';
import { ChartLegend } from './ChartLegend';
import type { BrokerChartData, LegendItem } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface SailVsPowerWorksheetProps {
  data: BrokerChartData[];
}

export function SailVsPowerWorksheet({ data }: SailVsPowerWorksheetProps) {
  const { selection, setSelection, highlightedWorksheets } = useDashboard();
  const worksheetName = 'Number of Boats Sold By Brokers(Sail vs Power)';
  const isHighlighted = highlightedWorksheets.has(worksheetName);

  const colorMap = useMemo<Map<string, string>>(() => {
    return new Map([
      ['Power', '#4e79a7'],
      ['Sail', '#f28e2b'],
    ]);
  }, []);

  const categoryOrder = useMemo<string[]>(() => {
    return ['Power', 'Sail'];
  }, []);

  const legendItems: LegendItem[] = useMemo(() => {
    return [
      { label: 'Power', color: '#4e79a7' },
      { label: 'Sail', color: '#f28e2b' },
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
          title="Number of Boats Sold By Brokers(Sail vs Power)"
          axisTitle="Number of Boats Sold"
          colorMap={colorMap}
          categoryOrder={categoryOrder}
          selection={selection}
          onSelectionChange={handleSelectionChange}
          worksheetName={worksheetName}
          isHighlighted={isHighlighted}
          seriesField="boatType"
        />
      </div>
      <div className="worksheet-legend">
        <ChartLegend title="" items={legendItems} position="right" />
      </div>
    </div>
  );
}
