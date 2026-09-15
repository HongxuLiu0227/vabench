import { useEffect, useState, useMemo } from 'react';
import { loadBoatSalesData, filterData, aggregateByBrokerAndCategory, flattenAggregatedData } from '../services/dataService';
import type { BoatSalesData, BrokerChartData } from '../types';
import { PriceCutWorksheet } from './PriceCutWorksheet';
import { SailVsPowerWorksheet } from './SailVsPowerWorksheet';
import { UsedVsNewWorksheet } from './UsedVsNewWorksheet';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import './Dashboard.css';

const FILTERED_BROKERS = [
  'Brent Hermann',
  'Caroline Laviolette',
  'Chris Block',
  'John Anderson',
  'Michael Harris',
  'Mike Auton',
  'Mike Nystrum',
  'Monte Cottrell',
  'Peter Gulick',
  'Staley Weidman',
];

const MIN_DATE = new Date('2012-01-21');
const MAX_DATE = new Date('2020-07-06');

export function Dashboard() {
  const [rawData, setRawData] = useState<BoatSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadBoatSalesData();
        setRawData(data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return filterData(rawData, FILTERED_BROKERS, MIN_DATE, MAX_DATE);
  }, [rawData]);

  const priceCutData = useMemo<BrokerChartData[]>(() => {
    const aggregated = aggregateByBrokerAndCategory(filteredData, 'hasPriceCut');
    return flattenAggregatedData(aggregated, true);
  }, [filteredData]);

  const sailVsPowerData = useMemo<BrokerChartData[]>(() => {
    const aggregated = aggregateByBrokerAndCategory(filteredData, 'boatType');
    return flattenAggregatedData(aggregated, true);
  }, [filteredData]);

  const usedVsNewData = useMemo<BrokerChartData[]>(() => {
    const aggregated = aggregateByBrokerAndCategory(filteredData, 'boatCondition');
    return flattenAggregatedData(aggregated, true);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Brokers Stats</h1>
      <div className="dashboard-worksheets">
        <div className="worksheet-section">
          <SailVsPowerWorksheet data={sailVsPowerData} />
        </div>
        <div className="worksheet-section">
          <PriceCutWorksheet data={priceCutData} />
        </div>
        <div className="worksheet-section">
          <UsedVsNewWorksheet data={usedVsNewData} />
        </div>
      </div>
    </div>
  );
}
