export interface SuperstoreRecord {
  "Category": string;
  "City": string;
  "Country": string;
  "Customer Name": string;
  "Manufacturer": string;
  "Order Date": string;
  "Order ID": string;
  "Postal Code": string;
  "Product Name": string;
  "Region": string;
  "Segment": string;
  "Ship Date": string;
  "Ship Mode": string;
  "State": string;
  "Sub-Category": string;
  "Discount": number;
  "Number of Records": number;
  "Profit": number;
  "Profit Ratio": number;
  "Quantity": number;
  "Sales": number;
}

export interface ParsedRecord {
  "Category": string;
  "City": string;
  "Country": string;
  "Customer Name": string;
  "Manufacturer": string;
  "Order Date": Date;
  "Order ID": string;
  "Postal Code": string;
  "Product Name": string;
  "Region": string;
  "Segment": string;
  "Ship Date": Date;
  "Ship Mode": string;
  "State": string;
  "Sub-Category": string;
  "Discount": number;
  "Number of Records": number;
  "Profit": number;
  "Profit Ratio": number;
  "Quantity": number;
  "Sales": number;
}

export interface AggregatedBySubCategory {
  "Sub-Category": string;
  "Sales": number;
}

export interface AggregatedByProduct {
  "Product Name": string;
  "Sales": number;
  "Profit": number;
  "Quantity": number;
}

export interface AggregatedByMonth {
  "Month": Date;
  "Sales": number;
}

export interface AggregatedByYear {
  "Year": number;
  "Sales": number;
}
