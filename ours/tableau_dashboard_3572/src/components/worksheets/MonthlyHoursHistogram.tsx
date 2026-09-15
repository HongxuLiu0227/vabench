import React, { useEffect, useState } from 'react';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { binMonthlyHours } from '../../services/dataService';
import type { HRData, BinnedData } from '../../types/hrData';

interface MonthlyHoursHistogramProps {
  data: HRData[];
  width?: number;
  height?: number;
  filters?: Record<string, unknown>;
}

export const MonthlyHoursHistogram: React.FC<MonthlyHoursHistogramProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const [binnedData, setBinnedData] = useState<BinnedData[]>([]);

  useEffect(() => {
    const binned = binMonthlyHours(data);
    setBinnedData(binned);
  }, [data]);

  return (
    <div style={{ width, height }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Histogram to find the Employee Monthly Hours Distribution Level
      </div>
      <VerticalBarChart
        data={binnedData}
        width={width}
        height={height - 40}
        color="#4e79a7"
      />
    </div>
  );
};
