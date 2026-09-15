export const BREACH_TYPE_COLORS: Record<string, string> = {
  DISC: '#4e79a7',
  PORT: '#59a14f',
  PHYS: '#76b7b2',
  UNKN: '#b07aa1',
  INSD: '#e15759',
  STAT: '#edc948',
  HACK: '#f28e2b',
};

export const INFO_SOURCE_COLORS: Record<string, string> = {
  'Media': '#499894',
  '(Null)': '#4e79a7',
  'Government Agency': '#59a14f',
  'PHIPrivacy.net': '#86bcb6',
  'Health IT Security': '#8cd17d',
  'California Attorney General': '#a0cbe8',
  'HHS via Databreaches.net': '#b6992d',
  'Security Breach Letter': '#e15759',
  'HHS via PHIPrivacy.net': '#f1ce63',
  'Databreaches.net': '#f28e2b',
  'Vermont Attorney General': '#ff9d9a',
  'Dataloss DB': '#ffbe7d',
};

export const getBreachTypeColor = (breachType: string): string => {
  return BREACH_TYPE_COLORS[breachType] || '#999999';
};

export const getInfoSourceColor = (infoSource: string): string => {
  return INFO_SOURCE_COLORS[infoSource] || '#999999';
};
