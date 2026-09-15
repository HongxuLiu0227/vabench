/**
 * Raw CSV row structure for boat sales data
 */
export interface BoatSalesRaw {
  'Unnamed: 0': string;
  VesselID_PK: string;
  'Boat Name': string;
  'Listing Status': string;
  'Boat Model': string;
  'Boat Type': string;
  'Boat Condition': string;
  'Listing Date': string;
  'Listing Price': string;
  Boat_Sold_Date: string;
  'Sold Price': string;
  Boat_Price_Cut_Date: string;
  'Price Was': string;
  'Selling Broker': string;
  'Listing Broker': string;
  Seller: string;
  'Seller Email': string;
  Buyer: string;
  BuyerEmail: string;
  HullNo: string;
  'No of Days': string;
  boat_model_name: string;
}

/**
 * Transformed boat sales data with calculated fields
 */
export interface BoatSalesData {
  vesselIdPk: number;
  boatName: string;
  listingStatus: string;
  boatModel: string;
  boatType: string;
  boatCondition: string;
  listingDate: Date | null;
  listingPrice: number | null;
  boatSoldDate: Date | null;
  soldPrice: number | null;
  boatPriceCutDate: Date | null;
  priceWas: number | null;
  sellingBroker: string;
  listingBroker: string;
  seller: string;
  sellerEmail: string;
  buyer: string;
  buyerEmail: string;
  hullNo: string;
  noOfDays: number | null;
  boatModelName: string;
  hasPriceCut: boolean;
}

/**
 * Filter state for dashboard
 */
export interface FilterState {
  dateRange: {
    min: Date;
    max: Date;
  } | null;
}

/**
 * Selection/highlight state for interactions
 */
export interface SelectionState {
  broker: string | null;
  hasPriceCut: boolean | null;
  boatType: string | null;
  boatCondition: string | null;
}

/**
 * Aggregated data for bar chart
 */
export interface BrokerChartData {
  broker: string;
  category: string; // The series dimension (HasPriceCut, Boat Type, or Boat Condition)
  count: number;
  total: number; // Total count for this broker across all categories
}

/**
 * Worksheet specification from render contract
 */
export interface WorksheetSpec {
  name: string;
  chart_intent: string;
  series_field: string;
  axis_title_cols: string[];
  filter_members: string[];
  legend_required: boolean;
}

/**
 * Legend item
 */
export interface LegendItem {
  label: string;
  color: string;
}
