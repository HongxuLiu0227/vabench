import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DiscountOverviewData } from '../types/data';
import { formatCurrency, formatInteger, formatPercent } from '../utils/formatters';

interface DiscountOverviewProps {
  data: DiscountOverviewData[];
  width?: number;
  height?: number;
}

interface MeasureColumn {
  key: keyof DiscountOverviewData;
  label: string;
  format: (value: number) => string;
}

const MEASURE_COLUMNS: MeasureColumn[] = [
  { key: 'avgDiscount', label: 'Avg Discount', format: (v) => formatPercent(v / 100) },
  { key: 'sumProfit', label: 'Profit', format: formatCurrency },
  { key: 'profitRatio', label: 'Profit Ratio', format: (v) => formatPercent(v) },
  { key: 'sumQuantity', label: 'Quantity', format: formatInteger },
  { key: 'sumSales', label: 'Sales', format: formatCurrency },
];

export function DiscountOverview({ data, width = 400, height = 300 }: DiscountOverviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 20, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create title
    g.append('text')
      .attr('x', 0)
      .attr('y', -15)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .text('Discount Overview by Region');

    // Color scale for avg discount (diverging scale, reversed orange-blue)
    const colorScale = d3.scaleDiverging<string>()
      .domain([0, 0.2, 0.4])
      .interpolator(d3.interpolateRdBu)
      .unknown('#cccccc');

    const rowHeight = innerHeight / data.length;
    const colWidth = innerWidth / MEASURE_COLUMNS.length;

    // Create column headers
    MEASURE_COLUMNS.forEach((col, i) => {
      g.append('text')
        .attr('x', i * colWidth + colWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, sans-serif')
        .text(col.label);
    });

    // Create rows
    data.forEach((row, rowIndex) => {
      const y = rowIndex * rowHeight;

      // Region label
      g.append('text')
        .attr('x', -10)
        .attr('y', y + rowHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-family', 'Arial, sans-serif')
        .text(row.region);

      // Measure columns
      MEASURE_COLUMNS.forEach((col, colIndex) => {
        const x = colIndex * colWidth;
        const value = row[col.key] as number;

        // Background cell with color based on avg discount
        const cellColor = col.key === 'avgDiscount' ? colorScale(value) : '#ffffff';

        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', colWidth)
          .attr('height', rowHeight)
          .attr('fill', cellColor)
          .attr('stroke', '#e0e0e0')
          .attr('stroke-width', 1)
          .attr('rx', 2)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            setTooltip({
              visible: true,
              x: event.pageX + 10,
              y: event.pageY - 10,
              content: `${row.region}<br/><strong>${col.label}:</strong> ${col.format(value)}`,
            });
            d3.select(event.currentTarget).attr('stroke', '#666').attr('stroke-width', 2);
          })
          .on('mouseout', (event) => {
            setTooltip(prev => ({ ...prev, visible: false }));
            d3.select(event.currentTarget).attr('stroke', '#e0e0e0').attr('stroke-width', 1);
          });

        // Value text
        const textColor = col.key === 'avgDiscount' && value > 0.25 ? '#ffffff' : '#000000';
        g.append('text')
          .attr('x', x + colWidth / 2)
          .attr('y', y + rowHeight / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-family', 'Arial, sans-serif')
          .attr('fill', textColor)
          .text(col.format(value));
      });
    });
  }, [data, width, height]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
}
