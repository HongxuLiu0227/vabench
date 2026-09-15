import type { TelcoRecord } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface CustomTableViewProps {
  data: TelcoRecord[];
  type: 'citizen' | 'count';
  dimension?: keyof TelcoRecord;
  centerText?: {
    label: string;
    value: string;
  };
}

export const CustomTableView: React.FC<CustomTableViewProps> = ({
  data,
  type,
  dimension,
  centerText,
}) => {
  const { highlightState } = useDashboard();

  if (type === 'citizen') {
    // Calculate senior citizen metrics
    const seniorCount = data.filter((d) => d.SeniorCitizen === 1).length;
    const nonSeniorCount = data.length - seniorCount;

    const isHighlighted = (category: string) => {
      if (!highlightState.dimension || !highlightState.value) return true;
      return category === highlightState.value;
    };

    return (
      <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '4px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            opacity: isHighlighted('Senior Citizen') ? 1 : 0.3,
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Senior Citizen</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#72b966' }}>
            {seniorCount.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            opacity: isHighlighted('NO') ? 1 : 0.3,
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>NO</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#72b966' }}>
            {nonSeniorCount.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'count' && dimension && centerText) {
    // Simple count display with center text format
    const count = data.length;

    return (
      <div
        style={{
          padding: '10px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          {centerText.label}
        </div>
        <div style={{ fontSize: centerText.value ? '15px' : '20px', fontWeight: 'bold', color: '#333' }}>
          {centerText.value || count.toLocaleString()}
        </div>
      </div>
    );
  }

  return null;
};
