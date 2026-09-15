import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterplotData } from '../../types/dashboard';

interface ScatterplotProps {
  data: ScatterplotData[];
  width?: number;
  height?: number;
}

export function Scatterplot({ data, width = 400, height = 300 }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parentWidth = svgRef.current.parentElement.clientWidth;
        setDimensions({
          width: parentWidth,
          height: Math.max(300, parentWidth * 0.75),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    // Y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.profit) || 0,
        d3.max(data, (d) => d.profit) || 0,
      ])
      .range([innerHeight, 0])
      .nice();

    // Size scale (Quantity)
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    // Color scale (Sales)
    const maxSales = d3.max(data, (d) => d.sales) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(d3.interpolateBlues);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(',.0f')))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format(',.0f')))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '11px')
          .style('font-family', 'sans-serif')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .html(
            `<strong>${d.productName}</strong><br/>` +
              `Sales: ${d3.format(',.2f')(d.sales)}<br/>` +
              `Profit: ${d3.format(',.2f')(d.profit)}<br/>` +
              `Quantity: ${d3.format(',.0f')(d.quantity)}`
          );

        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px')
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.7)
          .attr('stroke-width', 1);

        d3.selectAll('.tooltip').remove();
      })
      .transition()
      .delay((_, i) => Math.min(i * 10, 500))
      .duration(500)
      .attr('r', (d) => sizeScale(d.quantity));
  }, [data, dimensions]);

  return (
    <div className="worksheet" style={{ width: '100%', height: '100%' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
        Scatterplot
      </h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
