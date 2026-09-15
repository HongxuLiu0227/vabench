import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useInteractions } from '../../contexts/InteractionContext';
import type { AggregatedMarsData } from '../../types/marsData';

interface Sheet3Props {
  data: AggregatedMarsData[];
  width?: number;
  height?: number;
}

export const Sheet3: React.FC<Sheet3Props> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isHighlighted, isFiltered } = useInteractions();
  const [hoveredData, setHoveredData] = useState<AggregatedMarsData | null>(null);

  const chartData = data.map((d) => ({
    month: d.month,
    temp_range: d.avg_max_temp - d.avg_min_temp,
  }));

  useEffect(() => {
    if (!svgRef.current || !chartData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortedData = [...chartData].sort((a, b) => b.temp_range - a.temp_range);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.temp_range) || 0])
      .range([0, innerWidth]);

    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.month))
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
      .attr('y', innerHeight + 50)
      .text('Temperature Range (°C)')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .text('Month')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.selectAll<SVGRectElement, typeof sortedData[0]>('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.month)!)
      .attr('width', (d) => x(d.temp_range))
      .attr('height', y.bandwidth())
      .attr('fill', '#59a14f')
      .attr('opacity', (d) => (isHighlighted('Sheet 3', d.month) && isFiltered(d.month) ? 1 : 0.2))
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(data.find((item) => item.month === d.month) || null);
        d3.select(event.currentTarget).attr('opacity', 0.8);
      })
      // eslint-disable-next-line react-hooks/unsupported-syntax
      .on('mouseout', function(this: SVGRectElement, _event: d3.D3BrushEvent<SVGRectElement>, d: { month: string }) {
        setHoveredData(null);
        d3.select(this).attr('opacity', () =>
          isHighlighted('Sheet 3', d.month) && isFiltered(d.month) ? 1 : 0.2
        );
      });
  }, [chartData, data, width, height, isHighlighted, isFiltered]);

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
            <strong>Temp Range:</strong> {(hoveredData.avg_max_temp - hoveredData.avg_min_temp).toFixed(1)}°C
          </div>
          <div>
            <strong>Avg Min:</strong> {hoveredData.avg_min_temp.toFixed(1)}°C
          </div>
          <div>
            <strong>Avg Max:</strong> {hoveredData.avg_max_temp.toFixed(1)}°C
          </div>
        </div>
      )}
    </div>
  );
};
