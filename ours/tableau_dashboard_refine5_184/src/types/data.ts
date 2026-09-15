/**
 * Raw order row type matching the CSV structure
 * All values from PapaParse are strings initially
 */
export interface OrderRow {
  [key: string]: string;
}

/**
 * Parsed order row with numeric fields converted to numbers
 */
export interface ParsedOrderRow {
  rowId: number;
  orderId: string;
  orderDate: string;
  shipDate: string;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  cityState: string;
  country: string;
  postalCode: string;
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
 * Aggregated product data for scatterplot
 */
export interface ProductAggregation {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated category/sub-category data for bar chart
 */
export interface CategoryAggregation {
  category: string;
  subCategory: string;
  sales: number;
}

/**
 * Aggregated region data for discount overview
 */
export interface RegionAggregation {
  region: string;
  avgDiscount: number;
  sumProfit: number;
  sumShippingCost: number;
  sumQuantity: number;
  sumSales: number;
  countDistinctCustomers: number;
}

/**
 * Measure value for the discount overview chart
 */
export interface MeasureValue {
  measureName: string;
  value: number;
}
