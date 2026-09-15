# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Monthly Profit for Top 10 Customers and Products'.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for data visualization (use primitives: d3-scale, d3-axis, d3-shape, d3-array, d3-time-format, d3-selection). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or standard CSS). No UI component libraries (e.g., Ant Design) unless necessary for basic layout, but prefer raw CSS/Flexbox/Grid.

## Data Loading
1.  **Source**: The data is located at `/data/#TableauTemp_0gk6vqz1hr1vdh1egpwt119prxkq.csv`.
2.  **Fetching**: Use the native `fetch` API inside a `useEffect` hook in your main App component.
3.  **Parsing**: Use `d3-dsv` (d3.csvParse) to parse the CSV string into an array of objects.
4.  **Type Definition**: Define a TypeScript interface `DataRow` matching the columns in the CSV (e.g., `Order Date`, `Profit`, `Customer Name`, `Product Name`, etc.).
5.  **Data Transformation**:
    - Parse `Order Date` strings into JavaScript Date objects.
    - Create a derived string property `MonthYear` formatted as 'YYYY-MM' (e.g., '2010-09') to match the Tableau 'MY(Order Date)' logic.

## Application State
- **`selectedMonth`**: A state variable (string | null) representing the selected Month-Year (e.g., '2010-09').
- **Initialization**: The dashboard should initialize with `selectedMonth` set to '2010-09' (based on the workbook default viewpoint).
- **Interaction**: Clicking on a data point (bar/line) in the 'Monthly Profit' chart updates `selectedMonth`. Clicking the same point again should deselect it (set to null), showing the global Top 10.

## Layout & Components
Create a main `Dashboard` component that renders the following layout using CSS Grid or Flexbox:

1.  **Container**: A full-height flex column container.
2.  **Top Section (approx 40% height)**: Contains the `MonthlyProfit` chart. It spans the full width.
3.  **Bottom Section (approx 60% height)**: A flex row container split into two equal columns.
    -   **Left**: `TopCustomers` chart.
    -   **Right**: `TopProducts` chart.

### Component: MonthlyProfit
-   **Type**: Vertical Bar Chart (or Line Chart, but Bar is safer for discrete dates). The XML uses discrete Month-Year on columns.
-   **Data**: Group all data by `MonthYear` and sum `Profit`.
-   **Visual Encoding**:
    -   X-Axis: `MonthYear` (Discrete/Ordinal). Display labels as 'MMM YY' (e.g., Sep 10).
    -   Y-Axis: `SUM(Profit)` (Quantitative).
    -   Color: `#4e79a7` (Tableau Blue).
    -   Highlight: If a bar corresponds to `selectedMonth`, highlight it (e.g., darker stroke or opacity change).
-   **Interaction**: Click event on bars to update the global `selectedMonth` state.

### Component: TopCustomers
-   **Title**: "Top Ten Customers by Profit" (Preserve exact wording).
-   **Type**: Horizontal Bar Chart.
-   **Data Logic**:
    -   Filter the raw data: If `selectedMonth` is not null, include only rows where `MonthYear` matches `selectedMonth`.
    -   Group by `Customer Name` and sum `Profit`.
    -   Sort by Profit Descending.
    -   Take the top 10 entries.
-   **Visual Encoding**:
    -   Y-Axis: `Customer Name`.
    -   X-Axis: `SUM(Profit)`.
    -   Color: `#4e79a7`.

### Component: TopProducts
-   **Title**: "Top Products by Profit" (Preserve exact wording).
-   **Type**: Horizontal Bar Chart.
-   **Data Logic**:
    -   Filter the raw data: If `selectedMonth` is not null, include only rows where `MonthYear` matches `selectedMonth`.
    -   Group by `Product Name` and sum `Profit`.
    -   Sort by Profit Descending.
    -   Take the top 10 entries.
-   **Visual Encoding**:
    -   Y-Axis: `Product Name`.
    -   X-Axis: `SUM(Profit)`.
    -   Color: `#4e79a7`.

## Styling
-   Use a clean, sans-serif font (Inter, system-ui, Arial).
-   Ensure charts are responsive (use `viewBox` or percentage widths/heights).
-   Add padding/margins to match the 'margin=4' and 'margin=8' hints in the XML zones.
-   Axis labels should be legible.

## Sample Data
Here is a placeholder for the data structure:

```json
[
  {
    "﻿City": "��\u0004A\u0016l\u0019\u0000L�\u0012",
    "Customer Name": "��-\u0000�\t��M�$\tB\u0004\u0001ÒH�0I� \u0000�\"\"iR�$�0m\u00006)Z\u0012\t@2I��",
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0000\u0004",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0002\u0004\u0005\b\u000f?\b%\u0005\u0001\u000f",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0011\f\u0002\u0010\u0012\u0010\u000e",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0011\u0006\u0010",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "",
    "Customer Name": "Dolores Vincent",
    "Customer Segment": "",
    "Discount": "",
    "Order Date": "",
    "Order Priority": "",
    "Postal Code": "",
    "Product Base Margin": "",
    "Product Container": "",
    "Product Name": "Belkin ErgoBoard™ Keyboard",
    "Product Sub-Category": "",
    "Profit": "\u0006\u0001\u0002\u0003\u0002\u0002\u0004\u0007\u0005\u0006\n\n\u0004\n\u0000\b\u0002\u0002\u0005\u0004\u0012\u000b/\n+\u0000\u000b\u0006\n\n\u000f\n\u000f\r\u0003\b\"\u0000H\u0011\u0019\u0006",
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0004\u0014\u0004\u0006\u0006\u0000\u0007\u0007\t\u0001\u0000",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0002",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\b",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  },
  {
    "﻿City": "\u0006\f\f\u000f\u0010\u0001\u000f\u0006\u0000\u0001\u0003\u000f\u000b\u0005",
    "Customer Name": null,
    "Customer Segment": null,
    "Discount": null,
    "Order Date": null,
    "Order Priority": null,
    "Postal Code": null,
    "Product Base Margin": null,
    "Product Container": null,
    "Product Name": null,
    "Product Sub-Category": null,
    "Profit": null,
    "Quantity ordered new": null,
    "Sales": null,
    "Ship Date": null,
    "Ship Mode": null,
    "Shipping Cost": null,
    "State or Province": null,
    "Unit Price": null
  }
]
```

Implement the application strictly following these specifications.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/#TableauTemp_0gk6vqz1hr1vdh1egpwt119prxkq.csv

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
const rows = await loadCsv("/data/#TableauTemp_0gk6vqz1hr1vdh1egpwt119prxkq.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_2685/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Monthly Profit
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[sum:Profit:qk]`
- cols_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[my:Order Date:ok]`
- bar_orientation: `vertical`
- zone: x=625, y=1280, w=98750, h=40413
- highlight_fields: [federated.0zqvufs1onacp51cma8k0197mcg4].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top  Products
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[none:Product Name:nk]`
- cols_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[sum:Profit:qk]`
- series_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[Action (MY(Order Date))]`
- bar_orientation: `horizontal`
- zone: x=625, y=41693, w=49375, h=57027
- highlight_fields: [federated.0zqvufs1onacp51cma8k0197mcg4].[Top 10 Products], [federated.0zqvufs1onacp51cma8k0197mcg4].[none:Product Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top Customers
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[none:Customer Name:nk]`
- cols_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[sum:Profit:qk]`
- series_field: `[federated.0zqvufs1onacp51cma8k0197mcg4].[Action (MY(Order Date))]`
- bar_orientation: `horizontal`
- zone: x=50000, y=41693, w=49375, h=57027
- highlight_fields: [federated.0zqvufs1onacp51cma8k0197mcg4].[Top 10 Customers], [federated.0zqvufs1onacp51cma8k0197mcg4].[none:Customer Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Monthly Profit, target=Dashboard Viz
## Highlight Bindings
- Top Customers: [federated.0zqvufs1onacp51cma8k0197mcg4].[Top 10 Customers], [federated.0zqvufs1onacp51cma8k0197mcg4].[none:Customer Name:nk]
- Top  Products: [federated.0zqvufs1onacp51cma8k0197mcg4].[Top 10 Products], [federated.0zqvufs1onacp51cma8k0197mcg4].[none:Product Name:nk]
- Monthly Profit: [federated.0zqvufs1onacp51cma8k0197mcg4].[yr:Order Date:ok]
