# Project Requirements

Create a React + TypeScript + Vite application that recreates the provided Tableau dashboard.

## 1. Project Setup

- **Tech Stack**: React 18+, TypeScript, Vite.
- **Visualization Library**: Use D3.js (v7+) primitives (`d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-selection`). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling**: Use standard CSS modules or styled-components. No UI component library (like Ant Design) is required.
- **Data Source**: The data file is available at `/data/fight-songs-538.csv`.

## 2. Data Loading

Implement a data loading utility to fetch and parse the CSV data.

- Use the native `fetch` API to retrieve the data from `/data/fight-songs-538.csv`.
- Parse the CSV text into a JSON array of objects. You can use `d3-dsv` (`d3.csvParse`) or a simple string splitter.
- Type the data row interface based on the columns found in the CSV: `school`, `conference`, `song_name`, `writers`, `year`, `student_writer`, `official_song`, `contest`, `bpm`, `sec_duration`, `fight`, `number_fights`, `victory`, `win_won`, `victory_win_won`, `rah`, `nonsense`, `colors`, `men`, `opponents`, `spelling`, `trope_count`, `spotify_id`.
- Ensure numeric fields (`bpm`, `sec_duration`, `number_fights`, `trope_count`) are parsed as numbers.

## 3. Component Architecture

The application should consist of the following main components:

### `App.tsx`
- Manages the global state for the dataset (`allData`) and the current selection (`selectedSchool` | `null`).
- Fetches data on mount.
- Renders the `Dashboard` component, passing data and selection state/handlers.

### `Dashboard.tsx`
- **Layout**: Use a CSS Grid or Flexbox container to replicate the Tableau layout.
  - The dashboard has a fixed aspect ratio or max-width (approx 1000px width).
  - **Top Section**: Contains the `DynamicTitle` component.
  - **Main Section**: Contains the `Scatterplot` component.
  - **Legend**: A color legend for 'Conference' should be displayed, typically floating to the right of the scatterplot or positioned below it.

### `DynamicTitle.tsx`
- **Props**: `selectedSchool` (string | null).
- **Logic**: Implements the Tableau calculation logic:
  - If `selectedSchool` is not null: Display `"How ${selectedSchool}'s Fight Song Stacks Up"`.
  - If `selectedSchool` is null: Display `"How College Fight Songs Stack Up"`.
- **Styling**: Font family should be 'Courier New', font size 15px, bold weight. Center align or left align based on the dashboard layout (Tableau default is usually left or center, the XML suggests a specific width, centering is often safer for web).

### `Scatterplot.tsx`
- **Props**: `data` (Array of song objects), `selectedSchool` (string | null), `onSchoolSelect` (function).
- **Visual Encoding**:
  - **Mark Type**: Circle.
  - **X-Axis**: `sec_duration` (Title: "Duration (in seconds)").
  - **Y-Axis**: `bpm` (Title: "Beats per minute").
  - **Color**: Encoded by `conference` dimension. Use `d3.scaleOrdinal(d3.schemeTableau10)` for the color palette.
  - **Opacity**: Set circle opacity to approximately 0.55 (derived from Tableau transparency value 142/255).
  - **Size**: Fixed radius (e.g., 5px or 6px).
- **Axes Configuration**:
  - Y-Axis Range: Fixed domain [60, 200].
  - X-Axis Range: Dynamic based on data (approx 0 to 180).
  - Include gridlines (horizontal and vertical).
- **Reference Lines**:
  - Calculate the average of `bpm` and `sec_duration` from the *visible* data (or full dataset).
  - Draw a dashed vertical line at the average duration.
  - Draw a dashed horizontal line at the average BPM.
- **Annotations**:
  - Place text labels in the four quadrants created by the reference lines:
    1. Top-Right (High BPM, High Dur): "Fast and Long" (Bold).
    2. Bottom-Right (Low BPM, High Dur): "Slow and long".
    3. Top-Left (High BPM, Low Dur): "Fast and short" (Bold).
    4. Bottom-Left (Low BPM, Low Dur): "Slow and short".
  - Font: Courier New.
- **Interactions**:
  - **Click**: Clicking a circle should trigger `onSchoolSelect(school)`, setting the global selection state.
  - **Hover**: Show a tooltip displaying the `school` name.
  - **Highlighting**: If a `selectedSchool` is active, reduce the opacity of non-selected circles (or fade them out) to highlight the selected one.

## 4. Interaction Logic

1.  **Initial Load**: The dashboard loads all data. The title reads "How College Fight Songs Stack Up". All dots are visible.
2.  **Selection**: User clicks a dot (school) in the scatterplot.
    - The `selectedSchool` state updates.
    - The `DynamicTitle` updates to the specific school name.
    - The `Scatterplot` highlights the selected school (others fade).
3.  **Deselection**: Clicking the same school again or clicking empty space (optional, but good UX) should reset `selectedSchool` to null, reverting the title and highlighting.

## 5. Sample Data

```json
[
  {
    "school": "Notre Dame",
    "conference": "Independent",
    "song_name": "Victory March",
    "writers": "Michael J. Shea and John F. Shea",
    "year": 1908,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 152,
    "sec_duration": 64,
    "fight": "Yes",
    "number_fights": 1,
    "victory": "Yes",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "Yes",
    "nonsense": "No",
    "colors": "Yes",
    "men": "Yes",
    "opponents": "No",
    "spelling": "No",
    "trope_count": 6,
    "spotify_id": "15a3ShKX3XWKzq0lSS48yr"
  },
  {
    "school": "Baylor",
    "conference": "Big 12",
    "song_name": "Old Fight",
    "writers": "Dick Baker and Frank Boggs",
    "year": 1947,
    "student_writer": "Yes",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 76,
    "sec_duration": 99,
    "fight": "Yes",
    "number_fights": 4,
    "victory": "Yes",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "No",
    "nonsense": "No",
    "colors": "Yes",
    "men": "No",
    "opponents": "No",
    "spelling": "Yes",
    "trope_count": 5,
    "spotify_id": "2ZsaI0Cu4nz8DHfBkPt0Dl"
  },
  {
    "school": "Iowa State",
    "conference": "Big 12",
    "song_name": "Iowa State Fights",
    "writers": "Jack Barker, Manly Rice, Paul Gnam, Rosalind K. Cook",
    "year": 1930,
    "student_writer": "Yes",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 155,
    "sec_duration": 55,
    "fight": "Yes",
    "number_fights": 5,
    "victory": "No",
    "win_won": "No",
    "victory_win_won": "No",
    "rah": "Yes",
    "nonsense": "No",
    "colors": "No",
    "men": "Yes",
    "opponents": "No",
    "spelling": "Yes",
    "trope_count": 4,
    "spotify_id": "3yyfoOXZQCtR6pfRJqu9pl"
  },
  {
    "school": "Ohio State",
    "conference": "Big Ten",
    "song_name": "Buckeye Battle Cry",
    "writers": "Frank Crumit",
    "year": 1919,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "Yes",
    "bpm": 178,
    "sec_duration": 89,
    "fight": "Yes",
    "number_fights": 1,
    "victory": "Yes",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "No",
    "nonsense": "No",
    "colors": "Yes",
    "men": "Yes",
    "opponents": "No",
    "spelling": "No",
    "trope_count": 5,
    "spotify_id": "2faIedehtxwQqYxRRc6T2L"
  },
  {
    "school": "Iowa",
    "conference": "Big Ten",
    "song_name": "Iowa Fight Song",
    "writers": "Meredith Willson",
    "year": 1950,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 150,
    "sec_duration": 72,
    "fight": "Yes",
    "number_fights": 9,
    "victory": "No",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "Yes",
    "nonsense": "No",
    "colors": "No",
    "men": "No",
    "opponents": "No",
    "spelling": "No",
    "trope_count": 3,
    "spotify_id": "604ELPPFgbFlW0SHoEYVJw"
  },
  {
    "school": "Clemson",
    "conference": "ACC",
    "song_name": "Tiger Rag",
    "writers": "Original Dixieland Jass Band",
    "year": 1917,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 145,
    "sec_duration": 78,
    "fight": "No",
    "number_fights": 0,
    "victory": "No",
    "win_won": "No",
    "victory_win_won": "No",
    "rah": "No",
    "nonsense": "No",
    "colors": "No",
    "men": "No",
    "opponents": "No",
    "spelling": "Yes",
    "trope_count": 1,
    "spotify_id": "7hGtgN4N9ebZTlC7xhvKIE"
  },
  {
    "school": "Illinois",
    "conference": "Big Ten",
    "song_name": "Oskee-Wow-Wow",
    "writers": "H.R. Green and H.V. Hill",
    "year": 1910,
    "student_writer": "Yes",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 162,
    "sec_duration": 60,
    "fight": "No",
    "number_fights": 0,
    "victory": "Yes",
    "win_won": "No",
    "victory_win_won": "Yes",
    "rah": "Yes",
    "nonsense": "Yes",
    "colors": "Yes",
    "men": "Yes",
    "opponents": "Yes",
    "spelling": "No",
    "trope_count": 6,
    "spotify_id": "6C0vaoMxzM21yYgJBmGx5K"
  },
  {
    "school": "Colorado",
    "conference": "Pac-12",
    "song_name": "Fight CU",
    "writers": "Richard Durnett",
    "year": "Unknown",
    "student_writer": "Unknown",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 151,
    "sec_duration": 27,
    "fight": "Yes",
    "number_fights": 8,
    "victory": "Yes",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "No",
    "nonsense": "No",
    "colors": "No",
    "men": "No",
    "opponents": "No",
    "spelling": "Yes",
    "trope_count": 4,
    "spotify_id": "0Q3VKlBT4lugyLG5n9LKIz"
  },
  {
    "school": "TCU",
    "conference": "Big 12",
    "song_name": "TCU Fight Song",
    "writers": "Claude Sammis",
    "year": 1928,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 149,
    "sec_duration": 47,
    "fight": "Yes",
    "number_fights": 2,
    "victory": "Yes",
    "win_won": "No",
    "victory_win_won": "Yes",
    "rah": "Yes",
    "nonsense": "No",
    "colors": "Yes",
    "men": "Yes",
    "opponents": "No",
    "spelling": "Yes",
    "trope_count": 6,
    "spotify_id": "0ItcRLvqHlbkaqMCPtQKUl"
  },
  {
    "school": "Vanderbilt",
    "conference": "SEC",
    "song_name": "Dynamite",
    "writers": "Francis Craig",
    "year": 1941,
    "student_writer": "No",
    "official_song": "Yes",
    "contest": "No",
    "bpm": 72,
    "sec_duration": 45,
    "fight": "Yes",
    "number_fights": 3,
    "victory": "Yes",
    "win_won": "Yes",
    "victory_win_won": "Yes",
    "rah": "No",
    "nonsense": "No",
    "colors": "No",
    "men": "No",
    "opponents": "No",
    "spelling": "No",
    "trope_count": 3,
    "spotify_id": "5tXWqJHiTDHRYtOngsBPAW"
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/fight-songs-538.csv

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
const rows = await loadCsv("/data/fight-songs-538.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5182/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Dynamic Title
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.11puer61m90mpg19d40mw1ku60q8].[Action (Conference,School)]`
- zone: x=800, y=1000, w=98400, h=8250
- highlight_fields: [federated.11puer61m90mpg19d40mw1ku60q8].[usr:Calculation_1314769640457560064:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.11puer61m90mpg19d40mw1ku60q8].[sum:bpm:qk]`
- cols_field: `[federated.11puer61m90mpg19d40mw1ku60q8].[sum:sec_duration:qk]`
- series_field: `[federated.11puer61m90mpg19d40mw1ku60q8].[none:conference:nk]`
- axis_title_rows: Beats per minute
- axis_title_cols: Duration (in seconds)
- zone: x=800, y=9250, w=98400, h=89750
- legend_required: true
- legend_field: `[federated.11puer61m90mpg19d40mw1ku60q8].[none:conference:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.11puer61m90mpg19d40mw1ku60q8].[none:conference:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Scatterplot, target=Dashboard 1
## Highlight Bindings
- Scatterplot: [federated.11puer61m90mpg19d40mw1ku60q8].[none:conference:nk]
- Dynamic Title: [federated.11puer61m90mpg19d40mw1ku60q8].[usr:Calculation_1314769640457560064:nk]
- Scatterplot: [federated.11puer61m90mpg19d40mw1ku60q8].[none:conference:nk]
