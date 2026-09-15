import { useEffect, useRef } from 'react';
import { select, line, curveMonotoneX } from 'd3';
import { scaleLinear, scalePoint } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';

interface LineChartProps {
  data: Array<{ x: string | number; y: number }>;
  width: number;
  height: number;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  lineColor?: string;
  xLabel?: string;
  yLabel?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  title,
  margin = { top: 40, right: 30, bottom: 50, left: 80 },
  lineColor = '#4e79a7',
  xLabel = '',
  yLabel = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const maxY = Math.max(...data.map((d) => d.y)) * 1.1;

    const xScale = scalePoint()
      .domain(data.map((d) => d.x.toString()))
      .range([0, innerWidth])
      .padding(0.5);

    const yScale = scaleLinear()
      .domain([0, maxY])
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .tickFormat((d) => d.toString())
          .ticks(data.length)
      )
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(
        axisLeft(yScale).tickFormat((d) => {
          const value = d as number;
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
          }
          return `$${value.toFixed(0)}`;
        })
      )
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add axis labels
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(xLabel);
    }

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(yLabel);
    }

    // Create line generator
    const lineGenerator = line<{ x: string | number; y: number }>()
      .x((d) => xScale(d.x.toString()) || 0)
      .y((d) => yScale(d.y))
      .curve(curveMonotoneX);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add data points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.x.toString()) || 0)
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', lineColor)
      .on('mouseover', function(_event, d) {
        select(this).attr('r', 6);
        // Add tooltip
        const tooltip = g
          .append('g')
          .attr('class', 'tooltip');

        tooltip
          .append('rect')
          .attr('x', xScale(d.x.toString())! - 50)
          .attr('y', yScale(d.y) - 35)
          .attr('width', 100)
          .attr('height', 25)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        tooltip
          .append('text')
          .attr('x', xScale(d.x.toString())!)
          .attr('y', yScale(d.y) - 18)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#333')
          .text(`$${d.y.toLocaleString()}`);
      })
      .on('mouseout', function() {
        select(this).attr('r', 4);
        g.selectAll('.tooltip').remove();
      });

    // Add title if provided
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(title);
    }
  }, [data, width, height, margin, lineColor, title, xLabel, yLabel]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
