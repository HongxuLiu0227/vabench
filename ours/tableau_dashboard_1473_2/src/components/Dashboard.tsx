import { useState, useEffect, useMemo } from 'react';
import { useHighlight } from '../contexts/HighlightContext';
import { loadBikeTripData, processStationData } from '../services/dataService';
import type { BikeTripData } from '../types';
import VerticalRankedBarChart from './VerticalRankedBarChart';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<BikeTripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { highlightedStartStation, highlightedEndStation } = useHighlight();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadBikeTripData();
        setData(rawData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load bike trip data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data for each worksheet
  const topStartStations = useMemo(() => processStationData(data, true, true), [data]);
  const topEndStations = useMemo(() => processStationData(data, false, true), [data]);
  const bottomStartStations = useMemo(() => processStationData(data, true, false), [data]);
  const bottomEndStations = useMemo(() => processStationData(data, false, false), [data]);

  // Calculate highlighted stations set for each worksheet
  const topStartHighlighted = useMemo(() => {
    const set = new Set<string>();
    if (highlightedStartStation) {
      set.add(highlightedStartStation);
    }
    return set;
  }, [highlightedStartStation]);

  const topEndHighlighted = useMemo(() => {
    const set = new Set<string>();
    if (highlightedEndStation) {
      set.add(highlightedEndStation);
    }
    if (highlightedStartStation) {
      set.add(highlightedStartStation);
    }
    return set;
  }, [highlightedEndStation, highlightedStartStation]);

  const bottomStartHighlighted = useMemo(() => {
    const set = new Set<string>();
    if (highlightedStartStation) {
      set.add(highlightedStartStation);
    }
    return set;
  }, [highlightedStartStation]);

  const bottomEndHighlighted = useMemo(() => {
    const set = new Set<string>();
    if (highlightedEndStation) {
      set.add(highlightedEndStation);
    }
    if (highlightedStartStation) {
      set.add(highlightedStartStation);
    }
    return set;
  }, [highlightedEndStation, highlightedStartStation]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">Loading bike trip data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="worksheet-wrapper">
          <VerticalRankedBarChart
            title="Top 10 Stations - Start"
            data={topStartStations}
            isTop={true}
            isStart={true}
            highlightedStations={topStartHighlighted}
          />
        </div>
        <div className="worksheet-wrapper">
          <VerticalRankedBarChart
            title="Top 10 Stations - End"
            data={topEndStations}
            isTop={true}
            isStart={false}
            highlightedStations={topEndHighlighted}
          />
        </div>
        <div className="worksheet-wrapper">
          <VerticalRankedBarChart
            title="Bottom 10 Stations - Start"
            data={bottomStartStations}
            isTop={false}
            isStart={true}
            highlightedStations={bottomStartHighlighted}
          />
        </div>
        <div className="worksheet-wrapper">
          <VerticalRankedBarChart
            title="Bottom 10 Stations - End"
            data={bottomEndStations}
            isTop={false}
            isStart={false}
            highlightedStations={bottomEndHighlighted}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
