import React, { useEffect, useState } from 'react';
import HorizontalRankedBar from '../charts/HorizontalRankedBar';
import type { ParsedCovidData } from '../../types/data';
import { getTop10Data } from '../../services/dataService';

interface Top10Props {
  rawData: ParsedCovidData[];
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
}

const Top10: React.FC<Top10Props> = ({
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
      const chartData = await getTop10Data(rawData);
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
        aria-label="Loading Top 10 data"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <HorizontalRankedBar
      data={data}
      title="Top 10 countries having more deaths"
      highlightedCategories={highlightedCategories}
      onHighlight={onHighlight}
      onClearHighlight={onClearHighlight}
    />
  );
};

export default Top10;
