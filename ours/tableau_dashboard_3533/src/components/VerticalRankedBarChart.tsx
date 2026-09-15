import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-selection';
import * as d3scale from 'd3-scale';
import * as d3array from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import type { AggregatedDataPoint } from '../types/cricket';
import { format } from 'd3-format';
import { transition } from 'd3-transition';

interface VerticalRankedBarChartProps {
  data: AggregatedDataPoint[];
  title?: string;
  axisTitle?: string;
  titleStyle?: React.CSSProperties;
  width?: number;
  height?: number;
  onBarClick?: (category: string) => void;
  highlightedCategory?: string | null;
  colorScale?: (category: string) => string;
}

export const VerticalRankedBarChart: React.FC<VerticalRankedBarChartProps> = ({
  data,
  title,
  axisTitle,
  titleStyle,
  width = 400,
  height = 300,
  onBarClick,
  highlightedCategory,
  colorScale,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Responsive resize
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth } = entry.contentRect;
        if (newWidth > 0) {
          setDimensions({
            width: newWidth,
            height: Math.max(300, newWidth * 0.6),
          });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: axisTitle ? 60 : 50, left: 120 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (linear)
    const maxValue = d3array.max(data, (d) => d.value) || 0;
    const xScale = d3scale
      .scaleLinear()
      .domain([0, maxValue * 1.05])
      .range([0, chartWidth]);

    // Y scale (band)
    const yScale = d3scale
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, chartHeight])
      .padding(0.15);

    // X axis
    const xAxis = axisBottom(xScale).ticks(5).tickFormat(format(',.0f'));
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis
    const yAxis = axisLeft(yScale);
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(d.category) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', (d) => {
        if (colorScale) {
          return colorScale(d.category);
        }
        // Default blue color with opacity based on highlight
        if (highlightedCategory && highlightedCategory !== d.category) {
          return '#a0cbe8';
        }
        return '#4e79a7';
      })
      .attr('opacity', (d) => {
        if (highlightedCategory && highlightedCategory !== d.category) {
          return 0.4;
        }
        return 1;
      })
      .attr('cursor', onBarClick ? 'pointer' : 'default')
      .style('transition', 'all 0.2s ease');

    // Animate bars
    bars
      .transition(transition().duration(800))
      .attr('width', (d: AggregatedDataPoint) => xScale(d.value));

    // Bar click handler
    if (onBarClick) {
      bars.on('click', (_event, d) => {
        onBarClick(d.category);
      });

      // Hover effects
      bars
        .on('mouseenter', function () {
          d3.select(this)
            .attr('opacity', 0.8)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        })
        .on('mouseleave', function () {
          const d = d3.select(this).data()[0] as AggregatedDataPoint;
          d3.select(this)
            .attr('opacity', highlightedCategory && highlightedCategory !== d.category ? 0.4 : 1)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
        });
    }

    // Bar labels (values on bars)
    if (chartWidth > 150) {
      g.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('y', (d) => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
        .attr('x', 5)
        .attr('dy', '0.35em')
        .text((d) => format(',.0f')(d.value))
        .style('font-size', '10px')
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .attr('opacity', 0)
        .transition(transition().delay(500).duration(500))
        .attr('opacity', 1);
    }

    // Title
    if (title) {
      svg
        .append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .text(title)
        .style('font-size', titleStyle?.fontSize || '12px')
        .style('font-weight', titleStyle?.fontWeight || 'normal')
        .style('font-style', titleStyle?.fontStyle || 'normal')
        .style('text-decoration', titleStyle?.textDecoration || 'none')
        .style('font-family', titleStyle?.fontFamily || 'sans-serif');
    }

    // Axis title
    if (axisTitle) {
      svg
        .append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height - 10)
        .attr('text-anchor', 'middle')
        .text(axisTitle)
        .style('font-size', '12px')
        .style('font-weight', 'normal');
    }
  }, [data, dimensions, highlightedCategory, onBarClick, colorScale, title, axisTitle, titleStyle]);

  return (
    <div style={{ width: '100%', height: 'auto' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};
