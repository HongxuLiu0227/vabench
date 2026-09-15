import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesData } from '../types';
import { aggregateByCategoryAndSubCategory } from '../services/dataService';

interface P121BarProps {
  data: SalesData[];
  width: number;
  height: number;
}

export function P121Bar({ data, width, height }: P121BarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const aggregatedData = aggregateByCategoryAndSubCategory(data);

    // Calculate dynamic left margin based on longest label
    const maxLabelLength = d3.max(aggregatedData, d => `${d.category} - ${d.subCategory}`.length) || 0;
    const dynamicLeftMargin = Math.max(120, maxLabelLength * 6 + 20); // ~6px per character + padding

    const margin = { top: 20, right: 20, bottom: 20, left: dynamicLeftMargin };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregatedData, (d) => d.sales) || 0])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleBand()
      .domain(aggregatedData.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, chartHeight])
      .padding(0.1);

    // Color scale based on sales
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(aggregatedData, (d) => d.sales) || 0])
      .interpolator(d3.interpolateBlues);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
      const value = d as number;
      return `$${(value / 1000).toFixed(0)}K`;
    });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif')
      .style('text-anchor', 'end')
      .each(function() {
        const text = d3.select(this);
        const fullText = text.text();
        // Only truncate if text is very long (> 50 chars)
        if (fullText.length > 50) {
          const truncated = fullText.substring(0, 47) + '...';
          text.text(truncated);
          // Add title attribute for full text on hover
          text.append('title').text(fullText);
        }
      });

    // Create bars
    g.selectAll('.bar')
      .data(aggregatedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.category} - ${d.subCategory}<br/>Sales: $${d.sales.toLocaleString()}`,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        setTooltip(null);
      })
      .transition()
      .duration(500)
      .attr('width', (d) => xScale(d.sales));

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .text('Bar');
  }, [data, width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
