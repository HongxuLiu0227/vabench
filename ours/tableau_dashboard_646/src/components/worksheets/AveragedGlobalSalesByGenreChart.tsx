import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GameData, GenreSalesData } from '../../types';
import { useFilters } from '../../hooks/useFilters';

interface Props {
  data: GameData[];
  width: number;
  height: number;
  onGenreClick?: (genre: string) => void;
}

export function AveragedGlobalSalesByGenreChart({ data, width, height, onGenreClick }: Props) {
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

    // Aggregate data by genre
    const genreMap = new Map<string, { sum: number; count: number }>();
    filteredData.forEach((d) => {
      const existing = genreMap.get(d.Genre) || { sum: 0, count: 0 };
      genreMap.set(d.Genre, {
        sum: existing.sum + d.Global_Sales,
        count: existing.count + 1,
      });
    });

    const genreSalesData: GenreSalesData[] = Array.from(genreMap.entries())
      .map(([genre, { sum, count }]) => ({
        genre,
        avgGlobalSales: sum / count,
        count,
      }))
      .sort((a, b) => b.avgGlobalSales - a.avgGlobalSales);

    // Calculate overall average
    const overallAvg = d3.mean(genreSalesData, (d) => d.avgGlobalSales) || 0;

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(genreSalesData, (d) => d.avgGlobalSales) || 0])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(genreSalesData.map((d) => d.genre))
      .range([0, innerHeight])
      .padding(0.3);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add reference line for overall average
    g.append('line')
      .attr('x1', xScale(overallAvg))
      .attr('x2', xScale(overallAvg))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 2);

    // Add reference line label
    g.append('text')
      .attr('x', xScale(overallAvg))
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(`Avg: ${overallAvg.toFixed(2)}`);

    // Add circles
    genreSalesData.forEach((d) => {
      const isDimmed = highlightGenre && highlightGenre !== d.genre;
      const isHovered = hoveredGenre === d.genre;

      g.append('circle')
        .attr('cx', xScale(d.avgGlobalSales))
        .attr('cy', yScale(d.genre)! + yScale.bandwidth() / 2)
        .attr('r', 8)
        .attr('fill', '#e15759')
        .attr('opacity', isDimmed ? 0.3 : isHovered ? 1 : 0.8)
        .attr('stroke', isHovered ? '#000' : 'none')
        .attr('stroke-width', isHovered ? 2 : 0)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          if (onGenreClick) {
            onGenreClick(d.genre);
          }
        })
        .on('mouseover', () => setHoveredGenre(d.genre))
        .on('mouseout', () => setHoveredGenre(null));
    });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d3.format('.2f'));

    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Avg. Global Sales (in millions)');

  }, [data, width, height, selectedGenres, highlightGenre, hoveredGenre, onGenreClick]);

  return (
    <div className="worksheet">
      <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Averaged Global sales by Genre</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
    </div>
  );
}
