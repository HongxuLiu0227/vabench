import React, { useEffect, useRef, useState } from 'react';
import { line } from 'd3-shape';
import * as d3 from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { select } from 'd3-selection';

interface MeanDataPoint {
  measureName: string;
  value: number;
}

interface MeanLineChartProps {
  data: MeanDataPoint[];
  width?: number;
  height?: number;
}

const MeanLineChart: React.FC<MeanLineChartProps> = ({
  data,
  width = 500,
  height = 350
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
          height: Math.max(300, containerWidth * 0.6)
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const ageColumns = [
      'Year Born',
      '1 Years Old',
      '2 Years Old',
      '3 Years Old',
      '4 Years Old',
      '5 Years Old',
      '6 Years Old',
      '7 Years Old',
      '8 Years Old',
      '9 Years Old',
      '10 Years Old',
      '11 Years Old',
      '12 Years Old',
      '13 Years Old'
    ];

    const x = d3Scale
      .scalePoint()
      .domain(ageColumns)
      .range([0, chartWidth])
      .padding(0.5);

    const y = d3Scale.scaleLinear().domain([0, 1]).range([chartHeight, 0]).nice();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
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
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '10px')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-45)')
      .attr('dy', '0.5em')
      .attr('dx', '-0.5em');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '11px');

    // Y axis title
    g.append('text')
      .attr('class', 'y-axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -chartHeight / 2)
      .attr('dy', '1em')
      .text('Recognizability')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .style('text-anchor', 'middle');

    const lineGenerator = line<MeanDataPoint>()
      .x((d) => x(d.measureName) || 0)
      .y((d) => y(d.value))
      .defined((d) => !isNaN(d.value));

    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    // Draw dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.measureName) || 0)
      .attr('cy', (d) => y(d.value))
      .attr('r', 4)
      .attr('fill', '#4e79a7')
      .attr('opacity', 0.9)
      .on('mouseover', function () {
        select(this).attr('r', 6).attr('opacity', 1);
      })
      .on('mouseout', function () {
        select(this).attr('r', 4).attr('opacity', 0.9);
      });

    // Add value labels on hover
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => x(d.measureName) || 0)
      .attr('y', (d) => y(d.value) - 10)
      .text((d) => d.value.toFixed(2))
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    // Show/hide value labels on dot hover
    g.selectAll('.dot')
      .on('mouseover', function (_event, d) {
        select(this).attr('r', 6).attr('opacity', 1);
        g.selectAll<SVGTextElement, MeanDataPoint>('.value-label')
          .filter((labelData) => labelData.measureName === (d as MeanDataPoint).measureName)
          .attr('opacity', 1);
      })
      .on('mouseout', function () {
        select(this).attr('r', 4).attr('opacity', 0.9);
        g.selectAll('.value-label').attr('opacity', 0);
      });
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

export default MeanLineChart;
