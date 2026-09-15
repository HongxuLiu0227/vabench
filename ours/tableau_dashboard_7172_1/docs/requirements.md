# Project Requirements

You are an expert React + TypeScript developer. Your task is to implement a dashboard application that replicates the functionality and appearance of a specific Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like d3-scale, d3-axis, d3-shape, d3-array).
- CSS Modules or Styled Components for styling (no external UI component libraries like Ant Design unless necessary).

## Data Loading

The application must load data from the following URL:
`/data/Sold_Boats_Report_07-13-2020_11_37_51.csv`

### Implementation Steps:
1. Create a utility function `useData` or a service to fetch the CSV.
2. Use `d3-dsv` (d3.csvParse) to parse the raw CSV text.
3. **Data Transformation**: The raw data requires specific transformations to match the Tableau logic:
   - **Date Parsing**: Parse `Listing Date`, `Boat_Sold_Date`, and `Boat_Price_Cut_Date` using `d3-time-format`. The format appears to be `MM/dd/yyyy`.
   - **Sold Price Parsing**: The `Sold Price` column is a string (e.g., "USD 12345"). You must replicate the Tableau calculated field `[Sold Price - Split 2]` by splitting the string by space and taking the second element, then parsing it as an integer.
   - **Calculated Fields**:
     - `HasPriceCut`: Boolean. `true` if `Boat_Price_Cut_Date` is not null, `false` otherwise.
     - `Number of Records`: Count of rows (implicit in Tableau).

### Sample Data
```json
[
  {
    "﻿Unnamed: 0": 825,
    "VesselID_PK": 500151,
    "Boat Name": "HOT DOG",
    "Listing Status": "Sold",
    "Boat Model": "Prowler 450",
    "Boat Type": "Power",
    "Boat Condition": "Used",
    "Listing Date": "2017-10-11",
    "Listing Price": 310000.0,
    "Boat_Sold_Date": "04/19/2012",
    "Sold Price": "USD 260000",
    "Boat_Price_Cut_Date": "",
    "Price Was": 375000.0,
    "Selling Broker": "",
    "Listing Broker": "Staley Weidman",
    "Seller": "David Dame",
    "Seller Email": "venturian@yahoo.com",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "XQOPRW13L405",
    "No of Days": -2001.0,
    "boat_model_name": "Prowler"
  },
  {
    "﻿Unnamed: 0": 829,
    "VesselID_PK": 500263,
    "Boat Name": "LARUS",
    "Listing Status": "Sold",
    "Boat Model": "Gemini 3200",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2017-10-11",
    "Listing Price": 47000.0,
    "Boat_Sold_Date": "04/10/2012",
    "Sold Price": "USD 33000",
    "Boat_Price_Cut_Date": "",
    "Price Was": 47000.0,
    "Selling Broker": "",
    "Listing Broker": "Robin Hodges",
    "Seller": "Cath Carroll",
    "Seller Email": "cath_carroll@hotmail.com",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "PCI00320F292",
    "No of Days": -2010.0,
    "boat_model_name": "Gemini"
  },
  {
    "﻿Unnamed: 0": 645,
    "VesselID_PK": 500795,
    "Boat Name": "WHITE BIRD",
    "Listing Status": "Sold",
    "Boat Model": "Contour 34SC",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2013-10-06",
    "Listing Price": 72500.0,
    "Boat_Sold_Date": "10/31/2013",
    "Sold Price": "USD 63500",
    "Boat_Price_Cut_Date": "",
    "Price Was": 72500.0,
    "Selling Broker": "The Catamaran Company",
    "Listing Broker": "Robin Hodges",
    "Seller": "Mark Chimel",
    "Seller Email": "markchimel@gmail.com",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "QPC3403F9797",
    "No of Days": 25.0,
    "boat_model_name": "Contour"
  },
  {
    "﻿Unnamed: 0": 964,
    "VesselID_PK": 738103,
    "Boat Name": "AGILA",
    "Listing Status": "Sold",
    "Boat Model": "E33",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2016-08-24",
    "Listing Price": 119500.0,
    "Boat_Sold_Date": "",
    "Sold Price": "USD",
    "Boat_Price_Cut_Date": "",
    "Price Was": 119500.0,
    "Selling Broker": "Staley Weidman",
    "Listing Broker": "Lyman-Morse Boatbuilding Co.",
    "Seller": "Doyle Sail Makers",
    "Seller Email": "",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "",
    "No of Days": 1419.0,
    "boat_model_name": "E33"
  },
  {
    "﻿Unnamed: 0": 329,
    "VesselID_PK": 500253,
    "Boat Name": "KYLA DAY",
    "Listing Status": "Sold",
    "Boat Model": "Lagoon 43 Power",
    "Boat Type": "Power",
    "Boat Condition": "Used",
    "Listing Date": "2013-08-13",
    "Listing Price": 289000.0,
    "Boat_Sold_Date": "01/25/2017",
    "Sold Price": "USD 250000",
    "Boat_Price_Cut_Date": "06/01/2016",
    "Price Was": 299000.0,
    "Selling Broker": "Brent Hermann",
    "Listing Broker": "The Catamaran Company",
    "Seller": "The Catamaran Company",
    "Seller Email": "hugh@catamarans.com",
    "Buyer": "Dan Symes",
    "BuyerEmail": "dan61751@aol.com",
    "HullNo": "CNB43065D404",
    "No of Days": 1261.0,
    "boat_model_name": "Lagoon"
  },
  {
    "﻿Unnamed: 0": 764,
    "VesselID_PK": 500685,
    "Boat Name": "HULL 1150",
    "Listing Status": "Sold",
    "Boat Model": "Legacy 35",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2017-10-11",
    "Listing Price": "",
    "Boat_Sold_Date": "10/22/2012",
    "Sold Price": "USD 361000",
    "Boat_Price_Cut_Date": "",
    "Price Was": "",
    "Selling Broker": "The Catamaran Company",
    "Listing Broker": "Robin Hodges",
    "Seller": "Owner Of Record",
    "Seller Email": "",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "",
    "No of Days": -1815.0,
    "boat_model_name": "Legacy"
  },
  {
    "﻿Unnamed: 0": 199,
    "VesselID_PK": 802030,
    "Boat Name": "CASSANDRA",
    "Listing Status": "Sold",
    "Boat Model": "Leopard 44",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2018-05-25",
    "Listing Price": 335299.0,
    "Boat_Sold_Date": "05/25/2018",
    "Sold Price": "USD 294000",
    "Boat_Price_Cut_Date": "",
    "Price Was": "",
    "Selling Broker": "Caroline Laviolette",
    "Listing Broker": "Sunsail Brokerage",
    "Seller": "Owner Of Record",
    "Seller Email": "",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "",
    "No of Days": 0.0,
    "boat_model_name": "Leopard"
  },
  {
    "﻿Unnamed: 0": 944,
    "VesselID_PK": 699488,
    "Boat Name": "ISABELLA BELEN",
    "Listing Status": "Sold",
    "Boat Model": "Lagoon 450 F",
    "Boat Type": "Sail",
    "Boat Condition": "New",
    "Listing Date": "2015-10-10",
    "Listing Price": "",
    "Boat_Sold_Date": "",
    "Sold Price": "USD",
    "Boat_Price_Cut_Date": "",
    "Price Was": "",
    "Selling Broker": "Michael Harris",
    "Listing Broker": "The Catamaran Company",
    "Seller": "The Catamaran Company",
    "Seller Email": "yachtsales@catamarans.com",
    "Buyer": "Isabella Belén, LLC",
    "BuyerEmail": "",
    "HullNo": "FR-CNB45493L516",
    "No of Days": 1738.0,
    "boat_model_name": "Lagoon"
  },
  {
    "﻿Unnamed: 0": 439,
    "VesselID_PK": 699480,
    "Boat Name": "BLUE HERON",
    "Listing Status": "Sold",
    "Boat Model": "Gemini 105Mc",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2015-08-26",
    "Listing Price": 134999.0,
    "Boat_Sold_Date": "10/27/2015",
    "Sold Price": "USD 131000",
    "Boat_Price_Cut_Date": "",
    "Price Was": 134999.0,
    "Selling Broker": "Andrew Walker",
    "Listing Broker": "Brent Hermann",
    "Seller": "The Catamaran  Company",
    "Seller Email": "hugh@catamarans.com",
    "Buyer": "MIke Poehlitz",
    "BuyerEmail": "mikepoehlitz1@aol.com",
    "HullNo": "PCI01034E808",
    "No of Days": 62.0,
    "boat_model_name": "Gemini"
  },
  {
    "﻿Unnamed: 0": 853,
    "VesselID_PK": 500291,
    "Boat Name": "WILD CAT",
    "Listing Status": "Sold",
    "Boat Model": "Leopard 43",
    "Boat Type": "Sail",
    "Boat Condition": "Used",
    "Listing Date": "2017-10-11",
    "Listing Price": 265000.0,
    "Boat_Sold_Date": "03/05/2012",
    "Sold Price": "USD",
    "Boat_Price_Cut_Date": "",
    "Price Was": "",
    "Selling Broker": "",
    "Listing Broker": "The Moorings Yacht Brokerage",
    "Seller": "Owner of Record",
    "Seller Email": "",
    "Buyer": "",
    "BuyerEmail": "",
    "HullNo": "",
    "No of Days": -2046.0,
    "boat_model_name": "Leopard"
  }
]
```

## Dashboard Layout

The main dashboard (named "Brokers Stats" in the workbook) consists of three specific worksheets arranged vertically. Use a CSS Grid or Flexbox layout to stack them.

1. **Top**: "Number of Boats Sold By Brokers(Price Cut)"
2. **Middle**: "Number of Boats Sold By Brokers(Sail vs Power)"
3. **Bottom**: "Number of Boats Sold By Brokers(Used vs New)"

## Component Specifications

### Common Component: `BrokerBarChart`
Create a reusable horizontal bar chart component.

**Props:**
- `data`: The processed dataset.
- `groupByKey`: string (The dimension for the Y-axis, e.g., 'Selling Broker').
- `colorByKey`: string (The dimension for color encoding, e.g., 'HasPriceCut', 'Boat Type', 'Boat Condition').
- `title`: string (The chart title).

**Visual Encoding:**
- **Mark Type**: Horizontal Bar.
- **X-Axis**: Represents "Number of Boats Sold" (Count of records). Use a linear scale.
- **Y-Axis**: Represents "Selling Broker". Use a band scale.
- **Sorting**: Sort brokers in descending order based on the total count of boats sold.
- **Color**: Use an ordinal scale (`d3-scaleOrdinal`).
  - If `colorByKey` is 'HasPriceCut': Map `false` (No Price Cut) to `#59a14f` (Green) and `true` (Price Cut) to `#edc948` (Yellow).
  - If `colorByKey` is 'Boat Condition': Map "Used" to `#91dcea` (Light Blue) and "New" to `#fd6f30` (Orange).
  - If `colorByKey` is 'Boat Type': Use a standard categorical palette (e.g., Tableau10) for "Sail" vs "Power".
- **Labels**: Display the count number at the end of each bar segment.

**Interactions:**
- **Tooltip**: On hover, show the Broker Name, the Category (Color dimension), and the Count.
- **Filtering**: The dashboard should support a global date filter for `Boat_Sold_Date` (Range: 2012-01-21 to 2020-07-06). The charts must update when this filter changes.

### Specific Worksheet Implementations

1. **Worksheet: Number of Boats Sold By Brokers(Price Cut)**
   - **Component**: `<BrokerBarChart>`
   - **Props**:
     - `title`: "Number of Boats Sold By Brokers(Price Cut)"
     - `colorByKey`: "HasPriceCut"
   - **Data Filter**: Only include records where `Selling Broker` is one of: ["Brent Hermann", "Caroline Laviolette", "Chris Block", "John Anderson", "Michael Harris", "Mike Auton", "Mike Nystrum", "Monte Cottrell", "Peter Gulick", "Staley Weidman"].

2. **Worksheet: Number of Boats Sold By Brokers(Sail vs Power)**
   - **Component**: `<BrokerBarChart>`
   - **Props**:
     - `title`: "Number of Boats Sold By Brokers(Sail vs Power)"
     - `colorByKey`: "Boat Type"
   - **Data Filter**: Same broker list as above.

3. **Worksheet: Number of Boats Sold By Brokers(Used vs New)**
   - **Component**: `<BrokerBarChart>`
   - **Props**:
     - `title`: "Number of Boats Sold By Brokers(Used vs New)"
     - `colorByKey`: "Boat Condition"
   - **Data Filter**: Same broker list as above.

## Styling
- Keep the UI clean and professional.
- Ensure fonts are readable (sans-serif).
- Match the layout to a standard dashboard view (charts stacked vertically with consistent widths).
- Ensure axes are labeled correctly (X-axis: "Number of Boats Sold").

## Summary of Deliverables
1. `App.tsx`: Main entry point, handles data fetching and global state (filters).
2. `Dashboard.tsx`: Layout container.
3. `BrokerBarChart.tsx`: The D3-based visualization component.
4. `types.ts`: TypeScript interfaces for the data.
5. `utils.ts`: Data parsing and transformation logic.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Sold_Boats_Report_07-13-2020_11_37_51.csv

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
const rows = await loadCsv("/data/Sold_Boats_Report_07-13-2020_11_37_51.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_7172_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Number of Boats Sold By Brokers(Price Cut)
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk]`
- cols_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[__tableau_internal_object_id__].[cnt:Sheet1_5BB2B7D5BAE74821AECCBA852430F757:qk]`
- series_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Calculation_1145603158979420163:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Boats Sold
- zone: x=967, y=25340, w=87470, h=36198
- legend_required: true
- legend_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Calculation_1145603158979420163:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[yr:Boat_Price_Cut_Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Number of Boats Sold By Brokers(Sail vs Power)
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk]`
- cols_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[__tableau_internal_object_id__].[cnt:Sheet1_5BB2B7D5BAE74821AECCBA852430F757:qk]`
- series_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Boats Sold
- zone: x=967, y=684, w=87470, h=24656
- legend_required: true
- legend_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Number of Boats Sold By Brokers(Used vs New)
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk]`
- cols_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[__tableau_internal_object_id__].[cnt:Sheet1_5BB2B7D5BAE74821AECCBA852430F757:qk]`
- series_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Condition:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Boats Sold
- zone: x=967, y=61538, w=87470, h=37778
- legend_required: true
- legend_field: `[federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Condition:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0xc14ao1st9wyu1h40zo40lm8av6].[:Measure Names], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Condition:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[yr:Boat_Price_Cut_Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Number of Boats Sold By Brokers(Price Cut), target=Number of Boats Sold By Brokers(Price Cut)
  fields: HasPriceCut
- Highlight 2 (generated): kind=highlight_brush, source=Brokers Stats, target=Brokers Stats
  fields: HasPriceCut
## Highlight Bindings
- Number of Boats Sold By Brokers(Sail vs Power): [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk]
- Number of Boats Sold By Brokers(Price Cut): [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[yr:Boat_Price_Cut_Date:ok]
- Number of Boats Sold By Brokers(Used vs New): [federated.0xc14ao1st9wyu1h40zo40lm8av6].[:Measure Names], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Condition:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat_Sold_Date:qk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Selling Broker:nk], [federated.0xc14ao1st9wyu1h40zo40lm8av6].[yr:Boat_Price_Cut_Date:ok]
- Number of Boats Sold By Brokers(Sail vs Power): [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Type:nk]
- Number of Boats Sold By Brokers(Used vs New): [federated.0xc14ao1st9wyu1h40zo40lm8av6].[none:Boat Condition:nk]
