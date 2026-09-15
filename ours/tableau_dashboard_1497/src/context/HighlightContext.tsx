/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { HighlightState } from '../types';

interface HighlightContextType {
  highlightState: HighlightState;
  setPayTypeHighlight: (payType: string | null) => void;
  setSalesTypeHighlight: (salesType: string | null) => void;
  setItemCategoryHighlight: (itemCategory: string | null) => void;
  clearHighlights: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highlightState, setHighlightState] = useState<HighlightState>({
    payType: null,
    salesType: null,
    itemCategory: null,
  });

  const setPayTypeHighlight = useCallback((payType: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      payType,
    }));
  }, []);

  const setSalesTypeHighlight = useCallback((salesType: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      salesType,
    }));
  }, []);

  const setItemCategoryHighlight = useCallback((itemCategory: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      itemCategory,
    }));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightState({
      payType: null,
      salesType: null,
      itemCategory: null,
    });
  }, []);

  return (
    <HighlightContext.Provider
      value={{
        highlightState,
        setPayTypeHighlight,
        setSalesTypeHighlight,
        setItemCategoryHighlight,
        clearHighlights,
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};
