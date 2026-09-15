import React from 'react';
import * as d3 from 'd3';
import { getLightConditionsName, getAccidentSeverityName } from '../utils/dataTransform';

interface LegendProps {
  title?: string;
  categories: string[];
  position: 'top' | 'right' | 'bottom' | 'left';
  orientation?: 'horizontal' | 'vertical';
  colorScale?: (d: string) => string;
  style?: React.CSSProperties;
}

const LIGHT_CONDITION_COLORS: Record<number, string> = {
  1: '#1f77b4', // Daylight - blue
  4: '#ff7f0e', // Darkness - lights lit - orange
  5: '#d62728', // Darkness - lights unlit - red
  6: '#9467bd', // Darkness - no lighting - purple
  7: '#8c564b', // Darkness - lighting unknown - brown
};

const SEVERITY_COLORS: Record<number, string> = {
  1: '#d62728', // Fatal - red
  2: '#ff7f0e', // Serious - orange
  3: '#1f77b4', // Slight - blue
};

export const Legend: React.FC<LegendProps> = ({
  title,
  categories,
  position,
  orientation = position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical',
  colorScale,
  style,
}) => {
  const isNumeric = categories.every((c) => !isNaN(parseInt(c)));

  const getLabel = (category: string): string => {
    if (!isNumeric) return category;
    const code = parseInt(category);
    // Try to determine if this is light conditions or severity
    if (code >= 1 && code <= 3) {
      return getAccidentSeverityName(code);
    }
    return getLightConditionsName(code);
  };

  const getColor = (category: string): string => {
    if (colorScale) {
      return colorScale(category);
    }
    if (!isNumeric) return d3.schemeCategory10[categories.indexOf(category) % 10];
    const code = parseInt(category);
    if (code >= 1 && code <= 3) {
      return SEVERITY_COLORS[code] || '#999';
    }
    return LIGHT_CONDITION_COLORS[code] || '#999';
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: orientation === 'vertical' ? '8px' : '16px',
    alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
    padding: '10px',
    backgroundColor: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: orientation === 'vertical' ? '8px' : '0',
    marginRight: orientation === 'horizontal' ? '12px' : '0',
    color: '#333',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#555',
  };

  const colorBoxStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '2px',
    border: '1px solid #ccc',
  };

  return (
    <div style={containerStyle}>
      {title && <div style={titleStyle}>{title}</div>}
      {categories.map((category) => (
        <div key={category} style={itemStyle}>
          <div
            style={{
              ...colorBoxStyle,
              backgroundColor: getColor(category),
            }}
          />
          <span>{getLabel(category)}</span>
        </div>
      ))}
    </div>
  );
};
