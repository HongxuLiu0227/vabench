import React, { useEffect, useRef, useState } from 'react';
import { line } from 'd3-shape';
import * as d3 from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { select } from 'd3-selection';
import type { PRecognizabilityData } from '../../services/types';
import { getArtistColor } from '../../services/dataService';

interface MultiLineChartProps {
  data: PRecognizabilityData[];
  selectedArtist: string | null;
  width?: number;
  height?: number;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  selectedArtist,
  width = 500,
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
          height: Math.max(350, containerWidth * 0.7)
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const ageColumns = [
      'Year Born',
      '1 Years Old',
      '2 Years Old',
      '3 Years Old',
      '4 Years Old',
      '5 Years Old',
      '6 Years Old',
      '7 Years Old',
      '8 Years Old',
      '9 Years Old',
      '10 Years Old',
      '11 Years Old',
      '12 Years Old',
      '13 Years Old'
    ];

    // Group data by artist
    const groupedData = new Map<string, PRecognizabilityData[]>();
    data.forEach((d) => {
      if (!groupedData.has(d.artist)) {
        groupedData.set(d.artist, []);
      }
      groupedData.get(d.artist)!.push(d);
    });

    // Sort each artist's data by age column order
    groupedData.forEach((artistData) => {
      artistData.sort((a, b) => {
        return ageColumns.indexOf(a.measureName) - ageColumns.indexOf(b.measureName);
      });
    });

    const x = d3Scale
      .scalePoint()
      .domain(ageColumns)
      .range([0, chartWidth])
      .padding(0.5);

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
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '10px')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-45)')
      .attr('dy', '0.5em')
      .attr('dx', '-0.5em');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select('.domain').remove())
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

    const lineGenerator = line<PRecognizabilityData>()
      .x((d) => x(d.measureName) || 0)
      .y((d) => y(d.value))
      .defined((d) => !isNaN(d.value));

    // Draw lines
    groupedData.forEach((artistData, artist) => {
      const isHighlighted = selectedArtist === null || artist === selectedArtist;

      g.append('path')
        .datum(artistData)
        .attr('fill', 'none')
        .attr('stroke', getArtistColor(artist))
        .attr('stroke-width', artist === selectedArtist ? 3 : 1.5)
        .attr('stroke-opacity', isHighlighted ? 0.8 : 0.1)
        .attr('d', lineGenerator)
        .style('transition', 'all 0.2s ease');

      // Draw dots
      g.selectAll(`.dot-${artist.replace(/\s+/g, '-')}`)
        .data(artistData)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${artist.replace(/\s+/g, '-')}`)
        .attr('cx', (d) => x(d.measureName) || 0)
        .attr('cy', (d) => y(d.value))
        .attr('r', artist === selectedArtist ? 4 : 2.5)
        .attr('fill', getArtistColor(artist))
        .attr('opacity', isHighlighted ? 0.9 : 0.1)
        .style('transition', 'all 0.2s ease');
    });
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

export default MultiLineChart;
