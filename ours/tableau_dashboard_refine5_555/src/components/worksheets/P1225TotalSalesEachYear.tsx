import React, { useEffect, useState } from 'react';
import { loadData, aggregateByYear } from '../../services/dataService';
import LineChart from '../LineChart';
import LoadingSpinner from '../LoadingSpinner';
import type { AggregatedByYear } from '../../types/data';

interface P1225TotalSalesEachYearProps {
  width: number;
  height: number;
}

const P1225TotalSalesEachYear: React.FC<P1225TotalSalesEachYearProps> = ({ width, height }) => {
  const [data, setData] = useState<AggregatedByYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataAndAggregate = async () => {
      try {
        const rawData = await loadData();
        const aggregated = aggregateByYear(rawData);
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

  return <LineChart data={data} width={width} height={height} title="Total Sales Each Year" type="year" showLabels={true} />;
};

export default P1225TotalSalesEachYear;
