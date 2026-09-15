import React, { useEffect, useState } from 'react';
import VerticalRankedBar from '../charts/VerticalRankedBar';
import type { ParsedCovidData } from '../../types/data';
import { getTotalCasesData } from '../../services/dataService';

interface TotalCasesProps {
  rawData: ParsedCovidData[];
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
}

const TotalCases: React.FC<TotalCasesProps> = ({
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
      const chartData = await getTotalCasesData(rawData);
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
        aria-label="Loading Total Cases data"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <VerticalRankedBar
      data={data}
      title="Total Cases Continent Wise"
      highlightedCategories={highlightedCategories}
      onHighlight={onHighlight}
      onClearHighlight={onClearHighlight}
    />
  );
};

export default TotalCases;
