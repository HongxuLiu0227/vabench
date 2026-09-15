import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../hooks/useDashboard';
import { STATE_COLORS } from '../types/data';
import { filterByStates } from '../services/dataLoader';

interface MapChartProps {
  width?: number;
  height?: number;
}

interface TooltipContent {
  providerName: string;
  medicarePayments: number;
  totalPayments: number;
  x: number;
  y: number;
}

export const MapChart: React.FC<MapChartProps> = ({ width = 800, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, selectedStates, selectedProvider, setSelectedProvider } = useDashboard();
  const [tooltip, setTooltip] = useState<TooltipContent | null>(null);

  // Filter data by selected states
  const filteredData = filterByStates(data, selectedStates);

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create projection for US map
    const projection = d3.geoMercator()
      .center([-95, 38])
      .scale(width * 1.2)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create simplified US state boundaries (using a simple outline)
    // For a production app, you'd load actual GeoJSON
    const usOutline: GeoJSON.GeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          coordinates: [[
            [-125, 25], [-66, 25], [-66, 50], [-125, 50], [-125, 25]
          ]]
        }
      ]
    };

    // Draw US outline
    svg.append('path')
      .datum(usOutline)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('d', path);

    // Create scales for circle size
    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(filteredData, d => d.totalDischarges) as [number, number])
      .range([3, 15]);

    // Draw provider circles
    svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[0] : 0;
      })
      .attr('cy', d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[1] : 0;
      })
      .attr('r', d => sizeScale(d.totalDischarges))
      .attr('fill', d => STATE_COLORS[d.providerState] || '#ccc')
      .attr('fill-opacity', d =>
        selectedProvider && d.providerId === selectedProvider.providerId ? 1 : 0.6
      )
      .attr('stroke', d =>
        selectedProvider && d.providerId === selectedProvider.providerId ? '#000' : 'none'
      )
      .attr('stroke-width', d =>
        selectedProvider && d.providerId === selectedProvider.providerId ? 2 : 0
      )
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle selection: if clicking the same provider, deselect it
        if (selectedProvider && selectedProvider.providerId === d.providerId) {
          setSelectedProvider(null);
        } else {
          setSelectedProvider(d);
        }
      })
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, svg.node() as SVGSVGElement);
        setTooltip({
          providerName: d.providerName,
          medicarePayments: d.averageMedicarePayments,
          totalPayments: d.averageTotalPayments,
          x,
          y
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Click on background to clear selection
    svg.on('click', () => {
      setSelectedProvider(null);
    });

  }, [filteredData, width, height, selectedProvider, setSelectedProvider]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ddd', backgroundColor: '#fafafa' }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.providerName}
          </div>
          <div>Avg Medicare Payments: ${tooltip.medicarePayments.toFixed(2)}</div>
          <div>Avg Total Payments: ${tooltip.totalPayments.toFixed(2)}</div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '11px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>
          Provider State
        </div>
        {Array.from(selectedStates).sort().map(state => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: STATE_COLORS[state] || '#ccc',
                marginRight: '6px',
                border: '1px solid #999',
              }}
            />
            <span>{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
