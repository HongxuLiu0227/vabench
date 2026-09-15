import { useContext } from 'react';
import { InteractionContext } from '../contexts/InteractionContext';
import type { InteractionContextType } from '../services/interactionContext';

export function useInteraction(): InteractionContextType {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
}
