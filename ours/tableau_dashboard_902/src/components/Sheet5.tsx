import { useMemo, useRef, useEffect } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import * as d3 from 'd3';
import type { CampaignData } from '../types/data';
import { CHANNEL_COLORS } from '../types/data';
import { useFilters } from '../hooks/useFilters';

interface Sheet5Props {
  data: CampaignData[];
}

/**
 * Sheet 5: "Кампании" (Campaigns)
 * Horizontal bar chart showing campaigns by channel
 * - Rows: campaign
 * - Length/Value: users_count
 * - Color: channel
 * - Sorting: descending by users_count
 */
export function Sheet5({ data }: Sheet5Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setCampaignFilter } = useFilters();

  // Calculate dimensions based on zone aspect ratio (0.6153)
  const width = 370;
  const height = 600;

  // Margins for axis labels
  const margin = useMemo(() => ({ top: 20, right: 60, bottom: 40, left: 80 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Aggregate data by campaign (sum across channels)
  const campaignData = useMemo(() => {
    const campaignMap = new Map<string, { total: number; channels: CampaignData[] }>();
    data.forEach((d) => {
      if (!campaignMap.has(d.campaign)) {
        campaignMap.set(d.campaign, { total: 0, channels: [] });
      }
      const entry = campaignMap.get(d.campaign)!;
      entry.total += d.users_count;
      entry.channels.push(d);
    });
    return Array.from(campaignMap.entries())
      .map(([campaign, { total, channels }]) => ({
        campaign,
        total,
        channels,
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  // Create x scale (value)
  const xScale = useMemo(() => {
    const maxUsers = max(campaignData, (d) => d.total) || 1;
    return scaleLinear()
      .domain([0, maxUsers * 1.1]) // Add 10% padding
      .range([0, innerWidth]);
  }, [campaignData, innerWidth]);

  // Create y scale (categories)
  const yScale = useMemo(() => {
    return scaleBand()
      .domain(campaignData.map((d) => d.campaign))
      .range([0, innerHeight])
      .padding(0.2);
  }, [campaignData, innerHeight]);

  useEffect(() => {
    if (!svgRef.current || campaignData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Add x axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => d.toString());
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('font-size', '11px');

    // Add y axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      // Truncate long campaign names if needed
      const str = d as string;
      return str.length > 12 ? str.substring(0, 9) + '...' : str;
    });
    g.append('g')
      .call(yAxis)
      .attr('font-size', '11px');

    // Draw bars for each campaign
    campaignData.forEach((d) => {
      const y = yScale(d.campaign)!;
      const barHeight = yScale.bandwidth();

      // Group channels by campaign - draw stacked or side-by-side bars
      let xOffset = 0;
      d.channels.forEach((channel) => {
        const barWidth = xScale(channel.users_count);
        const color = CHANNEL_COLORS[channel.channel] || '#888';

        // Add bar segment
        g.append('rect')
          .attr('x', xOffset)
          .attr('y', y)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('fill', color)
          .attr('opacity', 0.85)
          .attr('cursor', 'pointer')
          .on('click', (event: MouseEvent) => {
            event.stopPropagation();
            // Toggle filter: if already selected, clear; otherwise select
            if (filters.campaign === d.campaign) {
              setCampaignFilter(null);
            } else {
              setCampaignFilter(d.campaign);
            }
          })
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('opacity', 1);
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('opacity', 0.85);
          });

        xOffset += barWidth;
      });

      // Add value label at end of bar
      g.append('text')
        .attr('x', xOffset + 5)
        .attr('y', y + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .text(d.total.toLocaleString());
    });
  }, [campaignData, xScale, yScale, innerWidth, innerHeight, margin, filters.campaign, setCampaignFilter]);

  if (campaignData.length === 0) {
    return (
      <div className="worksheet-container" style={{ width, height }}>
        <h3 className="worksheet-title">Кампании</h3>
        <div className="worksheet-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: height - 40 }}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet-container" style={{ width, height }}>
      <h3 className="worksheet-title">Кампании</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height - 40}
        style={{ overflow: 'visible' }}
      />
      <style>{`
        .worksheet-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 8px;
          box-sizing: border-box;
        }
        .worksheet-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </div>
  );
}
