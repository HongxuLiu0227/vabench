import { useState } from 'react';
import { SelectionContext } from '../contexts/SelectionContext';
import type { GenderText, SelectionState } from '../types';

interface SelectionProviderProps {
  children: React.ReactNode;
}

export const SelectionProvider = ({ children }: SelectionProviderProps) => {
  const [selection, setSelection] = useState<SelectionState>({ gender: null });

  const setGenderSelection = (gender: GenderText | null) => {
    setSelection({ gender });
  };

  const clearSelection = () => {
    setSelection({ gender: null });
  };

  return (
    <SelectionContext.Provider value={{ selection, setGenderSelection, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};
