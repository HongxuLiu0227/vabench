import React from 'react';
import { VOTE_DIRECTION_COLORS, VOTE_DIRECTION_LABELS } from '../types';

interface VoteDirectionLegendProps {
  className?: string;
}

export const VoteDirectionLegend: React.FC<VoteDirectionLegendProps> = ({ className = '' }) => {
  return (
    <div className={`vote-direction-legend ${className}`}>
      <div className="legend-title">Vote Direction</div>
      {[0, 1, 2, 3].map((direction) => (
        <div key={direction} className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: VOTE_DIRECTION_COLORS[direction as keyof typeof VOTE_DIRECTION_COLORS] }}
          />
          <span className="legend-label">{VOTE_DIRECTION_LABELS[direction as keyof typeof VOTE_DIRECTION_LABELS]}</span>
        </div>
      ))}
    </div>
  );
};
