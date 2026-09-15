import { useState, useEffect, useCallback } from 'react';
import {
  loadGameData,
  aggregatePlatformCritics,
  aggregatePlatformUsers,
  aggregateMetascoreByMonth,
  getPlatforms,
  getGames,
  filterData,
} from '../services/dataService';
import type { GameData, PlatformMetrics, MetascoreByMonth } from '../types';

export function useDashboardData() {
  const [allData, setAllData] = useState<GameData[]>([]);
  const [filteredData, setFilteredData] = useState<GameData[]>([]);
  const [platformCritics, setPlatformCritics] = useState<PlatformMetrics[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformMetrics[]>([]);
  const [metascoreByMonth, setMetascoreByMonth] = useState<MetascoreByMonth[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadGameData();
        setAllData(data);
        setFilteredData(data);
        setPlatforms(getPlatforms(data));
        setGames(getGames(data));

        // Initial aggregations
        setPlatformCritics(aggregatePlatformCritics(data));
        setPlatformUsers(aggregatePlatformUsers(data));
        setMetascoreByMonth(aggregateMetascoreByMonth(data));

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update filtered data and aggregations when filters change
  useEffect(() => {
    if (allData.length === 0) return;

    const filtered = filterData(allData, selectedPlatforms, selectedGames);
    setFilteredData(filtered);

    // Update aggregations based on filtered data
    setPlatformCritics(aggregatePlatformCritics(filtered));
    setPlatformUsers(aggregatePlatformUsers(filtered));
    setMetascoreByMonth(aggregateMetascoreByMonth(filtered));
  }, [allData, selectedPlatforms, selectedGames]);

  // Handle platform selection
  const handlePlatformToggle = useCallback((platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  }, []);

  // Handle game selection (for filtering)
  const handleGameSelect = useCallback((game: string | null) => {
    if (game === null) {
      setSelectedGames([]);
      setHoveredGame(null);
    } else {
      setSelectedGames([game]);
      setHoveredGame(game);
    }
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedPlatforms([]);
    setSelectedGames([]);
    setHoveredGame(null);
  }, []);

  return {
    allData,
    filteredData,
    platformCritics,
    platformUsers,
    metascoreByMonth,
    platforms,
    games,
    selectedPlatforms,
    selectedGames,
    hoveredGame,
    loading,
    error,
    handlePlatformToggle,
    handleGameSelect,
    clearFilters,
  };
}
