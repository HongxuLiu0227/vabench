import { createContext } from 'react';
import type { GenderText, SelectionState } from '../types';

interface SelectionContextType {
  selection: SelectionState;
  setGenderSelection: (gender: GenderText | null) => void;
  clearSelection: () => void;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

