/**
 * InteractiveLineChart Component
 * Enhanced line chart with click-to-select and highlight interactions
 * Implements Tableau-style highlight behavior with auto-clear
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { timeFormat } from 'd3-time-format';

interface DataPoint {
  Date: Date;
  [key: string]: number | Date;
}

interface InteractiveLineChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  width?: number;
  height?: number;
  axisTitle?: string;
  worksheetName?: string;
  onSelectionChange?: (selectedPoint: DataPoint | null) => void;
  selectedDate?: Date | null;
}

const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  xKey,
  yKey,
  color = '#1f77b4',
  width = 500,
  height = 300,
  axisTitle = '',
  worksheetName = '',
  onSelectionChange,
  selectedDate,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [internalSelection, setInternalSelection] = useState<DataPoint | null>(null);

  // Use external selection state if provided, otherwise use internal state
  const effectiveSelection = selectedDate
    ? data.find(d => (d[xKey] as Date).getTime() === selectedDate.getTime()) || null
    : internalSelection;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Margin setup
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d[xKey] as Date) as [Date, Date])
      .range([0, innerWidth]);

    // Y scale (linear)
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[yKey] as number) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d[xKey] as Date))
      .y((d) => yScale(d[yKey] as number))
      .curve(d3.curveMonotoneX)
      .defined((d) => !isNaN(d[yKey] as number));

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom<Date>(xScale).ticks(5).tickFormat(timeFormat('%b %Y')))
      .attr('color', '#000')
      .selectAll('text')
      .style('font-family', 'Calibri')
      .style('font-size', '12px');

    // X axis label
    if (axisTitle) {
      g.append('text')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight + 40})`)
        .style('text-anchor', 'middle')
        .style('font-family', 'Calibri')
        .style('font-size', '14px')
        .style('fill', '#000')
        .text(axisTitle);
    }

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#000')
      .selectAll('text')
      .style('font-family', 'Calibri')
      .style('font-size', '12px');

    // Add horizontal gridlines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .style('stroke', '#ccc')
      .style('stroke-width', '0.5px')
      .style('stroke-dasharray', '3,3')
      .lower();

    // Add the line path
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', effectiveSelection ? '1' : '2')
      .attr('stroke-opacity', effectiveSelection ? '0.3' : '1')
      .attr('d', line);

    // Animate the line drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Highlight selected point if exists
    if (effectiveSelection) {
      const xPos = xScale(effectiveSelection[xKey] as Date);
      const yPos = yScale(effectiveSelection[yKey] as number);

      // Add highlighted circle
      g.append('circle')
        .attr('class', 'selected-point')
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('r', 6)
        .style('fill', color)
        .style('stroke', '#fff')
        .style('stroke-width', '3px')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

      // Add vertical line indicator
      g.append('line')
        .attr('class', 'selected-line')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .style('stroke', '#666')
        .style('stroke-width', '1.5px')
        .style('stroke-dasharray', '4,4');
    }

    // Add invisible overlay for hover interactions
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);

        // Find closest data point
        const bisect = d3.bisector((d: DataPoint) => d[xKey] as Date).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0.getTime() - (d0?.[xKey] as Date).getTime() > (d1?.[xKey] as Date).getTime() - x0.getTime() ? d1 : d0;

        if (d) {
          const xPos = xScale(d[xKey] as Date);
          const yPos = yScale(d[yKey] as number);

          // Update tooltip
          const formatDate = timeFormat('%b %d, %Y');
          const yValue = d[yKey];
          const displayValue = typeof yValue === 'number' ? yValue.toFixed(2) : 'N/A';
          setTooltip({
            x: xPos + margin.left + 10,
            y: yPos + margin.top,
            content: `${formatDate(d[xKey] as Date)}<br/><strong>${yKey}:</strong> ${displayValue}`,
          });
        }
      })
      .on('mouseleave', () => {
        setTooltip(null);
      })
      .on('click', (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);

        // Find closest data point
        const bisect = d3.bisector((d: DataPoint) => d[xKey] as Date).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const selected = x0.getTime() - (d0?.[xKey] as Date).getTime() > (d1?.[xKey] as Date).getTime() - x0.getTime() ? d1 : d0;

        if (selected) {
          // Toggle selection: if clicking same point, clear selection
          if (effectiveSelection && (effectiveSelection[xKey] as Date).getTime() === (selected[xKey] as Date).getTime()) {
            if (onSelectionChange) {
              onSelectionChange(null);
            } else {
              setInternalSelection(null);
            }
          } else {
            if (onSelectionChange) {
              onSelectionChange(selected);
            } else {
              setInternalSelection(selected);
            }
          }
        }
      });

  }, [data, xKey, yKey, color, width, height, axisTitle, effectiveSelection, onSelectionChange]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
        role="img"
        aria-label={`${worksheetName || 'Line chart'} showing ${yKey} over time`}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'Calibri',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default InteractiveLineChart;
