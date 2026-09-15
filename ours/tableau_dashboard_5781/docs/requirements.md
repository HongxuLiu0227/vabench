# Project Requirements

You are an expert React engineer. Your task is to implement a dashboard application that replicates the functionality and design of the provided Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like d3-scale, d3-axis, d3-shape, d3-selection).
- CSS Modules or Styled Components for styling (no external UI component libraries like Ant Design).

## Data Loading

The application must load data from the public folder at runtime.

1.  **Primary Data Source**: `/data/TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv`
    -   This corresponds to the '20200217 test_tableau_LaunchMonth' datasource.
    -   Contains columns: `color_ID`, `LaunchDate_ID`, `merchant_ID`, `month_ID`, `Season_ID`, `CumulativeUnits`, `Solid_Flag.Non.Solid`, `totalsales_1W`, `units_1W`, `cluster.1`, `cluster.2`, `avgprice`, `Linear Preds`, `Randomforest Preds`, `XGBoost Preds`, `Bagging Preds`.

2.  **Secondary Data Source**: `/data/TEMP_18y7hw40viidyy134x5u807v8m5r.csv`
    -   This corresponds to the '20200218 Clusterprofiles' datasource.
    -   Contains columns: `COLOR_DESCRIPTION`, `count_sku`, `count_styles`, `count_merchantclass`, `totalsales`, `units`, `total_margins`, `avg_margins`, `avg_price`, `cluster`.

**Implementation Instructions:**
Create a `useData` hook or utility function that uses `fetch()` to retrieve these CSV files. Use `d3-dsv` (d3.csvParse) to parse the text into JSON objects. Type the data interfaces strictly based on the column names above.

## State Management

You must manage the following global state (using React Context or a state library like Zustand/Redux):

1.  **Parameters**:
    -   `trainTest`: string (default: "Test Accuracy"). Options: "Train Accuracy", "Test Accuracy".
    -   `model`: string (default: "Linear Regression"). Options: "Linear Regression", "Decision Tree", "Random Forest ", "XGBoost".

2.  **Filters**:
    -   `solidFlag`: string (default: "Solid"). Derived from `Solid_Flag.Non.Solid` (1 = Non-Solid, 0 = Solid).
    -   `season`: string (default: "SUMMER").
    -   `clusters`: string[] (multi-select). Options: "Cluster-1", "Cluster-2", "Cluster-3".
    -   `merchants`: string[] (multi-select). Derived from `merchant_ID`.
    -   `months`: string[] (multi-select). Derived from `month_ID`.

## Calculated Fields

Implement these logic functions to transform raw data rows:

1.  **Observed**: `Math.exp(row.CumulativeUnits)`
2.  **Model Parameter (Prediction)**:
    -   If `model` === "Linear Regression": `row['Linear Preds']`
    -   If `model` === "Decision Tree": `row['Bagging Preds']`
    -   If `model` === "Random Forest ": `row['Randomforest Preds']`
    -   If `model` === "XGBoost": `row['XGBoost Preds']`
3.  **MAE (Mean Absolute Error)**: `Math.abs(Observed - ModelParameter)`
4.  **Color - MAE**:
    -   If `MAE < 150`: "Low Variance"
    -   If `MAE < 280`: "Medium Variance"
    -   Else: "High Variance"
5.  **Cluster Label**:
    -   If `row['cluster.1'] === 1`: "Cluster-1"
    -   If `row['cluster.2'] === 1`: "Cluster-2"
    -   Else: "Cluster-3"

## Dashboard Layout & Components

The application should render a main container. Based on the workbook, there are two main views. Implement a layout that allows viewing the "Model Performance" dashboard as the primary view, with components for "Cluster Profiles" available.

### View 1: Model Performance Dashboard

**Layout:**
-   **Header**: Title "Model Performance".
-   **Controls Bar**: Dropdowns for `Parameters` (Model, Train/Test).
-   **Main Content**:
    -   **Left/Center (Large)**: `ModelPredictionsScatterPlot` component.
    -   **Right/Bottom**: `MAEValuesTable` component.

**Component: ModelPredictionsScatterPlot**
-   **Type**: Scatter Plot using D3.
-   **Data**: Filtered `TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv` data.
-   **Encodings**:
    -   **X-Axis**: "Actuals" (Calculated `Observed`). Linear scale.
    -   **Y-Axis**: "Predictions" (Calculated `Model Parameter`). Linear scale.
    -   **Color**: `Color - MAE`.
        -   Map: "Low Variance" -> `#59a14f`, "Medium Variance" -> `#f28e2b`, "High Variance" -> `#b60a1c`.
    -   **Shape**: Circle (filled).
-   **Interactions**:
    -   Tooltip on hover showing: Observed, Predicted, MAE, Color ID, Merchant ID.
    -   Clicking a point should trigger a highlight action (dim other points).
-   **Title**: Dynamic string `"Model Predictions - <Selected Model>"`.

**Component: MAEValuesTable**
-   **Type**: Text Table / Summary Card.
-   **Data**: Aggregated MAE values.
-   **Logic**: Calculate the Average MAE for the currently filtered data.
-   **Display**: A large text display or simple table showing the Average MAE.

### View 2: Cluster Profiles Dashboard

**Layout:**
-   **Header**: Title "Cluster Profiles".
-   **Grid**: A 1x3 or 3x1 grid of bar charts.

**Component: PatternsInClusterBarChart**
-   **Title**: "No. of Patterns".
-   **Data**: `TEMP_18y7hw40viidyy134x5u807v8m5r.csv`.
-   **Encodings**:
    -   **X-Axis**: `cluster` (1, 2, 3).
    -   **Y-Axis**: Count of records (Number of Patterns).
    -   **Color**: `cluster`.

**Component: UnitsSoldBarChart**
-   **Title**: "No. of Units Sold".
-   **Data**: `TEMP_18y7hw40viidyy134x5u807v8m5r.csv`.
-   **Encodings**:
    -   **X-Axis**: `cluster`.
    -   **Y-Axis**: Sum of `units`.
    -   **Color**: `cluster`.

**Component: AvgPriceBarChart**
-   **Title**: "Average Unit Price".
-   **Data**: `TEMP_18y7hw40viidyy134x5u807v8m5r.csv`.
-   **Encodings**:
    -   **X-Axis**: `cluster`.
    -   **Y-Axis**: Weighted Average Price (`sum(avg_price * units) / sum(units)`). Format as currency ($#,##0.00).
    -   **Color**: `cluster`.

## Styling & UX
-   Use a clean, sans-serif font (Inter, Roboto, or system-ui).
-   Ensure charts are responsive (resize observer or viewBox).
-   Implement the filters as a sidebar or a top bar panel.
-   Default filters on load: `Solid_Flag.Non.Solid` = 0 (Solid), `Season_ID` = "SUMMER".

## Sample Data

```json
[
  {
    "﻿\"\"\"color_ID\"\"\"": "Cut Vines",
    "\"LaunchDate_ID\"": "2018-05-03",
    "\"merchant_ID\"": "Backpacks",
    "\"month_ID\"": "May",
    "\"Season_ID\"": "SUMMER",
    "\"CumulativeUnits\"": 7.323170718,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 8.604618,
    "\"totalsales_2W\"": 9.039032462,
    "\"totalsales_3W\"": 9.17064389,
    "\"units_1W\"": 3.9703107810000002,
    "\"units_2W\"": 4.6347386969999995,
    "\"units_3W\"": 4.875204957,
    "\"launched_2M\"": 5,
    "\"launched_3M\"": 9,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 1,
    "\"avgprice\"": 113.6097561,
    "\"launched_1M\"": 1,
    "\"relativeprice\"": 1.328407745,
    "\"Linear Preds\"": 474.1205609,
    "\"Randomforest Preds\"": 676.4560123,
    "\"XGBoost Preds\"": 732.1363858,
    "\"Bagging Preds\"": 877.376747
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Lotus Chevron",
    "\"LaunchDate_ID\"": "2017-11-02",
    "\"merchant_ID\"": "Travel Bags",
    "\"month_ID\"": "November",
    "\"Season_ID\"": "Winter",
    "\"CumulativeUnits\"": 4.418840608,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 6.929713425,
    "\"totalsales_2W\"": 6.98109031,
    "\"totalsales_3W\"": 6.81958068,
    "\"units_1W\"": 2.302685088,
    "\"units_2W\"": 2.397986178,
    "\"units_3W\"": 2.197335682,
    "\"launched_2M\"": 6,
    "\"launched_3M\"": 8,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 1,
    "\"avgprice\"": 121.3333333,
    "\"launched_1M\"": 3,
    "\"relativeprice\"": 1.661514006,
    "\"Linear Preds\"": 39.22444216,
    "\"Randomforest Preds\"": 58.22919794,
    "\"XGBoost Preds\"": 47.19534448,
    "\"Bagging Preds\"": 66.30021589
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Falling Flowers",
    "\"LaunchDate_ID\"": "2017-07-06",
    "\"merchant_ID\"": "Lunch Bags",
    "\"month_ID\"": "July",
    "\"Season_ID\"": "Fall",
    "\"CumulativeUnits\"": 6.704414355,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 7.377934518,
    "\"totalsales_2W\"": 7.321850375,
    "\"totalsales_3W\"": 7.940829792,
    "\"units_1W\"": 3.891840706,
    "\"units_2W\"": 3.806684712,
    "\"units_3W\"": 4.4426630209999995,
    "\"launched_2M\"": 5,
    "\"launched_3M\"": 5,
    "\"cluster.1\"": 1,
    "\"cluster.2\"": 0,
    "\"avgprice\"": 34.0,
    "\"launched_1M\"": 3,
    "\"relativeprice\"": 1.24013018,
    "\"Linear Preds\"": 642.9572006,
    "\"Randomforest Preds\"": 681.9911177,
    "\"XGBoost Preds\"": 743.5704729,
    "\"Bagging Preds\"": 503.787894
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Ditsy Dot",
    "\"LaunchDate_ID\"": "2017-06-15",
    "\"merchant_ID\"": "Backpacks",
    "\"month_ID\"": "June",
    "\"Season_ID\"": "Fall",
    "\"CumulativeUnits\"": 6.177944114,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 8.043824226,
    "\"totalsales_2W\"": 7.62730142,
    "\"totalsales_3W\"": 8.224220079,
    "\"units_1W\"": 3.295873902,
    "\"units_2W\"": 2.944491609,
    "\"units_3W\"": 3.526389936,
    "\"launched_2M\"": 3,
    "\"launched_3M\"": 4,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 1,
    "\"avgprice\"": 113.875,
    "\"launched_1M\"": 3,
    "\"relativeprice\"": 1.295931969,
    "\"Linear Preds\"": 227.6738699,
    "\"Randomforest Preds\"": 317.1301742,
    "\"XGBoost Preds\"": 361.3342425,
    "\"Bagging Preds\"": 215.6214355
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Cool Lagoon",
    "\"LaunchDate_ID\"": "2017-03-07",
    "\"merchant_ID\"": "Cosmetics",
    "\"month_ID\"": "March",
    "\"Season_ID\"": "SUMMER",
    "\"CumulativeUnits\"": 5.521460918,
    "\"Solid_Flag.Non.Solid\"": 0,
    "\"totalsales_1W\"": 6.670894323,
    "\"totalsales_2W\"": 6.407623934,
    "\"totalsales_3W\"": 7.259159055,
    "\"units_1W\"": 2.944491609,
    "\"units_2W\"": 2.708116866,
    "\"units_3W\"": 3.850168878,
    "\"launched_2M\"": 1,
    "\"launched_3M\"": 1,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 0,
    "\"avgprice\"": 42.59259259,
    "\"launched_1M\"": 1,
    "\"relativeprice\"": 2.346259956,
    "\"Linear Preds\"": 218.4030347,
    "\"Randomforest Preds\"": 202.7788729,
    "\"XGBoost Preds\"": 202.617279,
    "\"Bagging Preds\"": 166.1873382
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Lavender Meadow",
    "\"LaunchDate_ID\"": "2019-04-03",
    "\"merchant_ID\"": "Backpacks",
    "\"month_ID\"": "April",
    "\"Season_ID\"": "Spring",
    "\"CumulativeUnits\"": 5.780743516,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 8.136811156,
    "\"totalsales_2W\"": 8.282736133,
    "\"totalsales_3W\"": 7.914618074,
    "\"units_1W\"": 3.663587287,
    "\"units_2W\"": 3.663587287,
    "\"units_3W\"": 3.332240224,
    "\"launched_2M\"": 10,
    "\"launched_3M\"": 12,
    "\"cluster.1\"": 1,
    "\"cluster.2\"": 0,
    "\"avgprice\"": 98.96226415,
    "\"launched_1M\"": 4,
    "\"relativeprice\"": 1.374956432,
    "\"Linear Preds\"": 363.0375098,
    "\"Randomforest Preds\"": 382.5701413,
    "\"XGBoost Preds\"": 364.6971933,
    "\"Bagging Preds\"": 355.0802764
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Black",
    "\"LaunchDate_ID\"": "2017-07-30",
    "\"merchant_ID\"": "Totes",
    "\"month_ID\"": "July",
    "\"Season_ID\"": "Fall",
    "\"CumulativeUnits\"": 6.042632834,
    "\"Solid_Flag.Non.Solid\"": 0,
    "\"totalsales_1W\"": 8.806051222,
    "\"totalsales_2W\"": 8.761918336,
    "\"totalsales_3W\"": -6.907755279,
    "\"units_1W\"": 3.9703107810000002,
    "\"units_2W\"": 3.93184524,
    "\"units_3W\"": -6.907755279,
    "\"launched_2M\"": 0,
    "\"launched_3M\"": 0,
    "\"cluster.1\"": 1,
    "\"cluster.2\"": 0,
    "\"avgprice\"": 141.1730769,
    "\"launched_1M\"": 0,
    "\"relativeprice\"": 1.0,
    "\"Linear Preds\"": 65.97204786,
    "\"Randomforest Preds\"": 225.7900502,
    "\"XGBoost Preds\"": 267.1355365,
    "\"Bagging Preds\"": 392.5771625
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Tossed Posies Pink",
    "\"LaunchDate_ID\"": "2019-02-02",
    "\"merchant_ID\"": "Backpacks",
    "\"month_ID\"": "February",
    "\"Season_ID\"": "Spring",
    "\"CumulativeUnits\"": 4.454347296,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 6.442478063,
    "\"totalsales_2W\"": 6.870179053,
    "\"totalsales_3W\"": 7.123351219,
    "\"units_1W\"": 1.791926122,
    "\"units_2W\"": 2.197335682,
    "\"units_3W\"": 2.833272166,
    "\"launched_2M\"": 3,
    "\"launched_3M\"": 8,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 1,
    "\"avgprice\"": 115.0,
    "\"launched_1M\"": 3,
    "\"relativeprice\"": 1.42810239,
    "\"Linear Preds\"": 130.8148857,
    "\"Randomforest Preds\"": 103.2760179,
    "\"XGBoost Preds\"": 85.72219642,
    "\"Bagging Preds\"": 136.5654112
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Go Fish",
    "\"LaunchDate_ID\"": "2018-02-01",
    "\"merchant_ID\"": "Wallets",
    "\"month_ID\"": "February",
    "\"Season_ID\"": "Spring",
    "\"CumulativeUnits\"": 5.411646052,
    "\"Solid_Flag.Non.Solid\"": 1,
    "\"totalsales_1W\"": 7.179118165,
    "\"totalsales_2W\"": 8.036065842,
    "\"totalsales_3W\"": 6.249571686,
    "\"units_1W\"": 3.401230714,
    "\"units_2W\"": 4.521799447,
    "\"units_3W\"": 2.48498998,
    "\"launched_2M\"": 4,
    "\"launched_3M\"": 6,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 1,
    "\"avgprice\"": 46.05970149,
    "\"launched_1M\"": 3,
    "\"relativeprice\"": 1.164245748,
    "\"Linear Preds\"": 119.3000369,
    "\"Randomforest Preds\"": 244.6729614,
    "\"XGBoost Preds\"": 262.4596738,
    "\"Bagging Preds\"": 170.1529847
  },
  {
    "﻿\"\"\"color_ID\"\"\"": "Turquoise Sea",
    "\"LaunchDate_ID\"": "2017-03-04",
    "\"merchant_ID\"": "IDs/Keychains",
    "\"month_ID\"": "March",
    "\"Season_ID\"": "SUMMER",
    "\"CumulativeUnits\"": 6.647688374,
    "\"Solid_Flag.Non.Solid\"": 0,
    "\"totalsales_1W\"": 6.764705588,
    "\"totalsales_2W\"": 7.571669819,
    "\"totalsales_3W\"": 7.381346839,
    "\"units_1W\"": 3.610944939,
    "\"units_2W\"": 4.488647606,
    "\"units_3W\"": 4.382039135,
    "\"launched_2M\"": 1,
    "\"launched_3M\"": 2,
    "\"cluster.1\"": 0,
    "\"cluster.2\"": 0,
    "\"avgprice\"": 23.98058252,
    "\"launched_1M\"": 2,
    "\"relativeprice\"": 2.712655762,
    "\"Linear Preds\"": 671.3101737,
    "\"Randomforest Preds\"": 701.4167788,
    "\"XGBoost Preds\"": 915.0513803,
    "\"Bagging Preds\"": 783.914161
  }
]
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5781/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: # Patterns in the Cluster
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[sum:Number of Records:qk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- bar_orientation: `vertical`
- axis_title_rows: # Patterns
- zone: x=800, y=8750, w=32500, h=45125
- legend_required: true
- legend_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- legend_relative_position: above
- highlight_fields: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: # Units Sold
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[sum:units:qk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- bar_orientation: `vertical`
- zone: x=33300, y=53875, w=32950, h=45125
- highlight_fields: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Avg Price in the cluster
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[usr:Calculation_94857087572549639:qk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- bar_orientation: `vertical`
- axis_title_rows: Avg Price
- zone: x=66250, y=53875, w=32950, h=45125
- highlight_fields: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: MAE Values
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Model Predictions
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533715459:qk]`
- cols_field: `([federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533387778:qk] + [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533715459:qk])`
- series_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087539785733:nk]`
- bar_orientation: `horizontal`
- series_order: LOW Varaince, High Variance, Medium Variance, Low Variance, %all%
- expected_series_values: LOW Varaince, High Variance, Medium Variance, Low Variance, %all%
- axis_title_rows: Predictions
- axis_title_cols: Actuals
- highlight_fields: [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087539785733:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532371968:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533387778:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533715459:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Season_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:color_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:merchant_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:month_ID:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Name of the Patterns
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:COLOR_DESCRIPTION:nk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[:Measure Names]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[Action (Cluster)]`
- zone: x=66250, y=8750, w=32950, h=45125
- highlight_fields: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:COLOR_DESCRIPTION:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:Calculation_3941634857564180481:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:Calculation_94857087571648518:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok], [federated.122jyyo0azry0c19lsg5k1llllnb].[usr:Calculation_3941634857562062848:nk:1], [federated.122jyyo0azry0c19lsg5k1llllnb].[usr:Calculation_3941634857562062848:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales 
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[sum:totalsales:qk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- bar_orientation: `vertical`
- axis_title_rows: Sales ($)
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Sheet 10
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk]`
- cols_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[:Measure Names]`
- series_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[:Measure Names]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Sheet 9
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[avg:count_merchantclass:qk]`
- cols_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- series_field: `[federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]`
- bar_orientation: `vertical`
- axis_title_rows: # Merchant Class
- zone: x=33300, y=8750, w=32950, h=45125
- highlight_fields: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Summary
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[:Measure Names]`
- cols_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk]`
- series_field: `[federated.06zw2ru072erjo14l70v61ngkhc8].[:Measure Names]`
- category_order: [federated.06zw2ru072erjo14l70v61ngkhc8].[avg:Calculation_1057431142530928640:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[avg:MAE Liner Pred (copy)_1057431142531407874:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[avg:MAE Decision Pred (copy)_1057431142531837955:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[avg:MAE Decision Pred (copy)_1057431142532128772:qk]
- highlight_fields: [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Season_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:cluster.1:ok], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:cluster.2:ok], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:merchant_ID:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=1000, w=98400, h=7750): Cluster Profiles - Based on first 3-week Performance
- zone(x=800, y=1000, w=82400, h=7999): MODEL PERFORMANCE
## Dashboard Actions
- Filter1: kind=filter_action, source=# Patterns in the Cluster, target=Cluster Profiles
- Highlight 1 (generated): kind=highlight_brush, source=Model Predictions, target=Model Predictions
  fields: Color - MAE
- Highlight 2 (generated): kind=highlight_brush, source=Model Performance, target=Model Performance
  fields: Color - MAE
## Highlight Bindings
- # Patterns in the Cluster: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- Name of the Patterns: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:COLOR_DESCRIPTION:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:Calculation_3941634857564180481:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:Calculation_94857087571648518:nk], [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok], [federated.122jyyo0azry0c19lsg5k1llllnb].[usr:Calculation_3941634857562062848:nk:1], [federated.122jyyo0azry0c19lsg5k1llllnb].[usr:Calculation_3941634857562062848:nk]
- Model Predictions: [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087539785733:nk]
- # Patterns in the Cluster: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- # Units Sold: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- Avg Price in the cluster: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- Model Predictions: [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532371968:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533387778:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087533715459:qk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Season_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:color_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:merchant_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:month_ID:nk]
- Sales : [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- Sheet 9: [federated.122jyyo0azry0c19lsg5k1llllnb].[none:cluster:ok]
- Summary: [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Calculation_94857087532646401:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:Season_ID:nk], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:cluster.1:ok], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:cluster.2:ok], [federated.06zw2ru072erjo14l70v61ngkhc8].[none:merchant_ID:nk]
