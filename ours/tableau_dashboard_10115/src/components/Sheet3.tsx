import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AgeData } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet3Props {
  data: AgeData[];
  width?: number;
  height?: number;
}

const COLOR_SCALE = ['#f1f1f1', '#d6dee6', '#beccdb', '#a6bbd0', '#90abc5', '#7c9cbb', '#698db0', '#577fa5', '#47719a', '#39648f', '#2c5985'];

export function Sheet3({ data, width = 400, height = 350 }: Sheet3Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, updateFilter, clearFilters } = useFilters();
  const [hoveredData, setHoveredData] = useState<AgeData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 100, bottom: 30, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.age))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.suicides_no) || 0])
      .range([0, innerWidth])
      .nice();

    const colorScale = d3.scaleLinear<string, string>()
      .domain(d3.extent(data, d => d.suicides_no) as [number, number])
      .range([COLOR_SCALE[0], COLOR_SCALE[COLOR_SCALE.length - 1]]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Prompt, sans-serif');

    // Add Y axis with age labels
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Prompt, sans-serif');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.age)!)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.suicides_no)!)
      .attr('fill', d => colorScale(d.suicides_no)!)
      .attr('stroke', '#2c5985')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Auto-clear behavior
        if (filters.selectedAge === d.age) {
          clearFilters();
        } else {
          updateFilter('selectedAge', d.age);
        }
      })
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        setTooltipPosition({ x: event.pageX, y: event.pageY });
        d3.select(event.currentTarget)
          .attr('stroke-width', 3);
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        setTooltipPosition(null);
        d3.select(event.currentTarget)
          .attr('stroke-width', 1);
      });

    // Add value labels at end of bars
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.suicides_no)! + 5)
      .attr('y', d => yScale(d.age)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
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
        Suicide Rates By Ages
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
          <div><strong>Age:</strong> {hoveredData.age}</div>
          <div><strong>Suicides:</strong> {hoveredData.suicides_no.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
