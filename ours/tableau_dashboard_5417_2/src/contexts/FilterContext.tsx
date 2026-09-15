import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SelectionState, FilterContextType } from '../types';

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialSelection: SelectionState = {
  games: new Set<string>(),
  platforms: new Set<string>(),
  genres: new Set<string>()
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<SelectionState>(initialSelection);

  const setSelection = useCallback((newSelection: SelectionState) => {
    setSelectionState(newSelection);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(initialSelection);
  }, []);

  const isSelected = useCallback(
    (game: string, platform?: string): boolean => {
      const hasGameSelection = selection.games.size > 0;
      const hasPlatformSelection = selection.platforms.size > 0;

      // If nothing is selected, everything is visible
      if (!hasGameSelection && !hasPlatformSelection) {
        return true;
      }

      const gameMatch = !hasGameSelection || selection.games.has(game);
      const platformMatch = !hasPlatformSelection || !!(platform && selection.platforms.has(platform));

      return gameMatch && platformMatch;
    },
    [selection]
  );

  const toggleGame = useCallback(
    (game: string) => {
      setSelectionState((prev) => {
        const newGames = new Set(prev.games);
        if (newGames.has(game)) {
          newGames.delete(game);
        } else {
          newGames.add(game);
        }
        return { ...prev, games: newGames };
      });
    },
    []
  );

  const togglePlatform = useCallback(
    (platform: string) => {
      setSelectionState((prev) => {
        const newPlatforms = new Set(prev.platforms);
        if (newPlatforms.has(platform)) {
          newPlatforms.delete(platform);
        } else {
          newPlatforms.add(platform);
        }
        return { ...prev, platforms: newPlatforms };
      });
    },
    []
  );

  return (
    <FilterContext.Provider
      value={{
        selection,
        setSelection,
        clearSelection,
        isSelected,
        toggleGame,
        togglePlatform
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export function useFilter(): FilterContextType {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
