export interface DashboardFilters {
  orderDateYear: number | null;
  category: string | null;
  region: string | null;
  state: string | null;
  subCategory: string | null;
}

export interface AggregatedData {
  category?: string;
  subCategory?: string;
  region?: string;
  state?: string;
  productName?: string;
  customerName?: string;
  city?: string;
  sales: number;
  profit: number;
  quantity: number;
  count: number;
}

export interface ChartData {
  key: string;
  label: string;
  value: number;
  sales?: number;
  profit?: number;
  category?: string;
  subCategory?: string;
  region?: string;
  state?: string;
  productName?: string;
}

export type FilterAction = {
  type: 'SET_FILTER' | 'CLEAR_FILTER' | 'CLEAR_ALL';
  field: keyof DashboardFilters;
  value: string | number | null;
};

export interface SelectionState {
  region: string | null;
  state: string | null;
  category: string | null;
  subCategory: string | null;
}

export const initialFilters: DashboardFilters = Object.freeze({
  orderDateYear: null,
  category: null,
  region: null,
  state: null,
  subCategory: null,
});

export const initialSelection: SelectionState = Object.freeze({
  region: null,
  state: null,
  category: null,
  subCategory: null,
});
