# Project Requirements

You are an expert React and D3.js developer. Your task is to implement a dashboard based on the provided Tableau workbook definition.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like `d3-scale`, `d3-shape`, `d3-axis`, `d3-selection`).
- CSS for layout (CSS Grid/Flexbox). No external UI component libraries (e.g., Ant Design) unless necessary for basic inputs.

## Data Loading

The primary data source is `Data_to_Clean_Orders.csv`.

1.  **Fetch URL**: `/data/Data_to_Clean_Orders.csv`
2.  **Parsing**: Use `d3.csv` to parse the file.
3.  **Type Definition**: Define a TypeScript interface `OrderRecord` matching the columns in the CSV (Row ID, Order ID, Order Date, Ship Date, Ship Mode, Customer ID, Customer Name, Segment, City, State, Country, Postal Code, Market, Region, Product ID, Category, Sub-Category, Product Name, Sales, Quantity, Discount, Profit, Shipping Cost, Order Priority).
4.  **Date Parsing**: Ensure `Order Date` is parsed into JavaScript `Date` objects using `d3.timeParse`.

**Implementation Example:**
```typescript
import { useEffect, useState } from 'react';
import * as d3 from 'd3';

interface OrderRecord {
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
  "Postal Code": number;
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

export const useData = () => {
  const [data, setData] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/Data_to_Clean_Orders.csv');
        const csvText = await response.text();
        const parseDate = d3.timeParse('%m/%d/%Y'); // Adjust format based on actual CSV content
        const parsedData = d3.csvParse<OrderRecord>(csvText, (d) => {
            return {
                ...d,
                "Order Date": parseDate(d["Order Date"] as string) || new Date(),
                "Sales": +d["Sales"],
                "Profit": +d["Profit"],
                "Quantity": +d["Quantity"]
            } as OrderRecord;
        });
        setData(parsedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
};
```

## Sample Data
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 35244,
    "Unnamed: 1": "CA-2013-119963",
    "Unnamed: 2": "2013-11-19 00:00:00",
    "Unnamed: 3": "2013-11-23 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SN-20710",
    "Unnamed: 6": "Steve Nguyen",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Pasadena, Texas",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 77506,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-AR-10003514",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "4009 Highlighters by Sanford",
    "Unnamed: 17": 6.368,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 1.0347999999999993,
    "Unnamed: 21": 0.73,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 40744,
    "Unnamed: 1": "CA-2014-136882",
    "Unnamed: 2": "2014-05-28 00:00:00",
    "Unnamed: 3": "2014-06-04 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "DN-13690",
    "Unnamed: 6": "Duane Noonan",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Tulsa, Oklahoma",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 74133,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "FUR-FU-10003664",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Electrix Architect's Clamp-On Swing Arm Lamp, Black",
    "Unnamed: 17": 477.29999999999995,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0,
    "Unnamed: 20": 138.41699999999997,
    "Unnamed: 21": 40.73,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 10134,
    "Unnamed: 1": "US-2013-160913",
    "Unnamed: 2": "2013-10-15 00:00:00",
    "Unnamed: 3": "2013-10-19 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "MO-17500",
    "Unnamed: 6": "Mary O'Rourke",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Araranguá, Santa Catarina",
    "Unnamed: 9": "Brazil",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "TEC-MA-10002864",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Machines",
    "Unnamed: 16": "Panasonic Card Printer, Durable",
    "Unnamed: 17": 139.15200000000002,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -86.98800000000003,
    "Unnamed: 21": 15.181999999999999,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 33717,
    "Unnamed: 1": "CA-2014-159597",
    "Unnamed: 2": "2014-11-10 00:00:00",
    "Unnamed: 3": "2014-11-15 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "MC-17590",
    "Unnamed: 6": "Matt Collister",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Coachella, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 92236,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "TEC-AC-10004171",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Accessories",
    "Unnamed: 16": "Razer Kraken 7.1 Surround Sound Over Ear USB Gaming Headset",
    "Unnamed: 17": 99.99,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 43.9956,
    "Unnamed: 21": 12.28,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 20021,
    "Unnamed: 1": "ES-2014-3994900",
    "Unnamed: 2": "2014-08-29 00:00:00",
    "Unnamed: 3": "2014-09-01 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "HM-14980",
    "Unnamed: 6": "Henry MacAllister",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Rome, Lazio",
    "Unnamed: 9": "Italy",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-BI-10002570",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Acco Binder Covers, Clear",
    "Unnamed: 17": 25.56,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 10.98,
    "Unnamed: 21": 1.36,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 5520,
    "Unnamed: 1": "MX-2013-114825",
    "Unnamed: 2": "2013-07-08 00:00:00",
    "Unnamed: 3": "2013-07-13 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "EH-13765",
    "Unnamed: 6": "Edward Hooks",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Araguaína, Tocantins",
    "Unnamed: 9": "Brazil",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "FUR-BO-10000378",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Bookcases",
    "Unnamed: 16": "Bush Floating Shelf Set, Pine",
    "Unnamed: 17": 230.16,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 64.44,
    "Unnamed: 21": 32.499,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 31049,
    "Unnamed: 1": "ID-2014-83044",
    "Unnamed: 2": "2014-04-23 00:00:00",
    "Unnamed: 3": "2014-04-29 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SG-20605",
    "Unnamed: 6": "Speros Goranitis",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Auckland, Auckland",
    "Unnamed: 9": "New Zealand",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-BI-10000707",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Wilson Jones 3-Hole Punch, Economy",
    "Unnamed: 17": 16.794,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.4,
    "Unnamed: 20": -7.296000000000001,
    "Unnamed: 21": 1.79,
    "Unnamed: 22": "Low"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 50680,
    "Unnamed: 1": "TU-2013-1290",
    "Unnamed: 2": "2013-07-22 00:00:00",
    "Unnamed: 3": "2013-07-26 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "PJ-9015",
    "Unnamed: 6": "Pauline Johnson",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Bagcilar, Istanbul",
    "Unnamed: 9": "Turkey",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "OFF-SAN-10001074",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "SanDisk Message Books, Premium",
    "Unnamed: 17": 19.056,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -16.224,
    "Unnamed: 21": 1.6,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 46617,
    "Unnamed: 1": "AO-2011-8260",
    "Unnamed: 2": "2011-07-16 00:00:00",
    "Unnamed: 3": "2011-07-20 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "RO-9780",
    "Unnamed: 6": "Rose O'Brian",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Huambo, Huambo",
    "Unnamed: 9": "Angola",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-BIC-10001632",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "BIC Pens, Easy-Erase",
    "Unnamed: 17": 14.549999999999999,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 3.18,
    "Unnamed: 21": 1.97,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 31273,
    "Unnamed: 1": "IN-2013-81021",
    "Unnamed: 2": "2013-07-10 00:00:00",
    "Unnamed: 3": "2013-07-12 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "PO-18850",
    "Unnamed: 6": "Patrick O'Brill",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Wollongong, New South Wales",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-SU-10002775",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Fiskars Box Cutter, Steel",
    "Unnamed: 17": 209.52,
    "Unnamed: 18": 6,
    "Unnamed: 19": 0,
    "Unnamed: 20": 83.7,
    "Unnamed: 21": 20.61,
    "Unnamed: 22": "High"
  }
]
```

## Dashboard Layout (Dashboard 1)

The dashboard uses a CSS Grid layout.
- **Container**: Fixed aspect ratio or responsive container (min-width 1000px, min-height 800px recommended to match Tableau).
- **Grid Structure**:
  - 2 Columns, 2 Rows.
  - **Row 1 (Top, ~62% height)**:
    - **Column 1 (Left)**: "Bar" Worksheet.
    - **Column 2 (Right)**: "Line" Worksheet.
  - **Row 2 (Bottom, ~38% height)**:
    - **Column 1 & 2 (Span)**: "Scatterplot" Worksheet.

## Component Specifications

### 1. Bar Chart (Worksheet: "Bar")
- **Type**: Horizontal Bar Chart.
- **Data**: Group by `Category` and `Sub-Category` (Hierarchical).
- **Visual Encodings**:
  - **Y-Axis**: `Category` (Parent) and `Sub-Category` (Child). Indent Sub-Categories visually.
  - **X-Axis**: `SUM(Sales)`.
  - **Color**: `SUM(Sales)` using a sequential color scale (Blue-Teal palette, e.g., `d3.interpolateBlues` or similar).
- **Interactions**:
  - **Click**: Triggers a global filter action. When a bar (Category or Sub-Category) is clicked, it filters the data for the other charts (Line and Scatterplot) to that specific selection.

### 2. Line Chart (Worksheet: "Line")
- **Type**: Line Chart.
- **Data**: Aggregated by `MONTH(Order Date)`.
- **Visual Encodings**:
  - **X-Axis**: `Order Date` (Truncated to Month). Use `d3.scaleTime`.
  - **Y-Axis**: `SUM(Sales)`.
  - **Color**: `SUM(Sales)` using a diverging or sequential scale (Sunrise-Sunset palette, e.g., `d3.interpolateWarm`).
- **Interactions**:
  - **Filter**: Reacts to the filter set by the Bar chart. If a Category/Sub-Category is selected, the line chart updates to show sales trends only for that selection.

### 3. Scatterplot (Worksheet: "Scatterplot")
- **Type**: Scatter Plot.
- **Data**: Individual records or aggregated by `Product Name` (The XML shows `Product Name` as Level of Detail, implying aggregation by Product if multiple rows exist, or plotting individual points if unique. Given the context of "Sales" and "Profit", it is likely aggregated by Product). **Assumption**: Aggregate by `Product Name`.
- **Visual Encodings**:
  - **X-Axis**: `SUM(Sales)`.
  - **Y-Axis**: `SUM(Profit)`.
  - **Size**: `SUM(Quantity)` (Radius of the circle).
  - **Color**: Fixed color `#75a1c7` (Light Blue) as per the XML style rule override.
  - **Shape**: Circle.
- **Interactions**:
  - **Filter**: Reacts to the filter set by the Bar chart.
  - **Tooltip**: Display `Product Name`, `Sales`, `Profit`, and `Quantity` on hover.

## Global State & Interactions

- **Filter State**: Maintain a state object `selectedFilter` which can be `{ category: string, subCategory: string }` or `null`.
- **Context**: Use React Context to provide `selectedFilter` and `setSelectedFilter` to the dashboard and its children.
- **Wiring**:
  - The `BarChart` component calls `setSelectedFilter` on click.
  - The `LineChart` and `Scatterplot` components accept `data` as a prop. The parent `Dashboard` component should filter the raw data based on `selectedFilter` before passing it down to these children.

## Styling
- Use standard CSS. Ensure fonts are clean (sans-serif).
- Match the background colors specified in the XML (White `#ffffff` for sheets, Light Gray `#e6e6e6` for the dashboard background if applicable, though standard white is safer for web).
- Ensure axes and gridlines are subtle (gray).

## Summary of Steps
1.  Setup Vite + React + TS + D3.
2.  Create `useData` hook to load and parse the CSV.
3.  Create `DashboardContext` for filter state.
4.  Implement `BarChart`, `LineChart`, and `Scatterplot` components using D3.
5.  Assemble in `Dashboard` component with CSS Grid.
6.  Implement filtering logic in the parent component.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_121/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.0azm2i115epm0e12562z51akj8sy].[none:Category:nk] / [federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk])`
- cols_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=49200, h=61748
- highlight_fields: [federated.0azm2i115epm0e12562z51akj8sy].[ctd:Sub-Category:ok], [federated.0azm2i115epm0e12562z51akj8sy].[none:Category:nk], [federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Highlight Table
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk]`
- cols_field: `[federated.0azm2i115epm0e12562z51akj8sy].[none:Market:nk]`
- series_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- highlight_fields: [federated.0azm2i115epm0e12562z51akj8sy].[none:Market:nk], [federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Line
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[federated.0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `vertical`
- zone: x=50000, y=1000, w=49200, h=61750
- highlight_fields: [federated.0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Profit:qk]`
- cols_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- highlight_fields: [federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter1: kind=filter_action, source=Bar, target=Dashboard 1
## Highlight Bindings
- Bar: [federated.0azm2i115epm0e12562z51akj8sy].[ctd:Sub-Category:ok], [federated.0azm2i115epm0e12562z51akj8sy].[none:Category:nk], [federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk]
- Line: [federated.0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]
- Highlight Table: [federated.0azm2i115epm0e12562z51akj8sy].[none:Market:nk], [federated.0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk]
- Scatterplot: [federated.0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]
