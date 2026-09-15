/**
 * Raw order record from the CSV file
 */
export interface OrderRecord {
  "Row ID": number;
  "Order ID": string;
  "Order Date": string;
  "Ship Date": string;
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  "Segment": string;
  "City, State": string;
  "Country": string;
  "Postal Code": string;
  "Market": string;
  "Region": string;
  "Product ID": string;
  "Category": string;
  "Sub-Category": string;
  "Product Name": string;
  "Sales": string;
  "Quantity": string;
  "Discount": string;
  "Profit": string;
  "Shipping Cost": string;
  "Order Priority": string;
}

/**
 * Parsed order record with proper types
 */
export interface ParsedOrderRecord {
  rowId: number;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  cityState: string;
  country: string;
  postalCode: number;
  market: string;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  shippingCost: number;
  orderPriority: string;
}

/**
 * Aggregated data for scatterplot (by Product Name)
 */
export interface ScatterplotData {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated data for bar chart (by Category and Sub-Category)
 */
export interface BarChartData {
  category: string;
  subCategory: string;
  sales: number;
}

/**
 * Aggregated data for yearly sales
 */
export interface YearlySalesData {
  year: number;
  sales: number;
}

/**
 * Aggregated data for customer overview (by Region)
 */
export interface CustomerOverviewData {
  region: string;
  numberOfCustomers: number;
  sales: number;
  quantity: number;
  profit: number;
  profitRatio: number;
}
