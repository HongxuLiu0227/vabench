import React, { useEffect, useState } from 'react';
import { LineChart } from './LineChart';
import { LoadingState, ErrorState } from './ui';
import { dataLoaderService } from '../services/dataLoader';
import type { HourRecord } from '../types';

interface PeakHoursTripEndProps {
  highlightedHours?: number[];
  onHover?: (hour: number | null) => void;
}

export const PeakHoursTripEnd: React.FC<PeakHoursTripEndProps> = ({
  highlightedHours = [],
  onHover
}) => {
  const [data, setData] = useState<HourRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const peakHours = await dataLoaderService.getPeakEndHours();
        setData(peakHours);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading peak trip end hours..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LineChart
        data={data}
        title="Peak hours for trip end"
        yAxisTitle="Number of Records"
        highlightedHours={highlightedHours}
        onHover={onHover}
      />
    </div>
  );
};
