import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { select } from 'd3-selection';
import type { ScatterDataPoint } from '../../services/types';
import { getArtistColor } from '../../services/dataService';

interface ScatterPlotProps {
  data: ScatterDataPoint[];
  selectedArtist: string | null;
  width?: number;
  height?: number;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  selectedArtist,
  width = 400,
  height = 400
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
          height: Math.max(350, containerWidth * 0.8)
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3Scale.scaleLinear().domain([0, 19]).range([0, chartWidth]).nice();

    const y = d3Scale.scaleLinear().domain([0, 1]).range([chartHeight, 0]).nice();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke-opacity', 0.1)
          .attr('stroke-dasharray', '3,3')
      );

    // X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .attr('font-size', '11px');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .attr('font-size', '11px');

    // Y axis title
    g.append('text')
      .attr('class', 'y-axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -chartHeight / 2)
      .attr('dy', '1em')
      .text('Recognizability')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .style('text-anchor', 'middle');

    // Draw dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'dot')
      .attr('d', (d) => {
        const cx = x(d.noOfSongs);
        const cy = y(d.recognizability);
        const size = d.measureName === 'Recognition by Millennials' ? 6 : 5;
        if (d.measureName === 'Recognition by Millennials') {
          // Square
          return `M ${cx - size},${cy - size} h ${size * 2} v ${size * 2} h ${-size * 2} Z`;
        } else {
          // Circle
          return `M ${cx},${cy} m ${-size},0 a ${size},${size} 0 1,0 ${size * 2},0 a ${size},${size} 0 1,0 ${-size * 2},0`;
        }
      })
      .attr('fill', (d) => getArtistColor(d.artist))
      .attr('opacity', (d) => {
        if (selectedArtist === null) return 0.7;
        return d.artist === selectedArtist ? 0.9 : 0.1;
      })
      .attr('stroke', (d) => getArtistColor(d.artist))
      .attr('stroke-width', (d) => {
        if (selectedArtist === null) return 0.5;
        return d.artist === selectedArtist ? 1.5 : 0.5;
      })
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function (_event, d) {
        if (selectedArtist !== null && d.artist !== selectedArtist) return;
        select(this).attr('opacity', 1);
      })
      .on('mouseout', function (_event, d) {
        if (selectedArtist === null || d.artist === selectedArtist) {
          select(this).attr('opacity', d.measureName === 'Recognition by Millennials' ? 0.7 : 0.7);
        } else {
          select(this).attr('opacity', 0.1);
        }
      });

    // Add tooltips on hover
    g.selectAll('.dot-tooltip-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'dot-tooltip-bg')
      .attr('x', (d) => x(d.noOfSongs) + 10)
      .attr('y', (d) => y(d.recognizability) - 25)
      .attr('width', 0)
      .attr('height', 0)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5)
      .attr('rx', 3)
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    g.selectAll('.dot-tooltip-text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'dot-tooltip-text')
      .attr('x', (d) => x(d.noOfSongs) + 15)
      .attr('y', (d) => y(d.recognizability) - 15)
      .text((d) => `${d.artist}: ${d.recognizability.toFixed(2)}`)
      .attr('font-size', '10px')
      .attr('opacity', 0)
      .style('pointer-events', 'none');
  }, [data, chartWidth, chartHeight, selectedArtist, margin.left, margin.top]);

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

export default ScatterPlot;
