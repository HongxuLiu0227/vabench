import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BarChartData, WorksheetProps } from '../../types';

interface RankedBarChartProps extends Omit<WorksheetProps, 'data'> {
  data: BarChartData[];
  orientation: 'horizontal' | 'vertical';
  xAxisTitle?: string;
  yAxisTitle?: string;
  showAxisLabels?: boolean;
  onBarClick?: (label: string) => void;
  selectedLabel?: string | null;
}

const RankedBarChart: React.FC<RankedBarChartProps> = ({
  data,
  width,
  height,
  title,
  orientation,
  xAxisTitle,
  yAxisTitle,
  showAxisLabels = true,
  onBarClick,
  selectedLabel,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = orientation === 'horizontal'
      ? { top: 20, right: 100, bottom: 60, left: 150 }
      : { top: 40, right: 20, bottom: 80, left: 60 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const maxValue = d3.max(data, d => d.value) || 0;

    // Add bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .style('cursor', onBarClick ? 'pointer' : 'default');

    if (orientation === 'horizontal') {
      // Horizontal orientation
      const xScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([0, innerWidth]);

      const yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.2);

      bars.append('rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.label) || 0)
        .attr('width', d => xScale(d.value))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => {
          const isSelected = selectedLabel && selectedLabel !== d.label;
          const isDimmed = hoveredBar && hoveredBar !== d.label;
          return isSelected || isDimmed ? '#ccc' : d.color;
        })
        .attr('stroke', d => d.label === hoveredBar ? '#000' : 'none')
        .attr('stroke-width', d => d.label === hoveredBar ? 2 : 0)
        .style('opacity', d => {
          if (selectedLabel && selectedLabel !== d.label) return 0.3;
          return 1;
        })
        .on('mouseover', (event, d) => {
          setHoveredBar(d.label);
          const rect = (event.target as SVGRectElement).getBoundingClientRect();
          setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            content: `${d.label}: ${(d.value * 100).toFixed(1)}%`,
          });
        })
        .on('mouseout', () => {
          setHoveredBar(null);
          setTooltip(null);
        })
        .on('click', (_event, d) => {
          if (onBarClick) {
            onBarClick(d.label);
          }
        });

      // Add value labels
      bars.append('text')
        .attr('x', d => xScale(d.value) + 5)
        .attr('y', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text(d => `${(d.value * 100).toFixed(1)}%`)
        .attr('fill', '#333')
        .style('font-size', '12px')
        .style('opacity', d => {
          if (selectedLabel && selectedLabel !== d.label) return 0.3;
          return 1;
        });

      // Y axis
      if (showAxisLabels) {
        const yAxis = d3.axisLeft(yScale);
        g.append('g')
          .attr('class', 'y-axis')
          .call(yAxis)
          .selectAll('text')
          .style('font-size', '11px')
          .style('text-anchor', 'end');
      }

      // X axis
      if (showAxisLabels) {
        const xAxis = d3.axisBottom(xScale)
          .tickFormat(d => `${(d as number * 100).toFixed(0)}%`);
        g.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis);
      }

      // X axis title
      if (xAxisTitle) {
        g.append('text')
          .attr('class', 'x-axis-title')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + 50)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .text(xAxisTitle);
      }

    } else {
      // Vertical orientation
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([innerHeight, 0]);

      bars.append('rect')
        .attr('x', d => xScale(d.label) || 0)
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => {
          const isSelected = selectedLabel && selectedLabel !== d.label;
          const isDimmed = hoveredBar && hoveredBar !== d.label;
          return isSelected || isDimmed ? '#ccc' : d.color;
        })
        .attr('stroke', d => d.label === hoveredBar ? '#000' : 'none')
        .attr('stroke-width', d => d.label === hoveredBar ? 2 : 0)
        .style('opacity', d => {
          if (selectedLabel && selectedLabel !== d.label) return 0.3;
          return 1;
        })
        .on('mouseover', (event, d) => {
          setHoveredBar(d.label);
          const rect = (event.target as SVGRectElement).getBoundingClientRect();
          setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            content: `${d.label}: ${(d.value * 100).toFixed(1)}%`,
          });
        })
        .on('mouseout', () => {
          setHoveredBar(null);
          setTooltip(null);
        })
        .on('click', (_event, d) => {
          if (onBarClick) {
            onBarClick(d.label);
          }
        });

      // Add value labels
      bars.append('text')
        .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .text(d => `${(d.value * 100).toFixed(1)}%`)
        .attr('fill', '#333')
        .style('font-size', '12px')
        .style('opacity', d => {
          if (selectedLabel && selectedLabel !== d.label) return 0.3;
          return 1;
        });

      // X axis
      if (showAxisLabels) {
        const xAxis = d3.axisBottom(xScale);
        g.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis)
          .selectAll('text')
          .style('font-size', '11px')
          .style('text-anchor', 'end')
          .attr('transform', 'rotate(-45)')
          .attr('dx', '-.8em')
          .attr('dy', '.15em');
      }

      // Y axis
      if (showAxisLabels) {
        const yAxis = d3.axisLeft(yScale)
          .tickFormat(d => `${(d as number * 100).toFixed(0)}%`);
        g.append('g')
          .attr('class', 'y-axis')
          .call(yAxis);
      }

      // Y axis title
      if (yAxisTitle) {
        g.append('text')
          .attr('class', 'y-axis-title')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
          .attr('y', -45)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .text(yAxisTitle);
      }
    }

    // Title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

  }, [data, width, height, orientation, xAxisTitle, yAxisTitle, showAxisLabels, onBarClick, selectedLabel, hoveredBar, title]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default RankedBarChart;
