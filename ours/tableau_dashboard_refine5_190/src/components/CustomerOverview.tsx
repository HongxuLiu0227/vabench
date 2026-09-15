import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import type { CustomerOverviewData } from '../types';

interface CustomerOverviewProps {
  data: CustomerOverviewData[];
  width?: number;
  height?: number;
}

/**
 * Customer Overview worksheet component
 * Displays a table view with Region as rows and multiple measures as columns
 * Measures: Customer Count, Sales, Quantity, Profit, Profit Ratio
 */
export const CustomerOverview: React.FC<CustomerOverviewProps> = ({
  data,
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Margins
    const margin = { top: 40, right: 20, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Customer Overview');

    // Table layout parameters
    const rowHeight = 30;
    const headerHeight = 25;
    const colWidths = [80, 90, 80, 70, 70, 80]; // Region, Customer Count, Sales, Quantity, Profit, Profit Ratio
    const colLabels = ['Region', 'Customer Count', 'Sales', 'Quantity', 'Profit', 'Profit Ratio'];

    // Add column headers
    const headerRow = g.append('g')
      .attr('transform', `translate(0, 0)`);

    colLabels.forEach((label, i) => {
      const x = colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
      headerRow.append('text')
        .attr('x', x + 5)
        .attr('y', headerHeight - 5)
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(label);
    });

    // Add horizontal line below header
    headerRow.append('line')
      .attr('x1', 0)
      .attr('y1', headerHeight)
      .attr('x2', innerWidth)
      .attr('y2', headerHeight)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // Add data rows
    const rows = g.append('g')
      .attr('transform', `translate(0, ${headerHeight})`);

    data.forEach((d, i) => {
      const y = i * rowHeight;
      const rowGroup = rows.append('g')
        .attr('transform', `translate(0, ${y})`);

      // Add background striping for odd rows
      if (i % 2 === 1) {
        rowGroup.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', innerWidth)
          .attr('height', rowHeight)
          .attr('fill', '#f5f5f5')
          .attr('opacity', 0.5);
      }

      // Region
      rowGroup.append('text')
        .attr('x', 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .text(d.region);

      // Customer Count
      rowGroup.append('text')
        .attr('x', colWidths[0] + 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .text(d.customerCount.toLocaleString());

      // Sales
      rowGroup.append('text')
        .attr('x', colWidths[0] + colWidths[1] + 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .text('$' + d.sales.toFixed(0).toLocaleString());

      // Quantity
      rowGroup.append('text')
        .attr('x', colWidths[0] + colWidths[1] + colWidths[2] + 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .text(d.quantity.toLocaleString());

      // Profit
      rowGroup.append('text')
        .attr('x', colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .attr('fill', d.profit >= 0 ? '#1f77b4' : '#d62728')
        .text('$' + d.profit.toFixed(0).toLocaleString());

      // Profit Ratio
      rowGroup.append('text')
        .attr('x', colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5)
        .attr('y', rowHeight / 2 + 4)
        .attr('font-size', '11px')
        .text((d.profitRatio * 100).toFixed(1) + '%');

      // Add bottom border for each row
      rowGroup.append('line')
        .attr('x1', 0)
        .attr('y1', rowHeight)
        .attr('x2', innerWidth)
        .attr('y2', rowHeight)
        .attr('stroke', '#eee')
        .attr('stroke-width', 0.5);
    });

  }, [data, width, height]);

  return (
    <div className="customer-overview">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default CustomerOverview;
