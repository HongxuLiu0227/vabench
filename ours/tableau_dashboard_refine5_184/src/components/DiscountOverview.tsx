import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { max } from 'd3-array';
import { interpolateRgb } from 'd3-interpolate';
import type { RegionAggregation } from '../types/data';

interface DiscountOverviewProps {
  data: RegionAggregation[];
  width: number;
  height: number;
}

type MeasureKey = keyof Pick<
  RegionAggregation,
  'avgDiscount' | 'sumProfit' | 'sumShippingCost' | 'sumQuantity' | 'sumSales' | 'countDistinctCustomers'
>;

interface MeasureData {
  region: string;
  measureName: string;
  value: number;
  avgDiscount: number;
}

const DiscountOverview: React.FC<DiscountOverviewProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const margin = useMemo(() => ({ top: 50, right: 120, bottom: 50, left: 80 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Define measures in the order specified by manual_sort
  const measureConfigs: { key: MeasureKey; name: string; format: string }[] = useMemo(() => [
    { key: 'avgDiscount', name: 'AVG(Discount)', format: '.2f' },
    { key: 'sumProfit', name: 'SUM(Profit)', format: ',.0f' },
    { key: 'sumShippingCost', name: 'SUM(Shipping Cost)', format: ',.0f' },
    { key: 'sumQuantity', name: 'SUM(Quantity)', format: ',.0f' },
    { key: 'sumSales', name: 'SUM(Sales)', format: ',.0f' },
    { key: 'countDistinctCustomers', name: 'COUNTD(Customer Name)', format: ',.0f' },
  ], []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add worksheet title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('font-family', 'sans-serif')
      .text('Discount Overview by Region');

    // Transform data into measure-value format
    const measureData: MeasureData[] = [];
    data.forEach((region) => {
      measureConfigs.forEach((config) => {
        measureData.push({
          region: region.region,
          measureName: config.name,
          value: region[config.key] as number,
          avgDiscount: region.avgDiscount,
        });
      });
    });

    // Create scales
    const maxValue = max(measureData, (d) => d.value) || 0;
    const xScale = d3Scale
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, innerWidth])
      .nice();

    const yScale = d3Scale
      .scaleBand()
      .domain(data.map((d) => d.region))
      .range([0, innerHeight])
      .padding(0.3);

    // Group scale for positioning bars within each region
    const groupScale = d3Scale
      .scaleBand()
      .domain(measureConfigs.map((m) => m.name))
      .range([0, yScale.bandwidth()])
      .padding(0.1);

    // Color scale - orange blue diverging, reversed, based on discount (0.0 to 0.4)
    const colorScale = d3Scale
      .scaleSequential()
      .domain([0.4, 0.0]) // Reversed: higher discount = orange, lower = blue
      .interpolator(interpolateRgb('#f46d43', '#4575b4'));

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    const xAxis = axisBottom(xScale).ticks(5);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis (regions)
    const yAxis = axisLeft(yScale);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add bars
    g.selectAll('g.region-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'region-group')
      .attr('transform', (d) => `translate(0,${yScale(d.region) || 0})`)
      .selectAll('rect')
      .data((region) =>
        measureConfigs.map((config) => ({
          region: region.region,
          measureName: config.name,
          value: region[config.key] as number,
          avgDiscount: region.avgDiscount,
        }))
      )
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => groupScale(d.measureName) || 0)
      .attr('width', (d) => xScale(d.value))
      .attr('height', groupScale.bandwidth())
      .attr('fill', (d) => colorScale(Math.min(Math.max(d.avgDiscount, 0), 0.4)))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        const config = measureConfigs.find((m) => m.name === d.measureName);
        const formatter = format(config?.format || ',.0f');
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <strong>Region: ${d.region}</strong><br/>
            ${d.measureName}: ${formatter(d.value)}
          `,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Add legend for measures
    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    measureConfigs.forEach((config, i) => {
      legendGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', '#666');

      legendGroup
        .append('text')
        .attr('x', 18)
        .attr('y', i * 20 + 10)
        .text(config.name)
        .style('font-size', '11px')
        .attr('alignment-baseline', 'middle');
    });
  }, [data, width, height, innerWidth, innerHeight, margin, measureConfigs]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', backgroundColor: '#ffffff' }}
      />
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
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default DiscountOverview;
