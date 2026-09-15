import { useEffect, useRef, useState, type RefObject } from 'react';
import * as d3 from 'd3';
import type { MonthlySales } from '../services/types';
import { useContainerSize } from '../hooks/useContainerSize';

interface LineChartProps {
  data: MonthlySales[];
  containerRef: RefObject<HTMLDivElement | null>;
  title?: string;
}

export function LineChart({ data, containerRef, title }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const { width, height } = useContainerSize(containerRef);

  const effectiveWidth = width > 0 ? width : 400;
  const effectiveHeight = height > 0 ? height : 400;

  useEffect(() => {
    if (!svgRef.current || !data.length || effectiveWidth === 0 || effectiveHeight === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const innerWidth = effectiveWidth - margin.left - margin.right;
    const innerHeight = effectiveHeight - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.month) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    const line = d3
      .line<MonthlySales>()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .interpolator(d3.interpolateWarm);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(effectiveWidth / 80).tickSizeOuter(0))
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(10))
      .selectAll('text')
      .style('font-size', '11px');

    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colorScale(d3.max(data, (d) => d.sales) || 0))
      .attr('stroke-width', 2)
      .attr('d', line);

    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.month))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const dateStr = d.month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const content = `
          <strong>${dateStr}</strong><br/>
          Sales: $${d.sales.toFixed(2)}
        `;
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });
  }, [data, effectiveWidth, effectiveHeight]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {title && (
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {title}
        </h3>
      )}
      <svg
        ref={svgRef}
        width={effectiveWidth}
        height={effectiveHeight}
        style={{ display: 'block' }}
        role="img"
        aria-label="Line chart showing Sales over time"
      />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
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
}
