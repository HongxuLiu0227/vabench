/**
 * LegendPanel: Display legends for Sheet 28 (weather color and light condition size)
 */
import type { WeatherCondition, LightConditionsGroup } from '../../types/data';
import { WEATHER_COLORS, LIGHT_CONDITION_GROUP_THICKNESS } from '../../types/data';

interface LegendPanelProps {
  className?: string;
}

export function LegendPanel({ className = '' }: LegendPanelProps) {
  const weatherConditions: WeatherCondition[] = [
    'Fine no high winds',
    'Raining no high winds',
    'Snowing no high winds',
    'Fine + high winds',
    'Raining + high winds',
    'Snowing + high winds',
    'Fog or mist',
    'Other',
    'Unknown'
  ];

  const lightConditions: LightConditionsGroup[] = ['Daylight', 'Darkness'];

  return (
    <div className={`legend-panel ${className}`} style={{ padding: '10px' }}>
      {/* Weather Conditions Color Legend */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          Weather Conditions
        </h4>
        {weatherConditions.map(weather => (
          <div key={weather} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: WEATHER_COLORS[weather],
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
            />
            <span style={{ fontSize: '11px', color: '#333' }}>{weather}</span>
          </div>
        ))}
      </div>

      {/* Light Conditions Size Legend */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          Light Conditions
        </h4>
        {lightConditions.map(condition => (
          <div key={condition} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: `${LIGHT_CONDITION_GROUP_THICKNESS[condition]}px`,
                backgroundColor: '#1f77b4',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
            />
            <span style={{ fontSize: '11px', color: '#333' }}>{condition}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
