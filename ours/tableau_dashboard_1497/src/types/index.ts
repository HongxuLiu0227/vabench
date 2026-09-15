export interface SalesData {
  'Channel Type': string;
  'Pay Type': string;
  'Item Category': string;
  'Item ID': number;
  'Item code': string;
  'Item Name': string;
  'Employee ID': number;
  'Employee Code': string;
  'Employee Name': string;
  'Employee Locations': string;
  'Employee Country': string;
  'Manager': string;
  'Department': string;
  'Sales Date': string;
  'Sales_Cost': number;
  'Sales_Amt': number;
  'Sales_Qty': number;
  'Sales Type': string;
  'Customer ID': number;
  'Customer Name': string;
  'Customer Location': string;
  'Customer Country': string;
}

export interface SalesTypeData {
  salesType: string;
  salesAmt: number;
  channelType: string;
}

export interface SalesWithItemsData {
  itemCategory: string;
  department: string;
  salesQty: number;
}

export interface ItemsWithCategoryData {
  itemName: string;
  payType: string;
  salesQty: number;
  itemCategory: string;
  salesType: string;
}

export interface PayTypeWithYearData {
  year: number;
  salesType: string;
  salesQty: number;
}

export interface HighlightState {
  payType: string | null;
  salesType: string | null;
  itemCategory: string | null;
}

export interface ChartProps {
  width?: number;
  height?: number;
}
