import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GameData } from '../../types';
import { GENRE_PALETTE } from '../../types';
import { useFilters } from '../../hooks/useFilters';

interface Props {
  data: GameData[];
  width: number;
  height: number;
  yearRange: { start: number; end: number };
  title: string;
  onGenreClick?: (genre: string) => void;
}

export function PopularVideoGamesPieChart({ data, width, height, yearRange, title, onGenreClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedGenres, highlightGenre } = useFilters();
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter data by year range
    let filteredData = data.filter((d) => d.Year >= yearRange.start && d.Year <= yearRange.end);

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filteredData = filteredData.filter((d) => selectedGenres.includes(d.Genre));
    }

    // Aggregate data by genre
    const genreMap = new Map<string, number>();
    filteredData.forEach((d) => {
      genreMap.set(d.Genre, (genreMap.get(d.Genre) || 0) + d.Global_Sales);
    });

    const pieData = Array.from(genreMap.entries())
      .map(([genre, globalSales]) => ({ genre, globalSales }))
      .sort((a, b) => b.globalSales - a.globalSales);

    if (pieData.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#999')
        .text('No data available');
      return;
    }

    // Set up dimensions
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const colorScale = d3.scaleOrdinal<string>()
      .domain(pieData.map((d) => d.genre))
      .range(pieData.map((d) => GENRE_PALETTE[d.genre] || '#cccccc'));

    // Create pie
    const pie = d3.pie<{ genre: string; globalSales: number }>()
      .value((d) => d.globalSales)
      .sort(null);

    const arcs = pie(pieData);

    // Create arc generator
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const arc = d3.arc<d3.PieArcDatum<{ genre: string; globalSales: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3.arc<d3.PieArcDatum<{ genre: string; globalSales: number }>>()
      .innerRadius(0)
      .outerRadius(radius * 1.1);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Add arcs
    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data.genre))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', (d) => {
        if (highlightGenre && highlightGenre !== d.data.genre) return 0.3;
        if (hoveredGenre && hoveredGenre !== d.data.genre) return 0.5;
        return 0.9;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onGenreClick) {
          onGenreClick(d.data.genre);
        }
      })
      .on('mouseover', function(_, d) {
        setHoveredGenre(d.data.genre);
        d3.select(this)
          .transition()
          .duration(200)
          .attrTween('d', () => hoverArc as any);
      })
      .on('mouseout', function() {
        setHoveredGenre(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attrTween('d', () => arc as any);
      });

    // Add labels
    g.selectAll('text')
      .data(arcs)
      .enter()
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('text-shadow', '0 0 3px #000')
      .text((d) => {
        const percent = (d.data.globalSales / d3.sum(pieData, (pd) => pd.globalSales)) * 100;
        if (percent < 5) return ''; // Hide label for small slices
        return `${d.data.genre} ${d.data.globalSales.toFixed(1)}M`;
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(title);

  }, [data, width, height, yearRange, title, selectedGenres, highlightGenre, hoveredGenre, onGenreClick]);

  return (
    <div className="worksheet">
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
    </div>
  );
}
