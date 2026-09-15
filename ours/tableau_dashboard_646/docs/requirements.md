# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Dashboard: A look at the sales trend of Games from 1980-2016".

Tech Stack:
- React + TypeScript + Vite.
- D3.js (v7+) for visualizations (use d3-scale, d3-shape, d3-axis, d3-array, d3-selection).
- CSS Grid for the main dashboard layout.
- No external UI component libraries (use standard HTML elements styled with CSS).

Data Loading:
- The data source is a CSV file located at `/data/processed_data_All.csv`.
- Use the `d3-dsv` library (or `d3.csv`) to fetch and parse the data.
- Implement a `useData` hook that fetches the CSV, parses it, and returns the typed array.
- The CSV columns are: Rank, Name, Platform, Year, Genre, Publisher, NA_Sales, EU_Sales, JP_Sales, Other_Sales, Global_Sales, Averaged_Sales.
- Ensure `Year` is parsed as a number.

Sample Data:
```json
[
  {
    "Rank": 29,
    "Name": "Gran Turismo 3: A-Spec",
    "Platform": "PS2",
    "Year": 2001.0,
    "Genre": "Racing",
    "Publisher": "Sony Computer Entertainment",
    "NA_Sales": 6.85,
    "EU_Sales": 5.09,
    "JP_Sales": 1.87,
    "Other_Sales": 1.16,
    "Global_Sales": 14.98,
    "Averaged_Sales": 3.850899743
  },
  {
    "Rank": 213,
    "Name": "LEGO Star Wars: The Complete Saga",
    "Platform": "DS",
    "Year": 2007.0,
    "Genre": "Action",
    "Publisher": "LucasArts",
    "NA_Sales": 2.89,
    "EU_Sales": 1.54,
    "JP_Sales": 0,
    "Other_Sales": 0.46,
    "Global_Sales": 4.9,
    "Averaged_Sales": 1.259640103
  },
  {
    "Rank": 271,
    "Name": "EyeToy Play",
    "Platform": "PS2",
    "Year": 2003.0,
    "Genre": "Misc",
    "Publisher": "Sony Computer Entertainment",
    "NA_Sales": 0.88,
    "EU_Sales": 2.3,
    "JP_Sales": 0.2,
    "Other_Sales": 0.83,
    "Global_Sales": 4.2,
    "Averaged_Sales": 1.079691517
  },
  {
    "Rank": 376,
    "Name": "Batman: Arkham Asylum",
    "Platform": "X360",
    "Year": 2009.0,
    "Genre": "Action",
    "Publisher": "Eidos Interactive",
    "NA_Sales": 2.2,
    "EU_Sales": 0.97,
    "JP_Sales": 0.02,
    "Other_Sales": 0.31,
    "Global_Sales": 3.5,
    "Averaged_Sales": 0.899742931
  },
  {
    "Rank": 135,
    "Name": "Red Dead Redemption",
    "Platform": "X360",
    "Year": 2010.0,
    "Genre": "Action",
    "Publisher": "Take-Two Interactive",
    "NA_Sales": 3.7,
    "EU_Sales": 1.97,
    "JP_Sales": 0.09,
    "Other_Sales": 0.57,
    "Global_Sales": 6.34,
    "Averaged_Sales": 1.629820051
  },
  {
    "Rank": 519,
    "Name": "WWE SmackDown! vs. Raw",
    "Platform": "PS2",
    "Year": 2002.0,
    "Genre": "Fighting",
    "Publisher": "THQ",
    "NA_Sales": 1.32,
    "EU_Sales": 1.08,
    "JP_Sales": 0.04,
    "Other_Sales": 0.39,
    "Global_Sales": 2.83,
    "Averaged_Sales": 0.727506427
  },
  {
    "Rank": 146,
    "Name": "Metal Gear Solid",
    "Platform": "PS",
    "Year": 1998.0,
    "Genre": "Action",
    "Publisher": "Konami Digital Entertainment",
    "NA_Sales": 3.18,
    "EU_Sales": 1.83,
    "JP_Sales": 0.78,
    "Other_Sales": 0.24,
    "Global_Sales": 6.03,
    "Averaged_Sales": 1.550128535
  },
  {
    "Rank": 541,
    "Name": "Tekken 6",
    "Platform": "PS3",
    "Year": 2009.0,
    "Genre": "Fighting",
    "Publisher": "Namco Bandai Games",
    "NA_Sales": 1.2,
    "EU_Sales": 0.98,
    "JP_Sales": 0.17,
    "Other_Sales": 0.43,
    "Global_Sales": 2.78,
    "Averaged_Sales": 0.714652956
  },
  {
    "Rank": 107,
    "Name": "Crash Bandicoot 3: Warped",
    "Platform": "PS",
    "Year": 1998.0,
    "Genre": "Platform",
    "Publisher": "Sony Computer Entertainment",
    "NA_Sales": 3.68,
    "EU_Sales": 1.75,
    "JP_Sales": 1.42,
    "Other_Sales": 0.28,
    "Global_Sales": 7.13,
    "Averaged_Sales": 1.832904884
  },
  {
    "Rank": 93,
    "Name": "Star Wars Battlefront (2015)",
    "Platform": "PS4",
    "Year": 2015.0,
    "Genre": "Shooter",
    "Publisher": "Electronic Arts",
    "NA_Sales": 2.93,
    "EU_Sales": 3.29,
    "JP_Sales": 0.22,
    "Other_Sales": 1.23,
    "Global_Sales": 7.67,
    "Averaged_Sales": 1.971722365
  }
]
```

State Management:
- Create a global filter state object (e.g., using React Context) to hold:
  - `selectedGenres`: string[] (default: all)
  - `selectedPublishers`: string[] (default: all)
  - `selectedPlatforms`: string[] (default: all)
  - `selectedYears`: number[] (default: range 1980-2016)
  - `highlightGenre`: string | null (for the highlighter interaction)
- All charts must re-render when this state changes.
- Clicking on a mark in any chart should update the relevant filter state (Use as Filter interaction).

Layout Specification:
- The main container should use CSS Grid.
- Grid Template Areas (approximate based on Tableau zones):
  - Header: "Dashboard: A look at the sales trend of Games from 1980-2016"
  - Left Column (Main Content):
    - Top Row: "Game sales overview of the year 1980-2016" (Left), "Averaged Global sales by Genre" (Right)
    - Middle Row: Text Block 1 (Left), Text Block 2 (Right)
    - Bottom Row: "Popular Video Games between 1980-1999" (Left), "Popular Video Games between 1999-2016" (Center), "Publisher and sales performance" (Right)
  - Right Column (Sidebar):
    - Images (Placeholders for controller images)
    - "Filters located here" text
    - Filter Controls (Platform, Year, Avg Sales, Publisher)
    - Highlighter (Genre)
    - Text Block 3

Component Specifications:

1. **GameSalesOverviewChart** (Worksheet: Game sales overview of the year 1980-2016)
   - **Type:** Stacked Area Chart (confirmed by text description "Using a stacked plot...").
   - **X-Axis:** Year (1980-2016). Use `d3.scaleLinear`.
   - **Y-Axis:** Sum of Global_Sales. Use `d3.scaleLinear`.
   - **Color:** Encoded by Genre. Use the specific color palette defined in the XML (color_blind_10_0).
   - **Interactions:** Clicking a specific area/genre filters the dashboard by that Genre.
   - **D3 Implementation:** Use `d3.stack()` to stack the areas by Genre, then `d3.area()` to draw the paths.

2. **AveragedGlobalSalesByGenreChart** (Worksheet: Averaged Global sales by Genre)
   - **Type:** Dot Plot (Horizontal).
   - **Y-Axis:** Genre (Categorical). Use `d3.scaleBand`.
   - **X-Axis:** Average of Global_Sales. Use `d3.scaleLinear`.
   - **Marks:** Circles. Color is fixed Red (#e15759) per XML style rule.
   - **Reference Line:** A vertical line representing the overall average of the average sales.
   - **Interactions:** Clicking a dot filters by that Genre.

3. **PopularVideoGamesPieChart** (Worksheet: Popular Video Games between 1980-1999 & 1999-2016)
   - **Type:** Pie Chart.
   - **Data:** Filter data by Year range (1980-1999 for one instance, 1999-2016 for the other).
   - **Value:** Sum of Global_Sales.
   - **Color:** Encoded by Genre (same palette as above).
   - **Labels:** Format: "<Genre> <Value> million".
   - **Interactions:** Clicking a slice filters by that Genre.
   - **D3 Implementation:** Use `d3.pie()` and `d3.arc()`.

4. **PublisherSalesPerformanceChart** (Worksheet: Publisher and sales performance)
   - **Type:** Dot Plot (Horizontal) with Labels.
   - **Y-Axis:** Publisher. Sorted Descending by Average Global Sales.
   - **X-Axis:** Average of Global_Sales.
   - **Marks:** Circles. Color encoded by Publisher (use the specific Publisher palette from XML).
   - **Labels:** Display the Platform name inside or next to the circle.
   - **Reference Line:** Vertical line for the average.
   - **Interactions:** Clicking a dot filters by that Publisher.

5. **Filter Controls**
   - **Platform:** Dropdown (Select element). Single select or Multi-select (XML says 'dropdown', usually single in Tableau unless 'checklist'). XML says 'mode="dropdown"'.
   - **Year:** Multi-select checklist (XML says 'mode="checkdropdown"').
   - **Avg Global Sales:** Range slider (XML indicates quantitative filter).
   - **Publisher:** Multi-select checklist (XML says 'mode="checkdropdown"').
   - **Genre Highlighter:** A list of genres or a dropdown to select a genre to highlight across all charts (dims non-selected genres).

6. **Text Blocks**
   - Preserve exact text from the XML zones (id 42, 43, 51, 29).
   - Zone 42: "We have an overview break down global game sales from 1980 to 2016. Using a stacked plot we attempt to establish if there is a dominant genre or visible trend from the data plotted. We can somewhat see that sports genre had more of a success between 2006 to 2009. Then the shooter genre took off as the dominant genre in sales. To explore this more, we dive to a more indepth break down by looking at the publishers and their sales performance."
   - Zone 43: "From breaking down the publishers, we know that Nintendo thrived over the other publishers between 2004 and 2008. Setting record with Wii Sports. But that dominance, did not last long until the new shooter genres took over with the Call of Duty series and other titles."
   - Zone 51: "We were not able to discover a definitive trend over time, but found a volatile gaming market. That changed trends rapidly without much warning and favor to publishers. Nintendo got lucky and had it's success streak for a while until more recent times. The data indicates that the shooter genre took off after the 2009 and has seen continuous popularity and success"
   - Zone 29: "Filters located here"

Color Palettes (from XML):
- Genre Palette (color_blind_10_0):
  Action: #1170aa, Sports: #1170aa, Misc: #57606c, Platform: #5fa2ce, Racing: #7b848f, Fighting: #a3acb9, Role-Playing: #a3cce9, Puzzle: #c85200, Simulation: #c8d0d9, Adventure: #fc7d0b, Strategy: #fc7d0b, Shooter: #ffbc79.
- Publisher Palette (color_blind_10_0):
  (Map specific publishers to hex codes provided in the XML <map> tags, e.g., Nintendo: #ffbe7d, Electronic Arts: #e15759, etc.).

Implementation Details:
- Ensure the app is responsive, but prioritize the desktop layout defined in the XML.
- Use TypeScript interfaces for the data rows.
- Handle loading states and errors gracefully.
- Do not use any charting libraries (like Recharts or Chart.js); build the charts using D3.js primitives within React components (using `useRef` for the SVG container).

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/processed_data_All.csv

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
const rows = await loadCsv("/data/processed_data_All.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_646/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Averaged Global sales by Genre
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- cols_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[avg:Global_Sales:qk]`
- series_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- axis_title_cols: Avg. Global Sales (in millions)
- zone: x=43717, y=7465, w=43247, h=42463
- highlight_fields: [federated.0yrk2r51de03wg19dphp80w7wm3o].[attr:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Name:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:ok], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Game sales overview of the year 1980-2016
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[sum:Global_Sales:qk]`
- cols_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:ok]`
- series_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- bar_orientation: `vertical`
- zone: x=483, y=7465, w=36656, h=34354
- legend_required: true
- legend_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Name:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Popular Video Games between 1980-1999
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- zone: x=43717, y=58937, w=21618, h=40033
- highlight_fields: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year (copy)_413205318226034688:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Popular Video Games between 1999-2016
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]`
- zone: x=65335, y=58937, w=21629, h=40033
- highlight_fields: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year (copy)_413205318226034688:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Publisher and sales performance
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk]`
- cols_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[avg:Global_Sales:qk]`
- series_field: `[federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Platform:nk]`
- axis_title_cols: Avg. Global Sales (in millions)
- zone: x=483, y=60352, w=43234, h=38618
- highlight_fields: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=86964, y=47622, w=12553, h=44273): We were not able to discover a definitive trend over time, but found a volatile gaming market. That changed trends rapidly without much warning and favor to publishers. Nintendo got lucky and had it's success streak for a while until more recent times. The data indicates that the shooter genre took off after the 2009 and has seen continuous popularity and success
- zone(x=483, y=41819, w=36656, h=18533): We have an overview break down global game sales from 1980 to 2016. Using a stacked plot we attempt to establish if there is a dominant genre or visible trend from the data plotted. We can somewhat see that sports genre had more of a success between 2006 to 2009. Then the shooter genre took off as the dominant genre in sales. To explore this more, we dive to a more indepth break down by looking at the publishers and their sales performance.
- zone(x=43717, y=49928, w=43247, h=9009): From breaking down the publishers, we know that Nintendo thrived over the other publishers between 2004 and 2008. Setting record with Wii Sports. But that dominance, did not last long until the new shooter genres took over with the Call of Duty series and other titles.
- zone(x=86964, y=1287, w=11949, h=8237): Filters located here
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Game sales overview of the year 1980-2016, target=Dashboard: A look at the sales trend of Games from 1980-2016
- Filter 2 (generated): kind=filter_action, source=Publisher and sales performance, target=Dashboard: A look at the sales trend of Games from 1980-2016
- Filter 3 (generated): kind=filter_action, source=Popular Video Games between 1980-1999, target=Dashboard: A look at the sales trend of Games from 1980-2016
- Filter 4 (generated): kind=filter_action, source=Popular Video Games between 1999-2016, target=Dashboard: A look at the sales trend of Games from 1980-2016
- Filter 5 (generated): kind=filter_action, source=Averaged Global sales by Genre, target=Dashboard: A look at the sales trend of Games from 1980-2016
## Highlight Bindings
- Averaged Global sales by Genre: [federated.0yrk2r51de03wg19dphp80w7wm3o].[attr:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Name:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:ok], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:qk]
- Game sales overview of the year 1980-2016: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Name:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year:qk]
- Publisher and sales performance: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Platform:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk]
- Popular Video Games between 1980-1999: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year (copy)_413205318226034688:qk]
- Popular Video Games between 1999-2016: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk], [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Year (copy)_413205318226034688:qk]
- Averaged Global sales by Genre: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Name:nk]
- Game sales overview of the year 1980-2016: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Genre:nk]
- Publisher and sales performance: [federated.0yrk2r51de03wg19dphp80w7wm3o].[none:Publisher:nk]
