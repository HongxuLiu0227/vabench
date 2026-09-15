import { useMemo } from 'react';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import type { ClusterProfileRow, BarChartData } from '../../types'

import { useHighlightStore } from '../../store/dashboardStore';

interface SalesProps {
  data: ClusterProfileRow[]
}

export function Sales({ data }: SalesProps) {
  const { selectedCluster, setSelectedCluster, clearHighlights } = useHighlightStore()
  const chartData = useMemo(() => {

  
    // Aggregate totalsales by cluster
    const clusterMap = new Map<number, number>()

    data.forEach((row) => {
      const cluster = row.cluster
      const totalSales = Number(row.totalsales) || 0
      clusterMap.set(cluster, (clusterMap.get(cluster) || 0) + totalSales)
    })

    const chartData: BarChartData[] = Array.from(clusterMap.entries()).map(
      ([cluster, sales]) => ({
        category: `Cluster-${cluster}`,
        value: sales,
        cluster: cluster,
      })
    )

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
        title="Total Sales"
        axisTitle="Sales ($)"
        highlightCluster={selectedCluster}
        onBarClick={handleBarClick}
        valueFormat="currency"
      />
    </div>
  )
}
