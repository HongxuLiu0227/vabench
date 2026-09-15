/**
 * Gender Trips by Hour of Day worksheet
 * Chart intent: custom_tableau_view (grouped bar chart)
 * - X-axis: Hour of Day (0-23)
 * - Y-axis: Count of trips
 * - Color by Gender (1=Male, 2=Female)
 * - Filter: Gender in [1, 2] (exclude Undefined)
 */
import { useMemo, useRef, useEffect } from 'react';
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import type { GenderTripsByHour } from '../types';

interface GenderTripsByHourProps {
  data: GenderTripsByHour[];
  width: number;
  height: number;
  title?: string;
}

const GENDER_COLORS = {
  1: '#4e79a7', // Male
  2: '#ff9da7', // Female
  0: '#e15759', // Undefined (not shown per filter)
};

const GENDER_LABELS: Record<number, string> = {
  1: 'Male',
  2: 'Female',
};

const MARGIN = { top: 40, right: 20, bottom: 50, left: 60 };

export function GenderTripsByHour({
  data,
  width,
  height,
  title = 'Trips by Hour of Day',
}: GenderTripsByHourProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const chartWidth = width - MARGIN.left - MARGIN.right;
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Create scales
  const xScale = useMemo(() => {
    return scaleBand()
      .domain(Array.from({ length: 24 }, (_, i) => String(i)))
      .range([0, chartWidth])
      .padding(0.2);
  }, [chartWidth]);

  const yScale = useMemo(() => {
    const maxValue = max(data, d => d.count) || 0;
    return scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% headroom
      .range([chartHeight, 0])
      .nice();
  }, [data, chartHeight]);

  const groupScale = useMemo(() => {
    return scaleBand()
      .domain(['1', '2'])
      .range([0, xScale.bandwidth()])
      .padding(0.1);
  }, [xScale]);

  const colorScale = useMemo(() => {
    return scaleOrdinal<string, string>()
      .domain(['1', '2'])
      .range([GENDER_COLORS[1], GENDER_COLORS[2]]);
  }, []);

  // Group data by hour for rendering
  const groupedData = useMemo(() => {
    const groups: Map<number, GenderTripsByHour[]> = new Map();
    for (let hour = 0; hour < 24; hour++) {
      groups.set(hour, []);
    }
    for (const d of data) {
      if (groups.has(d.hour)) {
        groups.get(d.hour)!.push(d);
      }
    }
    return groups;
  }, [data]);

  // Render axes and bars
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create main group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);
    svg.appendChild(g);

    // Y-axis grid lines
    const yAxisTicks = yScale.ticks(5);
    yAxisTicks.forEach(tick => {
      const y = yScale(tick);
      if (y === undefined) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', String(chartWidth));
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-dasharray', '4,4');
      g.appendChild(line);

      // Y-axis labels
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-10');
      text.setAttribute('y', String(y + 4));
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '12px');
      text.setAttribute('fill', '#666');
      text.textContent = String(tick);
      g.appendChild(text);
    });

    // X-axis labels (show every 3 hours to avoid crowding)
    xScale.domain().forEach(hourStr => {
      const hour = parseInt(hourStr, 10);
      if (hour % 3 === 0) {
        const x = xScale(hourStr);
        if (x === undefined) return;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(x + xScale.bandwidth() / 2));
        text.setAttribute('y', String(chartHeight + 20));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12px');
        text.setAttribute('fill', '#666');
        text.textContent = String(hour);
        g.appendChild(text);
      }
    });

    // Render bars
    groupedData.forEach((hourData, hour) => {
      const x = xScale(String(hour));
      if (x === undefined) return;

      hourData.forEach(d => {
        const groupX = groupScale(String(d.gender));
        const barWidth = groupScale.bandwidth();
        const y = yScale(d.count);
        const barHeight = chartHeight - (y ?? 0);

        if (groupX !== undefined && barWidth && y !== undefined && d.count > 0) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(x + groupX));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(barWidth));
          rect.setAttribute('height', String(barHeight));
          rect.setAttribute('fill', colorScale(String(d.gender)) as string);
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('rx', '2');
          g.appendChild(rect);
        }
      });
    });

    // Y-axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', '0');
    yAxisLine.setAttribute('x2', '0');
    yAxisLine.setAttribute('y1', '0');
    yAxisLine.setAttribute('y2', String(chartHeight));
    yAxisLine.setAttribute('stroke', '#ccc');
    g.appendChild(yAxisLine);

  }, [groupedData, xScale, yScale, groupScale, colorScale, chartWidth, chartHeight]);

  // Legend component
  const legend = (
    <div style={{
      position: 'absolute',
      top: 60,
      right: 20,
      background: 'white',
      padding: '8px 12px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Gender</div>
      {[1, 2].map(gender => (
        <div key={gender} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '12px',
              backgroundColor: GENDER_COLORS[gender as keyof typeof GENDER_COLORS],
              marginRight: '8px',
              borderRadius: '2px',
            }}
          />
          <span>{GENDER_LABELS[gender]}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'left',
      }}>
        {title}
      </h3>
      {legend}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
    </div>
  );
}
