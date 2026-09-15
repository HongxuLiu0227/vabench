import React, { useState, useCallback } from 'react';
import { PeakHoursTripStart } from './PeakHoursTripStart';
import { PeakHoursTripEnd } from './PeakHoursTripEnd';

/**
 * Dashboard component implementing Tableau spec:
 * - Dashboard: Dashboard-Start&End time
 * - Worksheets: Peak hours for trip start, Peak hours for trip end
 * - Layout: Vertical stack with proper zone positioning
 * - Interactions: Hover highlight with auto-clear
 */
export const Dashboard: React.FC = () => {
  // State for highlighted hours across both charts
  const [highlightedHours, setHighlightedHours] = useState<number[]>([]);

  // Handle hover from trip start chart
  const handleTripStartHover = useCallback((hour: number | null) => {
    if (hour !== null) {
      setHighlightedHours([hour]);
    } else {
      // Auto-clear on mouse out (as per Tableau spec)
      setHighlightedHours([]);
    }
  }, []);

  // Handle hover from trip end chart
  const handleTripEndHover = useCallback((hour: number | null) => {
    if (hour !== null) {
      setHighlightedHours([hour]);
    } else {
      // Auto-clear on mouse out (as per Tableau spec)
      setHighlightedHours([]);
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Peak hours for trip start - top zone */}
      <div
        style={{
          flex: '0 0 auto',
          width: '100%',
          height: '48%',
          position: 'relative'
        }}
      >
        <PeakHoursTripStart
          highlightedHours={highlightedHours}
          onHover={handleTripStartHover}
        />
      </div>

      {/* Peak hours for trip end - bottom zone */}
      <div
        style={{
          flex: '0 0 auto',
          width: '100%',
          height: '48%',
          position: 'relative'
        }}
      >
        <PeakHoursTripEnd
          highlightedHours={highlightedHours}
          onHover={handleTripEndHover}
        />
      </div>
    </div>
  );
};
