import React, { useState } from 'react';
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface TiposDeTweetsObjetoEstudioProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function TiposDeTweetsObjetoEstudio({ data, width = 960, height = 380 }: TiposDeTweetsObjetoEstudioProps) {
  const { highlight } = useDashboard();
  const [filter, setFilter] = useState<{ flag?: string; label?: string }>({});

  // Apply filter if active
  const filteredData = React.useMemo(() => {
    if (!filter.flag && !filter.label) return data;
    return data.filter(d => {
      if (filter.flag && d.flag !== filter.flag) return false;
      if (filter.label && d.label !== filter.label) return false;
      return true;
    });
  }, [data, filter]);

  // Aggregate: count tweets by flag, colored by label
  const chartData = React.useMemo(() => {
    const flagLabelMap = new Map<string, Map<string, number>>();

    filteredData.forEach(tweet => {
      if (!flagLabelMap.has(tweet.flag)) {
        flagLabelMap.set(tweet.flag, new Map());
      }
      const labelMap = flagLabelMap.get(tweet.flag)!;
      labelMap.set(tweet.label, (labelMap.get(tweet.label) || 0) + 1);
    });

    // For each flag, use the most common label for coloring
    const aggregated = Array.from(flagLabelMap.entries()).map(([flag, labelMap]) => {
      let maxCount = 0;
      let dominantLabel = '';
      labelMap.forEach((count, label) => {
        if (count > maxCount) {
          maxCount = count;
          dominantLabel = label;
        }
      });

      return {
        category: flag,
        value: Array.from(labelMap.values()).reduce((sum, count) => sum + count, 0),
        label: dominantLabel,
        flag: flag,
      };
    });

    return aggregated.sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Handle bar click for filter action
  const handleBarClick = (category: string, clickedData: typeof chartData[0]) => {
    // Toggle filter
    if (filter.flag === category && filter.label === clickedData.label) {
      setFilter({});
    } else {
      setFilter({ flag: category, label: clickedData.label });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        {filter.flag || filter.label ? (
          <span>
            Filtered by: {filter.flag} / {filter.label}{' '}
            <button
              onClick={() => setFilter({})}
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </span>
        ) : (
          <span>Click a bar to filter</span>
        )}
      </div>
      <HorizontalBarChart
        data={chartData}
        width={width}
        height={height}
        title=""
        colorBy="label"
        highlight={highlight}
        onBarClick={handleBarClick}
      />
    </div>
  );
}
