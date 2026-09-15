import { useRef, useEffect, useMemo, useCallback } from 'react';
import * as d3 from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import type { HighlightState } from '../../types';
import { LABEL_COLORS, FLAG_COLORS } from '../../types';

interface BarData {
  category: string;
  value: number;
  label?: string;
  flag?: string;
}

interface VerticalBarChartProps {
  data: BarData[];
  width: number;
  height: number;
  title?: string;
  colorBy?: 'label' | 'flag';
  highlight?: HighlightState;
  onBarClick?: (category: string, data: BarData) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
  rotateLabels?: boolean;
}

export function VerticalBarChart({
  data,
  width,
  height,
  title,
  colorBy = 'label',
  highlight,
  onBarClick,
  margin = { top: 40, right: 20, bottom: 60, left: 60 },
  rotateLabels = false
}: VerticalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = useMemo(() => {
    return d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.1);
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);
  }, [data, innerHeight]);

  // Get color for a bar
  const getBarColor = useCallback((d: BarData): string => {
    if (colorBy === 'label' && d.label) {
      return LABEL_COLORS[d.label] || '#cccccc';
    }
    if (colorBy === 'flag' && d.flag) {
      return FLAG_COLORS[d.flag] || '#cccccc';
    }
    return '#4e79a7';
  }, [colorBy]);

  // Check if bar is highlighted or dimmed
  const isDimmed = useCallback((d: BarData): boolean => {
    if (!highlight?.enabled) return false;

    if (highlight.label && d.label !== highlight.label) return true;
    if (highlight.flag && d.flag !== highlight.flag) return true;
    if (highlight.name && d.category !== highlight.name) return true;

    return false;
  }, [highlight]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '11px')
      .style('text-anchor', rotateLabels ? 'end' : 'middle')
      .attr('dx', rotateLabels ? '-.8em' : '0')
      .attr('dy', rotateLabels ? '.15em' : '.35em')
      .attr('transform', rotateLabels ? 'rotate(-45)' : '');

    // Y-axis
    g.append('g')
      .call(axisLeft(yScale).ticks(5))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '12px');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category) || 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => getBarColor(d))
      .attr('opacity', d => isDimmed(d) ? 0.2 : 0.9)
      .style('cursor', onBarClick ? 'pointer' : 'default')
      .on('click', (event, d) => {
        if (onBarClick) {
          onBarClick(d.category, d);
        }
      });

    // Bar value labels (only if there's room)
    if (data.length < 20) {
      g.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .style('font-size', '10px')
        .style('fill', '#333')
        .style('text-anchor', 'middle')
        .text(d => d.value.toLocaleString());
    }

  }, [data, xScale, yScale, innerWidth, innerHeight, margin, highlight, colorBy, onBarClick, rotateLabels, getBarColor, isDimmed]);

  if (!data.length) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {title}
        </h3>
      )}
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
