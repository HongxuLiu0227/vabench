import { useMemo } from 'react';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import type { ClusterProfileRow } from '../../types'

import { useHighlightStore } from '../../store/dashboardStore';

interface UnitsSoldProps {
  data: ClusterProfileRow[]
}

export function UnitsSold({ data }: UnitsSoldProps) {
  const { selectedCluster, setSelectedCluster, clearHighlights } = useHighlightStore()

  const chartData = useMemo(() => {
    // Aggregate units by cluster
    const clusterMap = new Map<number, number>()

    data.forEach((row) => {
      const cluster = row.cluster
      const units = Number(row.units) || 0
      clusterMap.set(cluster, (clusterMap.get(cluster) || 0) + units)
    })

    return Array.from(clusterMap.entries()).map(
      ([cluster, units]) => ({
        category: `Cluster-${cluster}`,
        value: units,
        cluster: cluster,
      })
    )
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
        title="No. of Units Sold"
        highlightCluster={selectedCluster}
        onBarClick={handleBarClick}
        valueFormat="number"
      />
    </div>
  )
}
