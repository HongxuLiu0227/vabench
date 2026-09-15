export interface DataRow {
  // Old format fields
  City?: string;
  'Customer Name'?: string;
  'Customer Segment'?: string;
  'Postal Code'?: string;
  'Product Base Margin'?: string;
  'Product Container'?: string;
  'Product Sub-Category'?: string;
  'Quantity ordered new'?: string;
  'State or Province'?: string;
  'Unit Price'?: string;

  // New format fields (Superstore)
  'Order ID'?: string;
  Segment?: string;
  State?: string;
  Country?: string;
  Market?: string;
  Region?: string;
  'Product ID'?: string;
  Category?: string;
  'Sub-Category'?: string;
  Quantity?: string;
  Year?: string;

  // Common fields (exist in both formats)
  Discount?: string;
  'Order Date'?: string;
  'Order Priority'?: string;
  'Product Name'?: string;
  Profit?: string;
  Sales?: string;
  'Ship Date'?: string;
  'Ship Mode'?: string;
  'Shipping Cost'?: string;

  // Index signature to allow dynamic access
  [key: string]: string | undefined;
}

export interface ParsedDataRow {
  City: string;
  CustomerName: string;
  CustomerSegment: string;
  Discount: number | null;
  OrderDate: Date | null;
  OrderPriority: string;
  PostalCode: string;
  ProductBaseMargin: number | null;
  ProductContainer: string;
  ProductName: string;
  ProductSubCategory: string;
  Profit: number;
  QuantityOrderedNew: number | null;
  Sales: number | null;
  ShipDate: Date | null;
  ShipMode: string;
  ShippingCost: number | null;
  StateOrProvince: string;
  UnitPrice: number | null;
  MonthYear: string;
  YearMonth: string;
}

export interface MonthlyProfitData {
  MonthYear: string;
  Profit: number;
}

export interface TopItemData {
  name: string;
  profit: number;
}

export type SelectionState = string | null;
