# Project Requirements

You are an expert React + TypeScript developer. Your task is to implement a dashboard application that replicates the provided Tableau workbook 'Twitterデータの可視化'.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or higher) for visualizations (use d3-scale, d3-shape, d3-axis, d3-array primitives).
- CSS Grid/Flexbox for layout.
- No UI component libraries (e.g., Ant Design) unless necessary for basic layout containers.

## Data Loading
The application must load data from the public directory.

1.  **Fetch URL:** `/data/πé¡πââπâêπé½πââπâê.csv`
2.  **Parsing:** Use `d3-dsv` (d3.csvParse) or `papaparse` to parse the CSV content.
3.  **Type Definition:** Create a TypeScript interface `TwitterData` matching the CSV columns:
    - `投稿日時` (Date)
    - `媒体` (string)
    - `ユーザプロフィールURL` (string)
    - `投稿URL/キャプチャー` (string)
    - `投稿内容` (string)
    - `コメント数` (number)
    - `リツイート数` (number)
    - `いいね数` (number)
    - `検索ワード` (string)
4.  **Date Parsing:** Ensure `投稿日時` is parsed into JavaScript Date objects.

## Sample Data
```json
[
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/luveverjp",
    "投稿URL/キャプチャー": "https://twitter.com/luveverjp/status/1199712291823869952",
    "投稿内容": "ノッポさんの「できるかな」シリーズ 第３弾 紙パッケージになった”キットカット”で何ができるかな？ ノッポさんが作ったのは、、、そんなことより #キットカット食べたい #キットずっと #キットカットで何ができるかな",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/kyo_intras",
    "投稿URL/キャプチャー": "https://twitter.com/kyo_intras/status/1199958284867796993",
    "投稿内容": "KitKatのパッケージが一部紙製に変わったことを知っていますか？\nプラスチックごみ削減のため、今後ネスレ・ジャパンは紙包装を増やしていき、2022年には全ての商品を100％リサイクルあるいはリユース可能なものとすることを目標にしているそうです\n#intras #同志社えこずクラブ #paperpackaging",
    "コメント数": 0,
    "リツイート数": 7,
    "いいね数": 34,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/daikidaiki0000",
    "投稿URL/キャプチャー": "https://twitter.com/daikidaiki0000/status/1199711476908343298",
    "投稿内容": "まじかよ。。\n俺とれるかな笑",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/mei_believe",
    "投稿URL/キャプチャー": "https://twitter.com/mei_believe/status/1199974999957704705",
    "投稿内容": "ドコモご利用頂きありがとうございます機種変更はぜひ当店でよろしくお願いします",
    "コメント数": 1,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/leu2704",
    "投稿URL/キャプチャー": "https://twitter.com/leu2704/status/1199986873503846402",
    "投稿内容": "ノッポさんの「できるかな」シリーズ 第３弾 紙パッケージになった”キットカット”で何ができるかな？ ノッポさんが作ったのは #ゴン太くん だと思う #キットずっと #キットカットで何ができるかな",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/1962take1103",
    "投稿URL/キャプチャー": "https://twitter.com/1962take1103/status/1199815521945800705",
    "投稿内容": "ノッポさんの「できるかな」シリーズ 第３弾 紙パッケージになった”キットカット”で何ができるかな？ ノッポさんが作ったのは、、、そんなことより #キットカット食べたい #キットずっと #キットカットで何ができるかな",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/Bo4Vani",
    "投稿URL/キャプチャー": "https://twitter.com/Bo4Vani/status/1199837421833056257",
    "投稿内容": "この流れww",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 1,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/kitkat45861112",
    "投稿URL/キャプチャー": "https://twitter.com/kitkat45861112/status/1199929743740588039",
    "投稿内容": "露出プレイがお好きなようで...",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/27",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/pyan05mt2523",
    "投稿URL/キャプチャー": "https://twitter.com/pyan05mt2523/status/1199680237044322309",
    "投稿内容": "プロテインブレイクバーが普通においしい。キットカットとほとんど同じじゃね？俺が味覚鈍いのかもしれんけど。",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  },
  {
    "﻿\"投稿日時\"": "2019/11/28",
    "媒体": "twitter",
    "ユーザプロフィールURL": "https://twitter.com/969696cchi",
    "投稿URL/キャプチャー": "https://twitter.com/969696cchi/status/1199980951008231424",
    "投稿内容": "朝起きてからお菓子食べたけどご飯食べてなくて，割といけるもんだなと思ったが，\nよく考えたらキットカットとココナッツサブレとじゃがりこ食ってて，割と食ってるなと思うなどした",
    "コメント数": 0,
    "リツイート数": 0,
    "いいね数": 0,
    "検索ワード": "キットカット"
  }
]
```

## Application Architecture

### State Management
Implement a global state (using React Context) to handle filtering. The state should track:
- `selectedUser`: string | null (derived from `ユーザプロフィールURL`)
- `selectedPost`: string | null (derived from `投稿URL/キャプチャー`)
- `selectedDate`: Date | null (derived from `投稿日時`)

All charts must filter their input data based on these global state values. If a filter is null, include all data for that dimension.

### Layout Structure
The main dashboard 'Twitterデータの可視化' should use CSS Grid.

**Grid Template Areas (Approximation based on Tableau zones):**
```css
dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto 1fr 1fr 1fr;
  gap: 16px;
}
```

**Component Placement:**
1.  **Header:** Title "Twitterデータの可視化" (Full width)
2.  **Row 1 (KPIs):**
    - Left: `検索ワード` (Search Word)
    - Center: `収集データ` (Collected Data Range)
    - Right: `データ数` (Total Data Count)
3.  **Row 2:** `ユーザ別投稿数ランキング` (User Post Count Ranking) - Full Width
4.  **Row 3:**
    - Left: `いいね数` (Likes Pie Chart)
    - Right: `いいねユーザ日別` (Likes Daily Bar Chart)
5.  **Row 4:**
    - Left: `リツート数` (Retweets Pie Chart)
    - Right: `リツイート日別` (Retweets Daily Bar Chart)
6.  **Row 5:**
    - Left: `コメント数` (Comments Pie Chart)
    - Right: `コメントユーザ日別` (Comments Daily Bar Chart)

## Component Specifications

### 1. KPI Components

**`検索ワード` (Search Word)**
- **Type:** Text Display
- **Content:** Display the value of `検索ワード` from the first row of the dataset.
- **Style:** Font size 28px, centered.

**`収集データ` (Collected Data)**
- **Type:** Text Display
- **Content:** Calculate Min(`投稿日時`) and Max(`投稿日時`). Display as "<Min> ~ <Max>".
- **Style:** Font size 16px, centered.

**`データ数` (Data Count)**
- **Type:** Big Number
- **Content:** Count of total records (after filtering).
- **Style:** Font size 28px, centered.

### 2. Chart Components (D3 Implementation)

**`ユーザ別投稿数ランキング` (User Post Count Ranking)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `ユーザプロフィールURL`, Count records.
- **Encoding:**
    - X-axis: Count of Records (labeled "投稿数")
    - Y-axis: `ユーザプロフィールURL`
    - Color/Size: Encoded by Count.
    - Labels: Show `ユーザプロフィールURL` text.
- **Sorting:** Descending by Count.
- **Interaction:** Click on a bar -> Set `selectedUser` filter. Click on text -> Open URL in new tab (Action: `ユーザ別投稿数ランキング プロフィール遷移`).

**`いいね数` (Likes Count)**
- **Type:** Pie Chart
- **Data:** Group by `いいね数` (discrete buckets), Count records.
- **Encoding:**
    - Angle: Count of Records.
    - Color: `いいね数` (Use specific palette: #499894, #4e79a7, #59a14f, #79706e, #86bcb6, #8cd17d, #9d7660, #a0cbe8, #b07aa1, #b6992d, #bab0ac, #d37295, #d4a6c8, #d7b5a6, #e15759, #f1ce63, #f28e2b, #fabfd2, #ff9d9a, #ffbe7d).
    - Labels: Percentage and Value.

**`いいねユーザ日別` (Likes User Daily)**
- **Type:** Vertical Bar Chart
- **Data:** Group by `投稿日時` (Day), Sum(`いいね数`).
- **Encoding:**
    - X-axis: `投稿日時` (Day)
    - Y-axis: Sum(`いいね数`)
- **Interaction:** Click on a bar -> Set `selectedDate` filter.

**`いいね数(ユーザ別)` (Likes Count by User)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `ユーザプロフィールURL`, Avg(`いいね数`).
- **Encoding:**
    - X-axis: Avg(`いいね数`)
    - Y-axis: `ユーザプロフィールURL`
- **Sorting:** Descending by Avg(`いいね数`).
- **Interaction:** Click on a bar -> Set `selectedUser` filter.

**`いいね数(投稿別)` (Likes Count by Post)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `投稿URL/キャプチャー`, Sum(`いいね数`).
- **Encoding:**
    - X-axis: Sum(`いいね数`)
    - Y-axis: `投稿URL/キャプチャー`
- **Sorting:** Descending by Sum(`いいね数`).
- **Interaction:** Click on a bar -> Set `selectedPost` filter. Click -> Open URL (Action: `投稿別URL`).

**`リツート数` (Retweet Count)**
- **Type:** Pie Chart
- **Data:** Group by `リツイート数` (discrete buckets), Count records.
- **Encoding:**
    - Angle: Count of Records.
    - Color: `リツイート数` (Use specific palette: #4e79a7, #59a14f, #76b7b2, #9c755f, #b07aa1, #e15759, #edc948, #f28e2b, #ff9da7).
    - Labels: Percentage and Value.

**`リツイート日別` (Retweets Daily)**
- **Type:** Vertical Bar Chart
- **Data:** Group by `投稿日時` (Day), Sum(`リツイート数`).
- **Encoding:**
    - X-axis: `投稿日時` (Day)
    - Y-axis: Sum(`リツイート数`)
- **Interaction:** Click on a bar -> Set `selectedDate` filter.

**`リツイート(ユーザ別)` (Retweets by User)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `ユーザプロフィールURL`, Avg(`リツイート数`).
- **Encoding:**
    - X-axis: Avg(`リツイート数`)
    - Y-axis: `ユーザプロフィールURL`
- **Sorting:** Descending by Avg(`リツイート数`).
- **Interaction:** Click on a bar -> Set `selectedUser` filter.

**`リツイート(投稿別)` (Retweets by Post)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `投稿URL/キャプチャー`, Sum(`リツイート数`).
- **Encoding:**
    - X-axis: Sum(`リツイート数`)
    - Y-axis: `投稿URL/キャプチャー`
- **Sorting:** Descending by Sum(`リツイート数`).

**`コメント数` (Comment Count)**
- **Type:** Pie Chart
- **Data:** Group by `コメント数` (discrete buckets), Count records.
- **Encoding:**
    - Angle: Count of Records.
    - Color: `コメント数` (Use specific palette: #4e79a7, #59a14f, #76b7b2, #9c755f, #b07aa1, #e15759, #edc948, #f28e2b, #ff9da7).
    - Labels: Percentage and Value.

**`コメントユーザ日別` (Comments Daily)**
- **Type:** Vertical Bar Chart
- **Data:** Group by `投稿日時` (Day), Sum(`コメント数`).
- **Encoding:**
    - X-axis: `投稿日時` (Day)
    - Y-axis: Sum(`コメント数`)
- **Interaction:** Click on a bar -> Set `selectedDate` filter.

**`コメントユーザ(ユーザ別)` (Comments by User)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `ユーザプロフィールURL`, Avg(`コメント数`).
- **Encoding:**
    - X-axis: Avg(`コメント数`)
    - Y-axis: `ユーザプロフィールURL`
- **Sorting:** Descending by Avg(`コメント数`).
- **Interaction:** Click on a bar -> Set `selectedUser` filter.

**`コメントユーザ(投稿別)` (Comments by Post)**
- **Type:** Horizontal Bar Chart
- **Data:** Group by `投稿URL/キャプチャー`, Sum(`コメント数`).
- **Encoding:**
    - X-axis: Sum(`コメント数`)
    - Y-axis: `投稿URL/キャプチャー`
- **Sorting:** Descending by Sum(`コメント数`).
- **Interaction:** Click on a bar -> Set `selectedPost` filter.

## Styling & UX
- **Background:** Light gray/white theme matching Tableau defaults.
- **Fonts:** Sans-serif (system-ui, Arial).
- **Responsiveness:** Use CSS Grid `minmax` or Flexbox wrapping to ensure the dashboard is usable on smaller screens, though the primary target is desktop.
- **Tooltips:** Implement D3-based tooltips showing exact values on hover.

## Implementation Steps
1.  Setup Vite + React + TypeScript.
2.  Create `types.ts` for `TwitterData`.
3.  Create `useData.ts` hook to fetch and parse the CSV.
4.  Create `FilterContext.tsx` for global state.
5.  Implement generic D3 chart components (`BarChart`, `PieChart`).
6.  Implement specific sheet components using the generic charts and data aggregation logic.
7.  Assemble the Dashboard component with the CSS Grid layout.
8.  Wire up interactions (onClick events updating the Context).

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/πé¡πââπâêπé½πââπâê.csv

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
const rows = await loadCsv("/data/πé¡πââπâêπé½πââπâê.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3259/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: いいねユーザ日別
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:いいね数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:qk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: いいね数
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137308614656:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: いいね数(ユーザ別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[avg:いいね数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (ユーザプロフィールURL)]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: いいね数(投稿別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:いいね数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: コメントユーザ(ユーザ別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[avg:コメント数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: コメントユーザ(投稿別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:コメント数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: コメントユーザ日別
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:コメント数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:qk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: コメント数
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137311887363:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: データ数
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: ユーザ別投稿数ランキング
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[cnt:Number of Records:qk]`
- axis_title_cols: 投稿数
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[cnt:Number of Records:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[cnt:Number of Records:qk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: リツイート(ユーザ別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[avg:リツイート数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (ユーザプロフィールURL)]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: リツイート(投稿別)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:リツイート数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: リツイート日別
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[sum:リツイート数:qk]`
- cols_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:qk]`
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: リツート数
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137310105601:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: 収集データ
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[max:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[qr:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: 検索ワード
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0nnqf130tzgecx1a44up50632gpd].[Action (日(投稿日時))]`
- highlight_fields: [federated.0nnqf130tzgecx1a44up50632gpd].[none:検索ワード:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- フィルター 8 (生成済み): kind=filter_action, source=コメントユーザ(ユーザ別), target=Twitterデータの可視化
- フィルター 1 (生成済み): kind=filter_action, source=ユーザ別投稿数ランキング, target=Twitterデータの可視化
- フィルター 2 (生成済み): kind=filter_action, source=いいねユーザ日別, target=Twitterデータの可視化
- フィルター 3 (生成済み): kind=filter_action, source=リツイート日別, target=Twitterデータの可視化
- フィルター 4 (生成済み): kind=filter_action, source=コメントユーザ日別, target=Twitterデータの可視化
- ユーザ別投稿数ランキング プロフィール遷移: kind=custom_action, source=unknown, target=unknown
- フィルター 5 (生成済み): kind=filter_action, source=いいね数(ユーザ別), target=Twitterデータの可視化
- フィルター 6 (生成済み): kind=filter_action, source=リツイート(ユーザ別), target=Twitterデータの可視化
- 投稿別URL: kind=custom_action, source=unknown, target=unknown
- フィルター 7 (生成済み): kind=filter_action, source=コメントユーザ(投稿別), target=Twitterデータの可視化
## Highlight Bindings
- リツート数: [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok]
- 検索ワード: [federated.0nnqf130tzgecx1a44up50632gpd].[none:検索ワード:nk]
- 収集データ: [federated.0nnqf130tzgecx1a44up50632gpd].[max:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[qr:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- ユーザ別投稿数ランキング: [federated.0nnqf130tzgecx1a44up50632gpd].[cnt:Number of Records:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[cnt:Number of Records:qk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
- いいね数: [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137308614656:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- いいねユーザ日別: [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- いいね数(投稿別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- いいね数(ユーザ別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:いいね数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
- リツート数: [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137310105601:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok]
- リツイート日別: [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[tdy:投稿日時:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- リツイート(投稿別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- リツイート(ユーザ別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:リツイート数:ok]
- コメント数: [federated.0nnqf130tzgecx1a44up50632gpd].[none:Calculation_269090137311887363:nk], [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok]
- コメントユーザ日別: [federated.0nnqf130tzgecx1a44up50632gpd].[yr:投稿日時:ok]
- コメントユーザ(投稿別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:投稿URL/キャプチャー:nk]
- コメントユーザ(ユーザ別): [federated.0nnqf130tzgecx1a44up50632gpd].[none:コメント数:ok], [federated.0nnqf130tzgecx1a44up50632gpd].[none:ユーザプロフィールURL:nk]
