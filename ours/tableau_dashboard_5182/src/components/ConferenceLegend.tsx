import React from 'react';
import * as d3 from 'd3';
import type { FightSongData } from '../types';
import './ConferenceLegend.css';

interface ConferenceLegendProps {
  data: FightSongData[];
}

const ConferenceLegend: React.FC<ConferenceLegendProps> = ({ data }) => {
  const conferences = React.useMemo(() => {
    return Array.from(new Set(data.map((d) => d.conference))).sort();
  }, [data]);

  const colorScale = React.useMemo(() => {
    return d3.scaleOrdinal(d3.schemeTableau10).domain(conferences);
  }, [conferences]);

  return (
    <div className="conference-legend">
      <div className="legend-title">Conference</div>
      <div className="legend-items">
        {conferences.map((conference) => (
          <div key={conference} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colorScale(conference) }}
            />
            <div className="legend-label">{conference}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConferenceLegend;
