import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlySales } from '../types';

interface P1225TotalSalesEachYearProps {
  data: YearlySales[];
  width?: number;
  height?: number;
}

const P1225TotalSalesEachYear: React.FC<P1225TotalSalesEachYearProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const margin = { top: 20, right: 30, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([data[0].Year, data[data.length - 1].Year])
      .range([0, innerWidth]);

    const maxSales = Math.max(...data.map((d) => d.Sales));
    const yScale = d3.scaleLinear()
      .domain([0, maxSales * 1.1])
      .range([innerHeight, 0]);

    // Color scale based on Sales
    const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, maxSales]);

    // Create gradient for the line
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'year-line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(maxSales))
      .attr('x2', 0)
      .attr('y2', yScale(0));

    // Add gradient stops
    data.forEach((d, i) => {
      gradient.append('stop').attr('offset', `${(i / (data.length - 1)) * 100}%`).attr('stop-color', colorScale(d.Sales));
    });

    // Create main group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Create line generator
    const lineGenerator = d3.line<YearlySales>()
      .x((d) => xScale(d.Year))
      .y((d) => yScale(d.Sales))
      .curve(d3.curveMonotoneX);

    // Draw the line
    const path = g.append('path').datum(data).attr('fill', 'none').attr('stroke', 'url(#year-line-gradient)').attr('stroke-width', 2).attr('d', lineGenerator);

    // Animate the line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (path as any).attr('stroke-dasharray', `0,${path.node()!.getTotalLength()}`)
      .transition()
      .duration(1500)
      .attr('stroke-dasharray', `${path.node()!.getTotalLength()},0`);

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => d.toString());
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis).style('font-size', '11px');

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `$${(d as number).toLocaleString()}`);
    g.append('g').call(yAxis).style('font-size', '11px');

    // Add invisible rectangles for hover detection
    g.selectAll('.hover-rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'hover-rect')
      .attr('x', (d) => xScale(d.Year) - innerWidth / data.length / 2)
      .attr('y', 0)
      .attr('width', innerWidth / data.length)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <div style="font-weight: bold; margin-bottom: 4px;">Year: ${d.Year}</div>
            <div>Sales: $${d.Sales.toLocaleString()}</div>
          `,
        });

        // Highlight point
        g.selectAll('.data-point').style('opacity', 0.3);
        g.select(`#point-${data.indexOf(d)}`).style('opacity', 1).attr('r', 6);
      })
      .on('mouseout', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        g.selectAll('.data-point').style('opacity', 0.8).attr('r', 4);
      });

    // Add data points
    g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('id', (_d, i) => `point-${i}`)
      .attr('cx', (d) => xScale(d.Year))
      .attr('cy', (d) => yScale(d.Sales))
      .attr('r', 4)
      .attr('fill', (d) => colorScale(d.Sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .style('opacity', 0.8);

    // Add labels on points
    g.selectAll('.data-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'data-label')
      .attr('x', (d) => xScale(d.Year))
      .attr('y', (d) => yScale(d.Sales) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => `$${(d.Sales / 1000).toFixed(1)}K`);
  }, [data, innerWidth, innerHeight, margin.left, margin.top]);

  return (
    <div style={{ position: 'relative' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        Total Sales Each Year
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default P1225TotalSalesEachYear;
