import { useEffect, useState } from 'react';
import { SummaryCard } from '../charts/CustomTableView';
import type { ModelPerformanceRow } from '../../types'

import { calculateMAE } from '../../utils/calculatedFields';
import { useDashboardStore } from '../../store/dashboardStore';

interface MAEValuesProps {
  data: ModelPerformanceRow[]
}

export function MAEValues({ data }: MAEValuesProps) {
  const { model } = useDashboardStore()
  const [averageMAE, setAverageMAE] = useState<number>(0)

  useEffect(() => {
    if (data.length === 0) return

    // Calculate average MAE
    let totalMAE = 0
    let count = 0

    data.forEach((row) => {
      const mae = calculateMAE(row, model)
      totalMAE += mae
      count++
    })

    const avgMAE = count > 0 ? totalMAE / count : 0
    setAverageMAE(avgMAE)
  }, [data, model])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <SummaryCard
        title="MAE"
        value={averageMAE.toFixed(2)}
        subtitle="Mean Absolute Error"
        size="large"
      />
    </div>
  )
}
