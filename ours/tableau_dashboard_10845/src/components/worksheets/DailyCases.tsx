import React, { useEffect, useState } from 'react';
import HorizontalRankedBar from '../charts/HorizontalRankedBar';
import type { ParsedCovidData } from '../../types/data';
import { getDailyCasesData } from '../../services/dataService';

interface DailyCasesProps {
  rawData: ParsedCovidData[];
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
}

const DailyCases: React.FC<DailyCasesProps> = ({
  rawData,
  highlightedCategories,
  onHighlight,
  onClearHighlight,
}) => {
  const [data, setData] = React.useState<{ category: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const chartData = await getDailyCasesData(rawData);
      setData(chartData);
      setLoading(false);
    };
    loadData();
  }, [rawData]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading Daily Cases data"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <HorizontalRankedBar
      data={data}
      highlightedCategories={highlightedCategories}
      onHighlight={onHighlight}
      onClearHighlight={onClearHighlight}
    />
  );
};

export default DailyCases;
