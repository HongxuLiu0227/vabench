import React, { useEffect, useState } from 'react';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { binSatisfactionLevel } from '../../services/dataService';
import type { HRData, BinnedData } from '../../types/hrData';

interface SatisfactionHistogramProps {
  data: HRData[];
  width?: number;
  height?: number;
  filters?: Record<string, unknown>;
}

export const SatisfactionHistogram: React.FC<SatisfactionHistogramProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const [binnedData, setBinnedData] = useState<BinnedData[]>([]);

  useEffect(() => {
    const binned = binSatisfactionLevel(data);
    setBinnedData(binned);
  }, [data]);

  return (
    <div style={{ width, height }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Histogram to find the Employee Statisfaction level
      </div>
      <VerticalBarChart
        data={binnedData}
        width={width}
        height={height - 40}
        color="#59a14f"
      />
    </div>
  );
};
