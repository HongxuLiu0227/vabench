export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

export const removeWhitespace = (str: string): string => {
  return str.replace(/\s+/g, '');
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
};

export const stringToSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
};