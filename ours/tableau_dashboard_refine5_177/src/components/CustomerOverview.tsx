import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { RegionSummary } from '../services/dataLoader';
import './Worksheet.css';

interface CustomerOverviewProps {
  data: RegionSummary[];
}

function CustomerOverview({ data }: CustomerOverviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define column positions
    const colWidth = width / 5;
    const rowHeight = 50;
    const headerHeight = 30;

    const metrics = [
      { key: 'region', label: 'Region', format: (d: string) => d },
      { key: 'customerCount', label: 'Customer Count', format: (d: number) => d.toString() },
      { key: 'sales', label: 'Sales', format: (d: number) => `$${d.toFixed(2)}` },
      { key: 'quantity', label: 'Quantity', format: (d: number) => d.toString() },
      { key: 'profit', label: 'Profit', format: (d: number) => `$${d.toFixed(2)}` },
    ] as const;

    // Add headers
    g.selectAll('.header')
      .data(metrics)
      .enter()
      .append('text')
      .attr('class', 'header')
      .attr('x', (_d, i) => i * colWidth + colWidth / 2)
      .attr('y', headerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text((d) => d.label);

    // Add header separator line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', headerHeight)
      .attr('y2', headerHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1);

    // Add data rows
    data.forEach((row, rowIndex) => {
      const y = headerHeight + rowIndex * rowHeight + rowHeight / 2;

      // Add alternating row background
      if (rowIndex % 2 === 0) {
        g.append('rect')
          .attr('x', 0)
          .attr('y', headerHeight + rowIndex * rowHeight)
          .attr('width', width)
          .attr('height', rowHeight)
          .attr('fill', '#f9f9f9')
          .attr('opacity', 0.5);
      }

      // Add region color indicator
      g.append('rect')
        .attr('x', 5)
        .attr('y', y - 8)
        .attr('width', 4)
        .attr('height', 16)
        .attr('fill', d3.schemeCategory10[rowIndex % 10])
        .attr('rx', 2);

      // Add cell values
      metrics.forEach((metric, colIndex) => {
        const value = row[metric.key as keyof RegionSummary];

        g.append('text')
          .attr('class', 'cell')
          .attr('x', colIndex * colWidth + colWidth / 2)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', colIndex === 0 ? '#333' : '#555')
          .text(metric.format(value as string & number));
      });

      // Add row separator line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', headerHeight + (rowIndex + 1) * rowHeight)
        .attr('y2', headerHeight + (rowIndex + 1) * rowHeight)
        .attr('stroke', '#f0f0f0')
        .attr('stroke-width', 1);
    });

    // Add column separators
    metrics.forEach((_, i) => {
      if (i > 0) {
        g.append('line')
          .attr('x1', i * colWidth)
          .attr('x2', i * colWidth)
          .attr('y1', headerHeight)
          .attr('y2', height)
          .attr('stroke', '#f0f0f0')
          .attr('stroke-width', 1);
      }
    });
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="worksheet-container">
      <div className="worksheet-header">
        <h3 className="worksheet-title">Customer Overview</h3>
      </div>
      <div className="worksheet-content">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

export default CustomerOverview;
