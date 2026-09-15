import { useEffect, useRef, useState, useMemo } from 'react';
import { select, pointer } from 'd3-selection';
import { max } from 'd3-array';
import { scaleLinear, scaleBand, scaleSequential } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { interpolateBlues } from 'd3-scale-chromatic';
import type { YearlySalesData } from '../types';

interface LineChartProps {
  data: YearlySalesData[];
  width: number;
  height: number;
}

export function LineChart({ data, width, height }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });

  const margin = useMemo(() => ({ top: 20, right: 30, bottom: 50, left: 70 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = scaleBand()
      .domain(data.map((d) => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    const colorScale = scaleSequential((t) => interpolateBlues(t * 0.7 + 0.3))
      .domain([0, max(data, (d) => d.sales) || 0]);

    // Add axes
    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `$${Number(d) / 1000}k`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.year.toString()) || 0)
      .attr('y', (d) => yScale(d.sales))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.sales))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = pointer(event, svg.node()!);
        setTooltip({
          visible: true,
          x: x + margin.left + 10,
          y: y + margin.top + 10,
          content: (
            <div style={{ padding: '8px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Year: {d.year}</div>
              <div>Sales: ${d.sales.toFixed(2)}</div>
            </div>
          ),
        });
      })
      .on('mousemove', (event) => {
        const [x, y] = pointer(event, svg.node()!);
        setTooltip((prev) => ({
          ...prev,
          x: x + margin.left + 10,
          y: y + margin.top + 10,
        }));
      })
      .on('mouseout', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Add value labels on top of bars
    g.selectAll('text.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.sales) - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => `$${(d.sales / 1000).toFixed(1)}k`);
  }, [data, width, height, innerWidth, innerHeight, margin]);

  return (
    <div style={{ position: 'relative' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Total Sales Each Year</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #e0e0e0' }} />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
