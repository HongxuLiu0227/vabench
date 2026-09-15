import { createContext } from 'react';
import type { InteractionContextType } from '../services/interactionContext';

export const InteractionContext = createContext<InteractionContextType | undefined>(undefined);
