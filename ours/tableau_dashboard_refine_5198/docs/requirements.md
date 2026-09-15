# Project Requirements

You are a Senior React Engineer tasked with recreating a Tableau dashboard as a single-page application using React, TypeScript, and Vite.

## Project Overview
The application visualizes tweet sentiment analysis data regarding political figures (Kirchner, Macri, Lavagna). It consists of a main dashboard ('Dashboard 1') and a storyboard ('Historia 1').

## Tech Stack
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7+) for primitives (scales, shapes, axes). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex tooltips; prefer raw D3 for fidelity.
- **Styling:** CSS Modules or Tailwind CSS (optional, but keep it simple). Use CSS Grid/Flexbox for layout.
- **Data Parsing:** D3-DSV.

## Data Loading
The data source is a CSV file located at `/data/tweets_classification.csv`.

**Critical Parsing Details:**
1.  **Delimiter:** The CSV uses a pipe `|` separator, not a comma. Use `d3.dsvFormat("|").parse` or `d3.dsv("|")`.
2.  **Locale:** The data originates from `es_AR` locale. Numbers might use `,` as a decimal separator and `.` as thousands separator. Ensure parsing handles this correctly (e.g., `d3.formatLocale`).
3.  **Columns:**
    - `created_at` (DateTime)
    - `name` (String - User)
    - `followers_count` (Integer)
    - `favorite_count` (Integer)
    - `retweet_count` (Integer)
    - `flag` (String - 'Kirchner', 'Macri', 'Lavagna')
    - `full_text` (String)
    - `label` (String - 'error', 'positive', 'neutral', 'negative')

**Implementation:**
Create a `useData` hook that fetches the file, parses it, and returns the typed array. Handle loading and error states.

## Sample Data
```json
[
  {
    "": 548,
    "id": 1113496722074947584,
    "created_at": "2019-04-03 17:41:20",
    "name": "Nicocaveri",
    "followers_count": 64,
    "favorite_count": 0,
    "retweet_count": 297,
    "flag": "Lavagna",
    "full_text": "RT @nachomdeo: Las campañas de Massa y Lavagna estan volcando mas pesos en la economia que las exportaciones de soja.",
    "label": "neutral"
  },
  {
    "": 475,
    "id": 1113502812640612354,
    "created_at": "2019-04-03 18:05:33",
    "name": "GnashKane",
    "followers_count": 1101,
    "favorite_count": 1,
    "retweet_count": 0,
    "flag": "Kirchner",
    "full_text": "Kirchner",
    "label": "neutral"
  },
  {
    "": 582,
    "id": 1113513346110775296,
    "created_at": "2019-04-03 18:47:24",
    "name": "eucaliptu",
    "followers_count": 615,
    "favorite_count": 0,
    "retweet_count": 29,
    "flag": "Macri",
    "full_text": "RT @elcancillercom: \"Hoy Macri cumple 1209 años...\" #Massa 🤭",
    "label": "neutral"
  },
  {
    "": 207,
    "id": 1113510785169408000,
    "created_at": "2019-04-03 18:37:13",
    "name": "BandaKirchner",
    "followers_count": 2401,
    "favorite_count": 0,
    "retweet_count": 0,
    "flag": "Kirchner",
    "full_text": "Y si ponen presos a otros \"\"Inocentes pelotudos\"\", palabra textual de sicarios narcos socios de Kirchner, Fernandez, Rousseau, Stinfale, Luis Rodriguez. Si Corte Lorenzetti Com del delito impune Py, Toc 15, Salva, Oyarbide y otr encubren 12 años. Quian Zavalia absolvio a q matan",
    "label": "negative"
  },
  {
    "": 430,
    "id": 1113500367529103372,
    "created_at": "2019-04-03 17:55:50",
    "name": "Charly_S_",
    "followers_count": 110,
    "favorite_count": 0,
    "retweet_count": 878,
    "flag": "Lavagna",
    "full_text": "RT @PeroniaRepublic: Lo midieron a Espert: Muerto.   A Massa: Muerto   A Lavagna con toda la tarasca, Muerto.   A Pichetto, Muerto.   A Urtubey…",
    "label": "positive"
  },
  {
    "": 315,
    "id": 1113504793820057601,
    "created_at": "2019-04-03 18:13:25",
    "name": "unajo_dida",
    "followers_count": 1378,
    "favorite_count": 0,
    "retweet_count": 11,
    "flag": "Lavagna",
    "full_text": "RT @wallydays0926: @mirif68 Te gusta ?  Pero Lavagna laburo con Duhalde.  Devaluo 400 % en una semana  Nos mintio \"El que deposito U$S recibir…",
    "label": "negative"
  },
  {
    "": 49,
    "id": 1113515434786152449,
    "created_at": "2019-04-03 18:55:42",
    "name": "salinaslucia",
    "followers_count": 21453,
    "favorite_count": 5,
    "retweet_count": 5,
    "flag": "Kirchner",
    "full_text": "Rechazan la unificacion de dos causas que podria retrasar el primer juicio oral a Cristina Kirchner -",
    "label": "neutral"
  },
  {
    "": 267,
    "id": 1113508767881207808,
    "created_at": "2019-04-03 18:29:12",
    "name": "juanresquivel",
    "followers_count": 102,
    "favorite_count": 0,
    "retweet_count": 0,
    "flag": "Kirchner",
    "full_text": "El juez  Jose M. Sobrino obliga a Florencia Kirchner a presentarse.  Es el mismo de la domiciliaria a Etchecolatz. ¿Entendes..?",
    "label": "neutral"
  },
  {
    "": 56,
    "id": 1113515322370396161,
    "created_at": "2019-04-03 18:55:15",
    "name": "NickyTejeda",
    "followers_count": 13252,
    "favorite_count": 1,
    "retweet_count": 3,
    "flag": "Lavagna",
    "full_text": "En los barrios no escucho pedir por Lavagna o Massa...mucho menos por Macri...    Piden por Cristina...",
    "label": "neutral"
  },
  {
    "": 154,
    "id": 1113516309373947905,
    "created_at": "2019-04-03 18:59:10",
    "name": "CristinaTerzolo",
    "followers_count": 1200,
    "favorite_count": 0,
    "retweet_count": 0,
    "flag": "Macri",
    "full_text": "@rolandosantoro6 Enloqueciste???? MACRI  Morales si queres pero Alfonsin??? Seria un Chacho Alvarez",
    "label": "negative"
  }
]
```

## Component Architecture
Map the Tableau worksheets to the following React components:

1.  **`Dashboard1`**: The main view container.
2.  **`Story1`**: The storyboard view container.
3.  **`SheetUsuariosConMasTweets`**: Horizontal bar chart (Users vs Tweet Count).
4.  **`SheetTiposDeTweets`**: Horizontal bar chart (Flag vs Tweet Count, colored by Label).
5.  **`SheetEvolucionTipo`**: Time series chart (Time vs Tweet Count, colored by Flag).
6.  **`SheetTweetsXTiempo`**: Time series bar chart (Time vs Tweet Count, colored by Label).
7.  **`SheetUsersXFollowers`**: Horizontal bar chart (Users vs Followers).
8.  **`SheetTweetsFavoritos`**: Horizontal bar chart (Tweet Text vs Favorite Count).
9.  **`SheetRetweeteados`**: Horizontal bar chart (Tweet Text vs Retweet Count).
10. **`ColorLegend`**: A reusable legend component for the 'label' dimension.

## Layout Specification

### Dashboard 1
- **Container**: Fixed size or responsive container approximating 1000x800px.
- **Structure**: CSS Grid or Flex Column.
    - **Top Section (Height ~50%)**:
        - **Left (Main)**: `SheetUsuariosConMasTweets`. Width: ~82%.
        - **Right (Sidebar)**: `ColorLegend` (for 'label'). Width: ~16%.
    - **Bottom Section (Height ~50%)**:
        - `SheetTiposDeTweets`. Full width.

### Historia 1 (Storyboard)
- **Title**: "Macri - Cristina - Lavagna" (Bold, Centered, Size 24px).
- **Navigation**: A list of clickable captions (Story Points) at the top or side.
- **Content Area**: Renders the active sheet based on the selected story point.
- **Story Points**:
    1.  "% Sentimiento x Objeto de estudio" -> Renders `SheetTiposDeTweets` (with specific filter applied: Flag='Lavagna', Label='positive').
    2.  "Evolución de tipo de Tweet sobre tiempo" -> Renders `SheetEvolucionTipo`.
    3.  "Proporción de tipo de Tweets en el tiempo" -> Renders `SheetTweetsXTiempo`.
    4.  "Usuarios con mayor cantidad de seguidores" -> Renders `SheetUsersXFollowers`.
    5.  "Tweets más Favoriteados" -> Renders `SheetTweetsFavoritos`.
    6.  "Tweets más retweeteados" -> Renders `SheetRetweeteados`.
    7.  "Usuarios más activos" -> Renders `SheetUsuariosConMasTweets`.

## Visual Encodings & D3 Implementation

### Color Scales (Exact Hex Codes)
- **Label (`none:label:nk`)**:
    - "error": `#4e79a7`
    - "positive": `#76b7b2`
    - "negative": `#e15759`
    - "neutral": `#edc948`
- **Flag (`none:flag:nk`)**:
    - "Kirchner": `#4e79a7`
    - "Macri": `#e15759`
    - "Lavagna": `#edc948`

### Chart Specifics

1.  **`SheetUsuariosConMasTweets`**
    - **Type**: Horizontal Bar.
    - **X-Axis**: `SUM(Number of Records)` (Count).
    - **Y-Axis**: `ATTR(name)` (User Name).
    - **Sort**: Descending by Count.
    - **Color**: Encoded by `label`.
    - **Tooltip**: Show `full_text` and `flag`.

2.  **`SheetTiposDeTweets`**
    - **Type**: Horizontal Bar (Stacked or Grouped, Tableau default is usually stacked for dimensions on color, but here it's a simple bar chart with color encoding). *Correction*: The XML shows Rows=`flag`, Cols=`SUM(Number of Records)`, Color=`label`. This implies a stacked bar or side-by-side. Given the "Tipos de Tweets" context, a stacked bar is most likely.
    - **X-Axis**: `SUM(Number of Records)`.
    - **Y-Axis**: `flag`.
    - **Color**: `label`.

3.  **`SheetEvolucionTipo`**
    - **Type**: Line or Area chart.
    - **X-Axis**: `MINUTE(created_at)` (Time).
    - **Y-Axis**: `label` * `SUM(Number of Records)` (This implies a small multiples or faceted view, or simply lines colored by label). The XML shows Rows=`label` * `Measure`, Cols=`Time`. This usually means separate rows for each label.
    - **Color**: `flag`.
    - **Filter**: `label` in ['negative', 'neutral', 'positive'] (excludes 'error').

4.  **`SheetTweetsXTiempo`**
    - **Type**: Vertical Bar.
    - **X-Axis**: `HOUR(created_at)` / `MINUTE(created_at)` (Time).
    - **Y-Axis**: `SUM(Number of Records)`.
    - **Color**: `label`.

5.  **`SheetUsersXFollowers`**
    - **Type**: Horizontal Bar.
    - **X-Axis**: `SUM(followers_count)`.
    - **Y-Axis**: `name`.
    - **Sort**: Descending by Followers.

6.  **`SheetTweetsFavoritos`** & **`SheetRetweeteados`**
    - **Type**: Horizontal Bar.
    - **X-Axis**: `SUM(favorite_count)` or `SUM(retweet_count)`.
    - **Y-Axis**: `full_text` (Truncate text if too long, e.g., ellipsis).
    - **Sort**: Descending by Measure.
    - **Color**: `label` (Favoritos) or `flag` (Retweeteados).

## Interactions & State Management

1.  **Highlighting (Action: Resaltar1)**:
    - **Trigger**: Click/Select a bar in `SheetUsuariosConMasTweets`.
    - **Target**: All other charts in `Dashboard 1` (except `SheetTiposDeTweets`).
    - **Logic**: When a user is selected, dim (reduce opacity) all other data points in the target charts that do not belong to that user. Highlight the matching data points.
    - **Fields**: Match on `Usuario` (name), `Label`, `Objeto de Estudio` (flag), `Full Text`.

2.  **Filtering (Action: Filtro 1)**:
    - **Trigger**: Select a bar in `SheetTiposDeTweets`.
    - **Target**: `SheetTiposDeTweets` (Self).
    - **Logic**: Filter the chart to show only the selected combination of Flag and Label.

3.  **Storyboard Navigation**:
    - Maintain a `currentStoryPoint` index state.
    - Clicking a caption updates the index and renders the corresponding sheet component.

## General UI Requirements
- **Fonts**: Sans-serif (e.g., Inter, system-ui).
- **Titles**: Bold, matching the Tableau sheet titles (e.g., "Usuarios con + Tweets", "Tweets x Tiempo").
- **Axes**: Clean D3 axes with tick marks. Remove outer borders of the chart area to match Tableau's "Automatic" style.
- **Responsiveness**: The dashboard should scale, but the aspect ratio of the charts should be preserved as much as possible.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/tweets_classification.csv

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
const rows = await loadCsv("/data/tweets_classification.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine_5198/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: + Retweeteados
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk]`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:retweet_count:qk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[attr:flag:nk]`
- bar_orientation: `horizontal`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[attr:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Evolución Tipo de Tweets
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk] * [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:Number of Records:qk])`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[tmi:created_at:qk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk]`
- bar_orientation: `horizontal`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[yr:created_at:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Favs x Tipo de Tweets
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:favorite_count:qk]`
- cols_field: `([federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk] / [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk])`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: RT x Tipos de Tweets
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:retweet_count:qk]`
- cols_field: `([federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk] / [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk])`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Tipos de Tweets x Objeto de Estudio
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk]`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:Number of Records:qk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `horizontal`
- zone: x=800, y=50000, w=98400, h=49000
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Tweets Favoritos
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk]`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:favorite_count:qk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `horizontal`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Tweets por Usuario
- chart_intent: `vertical_ranked_bar`
- rows_field: `([federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk] * [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:Number of Records:qk])`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Tweets x Tiempo
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:Number of Records:qk]`
- cols_field: `([federated.0c8okpg0coyfqg1d8783s1jnu0wr].[hr:created_at:ok] / [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[mi:created_at:ok])`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[:Measure Names], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Users x followers count
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:followers_count:qk]`
- bar_orientation: `horizontal`
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Usuarios con + Tweets
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]`
- cols_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[sum:Number of Records:qk]`
- series_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=82400, h=49000
- legend_required: true
- legend_field: `[federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Resaltar1: kind=highlight_brush, source=Usuarios con + Tweets, target=Dashboard 1
  fields: ATTR(Full Text), Label, Objeto de Estudio, Usuario
- Filtro 1 (generado): kind=filter_action, source=Tipos de Tweets x Objeto de Estudio, target=Tipos de Tweets x Objeto de Estudio
## Highlight Bindings
- Tipos de Tweets x Objeto de Estudio: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- Evolución Tipo de Tweets: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[yr:created_at:ok]
- Favs x Tipo de Tweets: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- RT x Tipos de Tweets: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- Tweets por Usuario: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]
- Usuarios con + Tweets: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- Users x followers count: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- Tweets Favoritos: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- + Retweeteados: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[attr:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
- Usuarios con + Tweets: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:name:nk]
- Tweets x Tiempo: [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[:Measure Names], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:flag:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:full_text:nk], [federated.0c8okpg0coyfqg1d8783s1jnu0wr].[none:label:nk]
