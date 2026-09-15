import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { FilterState, HighlightState, VoteDirection, IssueArea } from '../types';
import { DEFAULT_JUSTICE_FILTERS } from '../types';

interface FilterContextType {
  filters: FilterState;
  highlight: HighlightState;
  setIssueAreas: (areas: Set<IssueArea>) => void;
  setJusticeNames: (names: Set<string>) => void;
  setVoteDirections: (directions: Set<VoteDirection>) => void;
  setHighlight: (highlight: HighlightState) => void;
  clearHighlight: () => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialFilters: FilterState = {
  issueAreas: new Set<IssueArea>(),
  justiceNames: new Set(DEFAULT_JUSTICE_FILTERS),
  voteDirections: new Set<VoteDirection>(),
};

const initialHighlight: HighlightState = {
  justiceName: null,
  voteDirection: null,
  issueArea: null,
  caseId: null,
  term: null,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [highlight, setHighlightState] = useState<HighlightState>(initialHighlight);

  const setIssueAreas = (areas: Set<IssueArea>) => {
    setFilters((prev) => ({ ...prev, issueAreas: areas }));
  };

  const setJusticeNames = (names: Set<string>) => {
    setFilters((prev) => ({ ...prev, justiceNames: names }));
  };

  const setVoteDirections = (directions: Set<VoteDirection>) => {
    setFilters((prev) => ({ ...prev, voteDirections: directions }));
  };

  const setHighlight = (newHighlight: HighlightState) => {
    setHighlightState(newHighlight);
  };

  const clearHighlight = () => {
    setHighlightState(initialHighlight);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setHighlightState(initialHighlight);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        highlight,
        setIssueAreas,
        setJusticeNames,
        setVoteDirections,
        setHighlight,
        clearHighlight,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
