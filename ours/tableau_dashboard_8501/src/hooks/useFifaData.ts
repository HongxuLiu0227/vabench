import { useState, useEffect } from 'react';
import type { PlayerData, PositionStats, SelectionState } from '../types';
import { loadData, aggregateByPosition, filterByPosition } from '../services/dataService';

export const useFifaData = () => {
  const [data, setData] = useState<PlayerData[]>([]);
  const [positionStats, setPositionStats] = useState<PositionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>(null);
  const [filteredData, setFilteredData] = useState<PlayerData[]>([]);
  const [filteredStats, setFilteredStats] = useState<PositionStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await loadData();
        setData(rawData);
        const stats = aggregateByPosition(rawData);
        setPositionStats(stats);
        setFilteredData(rawData);
        setFilteredStats(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle selection changes with auto-clear behavior
  const handleSelect = (worksheet: string, position: string) => {
    // If clicking the same selection, clear it (auto-clear behavior)
    if (selection?.worksheet === worksheet && selection?.position === position) {
      setSelection(null);
      setFilteredData(data);
      setFilteredStats(positionStats);
    } else {
      // Apply new filter
      setSelection({ worksheet, position });
      const filtered = filterByPosition(data, position);
      setFilteredData(filtered);
      setFilteredStats(aggregateByPosition(filtered));
    }
  };

  const clearSelection = () => {
    setSelection(null);
    setFilteredData(data);
    setFilteredStats(positionStats);
  };

  return {
    data,
    positionStats,
    filteredData,
    filteredStats,
    loading,
    error,
    selection,
    handleSelect,
    clearSelection,
  };
};
