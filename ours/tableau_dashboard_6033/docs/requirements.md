# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard based on the provided Tableau workbook specification.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`, `d3-transition`).
- No external UI component libraries (e.g., Ant Design) are required. Use standard HTML/CSS.

## Data Loading

The primary data source is `Global Superstore_Orders.csv`.

1. Create a utility function `useData` that fetches the data.
2. Use the browser `fetch` API to load the data from `/data/Global Superstore_Orders.csv`.
3. Parse the CSV text into an array of objects. You can use `d3-dsv` (d3.csvParse) or a simple custom parser.
4. Type the data rows. The columns include: `Row ID`, `Order ID`, `Order Date`, `Ship Date`, `Ship Mode`, `Customer ID`, `Customer Name`, `Segment`, `Country`, `City`, `State`, `Postal Code`, `Region`, `Product ID`, `Category`, `Sub-Category`, `Product Name`, `Sales`, `Quantity`, `Discount`, `Profit`.
5. Ensure numeric fields (`Sales`, `Profit`, `Quantity`, `Discount`) are parsed as numbers.

## State Management

The application needs to manage the following state:
- `data`: The full array of order records.
- `selectedSegment`: string | null. Represents the selected Segment (Consumer, Corporate, Home Office). Defaults to null (All).
- `selectedMarket`: string | null. Represents the selected Market (e.g., "US", "EU", "APAC"). Defaults to null (All).

## Layout & Components

The dashboard layout should be implemented using CSS Grid or Flexbox to match the Tableau layout:

- **Container**: Fixed size or responsive container approximating the 800x600 aspect ratio of the original.
- **Top Row**:
  - **Left**: `SalesBySegment` (Pie Chart).
  - **Center**: `Plot of Sales` (Scatter Plot).
  - **Right**: `MarketFilter` (Radio List).
- **Bottom Row**: `SalesByMarket` (Horizontal Bar Chart).

### Component: `SalesBySegment`
- **Type**: Pie Chart.
- **Data**: Aggregate `Sales` by `Segment`.
- **Visuals**:
  - Use `d3.pie()` and `d3.arc()`.
  - **Colors**: Map Segments to specific colors found in the workbook:
    - Consumer: `#4e79a7`
    - Home Office: `#59a14f`
    - Corporate: `#f28e2b`
  - **Labels**: Display Segment Name and Percentage of Total Sales.
- **Interaction**: Clicking a slice sets the `selectedSegment` state. Clicking the background (or a reset button) clears the selection.

### Component: `Plot of Sales`
- **Type**: Scatter Plot.
- **Data**: The XML specifies Level of Detail (LOD) on `Category` and `Market`. You must aggregate the data by `Category` and `Market`.
  - X-Axis: Sum of `Sales`.
  - Y-Axis: Sum of `Profit`.
  - Color: `Segment` (using the same color palette as the Pie chart).
- **Visuals**:
  - Use `d3.scaleLinear` for X and Y axes.
  - Draw circles for each Category/Market combination.
  - Include axes with labels.
- **Filtering**: This chart must react to `selectedSegment` and `selectedMarket`. If a Segment is selected, only show points belonging to that Segment. If a Market is selected, only show points belonging to that Market.

### Component: `MarketFilter`
- **Type**: Radio Button List.
- **Data**: Unique values of the `Market` column.
- **Interaction**: Selecting a radio button sets the `selectedMarket` state.

### Component: `SalesByMarket`
- **Type**: Horizontal Bar Chart.
- **Data**: Aggregate `Sales` and `Profit` by `Country`.
- **Visuals**:
  - Y-Axis: `Country` (categorical).
  - X-Axis: Sum of `Sales`.
  - Color: Sum of `Profit`. Use a sequential color scale (e.g., `d3.interpolateGreys` or a custom gray scale `gray_warm_10_0` equivalent) where higher profit is darker or distinct.
  - **Sorting**: Sort the bars in descending order of `Sales` (highest sales at the top).
- **Filtering**: This chart must react to `selectedSegment` and `selectedMarket`.

## Interactions

1. **Filter Action**: When a user clicks a slice in `SalesBySegment`, it triggers a filter action.
   - Update `selectedSegment`.
   - `Plot of Sales` and `Sales by Market` should re-render to show only data for that segment.
2. **Global Filter**: When a user selects a Market in `MarketFilter`:
   - Update `selectedMarket`.
   - All three charts (`SalesBySegment`, `Plot of Sales`, `Sales by Market`) should re-render to show only data for that market.

## Sample Data

```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Juárez",
    "Country": "Mexico",
    "Customer Name": "Muhammed Lee",
    "Market": "LATAM",
    "Customer ID": "ML-182653",
    "Order Date": "2014-07-31",
    "Year (OrderDate)": 2014,
    "Order ID": "MX-2013-102806",
    "Order Priority": "Medium",
    "Product ID": "OFF-BI-10000124",
    "Product Name": "Acco Binder Covers, Clear",
    "Region": "North",
    "Row ID": 8890,
    "Segment": "Consumer",
    "Ship Date": "2014-08-04",
    "Ship Mode": "Standard Class",
    "State": "Chihuahua",
    "Sub-Category": "Binders",
    "Discount": 0.0,
    "Profit": 19.1,
    "Quantity": 5,
    "Sales": 42.6,
    "Shipping Cost": 2.133
  },
  {
    "﻿Category": "Furniture",
    "City": "Vienna",
    "Country": "Austria",
    "Customer Name": "Ruben Ausman",
    "Market": "EMEA",
    "Customer ID": "RA-198852",
    "Order Date": "2013-01-25",
    "Year (OrderDate)": 2013,
    "Order ID": "ES-2012-2756176",
    "Order Priority": "Medium",
    "Product ID": "FUR-CH-10000727",
    "Product Name": "Office Star Chairmat, Set of Two",
    "Region": "Central",
    "Row ID": 17461,
    "Segment": "Corporate",
    "Ship Date": "2013-01-30",
    "Ship Mode": "Standard Class",
    "State": "Vienna",
    "Sub-Category": "Chairs",
    "Discount": 0.0,
    "Profit": 29.94,
    "Quantity": 1,
    "Sales": 68.07,
    "Shipping Cost": 2.7
  },
  {
    "﻿Category": "Technology",
    "City": "Brisbane",
    "Country": "Australia",
    "Customer Name": "Craig Carroll",
    "Market": "APAC",
    "Customer ID": "CC-126851",
    "Order Date": "2013-10-25",
    "Year (OrderDate)": 2013,
    "Order ID": "ID-2012-78515",
    "Order Priority": "Medium",
    "Product ID": "TEC-CO-10001766",
    "Product Name": "Canon Fax Machine, Digital",
    "Region": "Oceania",
    "Row ID": 21772,
    "Segment": "Consumer",
    "Ship Date": "2013-10-29",
    "Ship Mode": "Standard Class",
    "State": "Queensland",
    "Sub-Category": "Copiers",
    "Discount": 0.1,
    "Profit": -127.215,
    "Quantity": 5,
    "Sales": 1431.135,
    "Shipping Cost": 110.6
  },
  {
    "﻿Category": "Furniture",
    "City": "Hillsboro",
    "Country": "United States",
    "Customer Name": "Chloris Kastensmidt",
    "Market": "USCA",
    "Customer ID": "CK-122054",
    "Order Date": "2013-10-02",
    "Year (OrderDate)": 2013,
    "Order ID": "US-2012-144771",
    "Order Priority": "High",
    "Product ID": "FUR-FU-10000629",
    "Product Name": "9-3/4 Diameter Round Wall Clock",
    "Region": "West",
    "Row ID": 40039,
    "Segment": "Consumer",
    "Ship Date": "2013-10-04",
    "Ship Mode": "First Class",
    "State": "Oregon",
    "Sub-Category": "Furnishings",
    "Discount": 0.2,
    "Profit": 3.0338,
    "Quantity": 1,
    "Sales": 11.032,
    "Shipping Cost": 1.04
  },
  {
    "﻿Category": "Furniture",
    "City": "Morelia",
    "Country": "Mexico",
    "Customer Name": "Stewart Carmichael",
    "Market": "LATAM",
    "Customer ID": "SC-207703",
    "Order Date": "2012-12-23",
    "Year (OrderDate)": 2012,
    "Order ID": "MX-2011-107370",
    "Order Priority": "High",
    "Product ID": "FUR-BO-10001201",
    "Product Name": "Bush Stackable Bookrack, Mobile",
    "Region": "North",
    "Row ID": 5971,
    "Segment": "Corporate",
    "Ship Date": "2012-12-25",
    "Ship Mode": "Second Class",
    "State": "Michoacán",
    "Sub-Category": "Bookcases",
    "Discount": 0.2,
    "Profit": 75.728,
    "Quantity": 4,
    "Sales": 263.488,
    "Shipping Cost": 39.301
  },
  {
    "﻿Category": "Technology",
    "City": "Tepic",
    "Country": "Mexico",
    "Customer Name": "Suzanne McNair",
    "Market": "LATAM",
    "Customer ID": "SM-209503",
    "Order Date": "2015-09-27",
    "Year (OrderDate)": 2015,
    "Order ID": "US-2014-142706",
    "Order Priority": "Medium",
    "Product ID": "TEC-CO-10001309",
    "Product Name": "Hewlett Wireless Fax, Laser",
    "Region": "North",
    "Row ID": 7492,
    "Segment": "Corporate",
    "Ship Date": "2015-10-02",
    "Ship Mode": "Standard Class",
    "State": "Nayarit",
    "Sub-Category": "Copiers",
    "Discount": 0.002,
    "Profit": 14.18616,
    "Quantity": 2,
    "Sales": 505.90616,
    "Shipping Cost": 24.448
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Milwaukee",
    "Country": "United States",
    "Customer Name": "Catherine Glotzbach",
    "Market": "USCA",
    "Customer ID": "CG-120404",
    "Order Date": "2015-11-12",
    "Year (OrderDate)": 2015,
    "Order ID": "CA-2014-143217",
    "Order Priority": "Low",
    "Product ID": "OFF-BI-10002949",
    "Product Name": "Prestige Round Ring Binders",
    "Region": "Central",
    "Row ID": 36375,
    "Segment": "Home Office",
    "Ship Date": "2015-11-18",
    "Ship Mode": "Standard Class",
    "State": "Wisconsin",
    "Sub-Category": "Binders",
    "Discount": 0.0,
    "Profit": 8.5728,
    "Quantity": 3,
    "Sales": 18.24,
    "Shipping Cost": 2.4
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Ghent",
    "Country": "Belgium",
    "Customer Name": "Erin Creighton",
    "Market": "EMEA",
    "Customer ID": "EC-140502",
    "Order Date": "2012-12-29",
    "Year (OrderDate)": 2012,
    "Order ID": "ES-2011-4335650",
    "Order Priority": "Low",
    "Product ID": "OFF-SU-10004980",
    "Product Name": "Acme Trimmer, Steel",
    "Region": "Central",
    "Row ID": 12832,
    "Segment": "Consumer",
    "Ship Date": "2013-01-04",
    "Ship Mode": "Standard Class",
    "State": "East Flanders",
    "Sub-Category": "Supplies",
    "Discount": 0.0,
    "Profit": 19.32,
    "Quantity": 2,
    "Sales": 87.96,
    "Shipping Cost": 13.54
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Whyalla",
    "Country": "Australia",
    "Customer Name": "Clay Cheatham",
    "Market": "APAC",
    "Customer ID": "CC-125501",
    "Order Date": "2015-02-11",
    "Year (OrderDate)": 2015,
    "Order ID": "IN-2014-59426",
    "Order Priority": "Critical",
    "Product ID": "OFF-BI-10004685",
    "Product Name": "Acco Binder, Economy",
    "Region": "Oceania",
    "Row ID": 30083,
    "Segment": "Consumer",
    "Ship Date": "2015-02-11",
    "Ship Mode": "Same Day",
    "State": "South Australia",
    "Sub-Category": "Binders",
    "Discount": 0.1,
    "Profit": 15.825,
    "Quantity": 5,
    "Sales": 68.175,
    "Shipping Cost": 20.89
  },
  {
    "﻿Category": "Technology",
    "City": "Pasadena",
    "Country": "United States",
    "Customer Name": "Ann Steele",
    "Market": "USCA",
    "Customer ID": "AS-106304",
    "Order Date": "2015-09-30",
    "Year (OrderDate)": 2015,
    "Order ID": "CA-2014-100314",
    "Order Priority": "Medium",
    "Product ID": "TEC-MA-10003066",
    "Product Name": "Wasp CCD Handheld Bar Code Reader",
    "Region": "Central",
    "Row ID": 32283,
    "Segment": "Home Office",
    "Ship Date": "2015-10-06",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Machines",
    "Discount": 0.4,
    "Profit": 44.868,
    "Quantity": 3,
    "Sales": 336.51,
    "Shipping Cost": 7.55
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Global Superstore_Orders.csv
- /data/Global Superstore_People.csv
- /data/Global Superstore_Returns.csv

Example (CSV via fetch):
```ts
async function loadCsv(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const csvText = await res.text();
  // Prefer a robust CSV parser (e.g. PapaParse) for production; keep a minimal parser if needed.
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

// Default entrypoint
const rows = await loadCsv("/data/Global Superstore_Orders.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_6033/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Plot of Sales
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[sum:Profit:qk]`
- cols_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[sum:Sales:qk]`
- series_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Segment:nk]`
- zone: x=40000, y=8333, w=39000, h=41499
- highlight_fields: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Category:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Market:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Region:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Market
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Country:nk]`
- cols_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[sum:Sales:qk]`
- series_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[sum:Profit:qk]`
- bar_orientation: `horizontal`
- zone: x=1000, y=49832, w=98000, h=48835
- highlight_fields: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Country:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Market:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Segment
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Segment:nk]`
- zone: x=1000, y=8333, w=39000, h=41499
- highlight_fields: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Segment:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sales by Segment, target=Sales Dashboard
## Highlight Bindings
- Sales by Segment: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Segment:nk]
- Plot of Sales: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Category:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Market:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Region:nk]
- Sales by Market: [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Country:nk], [federated.0qwmwnk1pi2ni61h1vh0209mr4v6].[none:Market:nk]
