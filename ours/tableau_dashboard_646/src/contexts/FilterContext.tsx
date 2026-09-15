import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

export interface FilterContextType extends FilterState {
  setGenres: (genres: string[]) => void;
  setPublishers: (publishers: string[]) => void;
  setPlatforms: (platforms: string[]) => void;
  setYears: (years: number[]) => void;
  setHighlightGenre: (genre: string | null) => void;
  resetFilters: () => void;
}

/* eslint-disable react-refresh/only-export-components */
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [highlightGenre, setHighlightGenre] = useState<string | null>(null);

  const resetFilters = useCallback(() => {
    setSelectedGenres([]);
    setSelectedPublishers([]);
    setSelectedPlatforms([]);
    setSelectedYears([]);
    setHighlightGenre(null);
  }, []);

  const setGenres = useCallback((genres: string[]) => {
    setSelectedGenres(genres);
  }, []);

  const setPublishers = useCallback((publishers: string[]) => {
    setSelectedPublishers(publishers);
  }, []);

  const setPlatforms = useCallback((platforms: string[]) => {
    setSelectedPlatforms(platforms);
  }, []);

  const setYears = useCallback((years: number[]) => {
    setSelectedYears(years);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        selectedGenres,
        selectedPublishers,
        selectedPlatforms,
        selectedYears,
        highlightGenre,
        setGenres,
        setPublishers,
        setPlatforms,
        setYears,
        setHighlightGenre,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
