import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { select } from 'd3-selection';
import type { DataRow } from '../../services/types';

interface HorizontalBarChartProps {
  data: DataRow[];
  selectedArtist: string | null;
  onArtistSelect: (artist: string | null) => void;
  width?: number;
  height?: number;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  selectedArtist,
  onArtistSelect,
  width = 400,
  height = 500
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const updateDimensions = () => {
        const containerWidth = container.clientWidth;
        setDimensions({
          width: containerWidth,
          height: Math.max(400, containerWidth * 0.8)
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const margin = { top: 20, right: 30, bottom: 40, left: 120 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Sort data by number of songs (descending)
    const sortedData = [...data].sort((a, b) => b['No. of Songs'] - a['No. of Songs']);

    const x = d3Scale.scaleLinear().domain([0, 19]).range([0, chartWidth]).nice();

    const y = d3Scale
      .scaleBand()
      .domain(sortedData.map((d) => d.artist))
      .range([0, chartHeight])
      .padding(0.15);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const xAxis = d3.axisBottom(x).ticks(5).tickSize(-chartHeight).tickPadding(10);
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke-opacity', 0.1)
          .attr('stroke-dasharray', '3,3')
      );

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick').remove());

    // Bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.artist) || 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d['No. of Songs']))
      .attr('fill', (d) => {
        if (selectedArtist === null) return '#e15759';
        return d.artist === selectedArtist ? '#e15759' : '#e0e0e0';
      })
      .attr('opacity', (d) => {
        if (selectedArtist === null) return 1;
        return d.artist === selectedArtist ? 1 : 0.3;
      })
      .attr('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('click', (_event, d) => {
        _event.stopPropagation();
        onArtistSelect(selectedArtist === d.artist ? null : d.artist);
      })
      .on('mouseover', function (_event, d) {
        if (selectedArtist !== null && d.artist !== selectedArtist) return;
        select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function (_event, d) {
        if (selectedArtist === null || d.artist === selectedArtist) {
          select(this).attr('opacity', 1);
        } else {
          select(this).attr('opacity', 0.3);
        }
      });

    // Bar labels (number of songs)
    g.append('g')
      .selectAll('.bar-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (y(d.artist) || 0) + y.bandwidth() / 2)
      .attr('x', (d) => x(d['No. of Songs']) + 5)
      .attr('dy', '0.35em')
      .text((d) => d['No. of Songs'].toString())
      .attr('font-size', '11px')
      .attr('fill', (d) => {
        if (selectedArtist === null) return '#333';
        return d.artist === selectedArtist ? '#333' : '#999';
      })
      .attr('opacity', (d) => {
        if (selectedArtist === null) return 1;
        return d.artist === selectedArtist ? 1 : 0.3;
      })
      .style('pointer-events', 'none');

    // Y-axis labels
    g.append('g')
      .selectAll('.y-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('y', (d) => (y(d.artist) || 0) + y.bandwidth() / 2)
      .attr('x', -10)
      .attr('dy', '0.35em')
      .text((d) => d.artist)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('fill', (d) => {
        if (selectedArtist === null) return '#333';
        return d.artist === selectedArtist ? '#000' : '#999';
      })
      .attr('font-weight', (d) => (d.artist === selectedArtist ? 'bold' : 'normal'))
      .attr('opacity', (d) => {
        if (selectedArtist === null) return 1;
        return d.artist === selectedArtist ? 1 : 0.3;
      })
      .style('pointer-events', 'none');
  }, [data, chartWidth, chartHeight, selectedArtist, onArtistSelect, margin.left, margin.top]);

  return (
    <div style={{ width: '100%', height: 'auto' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};

export default HorizontalBarChart;
