import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlySalesData } from '../../types/dashboard';

interface TotalSalesEachYearProps {
  data: YearlySalesData[];
  width?: number;
  height?: number;
}

export function TotalSalesEachYear({ data, width = 400, height = 300 }: TotalSalesEachYearProps) {
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

    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (years)
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, innerWidth])
      .nice();

    // Y scale (sales)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const maxSales = d3.max(data, (d) => d.sales) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(d3.interpolateBlues);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format(',.0f')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif');

    // Line generator
    const line = d3
      .line<{ year: number; sales: number }>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add line path
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4477AA')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add data points
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr('r', 5);

    // Add tooltips
    g.selectAll('circle')
      .on('mouseover', function (event, d) {
        const datum = d as YearlySalesData;
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);

        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('font-family', 'sans-serif')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .html(`<strong>${datum.year}</strong><br/>Sales: ${d3.format(',.2f')(datum.sales)}`);

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
          .attr('r', 5);

        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on points
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.year))
      .attr('y', (d) => yScale(d.sales) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .style('opacity', 0)
      .text((d) => d3.format(',.0f')(d.sales))
      .transition()
      .delay((_, i) => i * 100 + 500)
      .duration(500)
      .style('opacity', 1);
  }, [data, dimensions]);

  return (
    <div className="worksheet" style={{ width: '100%', height: '100%' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
        Total Sales Each Year
      </h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
