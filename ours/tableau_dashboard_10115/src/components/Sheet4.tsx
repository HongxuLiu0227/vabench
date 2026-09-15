import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GDPData } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet4Props {
  data: GDPData[];
  width?: number;
  height?: number;
}

const FIXED_COLOR = '#2c5985';

export function Sheet4({ data, width = 600, height = 400 }: Sheet4Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, updateFilter, clearFilters } = useFilters();
  const [hoveredData, setHoveredData] = useState<GDPData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 70, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.gdp_for_year) as [number, number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.suicides_no) || 0])
      .range([innerHeight, 0])
      .nice();

    // Add X axis with GDP formatted as currency
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d: d3.NumberValue) => {
        const value = Number(d);
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        return `$${value.toFixed(0)}`;
      }))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Prompt, sans-serif')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Prompt, sans-serif');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 65})`)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', 'Prompt, sans-serif')
      .style('fill', '#75a1c7')
      .text('GDP for Year ($)');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -70)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', 'Prompt, sans-serif')
      .style('fill', '#75a1c7')
      .text('Suicides No');

    // Create line generator
    const line = d3.line<GDPData>()
      .x(d => xScale(d.gdp_for_year)!)
      .y(d => yScale(d.suicides_no)!);

    // Add line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', FIXED_COLOR)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.gdp_for_year)!)
      .attr('cy', d => yScale(d.suicides_no)!)
      .attr('r', 6)
      .attr('fill', FIXED_COLOR)
      .attr('stroke', '#1a3d5c')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Auto-clear behavior
        if (filters.selectedGDP === d.gdp_for_year) {
          clearFilters();
        } else {
          updateFilter('selectedGDP', d.gdp_for_year);
        }
      })
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        setTooltipPosition({ x: event.pageX, y: event.pageY });
        d3.select(event.currentTarget)
          .attr('r', 8)
          .attr('stroke-width', 3);
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        setTooltipPosition(null);
        d3.select(event.currentTarget)
          .attr('r', 6)
          .attr('stroke-width', 2);
      });

    // Add value labels on points
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.gdp_for_year)!)
      .attr('y', d => yScale(d.suicides_no)! - 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-family', 'Prompt, sans-serif')
      .style('fill', '#2c5985')
      .text(d => d.suicides_no.toLocaleString());

  }, [data, width, height, filters, updateFilter, clearFilters]);

  // Format GDP for display
  const formatGDP = (gdp: number): string => {
    if (gdp >= 1e12) return `$${(gdp / 1e12).toFixed(2)}T`;
    if (gdp >= 1e9) return `$${(gdp / 1e9).toFixed(2)}B`;
    if (gdp >= 1e6) return `$${(gdp / 1e6).toFixed(2)}M`;
    return `$${gdp.toLocaleString()}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <h3 style={{
        color: '#75a1c7',
        fontFamily: 'Prompt Bold, sans-serif',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        Suicide Rates By GDP
      </h3>
      <svg ref={svgRef} style={{ display: 'block', margin: '0 auto' }}></svg>

      {hoveredData && tooltipPosition && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #75a1c7',
            borderRadius: '4px',
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontFamily: 'Prompt, sans-serif',
            fontSize: '13px'
          }}
        >
          <div><strong>Year:</strong> {hoveredData.year}</div>
          <div><strong>GDP:</strong> {formatGDP(hoveredData.gdp_for_year)}</div>
          <div><strong>Suicides:</strong> {hoveredData.suicides_no.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
