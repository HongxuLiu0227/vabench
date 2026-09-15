import React, { useEffect, useState } from 'react';
import { loadData, aggregateByCategoryAndSubCategory } from '../../services/dataService';
import HorizontalBarChart from '../HorizontalBarChart';
import LoadingSpinner from '../LoadingSpinner';
import type { AggregatedByCategory } from '../../types/data';

interface P121BarProps {
  width: number;
  height: number;
}

const P121Bar: React.FC<P121BarProps> = ({ width, height }) => {
  const [data, setData] = useState<AggregatedByCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataAndAggregate = async () => {
      try {
        const rawData = await loadData();
        const aggregated = aggregateByCategoryAndSubCategory(rawData);
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

  return <HorizontalBarChart data={data} width={width} height={height} title="Bar" />;
};

export default P121Bar;
