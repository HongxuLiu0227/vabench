import { useMemo } from 'react';
import { CustomTableView } from '../charts/CustomTableView';
import type { ClusterProfileRow } from '../../types'

import { formatCurrency } from '../../utils/calculatedFields';

interface NameOfPatternsProps {
  data: ClusterProfileRow[]
}

export function NameOfPatterns({ data }: NameOfPatternsProps) {
  const tableData = useMemo(() => {
    // Get top 10 patterns by totalsales
    const sortedData = [...data]
      .sort((a, b) => (b.totalsales || 0) - (a.totalsales || 0))
      .slice(0, 10)

    return sortedData.map((row) => ({
      key: row.COLOR_DESCRIPTION,
      value: formatCurrency(row.totalsales || 0),
    }))
  }, [data])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CustomTableView
        data={tableData}
        title="Top 10 Patterns"
        valueFormat="currency"
      />
    </div>
  )
}
