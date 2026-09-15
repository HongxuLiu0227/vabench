import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BarChartData } from '../../types/dashboard';

interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
}

export function BarChart({ data, width = 400, height = 400 }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parentWidth = svgRef.current.parentElement.clientWidth;
        setDimensions({
          width: parentWidth,
          height: Math.max(400, parentWidth),
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

    const margin = { top: 20, right: 80, bottom: 20, left: 150 };
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

    // Y scale (Category/Sub-Category)
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.1);

    // Custom blue-teal color scale
    const maxSales = d3.max(data, (d) => d.sales) || 1;
    const blueTealScale = (sales: number) => {
      const ratio = sales / maxSales;
      // Interpolate between light blue and teal
      const r = Math.floor(100 + ratio * 0);
      const g = Math.floor(149 + ratio * 31);
      const b = Math.floor(237 - ratio * 50);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(',.0f')).ticks(5))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif')
      .attr('text-anchor', 'end');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', (d) => blueTealScale(d.sales))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);

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
            `<strong>${d.category}</strong><br/>` +
              `Sub-Category: ${d.subCategory}<br/>` +
              `Sales: ${d3.format(',.2f')(d.sales)}`
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
          .attr('opacity', 1);

        d3.selectAll('.tooltip').remove();
      })
      .transition()
      .delay((_, i) => Math.min(i * 20, 500))
      .duration(500)
      .attr('width', (d) => xScale(d.sales));

    // Add value labels
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', (d) => (yScale(`${d.category} - ${d.subCategory}`) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.sales) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '9px')
      .style('font-family', 'sans-serif')
      .style('opacity', 0)
      .text((d) => d3.format(',.0f')(d.sales))
      .transition()
      .delay((_, i) => Math.min(i * 20 + 500, 1000))
      .duration(500)
      .style('opacity', 1);
  }, [data, dimensions]);

  return (
    <div className="worksheet" style={{ width: '100%', height: '100%' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
        Bar
      </h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
