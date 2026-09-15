import { useMemo } from 'react';
import { BalanceAgeTable } from '../charts/BalanceAgeTable';
import type { ABTestingDataWithAgeGroup } from '../../types/data';
import { filterData, averageByCategory } from '../../services/dataAggregator';

interface BalanceAgeTable2Props {
  data: ABTestingDataWithAgeGroup[];
  width: number;
  height: number;
}

export function BalanceAgeTable2({
  data,
  width,
  height
}: BalanceAgeTable2Props) {
  const { filteredData, avgGroupBalance } = useMemo(() => {
    // Apply hard filters as per spec:
    // Variation = 'Test'
    // age_group = 'Age 17-30'
    // process_step = 'start'
    // gendr in ('F', 'M')
    let filtered = filterData(data, {
      variation: 'Test',
      age_group: 'Age 17-30',
      process_step: 'start'
    });

    // Filter by gender
    filtered = filtered.filter(d => d.gendr === 'F' || d.gendr === 'M');

    // Calculate average balance for the age group
    const avgBalance = averageByCategory(filtered, 'age_group', 'bal');
    const avgGroupBalance = avgBalance.find(d => d.category === 'Age 17-30')?.value || 0;

    // Calculate delta and filter for delta >= 0
    filtered = filtered.map(row => ({
      ...row,
      delta: row.bal - avgGroupBalance
    })).filter(row => row.delta >= 0);

    return {
      filteredData: filtered,
      avgGroupBalance
    };
  }, [data]);

  return (
    <BalanceAgeTable
      data={filteredData}
      avgGroupBalance={avgGroupBalance}
      width={width}
      height={height}
      title="Group 1 Age: Balance Filter Above Average"
    />
  );
}
