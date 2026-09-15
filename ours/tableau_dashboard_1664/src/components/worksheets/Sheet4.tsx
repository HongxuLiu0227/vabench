import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useInteractions } from '../../contexts/InteractionContext';
import type { SeasonSolData } from '../../types/marsData';

interface Sheet4Props {
  data: SeasonSolData[];
  width?: number;
  height?: number;
}

const SEASON_COLORS: Record<string, string> = {
  Winter: '#4e79a7',
  Spring: '#59a14f',
  Summer: '#f28e2b',
  Autumn: '#e15759',
};

export const Sheet4: React.FC<Sheet4Props> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isHighlighted, isFiltered } = useInteractions();
  const [hoveredData, setHoveredData] = useState<SeasonSolData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortedData = [...data].sort((a, b) => b.sum_sol - a.sum_sol);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.sum_sol) || 0])
      .range([0, innerWidth]);

    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.season))
      .range([0, innerHeight])
      .padding(0.2);

    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g').call(yAxis).selectAll('text').style('font-size', '11px');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .text('Sum of Sols')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .text('Season')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.selectAll<SVGRectElement, typeof sortedData[0]>('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.season)!)
      .attr('width', (d) => x(d.sum_sol))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => SEASON_COLORS[d.season])
      .attr('opacity', (d) => (isHighlighted('Sheet 4', d.season) && isFiltered(d.season) ? 1 : 0.2))
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('opacity', 0.8);
      })
      // eslint-disable-next-line react-hooks/unsupported-syntax
      .on('mouseout', function(this: SVGRectElement, _event: d3.D3BrushEvent<SVGRectElement>, d: { season: string }) {
        setHoveredData(null);
        d3.select(this).attr('opacity', () =>
          isHighlighted('Sheet 4', d.season) && isFiltered(d.season) ? 1 : 0.2
        );
      });

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', -15)
      .text('Temperature Fluctuation')
      .style('font-size', '14px')
      .style('font-weight', 'bold');
  }, [data, width, height, isHighlighted, isFiltered]);

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
            <strong>Season:</strong> {hoveredData.season}
          </div>
          <div>
            <strong>Sum of Sols:</strong> {hoveredData.sum_sol.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};
