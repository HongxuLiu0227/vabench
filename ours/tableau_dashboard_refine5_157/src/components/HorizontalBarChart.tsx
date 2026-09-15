import { useEffect, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from 'd3';
import { axisBottom, axisLeft } from 'd3';
import { select } from 'd3';
import type { CategoryDataPoint } from '../types';

interface HorizontalBarChartProps {
  data: CategoryDataPoint[];
  title: string;
  width?: number;
  height?: number;
}

export function HorizontalBarChart({ data, title, width = 400, height = 300 }: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; category: string; subCategory: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create labels for hierarchy (Category / Sub-Category)
    const labels = data.map(d => `${d.category} - ${d.subCategory}`);

    // Create scales
    const xScale = scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value)) * 1.1])
      .range([0, chartWidth]);

    const yScale = scaleBand()
      .domain(labels)
      .range([0, chartHeight])
      .padding(0.15);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(axisBottom(xScale).tickFormat((d) => `$${(d as number).toLocaleString()}`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    // Add Y axis
    svg.append('g')
      .call(axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('text-anchor', 'end');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d as number))
      .attr('x2', (d) => xScale(d as number))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Create color scale by category
    const categories = Array.from(new Set(data.map(d => d.category)));
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
    const getColor = (category: string) => {
      const index = categories.indexOf(category);
      return colors[Math.min(index, colors.length - 1)];
    };

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d: CategoryDataPoint) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('width', (d: CategoryDataPoint) => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d: CategoryDataPoint) => getColor(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: CategoryDataPoint) => {
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          value: d.value,
          category: d.category,
          subCategory: d.subCategory || '',
        });
      })
      .on('mouseleave', () => {
        setTooltip(null);
      });

    // Add value labels on bars
    svg.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: CategoryDataPoint) => xScale(d.value) + 5)
      .attr('y', (d: CategoryDataPoint) => (yScale(`${d.category} - ${d.subCategory}`) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '10px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', '#333')
      .text((d: CategoryDataPoint) => `$${d.value.toLocaleString()}`);

  }, [data, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {title}
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tooltip.category}</div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>{tooltip.subCategory}</div>
          <div>Sales: ${tooltip.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      )}
    </div>
  );
}
