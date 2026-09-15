import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useInteractions } from '../../contexts/InteractionContext';
import type { TemperatureData } from '../../types/marsData';

interface Sheet2Props {
  data: TemperatureData[];
  width?: number;
  height?: number;
}

const MEASURE_COLORS: Record<string, string> = {
  'avg:max_temp': '#e15759',
  'avg:min_temp': '#4e79a7',
};

const MEASURE_LABELS: Record<string, string> = {
  'avg:max_temp': 'Avg Max Temp',
  'avg:min_temp': 'Avg Min Temp',
};

export const Sheet2: React.FC<Sheet2Props> = ({
  data,
  width = 600,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isHighlighted, setHighlight, setFilter, clearHighlight, clearFilter, isFiltered } = useInteractions();
  const [hoveredData, setHoveredData] = useState<TemperatureData | null>(null);

  const months = Array.from(new Set(data.map((d) => d.month)));
  const measures = Array.from(new Set(data.map((d) => d.measure)));

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand()
      .domain(months)
      .range([0, innerWidth])
      .paddingInner(0.2);

    const x1 = d3
      .scaleBand()
      .domain(measures)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.value) as [number, number])
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x0);
    const yAxis = d3.axisLeft(y).ticks(10);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    g.append('g').call(yAxis).selectAll('text').style('font-size', '11px');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .text('Month')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .text('Temperature (Celsius)')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    const groups = g
      .selectAll<SVGGElement, string>('g.group')
      .data(months)
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', (month) => `translate(${x0(month)},0)`);

    groups
      .selectAll<SVGCircleElement, TemperatureData>('circle')
      .data((month) => data.filter((d) => d.month === month))
      .enter()
      .append('circle')
      .attr('cx', (d) => x1(d.measure)! + x1.bandwidth() / 2)
      .attr('cy', (d) => y(d.value))
      .attr('r', 6)
      .attr('fill', (d) => MEASURE_COLORS[d.measure])
      .attr('opacity', (d) => (isHighlighted('Sheet 2', d.month) && isFiltered(d.month) ? 1 : 0.2))
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        const values = new Set([d.month]);
        setFilter('Sheet 2', 'month', values);
      })
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('r', 8);
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget).attr('r', 6);
      });

    svg.on('click', (event) => {
      if (event && event.target === svgRef.current) {
        clearFilter('Sheet 2');
      }
    });
  }, [data, width, height, months, measures, isHighlighted, isFiltered, setHighlight, setFilter, clearHighlight, clearFilter]);

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
            <strong>Measure:</strong> {MEASURE_LABELS[hoveredData.measure]}
          </div>
          <div>
            <strong>Temperature:</strong> {hoveredData.value.toFixed(1)}°C
          </div>
        </div>
      )}
    </div>
  );
};

export const Sheet2Legend: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'white',
        border: '1px solid #ccc',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '11px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Measure</div>
      {Object.entries(MEASURE_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: MEASURE_COLORS[key],
              marginRight: '6px',
              borderRadius: '50%',
            }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
