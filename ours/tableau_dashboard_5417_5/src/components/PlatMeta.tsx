import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MetascoreByMonth } from '../types';

interface PlatMetaProps {
  data: MetascoreByMonth[];
  onGameSelect?: (game: string | null) => void;
}

export function PlatMeta({ data, onGameSelect }: PlatMetaProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 984;
    const height = 468;
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d: MetascoreByMonth) => d.month) as [Date, Date])
      .range([0, innerWidth]);

    // Y scale (metascore)
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Line generator
    const line = d3
      .line<MetascoreByMonth>()
      .x((d: MetascoreByMonth) => xScale(d.month))
      .y((d: MetascoreByMonth) => yScale(d.avgMetascore))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0))
      .attr('color', '#666');

    // Add Y axis
    svg.append('g').call(d3.axisLeft(yScale).ticks(10)).attr('color', '#666');

    // Add axis titles
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('fill', '#666')
      .attr('font-size', '12px')
      .text('Month of release');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('fill', '#666')
      .attr('font-size', '12px')
      .text('Average Metascore');

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Add the line
    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
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

    // Add dots
    const dots = svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: MetascoreByMonth) => xScale(d.month))
      .attr('cy', (d: MetascoreByMonth) => yScale(d.avgMetascore))
      .attr('r', 4)
      .attr('fill', '#4e79a7')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.8);

    // Add hover effects
    dots
      .on('mouseenter', function (event: MouseEvent, d: MetascoreByMonth) {
        d3.select(this as unknown as d3.BaseType).attr('r', 6).attr('stroke-width', 2).style('opacity', 1);

        // Create tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', '#fff')
          .style('padding', '8px 12px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000');

        const dateStr = d.month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        tooltip
          .html(`<strong>${dateStr}</strong><br/>Avg Metascore: ${d.avgMetascore.toFixed(1)}<br/>Games: ${d.count}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mousemove', function (event: MouseEvent) {
        d3.select('.tooltip')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseleave', function () {
        d3.select(this as unknown as d3.BaseType).attr('r', 4).attr('stroke-width', 1).style('opacity', 0.8);
        d3.select('.tooltip').remove();
      })
      .on('click', () => {
        // Click to filter - in Tableau this would filter to games in that month
        // For now, we'll just clear the selection
        if (onGameSelect) {
          onGameSelect(null);
        }
      });

    // Cleanup function - capture current ref value
    const svgCurrent = svgRef.current;
    return () => {
      if (svgCurrent) {
        d3.select(svgCurrent).selectAll('*').remove();
      }
      d3.selectAll('.tooltip').remove();
    };
  }, [data, onGameSelect]);

  return (
    <div className="plat-meta-container">
      <h3
        style={{
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
        }}
      >
        Platforms
      </h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}
