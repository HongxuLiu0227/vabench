import { useMemo } from 'react';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import type { ClusterProfileRow } from '../../types'

import { useHighlightStore } from '../../store/dashboardStore';

interface PatternsInClusterProps {
  data: ClusterProfileRow[]
}

export function PatternsInCluster({ data }: PatternsInClusterProps) {
  const { selectedCluster, setSelectedCluster, clearHighlights } = useHighlightStore()

  const chartData = useMemo(() => {
    // Aggregate data by cluster
    const clusterMap = new Map<number, number>()

    data.forEach((row) => {
      const cluster = row.cluster
      const count = 1; // Each row represents one pattern
      clusterMap.set(cluster, (clusterMap.get(cluster) || 0) + count)
    })

    return Array.from(clusterMap.entries()).map(
      ([cluster, count]) => ({
        category: `Cluster-${cluster}`,
        value: count,
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
        title="No. of Patterns"
        axisTitle="# Patterns"
        showLegend={true}
        highlightCluster={selectedCluster}
        onBarClick={handleBarClick}
        valueFormat="number"
      />
    </div>
  )
}
