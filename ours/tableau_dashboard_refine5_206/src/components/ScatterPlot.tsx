import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedSalesRecord } from '../services/dataLoader';

interface ScatterPlotProps {
  data: ParsedSalesRecord[];
  title: string;
  width?: number;
  height?: number;
}

interface ScatterDataPoint {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export function ScatterPlot({ data, title, width = 400, height = 300 }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<ScatterDataPoint | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Aggregate data by product
    const aggregation = new Map<string, { sales: number; profit: number; quantity: number }>();
    data.forEach((record) => {
      const current = aggregation.get(record.productName) || { sales: 0, profit: 0, quantity: 0 };
      aggregation.set(record.productName, {
        sales: current.sales + record.sales,
        profit: current.profit + record.profit,
        quantity: current.quantity + record.quantity,
      });
    });

    const chartData: ScatterDataPoint[] = Array.from(aggregation.entries()).map(([productName, values]) => ({
      productName,
      sales: values.sales,
      profit: values.profit,
      quantity: values.quantity,
    }));

    if (chartData.length === 0) return;

    // Set up dimensions with margins
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(chartData, (d) => d.profit) as [number, number])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(chartData, (d) => d.quantity) || 0])
      .range([4, 20]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Profit');

    // Create circles
    g.selectAll('.circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', '#1f77b4')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget)
          .attr('fill', '#ff7f0e')
          .attr('fill-opacity', 0.8)
          .attr('stroke', '#ff7f0e');
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget)
          .attr('fill', '#1f77b4')
          .attr('fill-opacity', 0.6)
          .attr('stroke', '#1f77b4');
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, title, width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {hoveredData && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '12px',
            zIndex: 10,
            maxWidth: '250px',
            wordWrap: 'break-word',
          }}
        >
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
            {hoveredData.productName.length > 30
              ? hoveredData.productName.substring(0, 30) + '...'
              : hoveredData.productName}
          </div>
          <div>
            <strong>Sales:</strong> ${hoveredData.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div>
            <strong>Profit:</strong> ${hoveredData.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div>
            <strong>Quantity:</strong> {hoveredData.quantity}
          </div>
        </div>
      )}
    </div>
  );
}
