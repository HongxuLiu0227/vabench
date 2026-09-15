import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlyData } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet1Props {
  data: YearlyData[];
  width?: number;
  height?: number;
}

const COLOR_SCALE = ['#f1f1f1', '#d6dee6', '#beccdb', '#a6bbd0', '#90abc5', '#7c9cbb', '#698db0', '#577fa5', '#47719a', '#39648f', '#2c5985'];

export function Sheet1({ data, width = 600, height = 400 }: Sheet1Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, updateFilter, clearFilters } = useFilters();
  const [hoveredData, setHoveredData] = useState<YearlyData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year) as [number, number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.suicides_no) || 0])
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleLinear<string, string>()
      .domain(d3.extent(data, d => d.suicides_no) as [number, number])
      .range([COLOR_SCALE[0], COLOR_SCALE[COLOR_SCALE.length - 1]]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Prompt, sans-serif');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Prompt, sans-serif');

    // Create line generator
    const line = d3.line<YearlyData>()
      .x(d => xScale(d.year)!)
      .y(d => yScale(d.suicides_no)!);

    // Add line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2c5985')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.year)!)
      .attr('cy', d => yScale(d.suicides_no)!)
      .attr('r', 6)
      .attr('fill', d => colorScale(d.suicides_no)!)
      .attr('stroke', '#2c5985')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Auto-clear behavior: if same selection, clear it
        if (filters.selectedYear === d.year) {
          clearFilters();
        } else {
          updateFilter('selectedYear', d.year);
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
      .attr('x', d => xScale(d.year)!)
      .attr('y', d => yScale(d.suicides_no)! - 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'Prompt, sans-serif')
      .style('fill', '#2c5985')
      .text(d => d.suicides_no.toLocaleString());

  }, [data, width, height, filters, updateFilter, clearFilters]);

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
        Suicide Rates Per Year
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
          <div><strong>Suicides:</strong> {hoveredData.suicides_no.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
