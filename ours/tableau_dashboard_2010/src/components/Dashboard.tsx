import { useState, useEffect } from 'react';
import { NumberOfParticipants } from './worksheets/NumberOfParticipants';
import { TotalNumberOfParticipants } from './worksheets/TotalNumberOfParticipants';
import { GenderPercent } from './worksheets/GenderPercent';
import { BalanceAgeTable2 } from './worksheets/BalanceAgeTable2';
import type { ABTestingDataWithAgeGroup } from '../types/data';
import { loadABTestingData } from '../services/dataLoader';

interface DashboardProps {
  width?: number;
  height?: number;
}

export function Dashboard({ width = 1000, height = 800 }: DashboardProps) {
  const [data, setData] = useState<ABTestingDataWithAgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const loadedData = await loadABTestingData();
        setData(loadedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
        fontSize: '18px'
      }}>
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
        fontSize: '18px',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  // Dashboard layout based on zones from spec
  // 2x2 grid with margins
  const margin = 8;
  const chartWidth = (width - margin * 3) / 2;
  const chartHeight = (height - margin * 3) / 2;

  return (
    <div style={{
      width,
      height,
      padding: `${margin}px`,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: `${margin}px`,
      backgroundColor: '#fff'
    }}>
      {/* Top-Left: Number of participants */}
      <div>
        <NumberOfParticipants
          data={data}
          width={chartWidth}
          height={chartHeight}
        />
      </div>

      {/* Top-Right: Total Number of Participants */}
      <div>
        <TotalNumberOfParticipants
          data={data}
          width={chartWidth}
          height={chartHeight}
        />
      </div>

      {/* Bottom-Left: Balance vs Age (2) - Table */}
      <div>
        <BalanceAgeTable2
          data={data}
          width={chartWidth}
          height={chartHeight}
        />
      </div>

      {/* Bottom-Right: Gender % */}
      <div>
        <GenderPercent
          data={data}
          width={chartWidth}
          height={chartHeight}
        />
      </div>
    </div>
  );
}
