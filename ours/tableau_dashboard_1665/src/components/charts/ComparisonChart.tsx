import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { select } from 'd3-selection';
import type { ComparisonDataPoint } from '../../services/types';

interface ComparisonChartProps {
  data: ComparisonDataPoint[];
  width?: number;
  height?: number;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  width = 600,
  height = 200
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const updateDimensions = () => {
        const containerWidth = container.clientWidth;
        setDimensions({
          width: containerWidth,
          height: Math.max(180, containerWidth * 0.25)
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const margin = { top: 30, right: 50, bottom: 40, left: 200 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3Scale.scaleLinear().domain([0, 1]).range([0, chartWidth]).nice();

    const y = d3Scale
      .scaleBand()
      .domain(data.map((d) => d.measureName))
      .range([0, chartHeight])
      .padding(0.4);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
      )
      .attr('transform', `translate(0,${chartHeight})`)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke-opacity', 0.1)
          .attr('stroke-dasharray', '3,3')
      );

    // X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .attr('font-size', '11px');

    // X axis title
    g.append('text')
      .attr('class', 'x-axis-title')
      .attr('y', chartHeight + 35)
      .attr('x', chartWidth / 2)
      .text('Recognizability')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .style('text-anchor', 'middle');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '12px');

    // Calculate average for reference line
    const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    // Reference line (average)
    g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', x(avgValue))
      .attr('x2', x(avgValue))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#666')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);

    // Reference line label
    g.append('text')
      .attr('class', 'reference-label')
      .attr('x', x(avgValue))
      .attr('y', -10)
      .text(`Average: ${avgValue.toFixed(3)}`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Draw dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.value))
      .attr('cy', (d) => (y(d.measureName) || 0) + y.bandwidth() / 2)
      .attr('r', 8)
      .attr('fill', '#4e79a7')
      .attr('opacity', 0.8)
      .attr('cursor', 'pointer')
      .on('mouseover', function () {
        select(this).attr('r', 10).attr('opacity', 1);
      })
      .on('mouseout', function () {
        select(this).attr('r', 8).attr('opacity', 0.8);
      });

    // Value labels
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => x(d.value) + 15)
      .attr('y', (d) => (y(d.measureName) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text((d) => d.value.toFixed(3))
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .style('pointer-events', 'none');
  }, [data, chartWidth, chartHeight, margin.left, margin.top]);

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

export default ComparisonChart;
