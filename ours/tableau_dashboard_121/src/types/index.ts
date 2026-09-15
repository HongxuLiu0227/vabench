export interface OrderRecord {
  "Row ID": number;
  "Order ID": string;
  "Order Date": Date;
  "Ship Date": Date;
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  "Segment": string;
  "City, State": string;
  "Country": string;
  "Postal Code": string | number;
  "Market": string;
  "Region": string;
  "Product ID": string;
  "Category": string;
  "Sub-Category": string;
  "Product Name": string;
  "Sales": number;
  "Quantity": number;
  "Discount": number;
  "Profit": number;
  "Shipping Cost": number;
  "Order Priority": string;
}

export interface AggregatedSalesByCategory {
  category: string;
  subCategory: string;
  sales: number;
}

export interface AggregatedSalesByDate {
  date: Date;
  sales: number;
}

export interface AggregatedProductMetrics {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface AggregatedMarketSales {
  market: string;
  subCategory: string;
  sales: number;
}

export interface FilterState {
  category: string | null;
  subCategory: string | null;
}
