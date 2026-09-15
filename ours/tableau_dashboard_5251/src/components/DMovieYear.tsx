import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { StudioYearAggregation } from '../types';
import { STUDIO_COLORS } from '../utils/constants';

interface DMovieYearProps {
  data: StudioYearAggregation[];
  selectedStudio: string | null;
}

export function DMovieYear({ data, selectedStudio }: DMovieYearProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const updateSize = () => {
        const width = container.clientWidth;
        const height = Math.max(500, width * 1.2);
        setDimensions({ width, height });
      };

      updateSize();
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Calculate dynamic left margin based on longest label
    const maxLabelLength = d3.max(data, d => `${d.studio} ${d.year}`.length) || 0;
    const estimatedLabelWidth = maxLabelLength * 6; // Approximate 6px per character
    const dynamicLeftMargin = Math.max(70, estimatedLabelWidth + 20);

    const margin = { top: 30, right: 80, bottom: 50, left: dynamicLeftMargin };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique combinations of studio and year
    const categories = data.map(d => `${d.studio}-${d.year}`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avgGross) || 0])
      .range([0, chartWidth])
      .nice();

    const y = d3.scaleBand()
      .domain(categories)
      .range([0, chartHeight])
      .padding(0.15);

    // Add X axis
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickFormat(d => {
        const value = d as number;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
        return `$${value}`;
      });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Add Y axis with custom labels showing Studio and Year
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(tick => {
        const parts = (tick as string).split('-');
        const studio = parts[0];
        const year = parts[1];
        return `${studio} ${year}`;
      }))
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Add axis title "Years"
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .text('Years')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'normal')
      .attr('text-anchor', 'middle');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(`${d.studio}-${d.year}`) || 0)
      .attr('width', d => x(d.avgGross))
      .attr('height', y.bandwidth())
      .attr('fill', d => STUDIO_COLORS[d.studio] || STUDIO_COLORS.DEFAULT_COLOR)
      .style('opacity', d => {
        if (selectedStudio === null) return 1;
        return d.studio === selectedStudio ? 1 : 0.3;
      })
      .attr('rx', 2);

    // Add value labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.avgGross) + 5)
      .attr('y', d => (y(`${d.studio}-${d.year}`) || 0) + y.bandwidth() / 2)
      .text(d => {
        if (d.avgGross >= 1e6) return `$${(d.avgGross / 1e6).toFixed(1)}M`;
        if (d.avgGross >= 1e3) return `$${(d.avgGross / 1e3).toFixed(1)}K`;
        return `$${d.avgGross.toFixed(0)}`;
      })
      .style('font-size', '10px')
      .style('font-family', 'sans-serif')
      .attr('alignment-baseline', 'middle')
      .style('opacity', d => {
        if (selectedStudio === null) return 1;
        return d.studio === selectedStudio ? 1 : 0.3;
      });

  }, [data, dimensions, selectedStudio]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 'normal',
        margin: '0 0 10px 0',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        Average by Studio and Year
      </h3>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}
