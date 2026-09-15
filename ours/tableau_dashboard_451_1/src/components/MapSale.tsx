import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { aggregateByState, formatCurrency, formatPercentage } from '../services/dataService';
import type { SalesData } from '../services/dataService';

interface MapSaleProps {
  data: SalesData[];
  highlightedRegion: string | null;
  onStateHover?: () => void;
}

interface USGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      name: string;
    };
    geometry: GeoJSON.GeometryObject;
  }>;
}

const MapSale: React.FC<MapSaleProps> = ({ data, highlightedRegion, onStateHover }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [usGeo, setUsGeo] = useState<USGeoJSON | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    // Fetch US states geometry
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then(us => {
        const geoData = feature(us, us.objects.states) as unknown as USGeoJSON;
        setUsGeo(geoData);
      })
      .catch(err => console.error('Error loading US geometry:', err));
  }, []);

  useEffect(() => {
    if (!usGeo || !svgRef.current || data.length === 0) return;

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = 750;
    const height = 480;

    // Aggregate data by state
    const stateData = aggregateByState(data);
    const stateDataMap = new Map(stateData.map(d => [d.State, d]));

    // Create projection
    const projection = geoAlbersUsa()
      .fitSize([width, height], usGeo);

    const path = d3.geoPath().projection(projection);

    // Create color scale for Sales
    const salesExtent = d3.extent(stateData, d => d.Sales) as [number, number];
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain(salesExtent);

    // Create main group
    const g = svg.append('g');

    // Draw states
    g.selectAll('path')
      .data(usGeo.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        // Try to match state name to find data
        const stateName = d.properties.name;
        const stateInfo = stateDataMap.get(stateName);
        if (stateInfo) {
          return colorScale(stateInfo.Sales);
        }
        return '#e0e0e0';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', d => {
        // Dim non-highlighted states when a region is highlighted
        if (highlightedRegion) {
          const stateName = d.properties.name;
          // Find which region this state belongs to
          const stateRecord = data.find(d => d.State === stateName);
          if (stateRecord && stateRecord.Region !== highlightedRegion) {
            return 0.2;
          }
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const stateName = d.properties.name;
        const stateInfo = stateDataMap.get(stateName);

        if (stateInfo) {
          const tooltipContent = `
            <strong>${stateName}</strong><br/>
            Sales: ${formatCurrency(stateInfo.Sales)}<br/>
            Profit: ${formatCurrency(stateInfo.Profit)}<br/>
            Profit Ratio: ${formatPercentage(stateInfo.ProfitRatio)}
          `;

          setTooltip({
            visible: true,
            x: event.pageX + 10,
            y: event.pageY + 10,
            content: tooltipContent
          });
        }

        // Call the hover callback
        if (onStateHover) {
          onStateHover();
        }
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY + 10
        }));
      })
      .on('mouseout', () => {
        setTooltip(prev => ({ ...prev, visible: false }));
        if (onStateHover) {
          onStateHover();
        }
      });

    // Add labels for states with data
    g.selectAll('text')
      .data(usGeo.features)
      .enter()
      .append('text')
      .attr('x', d => {
        const centroid = path.centroid(d);
        return centroid[0];
      })
      .attr('y', d => {
        const centroid = path.centroid(d);
        return centroid[1];
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'Arial')
      .attr('fill', '#333333')
      .attr('pointer-events', 'none')
      .text(d => {
        const stateName = d.properties.name;
        const stateInfo = stateDataMap.get(stateName);
        return stateInfo ? stateName : '';
      });

  }, [usGeo, data, highlightedRegion, onStateHover]);

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 750 480"
          style={{ display: 'block', backgroundColor: '#f8f8f8' }}
        />
      </div>
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#00ffc7',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Arial',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'pre-line'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default MapSale;
