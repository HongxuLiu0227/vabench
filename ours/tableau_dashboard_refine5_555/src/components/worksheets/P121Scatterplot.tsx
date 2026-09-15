import React, { useEffect, useState } from 'react';
import ScatterPlot from '../ScatterPlot';
import { loadData, aggregateByProduct } from '../../services/dataService';
import LoadingSpinner from '../LoadingSpinner';
import type { AggregatedByProduct } from '../../types/data';

interface P121ScatterplotProps {
  width: number;
  height: number;
}

const P121Scatterplot: React.FC<P121ScatterplotProps> = ({ width, height }) => {
  const [data, setData] = useState<AggregatedByProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataAndAggregate = async () => {
      try {
        const rawData = await loadData();
        const aggregated = aggregateByProduct(rawData);
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

  return <ScatterPlot data={data} width={width} height={height} title="Scatterplot" />;
};

export default P121Scatterplot;
