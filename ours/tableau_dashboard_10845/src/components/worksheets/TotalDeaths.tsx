import React, { useEffect, useState } from 'react';
import VerticalRankedBar from '../charts/VerticalRankedBar';
import type { ParsedCovidData } from '../../types/data';
import { getTotalDeathsData } from '../../services/dataService';

interface TotalDeathsProps {
  rawData: ParsedCovidData[];
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
}

const TotalDeaths: React.FC<TotalDeathsProps> = ({
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
      const chartData = await getTotalDeathsData(rawData);
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
        aria-label="Loading Total Deaths data"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <VerticalRankedBar
      data={data}
      highlightedCategories={highlightedCategories}
      onHighlight={onHighlight}
      onClearHighlight={onClearHighlight}
    />
  );
};

export default TotalDeaths;
