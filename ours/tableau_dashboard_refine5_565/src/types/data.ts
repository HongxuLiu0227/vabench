export interface OrderRecord {
  rowId: number;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  city: string;
  country: string;
  postalCode: string;
  region: string;
  subRegion: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  unknown1: string;
  priority: string;
}

export interface AggregatedSalesByCategory {
  category: string;
  subCategory: string;
  sales: number;
}

export interface SalesByYear {
  year: number;
  sales: number;
}

export interface SalesByDate {
  date: Date;
  sales: number;
}

export interface ScatterPoint {
  sales: number;
  profit: number;
  quantity: number;
  productName: string;
}
