import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { CareerVotesData } from '../types';
import { VOTE_DIRECTION_COLORS } from '../types';
import type { VoteDirection } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet4Props {
  data: CareerVotesData[];
  width?: number;
  height?: number;
}

export const Sheet4: React.FC<Sheet4Props> = ({
  data,
  width = 1200,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlight, setHighlight, clearHighlight } = useFilters();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 80, left: 200 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Group by justiceName and term, then sum votes by direction
    const groupedData = d3.groups(data, (d) => `${d.justiceName}-${d.term}`);

    // Create composite category labels
    const categoryLabels: string[] = [];
    const categoryMap = new Map<string, { justiceName: string; term: number; totalCount: number }>();

    groupedData.forEach(([key, values]) => {
      const totalCount = d3.sum(values, (d) => d.count);
      const justiceName = values[0].justiceName;
      const term = values[0].term;

      categoryLabels.push(key);
      categoryMap.set(key, { justiceName, term, totalCount });
    });

    // Sort categories by total count (descending for ranked horizontal bars)
    const sortedCategories = categoryLabels.sort((a, b) => {
      const countA = categoryMap.get(a)!.totalCount;
      const countB = categoryMap.get(b)!.totalCount;
      return d3.descending(countA, countB);
    });

    // Get unique vote directions
    const voteDirections = Array.from(new Set(data.map((d) => d.vote_direction))) as VoteDirection[];

    // Calculate max X value
    const maxX = d3.max(data, (d) => d.count) || 0;

    // Create scales
    const y = d3.scaleBand()
      .domain(sortedCategories)
      .range([0, chartHeight])
      .padding(0.1);

    const x = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, chartWidth])
      .nice();

    const color = d3.scaleOrdinal<VoteDirection, string>()
      .domain(voteDirections)
      .range(voteDirections.map(d => VOTE_DIRECTION_COLORS[d]));

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stack the data by vote direction
    const stack = d3.stack<Record<string, any>, VoteDirection>()
      .keys(voteDirections)
      .offset(d3.stackOffsetDiverging);

    // Prepare stacked data
    const stackedData = sortedCategories.map((category) => {
      const obj: Record<string, any> = { category };
      voteDirections.forEach((dir) => {
        const found = data.find((d) => d.justiceName === categoryMap.get(category)!.justiceName && d.term === categoryMap.get(category)!.term && d.vote_direction === dir);
        obj[dir] = found?.count || 0;
      });
      return obj;
    });

    const layers = stack(stackedData);

    // Draw stacked bars
    g.selectAll('g.layer')
      .data(layers)
      .join('g')
      .attr('fill', (d) => color(d.key)!)
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('y', (d) => y(d.data.category)!)
      .attr('x', (d) => x(d[0])!)
      .attr('width', (d) => Math.max(0, x(d[1])! - x(d[0])!))
      .attr('height', y.bandwidth())
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('opacity', (d) => {
        if (highlight.justiceName && highlight.voteDirection !== null) {
          const stackKey = layers.find((layer) => layer.includes(d))?.key;
          const categoryData = categoryMap.get(d.data.category);
          const isSelected = categoryData?.justiceName === highlight.justiceName;
          return isSelected && stackKey === highlight.voteDirection ? 1 : 0.2;
        }
        return 1;
      })
      .on('click', (_event, d) => {
        const stackKey = layers.find((layer) => layer.includes(d))?.key;
        const categoryData = categoryMap.get(d.data.category);
        if (categoryData) {
          if (highlight.justiceName === categoryData.justiceName && highlight.voteDirection === stackKey) {
            clearHighlight();
          } else {
            setHighlight({
              justiceName: categoryData.justiceName,
              voteDirection: stackKey as VoteDirection | null,
              issueArea: null,
              caseId: null,
              term: categoryData.term,
            });
          }
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('cursor', 'pointer').style('opacity', 0.8);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this).style('opacity', () => {
          if (highlight.justiceName && highlight.voteDirection !== null) {
            const stackKey = layers.find((layer) => layer.includes(d))?.key;
            const categoryData = categoryMap.get(d.data.category);
            const isSelected = categoryData?.justiceName === highlight.justiceName;
            return isSelected && stackKey === highlight.voteDirection ? 1 : 0.2;
          }
          return 1;
        });
      });

    // Add value labels on bars
    layers.forEach((layer) => {
      g.selectAll(`.label-${layer.key}`)
        .data(layer)
        .join('text')
        .attr('class', `label-${layer.key}`)
        .attr('y', (d) => y(d.data.category)! + y.bandwidth() / 2)
        .attr('x', (d) => (x(d[0])! + x(d[1])!) / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .text((d) => {
          const value = d[1] - d[0];
          return value > 10 ? value.toString() : '';
        });
    });

    // Y axis with category labels
    g.append('g')
      .call(d3.axisLeft(y).tickFormat((d) => {
        const categoryData = categoryMap.get(d);
        if (categoryData) {
          return `${categoryData.justiceName} (${categoryData.term})`;
        }
        return d;
      }))
      .selectAll('text')
      .style('font-size', '11px')
      .style('text-anchor', 'end');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('dy', '0.35em');

    // X axis title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Votes');

    // Y axis title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -160)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Year');

    // Chart title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Total Career Votes to Date');

  }, [data, width, height, highlight, setHighlight, clearHighlight]);

  return (
    <div className="sheet4">
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};
