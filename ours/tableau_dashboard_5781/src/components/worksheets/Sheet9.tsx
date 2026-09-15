import { useMemo } from 'react';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import type { ClusterProfileRow, BarChartData } from '../../types'

import { useHighlightStore } from '../../store/dashboardStore';

interface Sheet9Props {
  data: ClusterProfileRow[]
}

export function Sheet9({ data }: Sheet9Props) {
  const { selectedCluster, setSelectedCluster, clearHighlights } = useHighlightStore()
  const chartData = useMemo(() => {

  
    // Aggregate count_merchantclass by cluster (taking the average as it's already a count)
    const clusterMap = new Map<number, { sum: number; count: number }>()

    data.forEach((row) => {
      const cluster = row.cluster
      const merchantClassCount = Number(row.count_merchantclass) || 0

      const current = clusterMap.get(cluster) || { sum: 0, count: 0 }
      clusterMap.set(cluster, {
        sum: current.sum + merchantClassCount,
        count: current.count + 1,
      })
    })

    const chartData: BarChartData[] = Array.from(clusterMap.entries())
      .map(([cluster, { sum, count }]) => ({
        category: `Cluster-${cluster}`,
        value: count > 0 ? sum / count : 0,
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
        title="Number of Merchant Classes"
        axisTitle="# Merchant Class"
        highlightCluster={selectedCluster}
        onBarClick={handleBarClick}
        valueFormat="number"
      />
    </div>
  )
}
