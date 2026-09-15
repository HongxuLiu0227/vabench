import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedSalesBySegment } from '../types';

interface SalesBySegmentProps {
  data: AggregatedSalesBySegment[];
  selectedSegment: string | null;
  onSegmentSelect: (segment: string | null) => void;
  width?: number;
  height?: number;
}

const SEGMENT_COLORS: Record<string, string> = {
  Consumer: '#4e79a7',
  'Home Office': '#59a14f',
  Corporate: '#f28e2b',
};

export default function SalesBySegment({
  data,
  selectedSegment,
  onSegmentSelect,
  width = 390,
  height = 415,
}: SalesBySegmentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.5;

    const pie = d3
      .pie<AggregatedSalesBySegment>()
      .value((d) => d.Sales)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<AggregatedSalesBySegment>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3
      .arc<d3.PieArcDatum<AggregatedSalesBySegment>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    g
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => SEGMENT_COLORS[d.data.Segment] || '#cccccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', '2px')
      .style('opacity', (d) => {
        if (selectedSegment && selectedSegment !== d.data.Segment) {
          return 0.3;
        }
        if (hoveredSegment && hoveredSegment !== d.data.Segment) {
          return 0.5;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredSegment(d.data.Segment);
        d3.select(event.currentTarget).attr('d', arcHover(d));
      })
      .on('mouseout', (event) => {
        setHoveredSegment(null);
        const datum = d3.select(event.currentTarget).datum() as d3.PieArcDatum<AggregatedSalesBySegment>;
        d3.select(event.currentTarget).attr('d', arc(datum));
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        onSegmentSelect(selectedSegment === d.data.Segment ? null : d.data.Segment);
      });

    // Add labels
    g.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text((d) => {
        const percentage = d.data.Percentage;
        return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
      });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    data.forEach((d, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', SEGMENT_COLORS[d.Segment] || '#cccccc')
        .attr('rx', 2);

      legendRow
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('font-size', '11px')
        .attr('fill', '#333')
        .text(d.Segment);
    });
  }, [data, selectedSegment, hoveredSegment, width, height, onSegmentSelect]);

  return (
    <div
      style={{ width, height }}
      onClick={(e) => {
        e.stopPropagation();
        onSegmentSelect(null);
      }}
    >
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
