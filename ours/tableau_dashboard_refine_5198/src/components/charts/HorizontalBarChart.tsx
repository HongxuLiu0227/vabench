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
  full_text?: string;
}

interface HorizontalBarChartProps {
  data: BarData[];
  width: number;
  height: number;
  title?: string;
  colorBy?: 'label' | 'flag';
  highlight?: HighlightState;
  onBarClick?: (category: string, data: BarData) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
  truncateLabel?: number;
}

export function HorizontalBarChart({
  data,
  width,
  height,
  title,
  colorBy = 'label',
  highlight,
  onBarClick,
  margin = { top: 40, right: 20, bottom: 40, left: 120 },
  truncateLabel = 100
}: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([0, innerWidth]);
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    return d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.1);
  }, [data, innerHeight]);

  // Truncate long labels
  const truncateText = useCallback((text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
  }, []);

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

    // Check various highlight conditions
    if (highlight.name && d.category !== highlight.name) return true;
    if (highlight.label && d.label !== highlight.label) return true;
    if (highlight.flag && d.flag !== highlight.flag) return true;
    if (highlight.full_text && d.full_text !== highlight.full_text) return true;

    return false;
  }, [highlight]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis
    const xAxis = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value), 0) * 1.1])
      .range([0, innerWidth]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xAxis).ticks(5))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '12px');

    // Y-axis
    g.append('g')
      .call(axisLeft(yScale))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '12px')
      .text(d => truncateText(String(d), truncateLabel));

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.category) || 0)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => getBarColor(d))
      .attr('opacity', d => isDimmed(d) ? 0.2 : 0.9)
      .style('cursor', onBarClick ? 'pointer' : 'default')
      .on('click', (event, d) => {
        if (onBarClick) {
          onBarClick(d.category, d);
        }
      });

    // Bar value labels
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.value) + 5)
      .attr('y', d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text(d => d.value.toLocaleString());

  }, [data, xScale, yScale, innerWidth, innerHeight, margin, highlight, truncateLabel, colorBy, onBarClick, getBarColor, isDimmed, truncateText]);

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
