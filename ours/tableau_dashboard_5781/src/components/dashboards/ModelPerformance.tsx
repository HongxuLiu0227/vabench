import type { ModelPerformanceRow, ModelParameter } from '../../types'

import { MAEValues } from '../worksheets/MAEValues';
import { ModelPredictions } from '../worksheets/ModelPredictions';
import { Summary } from '../worksheets/Summary';
import { Sheet10 } from '../worksheets/Sheet10';
import { useDashboardStore } from '../../store/dashboardStore';

interface ModelPerformanceProps {
  data: ModelPerformanceRow[]
}

export function ModelPerformance({ data }: ModelPerformanceProps) {
  const { model, setModel } = useDashboardStore()

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '20px',
      fontFamily: 'sans-serif',
      backgroundColor: '#f5f5f5',
      overflowY: 'auto',
    }}>
      {/* Dashboard Header */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'left',
          marginBottom: '20px',
          color: '#000000',
        }}
      >
        MODEL PERFORMANCE
      </div>

      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="model-select" style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
            Model:
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value as ModelParameter)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="Linear Regression">Linear Regression</option>
            <option value="Decision Tree">Decision Tree</option>
            <option value="Random Forest ">Random Forest</option>
            <option value="XGBoost">XGBoost</option>
          </select>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '20px',
        }}
      >
        {/* Model Predictions - Large Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ height: '500px' }}>
            <ModelPredictions data={data} />
          </div>
        </div>

        {/* MAE Values */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ height: '250px' }}>
            <MAEValues data={data} />
          </div>
        </div>

        {/* Sheet 10 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ height: '250px' }}>
            <Sheet10 data={data} />
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ height: '300px' }}>
            <Summary data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
