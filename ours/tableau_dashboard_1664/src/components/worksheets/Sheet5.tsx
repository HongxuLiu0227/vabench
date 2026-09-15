import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { PressureData } from '../../types/marsData';

interface Sheet5Props {
  data: PressureData[];
  width?: number;
  height?: number;
}

const SEASON_COLORS: Record<string, string> = {
  Winter: '#4e79a7',
  Spring: '#59a14f',
  Summer: '#f28e2b',
  Autumn: '#e15759',
};

export const Sheet5: React.FC<Sheet5Props> = ({
  data,
  width = 250,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<PressureData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerHeight])
      .padding(0.2);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.avg_pressure) as [number, number])
      .range([0, innerWidth]);

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
      .attr('y', innerHeight + 50)
      .text('Pressure (Pa)')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    const everestLine = x(33700);
    const armstrongLine = x(6250);
    const maxPressure = d3.max(data, (d) => d.avg_pressure) || 0;
    const maxLine = x(maxPressure);

    g.append('line')
      .attr('x1', everestLine)
      .attr('x2', everestLine)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ff6b6b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', everestLine)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .text('Mt. Everest')
      .style('font-size', '10px')
      .style('fill', '#ff6b6b');

    g.append('line')
      .attr('x1', armstrongLine)
      .attr('x2', armstrongLine)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ffa500')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', armstrongLine)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .text('Armstrong Limit')
      .style('font-size', '10px')
      .style('fill', '#ffa500');

    g.append('line')
      .attr('x1', maxLine)
      .attr('x2', maxLine)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3');

    g.selectAll<SVGRectElement, PressureData>('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.month)!)
      .attr('width', (d) => x(d.avg_pressure))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => SEASON_COLORS[d.Season])
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('opacity', 1);
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget).attr('opacity', 0.8);
      });

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', 15)
      .text('Can You Handle the Pressure?')
      .style('font-size', '14px')
      .style('font-weight', 'bold');
  }, [data, width, height]);

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
            <strong>Month:</strong> {hoveredData.month}
          </div>
          <div>
            <strong>Avg Pressure:</strong> {hoveredData.avg_pressure.toFixed(1)} Pa
          </div>
          <div>
            <strong>Season:</strong> {hoveredData.Season}
          </div>
        </div>
      )}
    </div>
  );
};
