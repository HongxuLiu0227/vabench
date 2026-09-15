import type { ParsedGameData, GameMetrics, TimeSeriesPoint } from '../types';

/**
 * Aggregate data by game for table views
 * Sorts by total critics (descending) to match Tableau behavior
 */
export function aggregateByGame(data: ParsedGameData[]): GameMetrics[] {
  const gameMap = new Map<string, GameMetrics>();

  data.forEach((item) => {
    const existing = gameMap.get(item.game);
    if (existing) {
      // Aggregate critics
      existing.positiveCritics += item.positiveCritics;
      existing.neutralCritics += item.neutralCritics;
      existing.negativeCritics += item.negativeCritics;
      existing.totalCritics += item.totalCritics;

      // Aggregate users
      existing.positiveUsers += item.positiveUsers;
      existing.neutralUsers += item.neutralUsers;
      existing.negativeUsers += item.negativeUsers;
      existing.totalUsers += item.totalUsers;

      // Average scores (weighted by number of reviews)
      const totalReviews = existing.totalCritics + existing.totalUsers;
      if (totalReviews > 0) {
        existing.metascore = (existing.metascore * existing.totalCritics + item.metascore * item.totalCritics) / (existing.totalCritics + item.totalCritics);
        existing.userScore = (existing.userScore * existing.totalUsers + item.userScore * item.totalUsers) / (existing.totalUsers + item.totalUsers);
      }

      // Recalculate derived metrics
      existing.Calculation_652740522679025665 = existing.totalCritics > 0
        ? (existing.positiveCritics / existing.totalCritics) * 100
        : 0;
      existing.Calculation_652740522680942595 = existing.totalUsers > 0
        ? (existing.positiveUsers / existing.totalUsers) * 100
        : 0;
    } else {
      gameMap.set(item.game, {
        game: item.game,
        positiveCritics: item.positiveCritics,
        neutralCritics: item.neutralCritics,
        negativeCritics: item.negativeCritics,
        totalCritics: item.totalCritics,
        positiveUsers: item.positiveUsers,
        neutralUsers: item.neutralUsers,
        negativeUsers: item.negativeUsers,
        totalUsers: item.totalUsers,
        metascore: item.metascore,
        userScore: item.userScore,
        platform: item.platform,
        releaseDate: item.releaseDate,
        Calculation_652740522679025665: item.Calculation_652740522679025665,
        Calculation_652740522680942595: item.Calculation_652740522680942595
      });
    }
  });

  // Sort by total critics (descending) - this matches Tableau's default behavior
  return Array.from(gameMap.values()).sort((a, b) => b.totalCritics - a.totalCritics);
}

/**
 * Aggregate data by month for the line chart
 */
export function aggregateByMonth(data: ParsedGameData[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, TimeSeriesPoint>();

  data.forEach((item) => {
    const existing = monthMap.get(item.releaseMonth);
    if (existing) {
      existing.avgMetascore += item.metascore;
      existing.games.push(item.game);
    } else {
      // Create a readable month label
      const date = new Date(item.releaseMonth + '-01');
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      monthMap.set(item.releaseMonth, {
        month: item.releaseMonth,
        monthLabel,
        avgMetascore: item.metascore,
        games: [item.game]
      });
    }
  });

  // Calculate averages and sort by month
  const result = Array.from(monthMap.values()).map((point) => ({
    ...point,
    avgMetascore: point.avgMetascore / point.games.length
  }));

  return result.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get top N games by metric
 */
export function getTopGames(data: ParsedGameData[], metric: keyof ParsedGameData, limit: number = 10): GameMetrics[] {
  const aggregated = aggregateByGame(data);
  return aggregated
    .sort((a, b) => (b[metric as keyof GameMetrics] as number) - (a[metric as keyof GameMetrics] as number))
    .slice(0, limit);
}

/**
 * Filter data based on selected games and platforms
 */
export function filterData(
  data: ParsedGameData[],
  selectedGames: Set<string>,
  selectedPlatforms: Set<string>
): ParsedGameData[] {
  if (selectedGames.size === 0 && selectedPlatforms.size === 0) {
    return data;
  }

  return data.filter((item) => {
    const gameMatch = selectedGames.size === 0 || selectedGames.has(item.game);
    const platformMatch = selectedPlatforms.size === 0 || selectedPlatforms.has(item.platform);
    return gameMatch && platformMatch;
  });
}

/**
 * Get unique platforms from data
 */
export function getPlatforms(data: ParsedGameData[]): string[] {
  const platforms = new Set<string>();
  data.forEach((item) => platforms.add(item.platform));
  return Array.from(platforms).sort();
}

/**
 * Get unique genres from data
 */
export function getGenres(data: ParsedGameData[]): string[] {
  const genres = new Set<string>();
  data.forEach((item) => genres.add(item.genre));
  return Array.from(genres).sort();
}

/**
 * Calculate derived metric for critics (Calculation_652740522679025665)
 * This appears to be the percentage of positive reviews
 */
export function calculateCriticDerivedMetric(positive: number, total: number): number {
  return total > 0 ? (positive / total) * 100 : 0;
}

/**
 * Calculate derived metric for users (Calculation_652740522680942595)
 * This appears to be the percentage of positive reviews
 */
export function calculateUserDerivedMetric(positive: number, total: number): number {
  return total > 0 ? (positive / total) * 100 : 0;
}
