import { useMemo } from 'react';
import type { DiagnosisData } from '../types';
import { BubbleChart } from './BubbleChart';
import { BarChart } from './BarChart';
import { Legend } from './Legend';
import { useFilter } from '../contexts/FilterContext';

interface DashboardProps {
  data: DiagnosisData[];
  width: number;
  height: number;
}

/**
 * Dashboard component - "G: Number of Records per Diagnosis and Total Discharges"
 * Layout: Vertical column with two worksheets
 * - Top (50%): Bubble Chart (Number of Records per Diagnosis)
 * - Bottom (50%): Bar Chart (Total Discharges vs Diagnosis)
 *
 * Implements filter interaction where selecting a bubble filters both worksheets
 */
export function Dashboard({ data, width, height }: DashboardProps) {
  const { selectedDiagnosis } = useFilter();

  // Filter data for bubble chart (613-3023 records range)
  const bubbleChartData = useMemo(() => {
    return data.filter((d) => d.numberOfRecords >= 613 && d.numberOfRecords <= 3023);
  }, [data]);

  // Filter data for bar chart based on selection
  const barChartData = useMemo(() => {
    if (selectedDiagnosis) {
      return data.filter((d) => d.diagnosis === selectedDiagnosis);
    }
    return data;
  }, [data, selectedDiagnosis]);

  const halfHeight = height / 2;

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Worksheet: G: Number of Records per Diagnosis */}
      <div
        style={{
          height: halfHeight,
          position: 'relative',
          marginBottom: '4px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '2px',
        }}
      >
        <BubbleChart data={bubbleChartData} width={width - 16} height={halfHeight - 8} />
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 100,
          }}
        >
          <Legend data={bubbleChartData} width={120} height={150} />
        </div>
      </div>

      {/* Bottom Worksheet: G: Total Discharges vs Diagnosis */}
      <div
        style={{
          height: halfHeight,
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '2px',
        }}
      >
        <BarChart data={barChartData} width={width - 16} height={halfHeight - 8} />
      </div>
    </div>
  );
}
