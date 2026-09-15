# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard for Diabetes Readmission Analysis.

The source Tableau workbook uses the dataset 'Diabetes_Cleaned.csv'. The workbook XML defines specific columns and a calculated grouping for readmission status, but the specific dashboard layout XML was truncated. Therefore, you must implement a standard Exploratory Data Analysis (EDA) dashboard layout that best utilizes the available data fields defined in the datasource.

## 1. Data Loading

The application must load data from `/data/Diabetes_Cleaned.csv`.

Use the following pattern in `src/App.tsx` or a dedicated `src/hooks/useData.ts`:

```typescript
import { csv } from 'd3-dsv';
import { useEffect, useState } from 'react';

interface DiabetesRecord {
  encounter_id: number;
  patient_nbr: number;
  race: string;
  gender: string;
  age: string;
  weight: string;
  admission_type_id: number;
  discharge_disposition_id: number;
  admission_source_id: number;
  time_in_hospital: number;
  payer_code: string;
  medical_specialty: string;
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;
  diag_1: string;
  diag_2: string;
  diag_3: string;
  number_diagnoses: number;
  max_glu_serum: string;
  A1Cresult: string;
  metformin: string;
  repaglinide: string;
  nateglinide: string;
  chlorpropamide: string;
  glimepiride: string;
  acetohexamide: string;
  glipizide: string;
  glyburide: string;
  tolbutamide: string;
  pioglitazone: string;
  rosiglitazone: string;
  acarbose: string;
  miglitol: string;
  troglitazone: string;
  tolazamide: string;
  examide: string;
  citoglipton: string;
  insulin: string;
  'glyburide-metformin': string;
  'glipizide-metformin': string;
  'glimepiride-pioglitazone': string;
  'metformin-rosiglitazone': string;
  'metformin-pioglitazone': string;
  change: string;
  diabetesMed: string;
  readmitted: string;
}

export const useData = () => {
  const [data, setData] = useState<DiabetesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/Diabetes_Cleaned.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const parsedData = csv<DiabetesRecord>(csvText);
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

## 2. Data Transformation

The Tableau workbook defines a calculated field `[readmitted (group)]` which maps values `">30"` and `"NO"` to `"Not Readmitted"`. You must implement this logic in the React application before passing data to charts.

```typescript
// Helper function to apply Tableau logic
const transformData = (data: DiabetesRecord[]) => {
  return data.map(d => ({
    ...d,
    readmitted_group: (d.readmitted === '>30' || d.readmitted === 'NO') ? 'Not Readmitted' : 'Readmitted' // Assuming <30 is the only other value based on dataset context
  }));
};
```

## 3. Component Architecture

Create the following component structure:

### `src/App.tsx`
- Main container.
- Manages global state for `filters` (e.g., selected Race, Gender, Age range).
- Fetches data using `useData`.
- Filters data based on state.
- Renders `Dashboard` passing filtered data.

### `src/components/Dashboard.tsx`
- Layout container using CSS Grid.
- **Layout:** A responsive grid with a sidebar for filters and a main area for visualizations.
- **Grid Areas:**
  - `sidebar`: Filters (Race, Gender, Age, Readmission Status).
  - `header`: Title "Diabetes Readmission Analysis".
  - `kpi-row`: Top row of KPI cards.
  - `charts`: Grid of chart components.

### `src/components/KPICard.tsx`
- Props: `title` (string), `value` (number | string), `format` (optional).
- Displays a simple card with a label and a large value.
- **Usage:** Display "Total Encounters", "Readmission Rate".

### `src/components/charts/BarChart.tsx`
- **Tech:** D3.js (d3-scale, d3-axis, d3-shape, d3-array).
- **Props:** `data` (array), `x` (accessor function), `y` (accessor function), `width`, `height`, `color` (optional).
- **Visuals:** Vertical bars. X-axis for categorical dimensions (Race, Gender), Y-axis for Count.
- **Interactions:** Tooltip on hover showing exact count and category.

### `src/components/charts/Histogram.tsx`
- **Tech:** D3.js.
- **Props:** `data` (array), `value` (accessor function), `width`, `height`.
- **Visuals:** Binned distribution for continuous measures (Time in Hospital, Num Lab Procedures).
- **Logic:** Use `d3.bin()` to calculate bins dynamically.

### `src/components/charts/StackedBarChart.tsx`
- **Tech:** D3.js.
- **Props:** `data`, `x`, `y`, `stack` (accessor for grouping, e.g., `readmitted_group`).
- **Visuals:** Bars split by color to show the proportion of Readmitted vs Not Readmitted across categories (e.g., Age buckets).

## 4. Dashboard Layout & Visualization Mapping

Since the specific dashboard layout XML was truncated, implement the following logical layout based on the available columns:

**Row 1: KPIs**
- Total Encounters (Count of `encounter_id`)
- Readmission Rate (Count of `readmitted_group === 'Readmitted'` / Total)
- Avg Time in Hospital (Average of `time_in_hospital`)

**Row 2: Demographics**
- **Chart 1:** Bar Chart of `race` distribution.
- **Chart 2:** Bar Chart of `gender` distribution.
- **Chart 3:** Bar Chart of `age` distribution.

**Row 3: Clinical Metrics**
- **Chart 4:** Histogram of `time_in_hospital`.
- **Chart 5:** Histogram of `num_lab_procedures`.
- **Chart 6:** Histogram of `num_medications`.

**Row 4: Readmission Analysis**
- **Chart 7:** Stacked Bar Chart: X-axis=`age`, Color=`readmitted_group`. (Shows readmission risk by age).
- **Chart 8:** Stacked Bar Chart: X-axis=`num_medications` (binned), Color=`readmitted_group`.

## 5. Styling

- Use CSS Modules or Styled Components.
- Maintain a clean, clinical aesthetic (whites, grays, blues).
- Ensure charts are responsive (use `viewBox` or resize listeners).
- Typography: Sans-serif (Inter or system fonts).

## 6. Sample Data

```json
[
  {
    "﻿\"\"\"encounter_id\"\"\"": 118909710,
    "\"patient_nbr\"": 24383520,
    "\"race\"": "AfricanAmerican",
    "\"gender\"": "Female",
    "\"age\"": "[80-90)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 11,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 10,
    "\"payer_code\"": "MC",
    "\"medical_specialty\"": "InternalMedicine",
    "\"num_lab_procedures\"": 50,
    "\"num_procedures\"": 1,
    "\"num_medications\"": 26,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 1,
    "\"diag_1\"": "Congenital Anomalies",
    "\"diag_2\"": "Blood and Blood-Forming Organs",
    "\"diag_3\"": "Circulatory",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "No",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "No",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 71584620,
    "\"patient_nbr\"": 16740945,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[80-90)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 2,
    "\"discharge_disposition_id\"": 1,
    "\"admission_source_id\"": 4,
    "\"time_in_hospital\"": 2,
    "\"payer_code\"": "?",
    "\"medical_specialty\"": "Cardiology",
    "\"num_lab_procedures\"": 37,
    "\"num_procedures\"": 2,
    "\"num_medications\"": 16,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Injury and Poisoning",
    "\"diag_2\"": "Circulatory",
    "\"diag_3\"": "Circulatory",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Steady",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": ">30"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 50573808,
    "\"patient_nbr\"": 3321378,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[70-80)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 3,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 6,
    "\"payer_code\"": "?",
    "\"medical_specialty\"": "InternalMedicine",
    "\"num_lab_procedures\"": 49,
    "\"num_procedures\"": 0,
    "\"num_medications\"": 12,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 1,
    "\"diag_1\"": "Musculoskeletal System and Connective Tissue",
    "\"diag_2\"": "Skin and Subcutaneous Tissue",
    "\"diag_3\"": "Genitourinary",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "No",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "No",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 44601192,
    "\"patient_nbr\"": 112786587,
    "\"race\"": "AfricanAmerican",
    "\"gender\"": "Female",
    "\"age\"": "[80-90)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 3,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 7,
    "\"payer_code\"": "?",
    "\"medical_specialty\"": "?",
    "\"num_lab_procedures\"": 78,
    "\"num_procedures\"": 2,
    "\"num_medications\"": 19,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 1,
    "\"diag_1\"": "Circulatory",
    "\"diag_2\"": "Circulatory",
    "\"diag_3\"": "Diabetes",
    "\"number_diagnoses\"": 8,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Down",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "Ch",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 224002080,
    "\"patient_nbr\"": 78864840,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[80-90)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 6,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 1,
    "\"payer_code\"": "MC",
    "\"medical_specialty\"": "?",
    "\"num_lab_procedures\"": 46,
    "\"num_procedures\"": 1,
    "\"num_medications\"": 15,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Respiratory",
    "\"diag_2\"": "Genitourinary",
    "\"diag_3\"": "Circulatory",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "Steady",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Steady",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "Ch",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": ">30"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 88161516,
    "\"patient_nbr\"": 481689,
    "\"race\"": "AfricanAmerican",
    "\"gender\"": "Male",
    "\"age\"": "[50-60)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 3,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 10,
    "\"payer_code\"": "MC",
    "\"medical_specialty\"": "InternalMedicine",
    "\"num_lab_procedures\"": 73,
    "\"num_procedures\"": 6,
    "\"num_medications\"": 23,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Musculoskeletal System and Connective Tissue",
    "\"diag_2\"": "Respiratory",
    "\"diag_3\"": "Infectious and Parasitic",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Steady",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 323753000,
    "\"patient_nbr\"": 124551176,
    "\"race\"": "Caucasian",
    "\"gender\"": "Male",
    "\"age\"": "[40-50)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 1,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 1,
    "\"payer_code\"": "?",
    "\"medical_specialty\"": "InternalMedicine",
    "\"num_lab_procedures\"": 41,
    "\"num_procedures\"": 0,
    "\"num_medications\"": 10,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Digestive",
    "\"diag_2\"": "Circulatory",
    "\"diag_3\"": "Digestive",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Steady",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 179182644,
    "\"patient_nbr\"": 40963005,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[70-80)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 1,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 1,
    "\"payer_code\"": "MC",
    "\"medical_specialty\"": "?",
    "\"num_lab_procedures\"": 11,
    "\"num_procedures\"": 0,
    "\"num_medications\"": 11,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Endocrine, Nutritional, Metabolic, Immunity",
    "\"diag_2\"": "Genitourinary",
    "\"diag_3\"": "External causes of injury",
    "\"number_diagnoses\"": 6,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "No",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "No",
    "\"diabetesMed\"": "No",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 95781414,
    "\"patient_nbr\"": 90535635,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[30-40)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 1,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 2,
    "\"payer_code\"": "CP",
    "\"medical_specialty\"": "?",
    "\"num_lab_procedures\"": 58,
    "\"num_procedures\"": 0,
    "\"num_medications\"": 9,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 0,
    "\"diag_1\"": "Diabetes",
    "\"diag_2\"": "Respiratory",
    "\"diag_3\"": "Not Required",
    "\"number_diagnoses\"": 2,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": null,
    "\"metformin\"": "No",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "Down",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "Ch",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": "NO"
  },
  {
    "﻿\"\"\"encounter_id\"\"\"": 72226212,
    "\"patient_nbr\"": 3750408,
    "\"race\"": "Caucasian",
    "\"gender\"": "Female",
    "\"age\"": "[50-60)",
    "\"weight\"": "?",
    "\"admission_type_id\"": 1,
    "\"discharge_disposition_id\"": 6,
    "\"admission_source_id\"": 7,
    "\"time_in_hospital\"": 3,
    "\"payer_code\"": "?",
    "\"medical_specialty\"": "?",
    "\"num_lab_procedures\"": 46,
    "\"num_procedures\"": 0,
    "\"num_medications\"": 18,
    "\"number_outpatient\"": 0,
    "\"number_emergency\"": 0,
    "\"number_inpatient\"": 4,
    "\"diag_1\"": "Circulatory",
    "\"diag_2\"": "Skin and Subcutaneous Tissue",
    "\"diag_3\"": "Diabetes",
    "\"number_diagnoses\"": 9,
    "\"max_glu_serum\"": null,
    "\"A1Cresult\"": "Norm",
    "\"metformin\"": "Up",
    "\"repaglinide\"": "No",
    "\"nateglinide\"": "No",
    "\"chlorpropamide\"": "No",
    "\"glimepiride\"": "No",
    "\"acetohexamide\"": "No",
    "\"glipizide\"": "No",
    "\"glyburide\"": "No",
    "\"tolbutamide\"": "No",
    "\"pioglitazone\"": "No",
    "\"rosiglitazone\"": "No",
    "\"acarbose\"": "No",
    "\"miglitol\"": "No",
    "\"troglitazone\"": "No",
    "\"tolazamide\"": "No",
    "\"examide\"": "No",
    "\"citoglipton\"": "No",
    "\"insulin\"": "No",
    "\"glyburide-metformin\"": "No",
    "\"glipizide-metformin\"": "No",
    "\"glimepiride-pioglitazone\"": "No",
    "\"metformin-rosiglitazone\"": "No",
    "\"metformin-pioglitazone\"": "No",
    "\"change\"": "Ch",
    "\"diabetesMed\"": "Yes",
    "\"readmitted\"": ">30"
  }
]
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine5_10700/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Diag1 vs Readmit
- chart_intent: `horizontal_stacked_percentage_bar`
- rows_field: `[federated.0an9erx07ypvk517e4x211dma9am].[__tableau_internal_object_id__].[pcto:cnt:Diabetes_OnlyDiag123Cleaned_19Cats.csv_F882F7FE6E8A4616A9B7B9127921A2C1:qk]`
- cols_field: `([federated.0an9erx07ypvk517e4x211dma9am].[none:diag_1:nk] / [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)])`
- series_field: `[federated.0an9erx07ypvk517e4x211dma9am].[none:diag_1:nk]`
- bar_orientation: `horizontal`
- series_order: %all%
- stacking_normalized_to_percent: true
- aggregate_by_series_field: true
- expected_series_values: %all%
- zone: x=693, y=1351, w=98614, h=32433
- highlight_fields: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_1:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render one horizontal stacked bar per category.
- rule: Normalize each category bar to 100%.
- rule: Aggregate by series_field so each category has one segment per series category.
- rule: Do not reinterpret stacked-percentage bars as heatmap/table matrices or grouped bars.
- rule: Render stacked segment order exactly as series_order.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Diag2 vs Readmit
- chart_intent: `horizontal_stacked_percentage_bar`
- rows_field: `[federated.0an9erx07ypvk517e4x211dma9am].[__tableau_internal_object_id__].[pcto:cnt:Diabetes_OnlyDiag123Cleaned_19Cats.csv_F882F7FE6E8A4616A9B7B9127921A2C1:qk]`
- cols_field: `([federated.0an9erx07ypvk517e4x211dma9am].[none:diag_2:nk] / [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)])`
- series_field: `[federated.0an9erx07ypvk517e4x211dma9am].[none:diag_2:nk]`
- bar_orientation: `horizontal`
- series_order: %all%
- stacking_normalized_to_percent: true
- aggregate_by_series_field: true
- expected_series_values: %all%
- zone: x=693, y=33784, w=98614, h=32432
- highlight_fields: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_2:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render one horizontal stacked bar per category.
- rule: Normalize each category bar to 100%.
- rule: Aggregate by series_field so each category has one segment per series category.
- rule: Do not reinterpret stacked-percentage bars as heatmap/table matrices or grouped bars.
- rule: Render stacked segment order exactly as series_order.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Diag3 vs Readmit
- chart_intent: `horizontal_stacked_percentage_bar`
- rows_field: `[federated.0an9erx07ypvk517e4x211dma9am].[__tableau_internal_object_id__].[pcto:cnt:Diabetes_OnlyDiag123Cleaned_19Cats.csv_F882F7FE6E8A4616A9B7B9127921A2C1:qk]`
- cols_field: `([federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk] / [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)])`
- series_field: `[federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk]`
- bar_orientation: `horizontal`
- series_order: Circulatory, Diabetes, Endocrine, Nutritional, Metabolic, Immunity, Respiratory, Genitourinary, External causes of injury, Digestive, Mental Disorders, Skin and Subcutaneous Tissue, Blood and Blood-Forming Organs, Other Symptoms, Injury and Poisoning, Musculoskeletal System and Connective Tissue, Infectious and Parasitic, Neoplasms, Nervous, Not Required, Congenital Anomalies, Pregnancy, Childbirth, Sense Organs, %all%
- stacking_normalized_to_percent: true
- aggregate_by_series_field: true
- expected_series_values: Circulatory, Diabetes, Endocrine, Nutritional, Metabolic, Immunity, Respiratory, Genitourinary, External causes of injury, Digestive, Mental Disorders, Skin and Subcutaneous Tissue, Blood and Blood-Forming Organs, Other Symptoms, Injury and Poisoning, Musculoskeletal System and Connective Tissue, Infectious and Parasitic, Neoplasms, Nervous, Not Required, Congenital Anomalies, Pregnancy, Childbirth, Sense Organs, %all%
- zone: x=693, y=66216, w=98614, h=32433
- highlight_fields: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render one horizontal stacked bar per category.
- rule: Normalize each category bar to 100%.
- rule: Aggregate by series_field so each category has one segment per series category.
- rule: Do not reinterpret stacked-percentage bars as heatmap/table matrices or grouped bars.
- rule: Render stacked segment order exactly as series_order.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Diag1 vs Readmit, target=Dashboard 1
- Filter 2 (generated): kind=filter_action, source=Diag2 vs Readmit, target=Dashboard 1
- Filter 3 (generated): kind=filter_action, source=Diag3 vs Readmit, target=Dashboard 1
## Highlight Bindings
- A1Cresult: [federated.0an9erx07ypvk517e4x211dma9am].[none:A1Cresult:nk]
- A1Cresult vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:A1Cresult:nk], [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk], [federated.0an9erx07ypvk517e4x211dma9am].[none:gender:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Admin_Source_Id: [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_source_id:ok]
- Admin_Source_Id vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_source_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_type_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Admin_Type_Id: [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_source_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_type_id:ok]
- Admin_Type_Id vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_source_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[none:admission_type_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Age Distribution: [federated.0an9erx07ypvk517e4x211dma9am].[none:age:nk]
- Age vs Readmission: [federated.0an9erx07ypvk517e4x211dma9am].[none:age:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Change: [federated.0an9erx07ypvk517e4x211dma9am].[none:A1Cresult:nk], [federated.0an9erx07ypvk517e4x211dma9am].[none:change:nk]
- Change vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:change:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- DiabetesMed: [federated.0an9erx07ypvk517e4x211dma9am].[none:diabetesMed:nk]
- DiabetesMed vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:diabetesMed:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Diag_1: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_1:nk]
- Diag1 vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_1:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Diag_2: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_2:nk]
- Diag2 vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_2:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Diag_3: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk]
- Diag3 vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:diag_3:nk], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
- Dis_Id: [federated.0an9erx07ypvk517e4x211dma9am].[none:discharge_disposition_id:ok]
- Dis_Id vs Readmit: [federated.0an9erx07ypvk517e4x211dma9am].[none:discharge_disposition_id:ok], [federated.0an9erx07ypvk517e4x211dma9am].[readmitted (group)]
