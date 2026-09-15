import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GenerationSexData } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet2Props {
  data: GenerationSexData[];
  width?: number;
  height?: number;
}

const COLOR_SCALE = ['#f1f1f1', '#d6dee6', '#beccdb', '#a6bbd0', '#90abc5', '#7c9cbb', '#698db0', '#577fa5', '#47719a', '#39648f', '#2c5985'];

export function Sheet2({ data, width = 400, height = 400 }: Sheet2Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, updateFilter, clearFilters } = useFilters();
  const [hoveredData, setHoveredData] = useState<GenerationSexData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group by generation
    const generations = Array.from(new Set(data.map(d => d.generation)));
    const sexTypes = Array.from(new Set(data.map(d => d.sex)));

    // Create x-scale for grouped bars
    const x0Scale = d3.scaleBand()
      .domain(generations)
      .range([0, innerWidth])
      .padding(0.2);

    const x1Scale = d3.scaleBand()
      .domain(sexTypes)
      .range([0, x0Scale.bandwidth()])
      .padding(0.05);

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
      .call(d3.axisBottom(x0Scale))
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

    // Create groups for each generation
    const groups = g.selectAll('.generation-group')
      .data(generations)
      .enter()
      .append('g')
      .attr('class', 'generation-group')
      .attr('transform', d => `translate(${x0Scale(d)!},0)`);

    // Add bars for each sex within generation
    groups.selectAll('.bar')
      .data(d => sexTypes.map(sex => {
        const item = data.find(item => item.generation === d && item.sex === sex);
        return { generation: d, sex, value: item?.suicides_no || 0 };
      }))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x1Scale(d.sex)!)
      .attr('y', d => yScale(d.value)!)
      .attr('width', x1Scale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value)!)
      .attr('fill', d => colorScale(d.value)!)
      .attr('stroke', '#2c5985')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Auto-clear behavior
        if (filters.selectedGeneration === d.generation && filters.selectedSex === d.sex) {
          clearFilters();
        } else {
          updateFilter('selectedGeneration', d.generation);
          updateFilter('selectedSex', d.sex);
        }
      })
      .on('mouseover', (event, d) => {
        setHoveredData({ generation: d.generation, sex: d.sex, suicides_no: d.value });
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

    // Add value labels on bars
    groups.selectAll('.label')
      .data(d => sexTypes.map(sex => {
        const item = data.find(item => item.generation === d && item.sex === sex);
        return { generation: d, sex, value: item?.suicides_no || 0 };
      }))
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x1Scale(d.sex)! + x1Scale.bandwidth() / 2)
      .attr('y', d => yScale(d.value)! - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-family', 'Prompt, sans-serif')
      .style('fill', '#2c5985')
      .text(d => d.value > 0 ? d.value.toLocaleString() : '');

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
        Suicide Rates Between Sex and Generations
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
          <div><strong>Generation:</strong> {hoveredData.generation}</div>
          <div><strong>Sex:</strong> {hoveredData.sex}</div>
          <div><strong>Suicides:</strong> {hoveredData.suicides_no.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
