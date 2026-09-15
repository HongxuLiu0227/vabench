import { useMemo } from 'react';
import { HorizontalRankedBarChart } from '../charts/HorizontalRankedBarChart';
import type { ModelPerformanceRow, MAECategory } from '../../types';
import { calculateMAE, calculateMAECategory } from '../../utils/calculatedFields';
import { useDashboardStore, useHighlightStore } from '../../store/dashboardStore';

interface ModelPredictionsProps {
  data: ModelPerformanceRow[]
}

export function ModelPredictions({ data }: ModelPredictionsProps) {
  const { model } = useDashboardStore()
  const { selectedMAECategory, setSelectedMAECategory, clearHighlights } = useHighlightStore()

  const chartData = useMemo(() => {
    // Group data by MAE category
    const categoryMap = new Map<string, { sumPredictions: number; count: number }>()

    data.forEach((row) => {
      const mae = calculateMAE(row, model)
      const category = calculateMAECategory(mae)

      // Get prediction value
      const prediction = model === 'Linear Regression'
        ? row['Linear Preds']
        : model === 'Decision Tree'
        ? row['Bagging Preds']
        : model === 'Random Forest '
        ? row['Randomforest Preds']
        : row['XGBoost Preds']

      const current = categoryMap.get(category) || { sumPredictions: 0, count: 0 }
      categoryMap.set(category, {
        sumPredictions: current.sumPredictions + prediction,
        count: current.count + 1,
      })
    })

    // Convert to chart data
    return Array.from(categoryMap.entries())
      .filter(([cat]) => cat !== 'LOW Varaince') // Skip duplicate category name
      .map(([category, { sumPredictions, count }]) => ({
        category: category,
        value: sumPredictions / count, // Average predictions
      }))
      .sort((a, b) => {
        // Sort by value descending
        return b.value - a.value
      })
  }, [data, model])

  const handleBarClick = (category: string) => {
    if (selectedMAECategory === category) {
      clearHighlights()
    } else {
      setSelectedMAECategory(category as MAECategory)
    }
  }

  const title = `Model Predictions - <${model}>`

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <HorizontalRankedBarChart
        data={chartData}
        title={title}
        yAxisTitle="Color - MAE"
        xAxisTitle="Predictions"
        highlightCategory={selectedMAECategory}
        onBarClick={handleBarClick}
        seriesOrder={['LOW Varaince', 'High Variance', 'Medium Variance', 'Low Variance']}
      />
    </div>
  )
}
