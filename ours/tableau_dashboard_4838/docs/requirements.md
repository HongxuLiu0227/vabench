# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Dashboard 1' (inferred from workbook context) analyzing Telco Customer Churn.

## Tech Stack
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7). Use primitives like `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`. Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** CSS Modules or Tailwind CSS (preferred for layout utility). Use CSS Grid for the main dashboard layout.
- **Data Parsing:** `d3-dsv` (d3.csvParse).

## Data Loading
The application must load data from `/data/WA_Fn-UseC_-Telco-Customer-Churn.csv`.

Implement a custom hook `useTelcoData.ts`:
```typescript
import { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';

interface TelcoRecord {
  customerID: string;
  gender: 'Male' | 'Female';
  SeniorCitizen: 0 | 1;
  Partner: 'Yes' | 'No';
  Dependents: 'Yes' | 'No';
  tenure: number;
  PhoneService: 'Yes' | 'No';
  MultipleLines: 'Yes' | 'No' | 'No phone service';
  InternetService: 'DSL' | 'Fiber optic' | 'No';
  OnlineSecurity: 'Yes' | 'No' | 'No internet service';
  OnlineBackup: 'Yes' | 'No' | 'No internet service';
  DeviceProtection: 'Yes' | 'No' | 'No internet service';
  TechSupport: 'Yes' | 'No' | 'No internet service';
  StreamingTV: 'Yes' | 'No' | 'No internet service';
  StreamingMovies: 'Yes' | 'No' | 'No internet service';
  Contract: 'Month-to-month' | 'One year' | 'Two year';
  PaperlessBilling: 'Yes' | 'No';
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number; // Note: Handle potential empty strings/blanks in CSV parsing
  Churn: 'Yes' | 'No';
}

export const useTelcoData = () => {
  const [data, setData] = useState<TelcoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/WA_Fn-UseC_-Telco-Customer-Churn.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const parsedData = csvParse<TelcoRecord>(csvText, (d) => ({
          ...d,
          SeniorCitizen: d.SeniorCitizen === '1' ? 1 : 0,
          tenure: +d.tenure,
          MonthlyCharges: +d.MonthlyCharges,
          TotalCharges: d.TotalCharges === '' ? 0 : +d.TotalCharges,
        }));
        setData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
```

## Sample Data
```json
[
  {
    "customerID": "3272-VUHPV",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "Yes",
    "tenure": 8,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "No",
    "TechSupport": "Yes",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "No",
    "PaymentMethod": "Bank transfer (automatic)",
    "MonthlyCharges": 56.3,
    "TotalCharges": 401.5,
    "Churn": "No"
  },
  {
    "customerID": "2890-WFBHU",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 59,
    "PhoneService": "Yes",
    "MultipleLines": "Yes",
    "InternetService": "DSL",
    "OnlineSecurity": "Yes",
    "OnlineBackup": "Yes",
    "DeviceProtection": "Yes",
    "TechSupport": "Yes",
    "StreamingTV": "No",
    "StreamingMovies": "Yes",
    "Contract": "One year",
    "PaperlessBilling": "No",
    "PaymentMethod": "Credit card (automatic)",
    "MonthlyCharges": 79.85,
    "TotalCharges": 4786.1,
    "Churn": "No"
  },
  {
    "customerID": "7228-OMTPN",
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 4,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 88.45,
    "TotalCharges": 370.65,
    "Churn": "Yes"
  },
  {
    "customerID": "0682-USIXD",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "No",
    "tenure": 21,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "Yes",
    "StreamingTV": "Yes",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 86.05,
    "TotalCharges": 1818.9,
    "Churn": "No"
  },
  {
    "customerID": "9851-QXEEQ",
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 41,
    "PhoneService": "Yes",
    "MultipleLines": "Yes",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "Yes",
    "TechSupport": "No",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 104.7,
    "TotalCharges": 4346.4,
    "Churn": "Yes"
  },
  {
    "customerID": "4800-VHZKI",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 1,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "No",
    "OnlineSecurity": "No internet service",
    "OnlineBackup": "No internet service",
    "DeviceProtection": "No internet service",
    "TechSupport": "No internet service",
    "StreamingTV": "No internet service",
    "StreamingMovies": "No internet service",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Mailed check",
    "MonthlyCharges": 19.9,
    "TotalCharges": 19.9,
    "Churn": "Yes"
  },
  {
    "customerID": "5845-BZZIB",
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "Yes",
    "tenure": 35,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "No",
    "OnlineSecurity": "No internet service",
    "OnlineBackup": "No internet service",
    "DeviceProtection": "No internet service",
    "TechSupport": "No internet service",
    "StreamingTV": "No internet service",
    "StreamingMovies": "No internet service",
    "Contract": "Two year",
    "PaperlessBilling": "No",
    "PaymentMethod": "Mailed check",
    "MonthlyCharges": 20.1,
    "TotalCharges": 655.3,
    "Churn": "No"
  },
  {
    "customerID": "7657-DYEPJ",
    "gender": "Male",
    "SeniorCitizen": 1,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 38,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "Yes",
    "TechSupport": "Yes",
    "StreamingTV": "Yes",
    "StreamingMovies": "No",
    "Contract": "One year",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Credit card (automatic)",
    "MonthlyCharges": 70.15,
    "TotalCharges": 2497.35,
    "Churn": "Yes"
  },
  {
    "customerID": "6214-EDAKZ",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "Yes",
    "tenure": 22,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "No",
    "TechSupport": "Yes",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "No",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 55.15,
    "TotalCharges": 1206.05,
    "Churn": "Yes"
  },
  {
    "customerID": "0247-SLUJI",
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "Yes",
    "tenure": 1,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "No",
    "OnlineSecurity": "No internet service",
    "OnlineBackup": "No internet service",
    "DeviceProtection": "No internet service",
    "TechSupport": "No internet service",
    "StreamingTV": "No internet service",
    "StreamingMovies": "No internet service",
    "Contract": "Month-to-month",
    "PaperlessBilling": "No",
    "PaymentMethod": "Mailed check",
    "MonthlyCharges": 19.7,
    "TotalCharges": 19.7,
    "Churn": "No"
  }
]
```

## Dashboard Layout & Components
The dashboard consists of multiple worksheets. Since the specific dashboard XML zone definitions were truncated, arrange the components in a responsive CSS Grid layout that logically groups the visualizations.

**Global Styles:**
- Font Family: 'Tableau Bold', sans-serif (fallback to system sans-serif).
- Title Color: `#f28e2b` (Orange).
- Text Color: `#000000`.
- Tooltip Color: `#f28e2b`.

### Component Specifications

#### 1. ChurnRateSheet (Pie Chart)
- **Type:** Donut/Pie Chart.
- **Data:** Count of `Churn` (Yes/No).
- **Encodings:**
  - Angle: Count of records.
  - Color: `Churn` field.
    - 'No': `#75a1c7`
    - 'Yes': `#989ca3`
- **Labels:**
  - Outer Label: Percentage of Total.
  - Center Text: "Total Customer" (Bold, size 10) + Total Count (Size 15).
- **Implementation:** Use `d3.pie()` and `d3.arc()`. Create a donut chart by setting `innerRadius`.

#### 2. PhoneServiceSheet (Pie Chart)
- **Type:** Donut/Pie Chart.
- **Data:** Count of `PhoneService` (Yes/No).
- **Encodings:**
  - Angle: Count of records.
  - Color: `PhoneService` field (Use default categorical palette or match Churn colors if specific mapping not found, usually Tableau defaults to blue/orange). *Note: XML doesn't specify explicit colors for PhoneService, use a standard palette (e.g., Tableau 10).*
- **Labels:**
  - Outer Label: Percentage of Total.
  - Center Text: "Total Customer" (Bold, size 10) + Total Count (Size 10).

#### 3. CitizenSheet (Text Table / KPI)
- **Type:** Text Table.
- **Data:** Two calculated metrics.
  - Row 1: "Senior Citizen" -> Sum of `SeniorCitizen` (where 1=Yes).
  - Row 2: "NO" -> Count of records - Sum of `SeniorCitizen`.
- **Visuals:**
  - Display text in a clean list format.
  - Color: `#72b966` (Greenish) for the marks/text.

#### 4. GenericHorizontalBarSheet (Reusable Component)
Most other sheets follow this pattern. Create a reusable component `HorizontalBarChart` accepting props for `data`, `dimension` (field name), and `colorMap`.

**Sheets to implement using this component:**
- **Backup** (`OnlineBackup`): Title "Online Backup".
- **Contract** (`Contract`): Title "Contract".
- **Dependents** (`Dependents`): Title "Dependents".
- **Device Protection** (`DeviceProtection`): Title "Device Protection".
- **Gender** (`gender`): Title "Gender".
- **Movies** (`StreamingMovies`): Title "Streaming Movies".
- **Partner** (`Partner`): Title "Partner". *Note: Aliases: 'No' -> 'No Partner', 'Yes' -> 'Have Partner'.*
- **Payment Method** (`PaymentMethod`): Title "Payment Method".
- **Security** (`OnlineSecurity`): Title "Online Security".
- **Support** (`TechSupport`): Title "Tech Support".
- **TV** (`StreamingTV`): Title "Streaming TV".
- **Internet** (`InternetService`): Title "Internet ".
- **Paperless Billing** (`PaperlessBilling`): Title "Paperless Billing".
- **Multiple Lines** (`MultipleLines`): Title "Multiple Lines".

**Generic Component Specs:**
- **Type:** Horizontal Bar Chart.
- **Rows (Y-Axis):** The Dimension field (e.g., `gender`, `Contract`).
- **Columns (X-Axis):** Count of records (`CNT`).
- **Encodings:**
  - X-Length: Count.
  - Color: The Dimension field.
  - Label: The Count value displayed at the end of the bar.
- **Specific Color Maps (from XML):**
  - **Gender:** Male -> `#76b7b2`, Female -> `#ff9da7`.
  - **Partner:** No -> `#76b7b2`, Yes -> `#ff9da7`.
  - **Dependents:** No -> `#4e79a7`, Yes -> `#f28e2b`.
  - **Contract:** Two year -> `#64cdcc`, Month-to-month -> `#9c755f`, One year -> `#a4a4d5`.
  - **InternetService:** No -> `#26897e`, Fiber optic -> `#87d180`, DSL -> `#94a323`.
  - **PaymentMethod:** Electronic check -> `#8c564b`, Mailed check -> `#9edae5`, Credit card (automatic) -> `#c5b0d5`, Bank transfer (automatic) -> `#e377c2`.
  - **MultipleLines:** Yes -> `#59a14f`, No -> `#e15759`, No phone service -> `#edc948`.
  - **DeviceProtection:** No -> `#4e79a7`, Yes -> `#e15759`, No internet service -> `#f28e2b`.

### Interactions
- **Highlighting:** The workbook defines a "Highlight" action.
  - When a user interacts (e.g., hovers or clicks) with a bar in the `Gender` sheet, corresponding data points (or bars) in other sheets should visually highlight (e.g., dim non-selected items).
  - Implement a Context API `DashboardContext` to track the currently selected dimension/value pair (e.g., `{ dimension: 'gender', value: 'Male' }`).
  - Pass this context to all chart components. If a filter is active, reduce opacity of non-matching elements.

### Layout Structure (Dashboard.tsx)
Use a CSS Grid layout. A suggested structure:
- **Header:** Dashboard Title (Color `#f28e2b`).
- **Top Row:** `ChurnRateSheet`, `PhoneServiceSheet`, `CitizenSheet` (Key Metrics).
- **Middle Section:** Demographics (Gender, Partner, Dependents, Senior Citizen).
- **Bottom Section:** Services & Billing (Contract, Internet, Payment, etc.).

Ensure the layout is responsive (stack columns on mobile).

### Implementation Details
- **D3 Integration:** Use `useRef` to select SVG elements. Use `useEffect` to render charts. Ensure cleanup of previous D3 selections to avoid memory leaks or double rendering.
- **Margins:** Define standard margins for axes and labels.
- **Responsiveness:** Listen to window resize events to update D3 scales (`viewBox` or re-render).

### Summary of Deliverables
1.  `App.tsx`: Main entry.
2.  `Dashboard.tsx`: Grid layout container.
3.  `useTelcoData.ts`: Data fetching hook.
4.  `DashboardContext.tsx`: State management for interactions.
5.  `ChurnRateChart.tsx`: Pie chart implementation.
6.  `PhoneServiceChart.tsx`: Pie chart implementation.
7.  `CitizenTable.tsx`: Text table implementation.
8.  `HorizontalBarChart.tsx`: Reusable bar chart.
9.  `types.ts`: TypeScript interfaces.
10. `colors.ts`: Constant color mappings.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_4838/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Backup
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk]`
- bar_orientation: `horizontal`
- zone: x=25000, y=54875, w=13800, h=14750
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Churn rate
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `([federated.19jtpq90ymq6fq14rs9nt1hebysn].[usr:Calculation_1852668344581492999:qk] + [federated.19jtpq90ymq6fq14rs9nt1hebysn].[usr:Calculation_1852668344581746953:qk])`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk]`
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Citizen
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[Multiple Values]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names]`
- zone: x=49200, y=11875, w=20500, h=14375
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Contract
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Contract:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Contract:nk]`
- bar_orientation: `horizontal`
- zone: x=25200, y=27000, w=22500, h=18750
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Contract:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Dependents
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk]`
- bar_orientation: `horizontal`
- category_order: Yes, No
- zone: x=73200, y=11875, w=20500, h=14375
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Device Protection
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:DeviceProtection:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:DeviceProtection:nk]`
- bar_orientation: `horizontal`
- zone: x=1300, y=52500, w=22300, h=17000
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:DeviceProtection:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Gender
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]`
- bar_orientation: `horizontal`
- zone: x=1200, y=11875, w=20500, h=14375
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Movies
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingMovies:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingMovies:nk]`
- bar_orientation: `horizontal`
- zone: x=53000, y=54875, w=15700, h=14125
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingMovies:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Partner
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]`
- bar_orientation: `horizontal`
- category_order: Yes, No
- zone: x=25200, y=11875, w=20500, h=14375
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Payment Method
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk]`
- bar_orientation: `horizontal`
- zone: x=71900, y=27000, w=26400, h=18750
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Phone service
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `([federated.19jtpq90ymq6fq14rs9nt1hebysn].[usr:Calculation_1852668344621695264:qk] + [federated.19jtpq90ymq6fq14rs9nt1hebysn].[usr:Calculation_1852668344621789474:qk])`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]`
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Security
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineSecurity:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineSecurity:nk]`
- bar_orientation: `horizontal`
- zone: x=38600, y=54875, w=13500, h=14500
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineSecurity:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Support
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:TechSupport:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:TechSupport:nk]`
- bar_orientation: `horizontal`
- zone: x=85000, y=54875, w=12900, h=12875
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:TechSupport:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: TV
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingTV:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingTV:nk]`
- bar_orientation: `horizontal`
- zone: x=70200, y=54875, w=12800, h=13875
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingTV:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: churn
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk]`
- zone: x=2100, y=87500, w=21400, h=3750
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: churn (2)
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk]`
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: internet service
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:InternetService:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:InternetService:nk]`
- bar_orientation: `horizontal`
- zone: x=48800, y=27000, w=23300, h=14000
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:InternetService:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: lines
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk]`
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk]`
- bar_orientation: `horizontal`
- category_order: Yes, No, No phone service
- zone: x=1200, y=27000, w=22500, h=18750
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: phs
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]`
- zone: x=47300, y=87000, w=28200, h=3125
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: phs (2)
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[__tableau_internal_object_id__].[cnt:WA_Fn-UseC_-Telco-Customer-Churn.csv_C6004F48DA344B86B670C3533F69FD51:qk]`
- series_field: `[federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]`
- highlight_fields: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=1000, w=98400, h=7125): Telco Customer Churn, a telephone company business scenario Customer attrition, also known as customer churn, or customer defection, is the loss of customers
- zone(x=1700, y=46125, w=24000, h=3750): Managed Services Usage
- zone(x=1800, y=76125, w=20300, h=8125): Churn Rate Orange indicates customers lost
- zone(x=47000, y=76125, w=28300, h=8125): Phone Service Usage Orange indicates customers not using service
- zone(x=36200, y=96250, w=22100, h=3750): Project Data Source: Kaggle
- zone(x=1700, y=9500, w=24800, h=3750): Customer Demographics
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Gender, target=Gender
  fields: Gender
- Highlight 2 (generated): kind=highlight_brush, source=Dashboard 1, target=Dashboard 1
## Highlight Bindings
- Gender: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Partner: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Citizen: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names]
- Dependents: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- lines: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Contract: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Contract:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- internet service: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:InternetService:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Payment Method: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Device Protection: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Backup: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Security: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineSecurity:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Movies: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingMovies:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- TV: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:StreamingTV:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Support: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:MultipleLines:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:OnlineBackup:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PaymentMethod:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:TechSupport:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:gender:nk]
- Churn rate: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk]
- Phone service: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
- churn: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]
- churn (2): [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk]
- phs: [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
- phs (2): [federated.19jtpq90ymq6fq14rs9nt1hebysn].[:Measure Names], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[attr:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn (copy)_1852668344639775025:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Churn:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Dependents:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:Partner:nk], [federated.19jtpq90ymq6fq14rs9nt1hebysn].[none:PhoneService:nk]
