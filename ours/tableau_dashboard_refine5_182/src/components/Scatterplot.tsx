import { useEffect, useRef, useState, type RefObject } from 'react';
import * as d3 from 'd3';
import type { ProductAggregation } from '../services/types';
import { useContainerSize } from '../hooks/useContainerSize';

interface ScatterplotProps {
  data: ProductAggregation[];
  containerRef: RefObject<HTMLDivElement | null>;
}

export function Scatterplot({ data, containerRef }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const { width, height } = useContainerSize(containerRef);

  // Use default dimensions if container is not measured yet
  const effectiveWidth = width > 0 ? width : 400;
  const effectiveHeight = height > 0 ? height : 400;

  useEffect(() => {
    if (!svgRef.current || !data.length || effectiveWidth === 0 || effectiveHeight === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = effectiveWidth - margin.left - margin.right;
    const innerHeight = effectiveHeight - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .interpolator(d3.interpolateBlues);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const content = `
          <strong>${d.productName}</strong><br/>
          Sales: $${d.sales.toFixed(2)}<br/>
          Profit: $${d.profit.toFixed(2)}<br/>
          Quantity: ${d.quantity}
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
      <svg
        ref={svgRef}
        width={effectiveWidth}
        height={effectiveHeight}
        style={{ display: 'block' }}
        role="img"
        aria-label="Scatterplot showing Sales vs Profit with Quantity as bubble size"
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
