import { useState, useCallback } from 'react';
import type { DateRange } from '../types/stockData';
import { useStockData } from '../hooks/useStockData';
import { LineChart } from './LineChart';
import { BigNumberCard } from './BigNumberCard';
import { DashboardHeader } from './DashboardHeader';

export function DashboardExploringPatterns() {
  const { loading, error, getMonthlyAverages, getMaxOpen, getMaxClose } =
    useStockData();
  const [filter, setFilter] = useState<DateRange | null>(null);

  const handleFilter = useCallback((range: DateRange) => {
    // If range is empty (no selection), clear filter
    if (!range.start && !range.end) {
      setFilter(null);
    } else {
      setFilter(range);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFilter(null);
  }, []);

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#000000',
          color: '#b4b4b4',
          fontFamily: 'Calibri, sans-serif',
          padding: '20px',
          minHeight: '100vh',
        }}
      >
        Error loading data: {error}
      </div>
    );
  }

  const monthlyData = getMonthlyAverages(filter || undefined);
  const maxOpenInfo = getMaxOpen(filter || undefined);
  const maxCloseInfo = getMaxClose(filter || undefined);

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#b4b4b4',
        fontFamily: 'Calibri, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DashboardHeader onReset={handleReset} />

      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Section */}
        <>
          {/* Max Open Card */}
          <div
            style={{
              gridColumn: '1',
              gridRow: '1',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#b4b4b4',
                marginBottom: '10px',
                textAlign: 'left',
              }}
            >
              Maximum open stock price and day of occurance
            </div>
            <div
              style={{
                height: 'calc(100% - 25px)',
              }}
            >
              <BigNumberCard
                label=""
                maxInfo={maxOpenInfo}
                loading={loading}
              />
            </div>
          </div>

          {/* Open Chart */}
          <div
            style={{
              gridColumn: '2',
              gridRow: '1',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#b4b4b4',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              Average monthly open stock prices
            </div>
            <LineChart
              data={monthlyData}
              dataKey="averageOpen"
              color="#b4b4b4"
              onFilter={handleFilter}
              axisTitle="Date"
            />
          </div>
        </>

        {/* Bottom Section */}
        <>
          {/* Max Close Card */}
          <div
            style={{
              gridColumn: '1',
              gridRow: '2',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#b4b4b4',
                marginBottom: '10px',
                textAlign: 'left',
              }}
            >
              Maximum close stock price and day of occurance
            </div>
            <div
              style={{
                height: 'calc(100% - 25px)',
              }}
            >
              <BigNumberCard
                label=""
                maxInfo={maxCloseInfo}
                loading={loading}
              />
            </div>
          </div>

          {/* Close Chart */}
          <div
            style={{
              gridColumn: '2',
              gridRow: '2',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#b4b4b4',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              Average monthly close stock prices
            </div>
            <LineChart
              data={monthlyData}
              dataKey="averageClose"
              color="#b4b4b4"
              onFilter={handleFilter}
              axisTitle="Date"
            />
          </div>
        </>
      </div>
    </div>
  );
}
