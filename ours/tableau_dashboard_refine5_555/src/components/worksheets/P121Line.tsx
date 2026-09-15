import React, { useEffect, useState } from 'react';
import { loadData, aggregateByMonth } from '../../services/dataService';
import LineChart from '../LineChart';
import LoadingSpinner from '../LoadingSpinner';
import type { AggregatedByMonth } from '../../types/data';

interface P121LineProps {
  width: number;
  height: number;
}

const P121Line: React.FC<P121LineProps> = ({ width, height }) => {
  const [data, setData] = useState<AggregatedByMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataAndAggregate = async () => {
      try {
        const rawData = await loadData();
        const aggregated = aggregateByMonth(rawData);
        setData(aggregated);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDataAndAggregate();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <LineChart data={data} width={width} height={height} title="Line" type="month" />;
};

export default P121Line;
