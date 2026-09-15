import { useMemo } from 'react';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import type { ClusterProfileRow, BarChartData } from '../../types'

import { useHighlightStore } from '../../store/dashboardStore';

interface AvgPriceProps {
  data: ClusterProfileRow[]
}

export function AvgPrice({ data }: AvgPriceProps) {
  const { selectedCluster, setSelectedCluster, clearHighlights } = useHighlightStore()
  const chartData = useMemo(() => {

  
    // Calculate weighted average price by cluster
    const clusterMap = new Map<number, { sum: number; units: number }>()

    data.forEach((row) => {
      const cluster = row.cluster
      const avgPrice = Number(row.avg_price) || 0
      const units = Number(row.units) || 0

      const current = clusterMap.get(cluster) || { sum: 0, units: 0 }
      clusterMap.set(cluster, {
        sum: current.sum + (avgPrice * units),
        units: current.units + units,
      })
    })

    const chartData: BarChartData[] = Array.from(clusterMap.entries())
      .map(([cluster, { sum, units }]) => ({
        category: `Cluster-${cluster}`,
        value: units > 0 ? sum / units : 0,
        cluster: cluster,
      }))
      .filter((d) => d.value > 0)

    return chartData
  }, [data])

  const handleBarClick = (category: string) => {
    if (selectedCluster === category) {
      clearHighlights()
    } else {
      setSelectedCluster(category)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <VerticalRankedBarChart
        data={chartData}
        title="Average Unit Price"
        axisTitle="Avg Price"
        highlightCluster={selectedCluster}
        onBarClick={handleBarClick}
        valueFormat="currency"
      />
    </div>
  )
}
