export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export const groupBy = <T, K extends keyof any>(arr: T[], key: (item: T) => K): Record<K, T[]> => {
  return arr.reduce((acc, item) => {
    const groupKey = key(item);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

export const uniqueBy = <T, K extends keyof any>(arr: T[], key: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return arr.filter((item) => {
    const keyValue = key(item);
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

export const sortBy = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...arr].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });
};

export const flatten = <T>(arr: T[][]): T[] => {
  return arr.reduce((acc, val) => acc.concat(val), []);
};

export const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  return arr.reduce(
    (acc, item) => {
      predicate(item) ? acc[0].push(item) : acc[1].push(item);
      return acc;
    },
    [[], []] as [T[], T[]]
  );
};

export const sample = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};

export const shuffle = <T>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const range = (start: number, end: number, step = 1): number[] => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

export const zip = <T, U>(arr1: T[], arr2: U[]): [T, U][] => {
  const result: [T, U][] = [];
  const minLength = Math.min(arr1.length, arr2.length);
  for (let i = 0; i < minLength; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
};