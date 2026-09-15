import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { RegionData, MeasureName } from '../services/dataLoader';
import { getProfitRatioColor, formatCurrency, formatNumber, formatPercentage } from '../utils/chartUtils';
import { useDashboard } from '../contexts/DashboardContext';

interface CustomerOverviewProps {
  data: RegionData[];
  width?: number;
  height?: number;
}

// Order of measures as specified in tableau_spec.json
const MEASURE_ORDER: MeasureName[] = [
  'Sales per Customer',
  'Sales',
  'Quantity',
  'Profit',
  'Profit Ratio',
];

const MEASURE_LABELS: Record<MeasureName, string> = {
  'Sales per Customer': 'Sales per Customer',
  'Sales': 'Sales',
  'Quantity': 'Quantity',
  'Profit': 'Profit',
  'Profit Ratio': 'Profit Ratio',
};

export function CustomerOverview({ data, width = 800, height = 200 }: CustomerOverviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state, setSelectedRegion } = useDashboard();

  // Prepare data for visualization
  const chartData = useMemo(() => {
    return data.map((region) => ({
      region: region.region,
      'Sales per Customer': region.salesPerCustomer,
      'Sales': region.sales,
      'Quantity': region.quantity,
      'Profit': region.profit,
      'Profit Ratio': region.profitRatio,
      customerCount: region.customerCount,
    }));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const rowHeight = innerHeight / chartData.length;
    const colWidth = innerWidth / MEASURE_ORDER.length;

    // Create row groups
    const rows = g
      .selectAll('.row')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d: any, i: number) => `translate(0,${i * rowHeight})`);

    // Region labels
    rows
      .append('text')
      .attr('class', 'region-label')
      .attr('x', -10)
      .attr('y', rowHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('cursor', 'pointer')
      .style('fill', (d: any) =>
        state.selectedRegion && state.selectedRegion !== d.region ? '#999' : '#000'
      )
      .text((d: any) => d.region)
      .on('click', (event: MouseEvent, d: any) => {
        event.stopPropagation();
        // Toggle selection
        if (state.selectedRegion === d.region) {
          setSelectedRegion(null);
        } else {
          setSelectedRegion(d.region);
        }
      });

    // Measure cells
    MEASURE_ORDER.forEach((measure, colIndex) => {
      const cellGroup = rows
        .append('g')
        .attr('class', `cell cell-${measure}`)
        .attr('transform', `translate(${colIndex * colWidth},0)`);

      // Cell background
      cellGroup
        .append('rect')
        .attr('class', 'cell-bg')
        .attr('x', 2)
        .attr('y', 2)
        .attr('width', colWidth - 4)
        .attr('height', rowHeight - 4)
        .attr('rx', 4)
        .attr('fill', (d: any) => getProfitRatioColor(d['Profit Ratio']))
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, d: any) => {
          event.stopPropagation();
          if (state.selectedRegion === d.region) {
            setSelectedRegion(null);
          } else {
            setSelectedRegion(d.region);
          }
        })
        .on('mouseover', function() {
          d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
        })
        .on('mouseout', function() {
          d3.select(this).attr('stroke', '#ccc').attr('stroke-width', 1);
        });

      // Cell value text
      cellGroup
        .append('text')
        .attr('x', colWidth / 2)
        .attr('y', rowHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .text((d: any) => {
          const value = d[measure];
          if (measure === 'Sales per Customer') return formatCurrency(value as number);
          if (measure === 'Sales') return formatCurrency(value as number);
          if (measure === 'Profit') return formatCurrency(value as number);
          if (measure === 'Quantity') return formatNumber(value as number);
          if (measure === 'Profit Ratio') return formatPercentage(value as number);
          return String(value);
        });
    });

    // Column headers
    MEASURE_ORDER.forEach((measure, colIndex) => {
      g.append('text')
        .attr('class', 'col-header')
        .attr('x', margin.left + colIndex * colWidth + colWidth / 2)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(MEASURE_LABELS[measure]);
    });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('z-index', '1000');

    rows.on('mouseover', function(event: MouseEvent, d: any) {
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.region}</div>
          <div>Customers: ${d.customerCount}</div>
          <div>Sales per Customer: ${formatCurrency(d['Sales per Customer'])}</div>
          <div>Sales: ${formatCurrency(d['Sales'])}</div>
          <div>Quantity: ${formatNumber(d['Quantity'])}</div>
          <div>Profit: ${formatCurrency(d['Profit'])}</div>
          <div>Profit Ratio: ${formatPercentage(d['Profit Ratio'])}</div>
        `);
    }).on('mousemove', function(event: MouseEvent) {
      tooltip
        .style('top', (event.pageY + 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    }).on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });

    return () => {
      tooltip.remove();
    };
  }, [chartData, width, height, state.selectedRegion, setSelectedRegion]);

  return (
    <div className="customer-overview" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
}
