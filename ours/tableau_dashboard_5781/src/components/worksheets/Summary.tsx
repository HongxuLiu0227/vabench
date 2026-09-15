import { useEffect, useState } from 'react';
import { CustomTableView } from '../charts/CustomTableView';
import type { ModelPerformanceRow, TableData } from '../../types';
import { calculateObserved, calculateMAE, rowMatchesFilters } from '../../utils/calculatedFields';
import { useDashboardStore } from '../../store/dashboardStore';

interface SummaryProps {
  data: ModelPerformanceRow[]
}

export function Summary({ data }: SummaryProps) {
  const { model, solidFlag, season, clusters, merchants, months } = useDashboardStore()
  const [tableData, setTableData] = useState<TableData[]>([])

  useEffect(() => {
    // Filter data based on current filters
    const filteredData = data.filter((row) =>
      rowMatchesFilters(row, solidFlag, season, clusters, merchants, months)
    )

    if (filteredData.length === 0) {
      setTableData([])
      return
    }

    // Calculate summary statistics
    let totalObserved = 0
    let totalMAE = 0
    let count = 0

    const modelMAEs: { [key: string]: number[] } = {
      'Linear Regression': [],
      'Decision Tree': [],
      'Random Forest ': [],
      'XGBoost': [],
    }

    filteredData.forEach((row) => {
      const observed = calculateObserved(row)
      const mae = calculateMAE(row, model)

      totalObserved += observed
      totalMAE += mae
      count++

      // Collect MAEs for each model
      modelMAEs['Linear Regression'].push(Math.abs(observed - row['Linear Preds']))
      modelMAEs['Decision Tree'].push(Math.abs(observed - row['Bagging Preds']))
      modelMAEs['Random Forest '].push(Math.abs(observed - row['Randomforest Preds']))
      modelMAEs['XGBoost'].push(Math.abs(observed - row['XGBoost Preds']))
    })

    // Calculate averages
    const avgObserved = count > 0 ? totalObserved / count : 0
    const avgMAE = count > 0 ? totalMAE / count : 0

    // Calculate average MAE for each model
    const avgModelMAEs: { [key: string]: number } = {}
    Object.entries(modelMAEs).forEach(([modelKey, maes]) => {
      avgModelMAEs[modelKey] = maes.length > 0
        ? maes.reduce((sum, mae) => sum + mae, 0) / maes.length
        : 0
    })

    const tableData: TableData[] = [
      {
        key: 'Average Observed',
        value: avgObserved.toFixed(2),
      },
      {
        key: `Average MAE (${model})`,
        value: avgMAE.toFixed(2),
      },
      {
        key: 'Average MAE (Linear)',
        value: avgModelMAEs['Linear Regression'].toFixed(2),
      },
      {
        key: 'Average MAE (Decision Tree)',
        value: avgModelMAEs['Decision Tree'].toFixed(2),
      },
      {
        key: 'Average MAE (Random Forest)',
        value: avgModelMAEs['Random Forest '].toFixed(2),
      },
      {
        key: 'Average MAE (XGBoost)',
        value: avgModelMAEs['XGBoost'].toFixed(2),
      },
      {
        key: 'Total Records',
        value: count.toString(),
      },
    ]

    setTableData(tableData)
  }, [data, model, solidFlag, season, clusters, merchants, months])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CustomTableView
        data={tableData}
        title="Summary"
        valueFormat="none"
      />
    </div>
  )
}
