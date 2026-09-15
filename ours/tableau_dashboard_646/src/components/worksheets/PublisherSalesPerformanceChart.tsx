import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GameData, PublisherSalesData } from '../../types';
import { useFilters } from '../../hooks/useFilters';

interface Props {
  data: GameData[];
  width: number;
  height: number;
  onPublisherClick?: (publisher: string) => void;
}

export function PublisherSalesPerformanceChart({ data, width, height, onPublisherClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedPublishers } = useFilters();
  const [hoveredPublisher, setHoveredPublisher] = useState<string | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter data
    const filteredData = data.filter((d) => {
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(d.Publisher)) return false;
      return true;
    });

    // Aggregate data by publisher
    const publisherMap = new Map<string, { sum: number; platforms: Set<string>; count: number }>();
    filteredData.forEach((d) => {
      const existing = publisherMap.get(d.Publisher) || { sum: 0, platforms: new Set<string>(), count: 0 };
      existing.sum += d.Global_Sales;
      existing.platforms.add(d.Platform);
      existing.count += 1;
      publisherMap.set(d.Publisher, existing);
    });

    const publisherSalesData: PublisherSalesData[] = Array.from(publisherMap.entries())
      .map(([publisher, { sum, platforms, count }]) => ({
        publisher,
        avgGlobalSales: sum / count,
        platforms: Array.from(platforms),
        count,
      }))
      .sort((a, b) => b.avgGlobalSales - a.avgGlobalSales)
      .slice(0, 20); // Show top 20 publishers

    // Calculate overall average
    const overallAvg = d3.mean(publisherSalesData, (d) => d.avgGlobalSales) || 0;

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(publisherSalesData, (d) => d.avgGlobalSales) || 0])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(publisherSalesData.map((d) => d.publisher))
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

    // Add circles and labels
    publisherSalesData.forEach((d) => {
      const isHovered = hoveredPublisher === d.publisher;
      const cx = xScale(d.avgGlobalSales);
      const cy = yScale(d.publisher)! + yScale.bandwidth() / 2;

      // Circle
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 6)
        .attr('fill', '#4e79a7')
        .attr('opacity', isHovered ? 1 : 0.7)
        .attr('stroke', isHovered ? '#000' : 'none')
        .attr('stroke-width', isHovered ? 2 : 0)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          if (onPublisherClick) {
            onPublisherClick(d.publisher);
          }
        })
        .on('mouseover', () => setHoveredPublisher(d.publisher))
        .on('mouseout', () => setHoveredPublisher(null));

      // Platform label
      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', '#333')
        .text(d.platforms.slice(0, 2).join(', ') + (d.platforms.length > 2 ? '...' : ''));
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
      .style('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '10px');

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Avg. Global Sales (in millions)');

  }, [data, width, height, selectedPublishers, hoveredPublisher, onPublisherClick]);

  return (
    <div className="worksheet">
      <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Publisher and sales performance</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
    </div>
  );
}
