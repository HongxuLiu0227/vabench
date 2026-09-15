import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { AggregatedVoteData } from '../types';
import { VOTE_DIRECTION_COLORS } from '../types';
import type { VoteDirection } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet1Props {
  data: AggregatedVoteData[];
  width?: number;
  height?: number;
}

export const Sheet1: React.FC<Sheet1Props> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlight, setHighlight, clearHighlight } = useFilters();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const groupedData = new Map<string, number>();
    data.forEach((d) => {
      groupedData.set(d.justiceName, (groupedData.get(d.justiceName) || 0) + d.count);
    });

    const sortedJustices = Array.from(groupedData.entries())
      .sort((a, b) => d3.descending(a[1], b[1]))
      .map((d) => d[0]);

    const x = d3.scaleBand().domain(sortedJustices).range([0, chartWidth]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count) || 0]).range([chartHeight, 0]).nice();

    const color = d3.scaleOrdinal<VoteDirection, string>()
      .domain([0, 1, 2, 3])
      .range([VOTE_DIRECTION_COLORS[0], VOTE_DIRECTION_COLORS[1], VOTE_DIRECTION_COLORS[2], VOTE_DIRECTION_COLORS[3]]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const stackedData: Array<{ justiceName: string } & Record<VoteDirection, number>> = [];

    sortedJustices.forEach((justiceName) => {
      const item: { justiceName: string } & Record<VoteDirection, number> = { justiceName: justiceName } as any;
      [0, 1, 2, 3].forEach((dir) => {
        const found = data.find((d) => d.justiceName === justiceName && d.vote_direction === dir);
        (item as any)[dir] = found?.count || 0;
      });
      stackedData.push(item);
    });

    const stack = d3.stack<Record<string, any>, VoteDirection>()
      .keys([0, 1, 2, 3] as VoteDirection[])
      .offset(d3.stackOffsetDiverging);

    const layers = stack(stackedData);

    g.selectAll('g.layer')
      .data(layers)
      .join('g')
      .attr('fill', (d) => color(d.key)!)
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => x(d.data.justiceName)!)
      .attr('y', (d) => y(d[1])!)
      .attr('height', (d) => Math.max(0, y(d[0])! - y(d[1])!))
      .attr('width', x.bandwidth())
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('opacity', (d) => {
        if (highlight.justiceName && highlight.voteDirection !== null) {
          const stackKey = layers.find((layer) => layer.includes(d))?.key;
          const isSelected = d.data.justiceName === highlight.justiceName;
          return isSelected && stackKey === highlight.voteDirection ? 1 : 0.2;
        }
        return 1;
      })
      .on('click', (_event, d) => {
        const stackKey = layers.find((layer) => layer.includes(d))?.key;
        if (highlight.justiceName === d.data.justiceName && highlight.voteDirection === stackKey) {
          clearHighlight();
        } else {
          setHighlight({
            justiceName: d.data.justiceName,
            voteDirection: stackKey as VoteDirection | null,
            issueArea: null,
            caseId: null,
            term: null,
          });
        }
      })
      .on('mouseover', function () {
        d3.select(this).attr('cursor', 'pointer').style('opacity', 0.8);
      })
      .on('mouseout', function (_event, d) {
        d3.select(this).style('opacity', () => {
          if (highlight.justiceName && highlight.voteDirection !== null) {
            const stackKey = layers.find((layer) => layer.includes(d))?.key;
            const isSelected = d.data.justiceName === highlight.justiceName;
            return isSelected && stackKey === highlight.voteDirection ? 1 : 0.2;
          }
          return 1;
        });
      });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('dy', '0.35em');

    g.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .selectAll('text')
      .style('font-size', '11px');

    layers.forEach((layer) => {
      g.selectAll(`.label-${layer.key}`)
        .data(layer)
        .join('text')
        .attr('class', `label-${layer.key}`)
        .attr('x', (d) => x(d.data.justiceName)! + x.bandwidth() / 2)
        .attr('y', (d) => (y(d[0])! + y(d[1])!) / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .text((d) => {
          const value = d[1] - d[0];
          return value > 0 ? value.toString() : '';
        });
    });
  }, [data, width, height, highlight, setHighlight, clearHighlight]);

  return (
    <div className="sheet1">
      <h3 className="sheet-title">SCOTUS Votes 1991 - 2017</h3>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};
