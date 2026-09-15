import { useState, useEffect, useMemo } from 'react';
import SalesBySegment from './SalesBySegment';
import PlotOfSales from './PlotOfSales';
import SalesByMarket from './SalesByMarket';
import MarketFilter from './MarketFilter';
import {
  loadOrderData,
  aggregateSalesBySegment,
  aggregateSalesByMarket,
  aggregateScatterData,
  getUniqueMarkets,
} from '../services/dataService';
import type { OrderData } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const orders = await loadOrderData();
        setData(orders);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const markets = useMemo(() => {
    if (!data.length) return [];
    return getUniqueMarkets(data);
  }, [data]);

  const segmentData = useMemo(() => {
    if (!data.length) return [];
    const filteredData = selectedMarket
      ? data.filter((row) => row.Market === selectedMarket)
      : data;
    return aggregateSalesBySegment(filteredData);
  }, [data, selectedMarket]);

  const scatterData = useMemo(() => {
    if (!data.length) return [];
    return aggregateScatterData(data, selectedSegment, selectedMarket);
  }, [data, selectedSegment, selectedMarket]);

  const marketData = useMemo(() => {
    if (!data.length) return [];
    return aggregateSalesByMarket(data, selectedSegment, selectedMarket);
  }, [data, selectedSegment, selectedMarket]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '600px',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '600px',
          fontSize: '16px',
          color: '#d32f2f',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '800px',
        height: '600px',
        margin: '0 auto',
        padding: '8px',
        backgroundColor: '#fff',
      }}
    >
      {/* Top row: SalesBySegment, PlotOfSales, MarketFilter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '390px 390px 180px',
          gridTemplateRows: '415px',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Sales by Segment
          </div>
          <SalesBySegment
            data={segmentData}
            selectedSegment={selectedSegment}
            onSegmentSelect={setSelectedSegment}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Plot of Sales
          </div>
          <PlotOfSales data={scatterData} selectedSegment={selectedSegment} />
        </div>

        <div>
          <MarketFilter
            markets={markets}
            selectedMarket={selectedMarket}
            onMarketSelect={setSelectedMarket}
          />
        </div>
      </div>

      {/* Bottom row: SalesByMarket */}
      <div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333',
          }}
        >
          Sales by Market
        </div>
        <SalesByMarket data={marketData} selectedSegment={selectedSegment} />
      </div>
    </div>
  );
}
