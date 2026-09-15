import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { StudioAggregation } from '../types';
import { STUDIO_COLORS } from '../utils/constants';

interface AvgMoviePieProps {
  data: StudioAggregation[];
  selectedStudio: string | null;
  onStudioSelect: (studio: string | null) => void;
}

export function AvgMoviePie({ data, selectedStudio, onStudioSelect }: AvgMoviePieProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const updateSize = () => {
        const width = container.clientWidth;
        const height = Math.max(300, width * 0.75);
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
    const radius = Math.min(width, height) / 2.5;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    const pie = d3.pie<StudioAggregation>()
      .value(d => d.avgGross)
      .sort((a, b) => b.avgGross - a.avgGross);

    const arc = d3.arc<d3.PieArcDatum<StudioAggregation>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3.arc<d3.PieArcDatum<StudioAggregation>>()
      .innerRadius(0)
      .outerRadius(radius * 1.08);

    const arcs = pie(data);

    // Draw slices
    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => STUDIO_COLORS[d.data.studio] || STUDIO_COLORS.DEFAULT_COLOR)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('opacity', d => {
        if (selectedStudio === null) return 1;
        return d.data.studio === selectedStudio ? 1 : 0.3;
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        const newSelection = selectedStudio === d.data.studio ? null : d.data.studio;
        onStudioSelect(newSelection);
      })
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', hoverArc(d));
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc(d));
      });

    // Add legend in overlay position (top-left, per spec)
    // Legend zone: x_ratio=0.011, y_ratio=0.1688 (overlay position)
    const legendX = width * 0.011;
    const legendY = height * 0.1688;

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX},${legendY})`)
      .attr('aria-label', 'Chart legend showing studio colors');

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => STUDIO_COLORS[d.studio] || STUDIO_COLORS.DEFAULT_COLOR)
      .attr('rx', 2);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .text(item => item.studio)
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .attr('alignment-baseline', 'middle');

  }, [data, dimensions, selectedStudio, onStudioSelect]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 'normal',
        margin: '0 0 10px 0',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        Average by Studio
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
