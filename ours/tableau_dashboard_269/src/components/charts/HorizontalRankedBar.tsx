import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../types';
import { createProfitColorScale, formatCompactNumber, calculateDynamicLabels } from '../../utils/chartUtils';

interface HorizontalRankedBarProps {
  data: AggregatedData[];
  title?: string;
  width?: number;
  height?: number;
  categoryField: 'state' | 'subCategory' | 'customerName';
  onBarClick?: (category: string) => void;
}

export const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = ({
  data,
  title,
  width = 400,
  height = 300,
  categoryField,
  onBarClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        setDimensions({ width: newWidth, height: newHeight });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const labels = data.map(d =>
      categoryField === 'state' ? d.state || '' :
      categoryField === 'subCategory' ? d.subCategory || '' :
      d.customerName || ''
    );
    const margin = calculateDynamicLabels(labels, 11);
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(labels)
      .range([0, chartHeight])
      .padding(0.2);

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.sales)) * 1.1])
      .range([0, chartWidth]);

    const profitValues = data.map(d => d.profit);
    const colorScale = createProfitColorScale(profitValues);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => formatCompactNumber(d as number));
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .style('font-size', '11px');

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(
        categoryField === 'state' ? d.state || '' :
        categoryField === 'subCategory' ? d.subCategory || '' :
        d.customerName || ''
      ) || 0)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.profit))
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onBarClick) {
          const key = categoryField === 'state' ? d.state :
                      categoryField === 'subCategory' ? `${d.category}|${d.subCategory}` :
                      d.customerName;
          if (key) onBarClick(key);
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8);
      });

    bars.transition()
      .duration(750)
      .attr('width', d => xScale(d.sales));

    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.sales) + 5)
      .attr('y', d => (yScale(
        categoryField === 'state' ? d.state || '' :
        categoryField === 'subCategory' ? d.subCategory || '' :
        d.customerName || ''
      ) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => formatCompactNumber(d.sales));

  }, [data, dimensions, categoryField, onBarClick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#666',
          marginBottom: '10px',
          fontFamily: 'Tableau Book, Arial, sans-serif',
        }}>
          {title}
        </h3>
      )}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};
