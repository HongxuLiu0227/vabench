import { useEffect, useRef, useState, useMemo } from 'react';
import { select, pointer } from 'd3-selection';
import { max, min } from 'd3-array';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { interpolateBlues } from 'd3-scale-chromatic';
import type { ScatterplotData } from '../types';

interface ScatterplotProps {
  data: ScatterplotData[];
  width: number;
  height: number;
}

export function Scatterplot({ data, width, height }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });

  const margin = useMemo(() => ({ top: 20, right: 20, bottom: 50, left: 60 }), []);
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
    const xScale = scaleLinear()
      .domain([0, max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = scaleLinear()
      .domain([min(data, (d) => d.profit) || 0, max(data, (d) => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = scaleLinear()
      .domain([0, max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = scaleSequential((t) => interpolateBlues(t * 0.7 + 0.3))
      .domain([0, max(data, (d) => d.sales) || 0]);

    // Add axes
    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

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

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = pointer(event, svg.node()!);
        setTooltip({
          visible: true,
          x: x + margin.left + 10,
          y: y + margin.top + 10,
          content: (
            <div style={{ padding: '8px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{d.productName}</div>
              <div>Sales: ${d.sales.toFixed(2)}</div>
              <div>Profit: ${d.profit.toFixed(2)}</div>
              <div>Quantity: {d.quantity}</div>
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
  }, [data, width, height, innerWidth, innerHeight, margin]);

  return (
    <div style={{ position: 'relative' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Scatterplot</h3>
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
