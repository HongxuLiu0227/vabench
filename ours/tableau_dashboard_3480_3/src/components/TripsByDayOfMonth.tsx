/**
 * Trips by Day of Month worksheet
 * Chart intent: vertical_ranked_bar (stacked bar)
 * - X-axis: Day of Month (1-30)
 * - Y-axis: Count of trips
 * - Color by Weekday (Monday=1 to Sunday=7)
 * - Interaction: Click bar to filter Gender Trips by Hour of Day
 */
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import type { DayTripsByMonth } from '../types';
import { useDashboardContext } from '../contexts/useDashboardContext';

interface TripsByDayOfMonthProps {
  data: DayTripsByMonth[];
  width: number;
  height: number;
  title?: string;
}

// Weekday colors (Sequential Gray Warm palette from Tableau spec)
const WEEKDAY_COLORS: Record<number, string> = {
  1: '#59504e', // Monday
  2: '#dcd4d0', // Tuesday
  3: '#c4bcb8', // Wednesday
  4: '#aea5a2', // Thursday
  5: '#98908c', // Friday
  6: '#827a77', // Saturday
  0: '#6e6462', // Sunday
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const MARGIN = { top: 40, right: 20, bottom: 50, left: 60 };

export function TripsByDayOfMonth({
  data,
  width,
  height,
  title = 'Trips by Day of Month',
}: TripsByDayOfMonthProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { toggleDayFilter, filterState } = useDashboardContext();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const chartWidth = width - MARGIN.left - MARGIN.right;
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Create scales
  const xScale = useMemo(() => {
    return scaleBand()
      .domain(Array.from({ length: 30 }, (_, i) => String(i + 1)))
      .range([0, chartWidth])
      .padding(0.15);
  }, [chartWidth]);

  // Calculate total per day for y-axis
  const totalsByDay = useMemo(() => {
    const totals = new Map<number, number>();
    for (let day = 1; day <= 30; day++) {
      totals.set(day, 0);
    }
    for (const d of data) {
      totals.set(d.day, (totals.get(d.day) || 0) + d.count);
    }
    return totals;
  }, [data]);

  const yScale = useMemo(() => {
    const maxValue = max(Array.from(totalsByDay.values())) || 0;
    return scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([chartHeight, 0])
      .nice();
  }, [totalsByDay, chartHeight]);

  // Group data by day for stacking
  const stackedData = useMemo(() => {
    const stacks: Map<number, Map<number, number>> = new Map();
    for (let day = 1; day <= 30; day++) {
      stacks.set(day, new Map());
    }
    for (const d of data) {
      const dayMap = stacks.get(d.day);
      if (dayMap) {
        dayMap.set(d.weekday, d.count);
      }
    }
    return stacks;
  }, [data]);

  // Handle bar click - stable reference
  const handleBarClick = useCallback((day: number) => {
    toggleDayFilter(day);
  }, [toggleDayFilter]);

  // Render axes and stacked bars
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

    // X-axis labels (show every 5 days)
    xScale.domain().forEach(dayStr => {
      const day = parseInt(dayStr, 10);
      if (day % 5 === 1 || day === 30) {
        const x = xScale(dayStr);
        if (x === undefined) return;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(x + xScale.bandwidth() / 2));
        text.setAttribute('y', String(chartHeight + 20));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12px');
        text.setAttribute('fill', '#666');
        text.textContent = String(day);
        g.appendChild(text);
      }
    });

    // Render stacked bars
    stackedData.forEach((weekdayMap, day) => {
      const x = xScale(String(day));
      if (x === undefined) return;

      const barWidth = xScale.bandwidth();
      let yOffset = 0;
      const total = totalsByDay.get(day) || 0;

      // Sort weekdays for consistent stacking (Sunday=0 to Saturday=6)
      const weekdays = [0, 1, 2, 3, 4, 5, 6];

      weekdays.forEach(weekday => {
        const count = weekdayMap.get(weekday) || 0;
        if (count > 0) {
          const segmentHeight = (count / total) * (yScale(0) - yScale(total));
          const y = yScale(0) - yOffset - segmentHeight;

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(barWidth));
          rect.setAttribute('height', String(segmentHeight));
          rect.setAttribute('fill', WEEKDAY_COLORS[weekday as keyof typeof WEEKDAY_COLORS]);
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('rx', '2');
          rect.setAttribute('class', 'cursor-pointer');
          rect.setAttribute('data-day', String(day));

          // Add hover effect via style
          const isHovered = hoveredDay === day;
          const isSelected = filterState.selectedDay === day;
          if (isHovered || isSelected) {
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '2');
          }

          g.appendChild(rect);
          yOffset += segmentHeight;
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

    // Add click handlers to bars
    const bars = g.querySelectorAll('rect[data-day]');
    bars.forEach(bar => {
      const day = parseInt(bar.getAttribute('data-day') || '0');
      bar.addEventListener('click', () => handleBarClick(day));
      bar.addEventListener('mouseenter', () => setHoveredDay(day));
      bar.addEventListener('mouseleave', () => setHoveredDay(null));
    });

  }, [stackedData, totalsByDay, xScale, yScale, chartWidth, chartHeight, hoveredDay, filterState.selectedDay, handleBarClick]);

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
      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Weekday</div>
      {[1, 2, 3, 4, 5, 6, 0].map(weekday => (
        <div key={weekday} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '12px',
              backgroundColor: WEEKDAY_COLORS[weekday as keyof typeof WEEKDAY_COLORS],
              marginRight: '8px',
              borderRadius: '2px',
            }}
          />
          <span>{WEEKDAY_LABELS[weekday]}</span>
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
