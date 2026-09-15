import { useMemo } from 'react';
import { CustomTableView } from '../charts/CustomTableView';
import type { ModelPerformanceRow, TableData } from '../../types';
import { formatNumber } from '../../utils/calculatedFields';
import { useDashboardStore } from '../../store/dashboardStore';

interface Sheet10Props {
  data: ModelPerformanceRow[]
}

export function Sheet10({ data }: Sheet10Props) {
  const { solidFlag, season } = useDashboardStore()

  const tableData = useMemo(() => {
    // Filter data based on current filters
    const filteredData = data.filter((row) => {
      const matchesSolidFlag = row['Solid_Flag.Non.Solid'] === solidFlag
      const matchesSeason = row['Season_ID'] === season
      return matchesSolidFlag && matchesSeason
    })

    if (filteredData.length === 0) {
      return []
    }

    // Calculate cumulative units and count of unique color_IDs
    let totalCumulativeUnits = 0
    const uniqueColors = new Set<string>()

    filteredData.forEach((row) => {
      totalCumulativeUnits += Math.exp(row['CumulativeUnits'])
      uniqueColors.add(row['color_ID'])
    })

    const tableData: TableData[] = [
      {
        key: 'Cumulative Units',
        value: formatNumber(Math.round(totalCumulativeUnits)),
      },
      {
        key: 'Count of Distinct Colors',
        value: formatNumber(uniqueColors.size),
      },
    ]

    return tableData
  }, [data, solidFlag, season])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CustomTableView
        data={tableData}
        valueFormat="none"
      />
    </div>
  )
}
