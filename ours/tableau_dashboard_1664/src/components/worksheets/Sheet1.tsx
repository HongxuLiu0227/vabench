import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useInteractions } from '../../contexts/InteractionContext';
import type { SolData } from '../../types/marsData';

interface Sheet1Props {
  data: SolData[];
  width?: number;
  height?: number;
}

const SEASON_COLORS: Record<string, string> = {
  Winter: '#4e79a7',
  Spring: '#59a14f',
  Summer: '#f28e2b',
  Autumn: '#e15759',
};

export const Sheet1: React.FC<Sheet1Props> = ({
  data,
  width = 600,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isHighlighted, setHighlight, clearHighlight, isFiltered } = useInteractions();
  const [hoveredData, setHoveredData] = useState<SolData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.sol) as [number, number]).range([0, innerWidth]);

    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d.max_temp) as [number, number]).range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y).ticks(10);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g').call(yAxis).selectAll('text').style('font-size', '11px');

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .text('Sols Elapsed')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .text('Max Temp')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.selectAll<SVGCircleElement, SolData>('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.sol))
      .attr('cy', (d) => y(d.max_temp))
      .attr('r', 4)
      .attr('fill', (d) => SEASON_COLORS[d.Season] || '#ccc')
      .attr('opacity', (d) => (isHighlighted('Sheet 1', d.month) && isFiltered(d.month) ? 1 : 0.2))
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        const values = new Set([d.month]);
        setHighlight('Sheet 1', 'month', values);
      })
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('r', 6);
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget).attr('r', 4);
      });

    svg.on('click', (event) => {
      if (event && event.target === svgRef.current) {
        clearHighlight('Sheet 1');
      }
    });
  }, [data, width, height, isHighlighted, isFiltered, setHighlight, clearHighlight]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
      {hoveredData && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <strong>Sol:</strong> {hoveredData.sol}
          </div>
          <div>
            <strong>Max Temp:</strong> {hoveredData.max_temp.toFixed(1)}°C
          </div>
          <div>
            <strong>Month:</strong> {hoveredData.month}
          </div>
          <div>
            <strong>Season:</strong> {hoveredData.Season}
          </div>
        </div>
      )}
    </div>
  );
};
