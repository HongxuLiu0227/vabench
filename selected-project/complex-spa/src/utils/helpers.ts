export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getInitials = (name: string): string => {
  const names = name.split(' ');
  return names.map(n => n[0]).join('').toUpperCase();
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const sortByProperty = <T extends Record<string, any>>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return order === 'asc' ? -1 : 1;
    if (a[property] > b[property]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  properties: Array<keyof T>
): T[] => {
  if (!searchTerm) return items;
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  return items.filter(item =>
    properties.some(prop =>
      String(item[prop]).toLowerCase().includes(lowerCaseSearchTerm)
    )
  );
};