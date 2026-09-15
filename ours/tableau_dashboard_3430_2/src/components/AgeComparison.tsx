import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TripData } from '../types';
import { useFilters } from '../contexts/FilterContext';
import { filterData } from '../services/dataLoader';
import './Worksheet.css';

interface AgeComparisonProps {
  data: TripData[];
}

interface StackedDataItem extends Record<string, number | string> {
  ageGroup: string;
  Customer: number;
  Subscriber: number;
  total: number;
}

type StackedSeries = d3.Series<StackedDataItem, string>;

// Color mapping from Tableau spec
const COLORS = {
  'Customer': '#4e79a7',
  'Subscriber': '#f28e2b'
};

// Age group order from Tableau spec
const AGE_GROUP_ORDER = ['17-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71+'];

function AgeComparison({ data }: AgeComparisonProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter } = useFilters();
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth - 40,
            height: Math.max(300, parent.clientHeight - 100)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Filter data based on current filters
    const filteredData = filterData(data, filters);

    // Aggregate by ageGroup and usertype
    const aggregated = d3.rollup(
      filteredData,
      v => v.length,
      d => d.ageGroup,
      d => d.usertype
    );

    // Convert to stacked data structure
    const usertypes: Array<'Customer' | 'Subscriber'> = ['Customer', 'Subscriber'];
    const stackedData: StackedDataItem[] = AGE_GROUP_ORDER.map(ageGroup => {
      const row: StackedDataItem = { ageGroup, Customer: 0, Subscriber: 0, total: 0 };
      let total = 0;

      usertypes.forEach(usertype => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = aggregated.get(ageGroup)?.get(usertype as any) || 0;
        row[usertype] = count;
        total += count;
      });

      row.total = total;
      return row;
    }).filter(d => d.total > 0); // Remove age groups with no data

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(stackedData.map(d => d.ageGroup as string))
      .range([0, chartWidth])
      .padding(0.3);

    const maxY = d3.max(stackedData, d => d.total as number) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([chartHeight, 0])
      .nice();

    // Create stack
    const stack = d3.stack<StackedDataItem>()
      .keys(usertypes)
      .offset(d3.stackOffsetDiverging);

    const stackedSeries = stack(stackedData);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d3.format('~s'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis title
    g.append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .text('Number of Trips');

    // Draw stacked bars
    stackedSeries.forEach((series: StackedSeries) => {
      const usertype = series.key as 'Customer' | 'Subscriber';

      g.selectAll(`.bar-${usertype}`)
        .data(series)
        .enter()
        .append('rect')
        .attr('class', `bar bar-${usertype}`)
        .attr('x', (d) => xScale(d.data.ageGroup) || 0)
        .attr('y', (d) => {
          const y0 = yScale(d[0]);
          const y1 = yScale(d[1]);
          return Math.min(y0, y1);
        })
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => {
          const y0 = yScale(d[0]);
          const y1 = yScale(d[1]);
          return Math.abs(y1 - y0);
        })
        .attr('fill', COLORS[usertype])
        .style('cursor', 'pointer')
        .style('opacity', (d) => {
          // Highlight based on filters
          if (filters.usertype && filters.usertype !== usertype) {
            return 0.3;
          }
          if (filters.ageGroup && filters.ageGroup !== d.data.ageGroup) {
            return 0.3;
          }
          return 1;
        })
        .on('click', (_event, d) => {
          // Toggle filters
          const newUsertype = (filters.usertype === usertype) ? undefined : usertype;
          const newAgeGroup = (filters.ageGroup === d.data.ageGroup) ? undefined : d.data.ageGroup;

          setFilter('usertype', newUsertype);
          if (newUsertype === usertype) {
            setFilter('ageGroup', newAgeGroup);
          }
        })
        .append('title')
        .text((d) => {
          const value = d[1] - d[0];
          return `${d.data.ageGroup} - ${usertype}: ${value.toLocaleString()} trips`;
        });
    });

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${chartWidth / 2 - 50}, -15)`);

    usertypes.forEach((usertype, i) => {
      const legendItem = legend.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(${i * 100}, 0)`);

      legendItem.append('rect')
        .attr('class', 'legend-color')
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', COLORS[usertype as keyof typeof COLORS]);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 13)
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(usertype);
    });

  }, [data, filters, dimensions, setFilter]);

  return (
    <div className="worksheet">
      <h2 className="worksheet-title">Age Comparison</h2>
      <div className="worksheet-content">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}

export default AgeComparison;
