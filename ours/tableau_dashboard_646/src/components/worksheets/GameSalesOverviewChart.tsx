import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GameData } from '../../types';
import { GENRE_PALETTE } from '../../types';
import { useFilters } from '../../hooks/useFilters';

interface Props {
  data: GameData[];
  width: number;
  height: number;
  onGenreClick?: (genre: string) => void;
}

export function GameSalesOverviewChart({ data, width, height, onGenreClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedGenres, highlightGenre } = useFilters();
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter data
    const filteredData = data.filter((d) => {
      if (selectedGenres.length > 0 && !selectedGenres.includes(d.Genre)) return false;
      return true;
    });

    // Aggregate data by year and genre
    const yearGenreMap = new Map<string, Map<string, number>>();
    filteredData.forEach((d) => {
      if (!yearGenreMap.has(d.Year.toString())) {
        yearGenreMap.set(d.Year.toString(), new Map());
      }
      const genreMap = yearGenreMap.get(d.Year.toString())!;
      genreMap.set(d.Genre, (genreMap.get(d.Genre) || 0) + d.Global_Sales);
    });

    // Get all unique years and genres
    const years = Array.from(yearGenreMap.keys()).map(Number).sort((a, b) => a - b);
    const allGenres = Array.from(new Set(filteredData.map((d) => d.Genre))).sort();

    // Prepare stacked data
    const stackedData = years.map((year) => {
      const genreMap = yearGenreMap.get(year.toString())!;
      const datum: Record<string, number> = { year: Number(year) };
      allGenres.forEach((genre) => {
        datum[genre] = genreMap.get(genre) || 0;
      });
      return datum;
    });

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(years) || 1980, d3.max(years) || 2016])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, (d) => d3.sum(allGenres, (g) => d[g])) || 0])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(allGenres)
      .range(allGenres.map((g) => GENRE_PALETTE[g] || '#cccccc'));

    // Create stack
    const stack = d3.stack()
      .keys(allGenres)
      .offset(d3.stackOffsetDiverging);

    const layers = stack(stackedData);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create bars
    const barWidth = Math.max(1, (innerWidth / years.length) * 0.8);

    layers.forEach((layer) => {
      const genre = layer.key;
      const isDimmed = highlightGenre && highlightGenre !== genre;
      const isHovered = hoveredGenre === genre;

      g.append('g')
        .selectAll('rect')
        .data(layer)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.data.year) - barWidth / 2)
        .attr('y', (d) => yScale(d[1]))
        .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
        .attr('width', barWidth)
        .attr('fill', colorScale(genre))
        .attr('opacity', isDimmed ? 0.3 : isHovered ? 1 : 0.8)
        .attr('stroke', isHovered ? '#000' : 'none')
        .attr('stroke-width', isHovered ? 2 : 0)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          if (onGenreClick) {
            onGenreClick(genre);
          }
        })
        .on('mouseover', () => setHoveredGenre(genre))
        .on('mouseout', () => setHoveredGenre(null));
    });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .ticks(10);

    const yAxis = d3.axisLeft(yScale)
      .ticks(10);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Global Sales (millions)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Year');

  }, [data, width, height, selectedGenres, highlightGenre, hoveredGenre, onGenreClick]);

  return (
    <div className="worksheet">
      <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Game sales overview of the year 1980-2016</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
    </div>
  );
}
