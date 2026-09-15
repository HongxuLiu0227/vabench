import React from 'react';
import { HighlightProvider } from './HighlightContext';

export const highlightProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <HighlightProvider>{children}</HighlightProvider>;
};
