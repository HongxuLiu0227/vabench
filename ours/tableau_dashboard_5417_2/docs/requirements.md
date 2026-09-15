# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5417_2/docs/pra2_Metacritic.twb
Primary data URL: /data/metacritic_games_clean.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿\"\"\"F1\"\"\"": 4083,
    "\"game\"": "88 Heroes",
    "\"platform\"": "PS4",
    "\"developer\"": "Rising Star Games, Bitmap Bureau",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2017-03-24",
    "\"positive_critics\"": 4,
    "\"neutral_critics\"": 4,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 0,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 72,
    "\"user_score\"": 58
  },
  {
    "﻿\"\"\"F1\"\"\"": 1056,
    "\"game\"": "Horizon",
    "\"platform\"": "PC",
    "\"developer\"": "L3O Interactive",
    "\"genre\"": "General",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2013-07-02",
    "\"positive_critics\"": 0,
    "\"neutral_critics\"": 13,
    "\"negative_critics\"": 1,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 5,
    "\"negative_users\"": 1,
    "\"metascore\"": 58,
    "\"user_score\"": 67
  },
  {
    "﻿\"\"\"F1\"\"\"": 2855,
    "\"game\"": "Obliteracers",
    "\"platform\"": "PC",
    "\"developer\"": "Space Dust Studios, Varkian Empire",
    "\"genre\"": "Racing",
    "\"number_players\"": "Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2016-02-23",
    "\"positive_critics\"": 5,
    "\"neutral_critics\"": 3,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 78,
    "\"user_score\"": 77
  },
  {
    "﻿\"\"\"F1\"\"\"": 2839,
    "\"game\"": "The King of Fighters XIV",
    "\"platform\"": "PS4",
    "\"developer\"": "SNK Playmore, SNK Corporation",
    "\"genre\"": "Action",
    "\"number_players\"": "Up to 12",
    "\"rating\"": "T",
    "\"release_date\"": "2016-08-23",
    "\"positive_critics\"": 45,
    "\"neutral_critics\"": 10,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 45,
    "\"neutral_users\"": 5,
    "\"negative_users\"": 4,
    "\"metascore\"": 79,
    "\"user_score\"": 82
  },
  {
    "﻿\"\"\"F1\"\"\"": 3296,
    "\"game\"": "Cobalt",
    "\"platform\"": "XONE",
    "\"developer\"": "Oxeye",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2016-02-02",
    "\"positive_critics\"": 6,
    "\"neutral_critics\"": 5,
    "\"negative_critics\"": 2,
    "\"positive_users\"": 1,
    "\"neutral_users\"": 0,
    "\"negative_users\"": 0,
    "\"metascore\"": 66,
    "\"user_score\"": 73
  },
  {
    "﻿\"\"\"F1\"\"\"": 3768,
    "\"game\"": "The Legend of Heroes: Trails of Cold Steel",
    "\"platform\"": "PC",
    "\"developer\"": "Falcom",
    "\"genre\"": "Role-Playing",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2017-08-02",
    "\"positive_critics\"": 9,
    "\"neutral_critics\"": 1,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 9,
    "\"neutral_users\"": 1,
    "\"negative_users\"": 0,
    "\"metascore\"": 80,
    "\"user_score\"": 81
  },
  {
    "﻿\"\"\"F1\"\"\"": 3692,
    "\"game\"": "RiME",
    "\"platform\"": "XONE",
    "\"developer\"": "Tequila Works",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E10+",
    "\"release_date\"": "2017-05-26",
    "\"positive_critics\"": 16,
    "\"neutral_critics\"": 2,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 7,
    "\"neutral_users\"": 2,
    "\"negative_users\"": 1,
    "\"metascore\"": 82,
    "\"user_score\"": 71
  },
  {
    "﻿\"\"\"F1\"\"\"": 1225,
    "\"game\"": "Stealth Inc 2: A Game of Clones",
    "\"platform\"": "WIIU",
    "\"developer\"": "Curve Digital",
    "\"genre\"": "Action",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "T",
    "\"release_date\"": "2014-10-30",
    "\"positive_critics\"": 18,
    "\"neutral_critics\"": 3,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 3,
    "\"neutral_users\"": 2,
    "\"negative_users\"": 0,
    "\"metascore\"": 82,
    "\"user_score\"": 83
  },
  {
    "﻿\"\"\"F1\"\"\"": 5334,
    "\"game\"": "Just Cause 4",
    "\"platform\"": "PS4",
    "\"developer\"": "Avalanche Studios",
    "\"genre\"": "Action Adventure",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "M",
    "\"release_date\"": "2018-12-04",
    "\"positive_critics\"": 9,
    "\"neutral_critics\"": 30,
    "\"negative_critics\"": 2,
    "\"positive_users\"": 14,
    "\"neutral_users\"": 9,
    "\"negative_users\"": 33,
    "\"metascore\"": 65,
    "\"user_score\"": 52
  },
  {
    "﻿\"\"\"F1\"\"\"": 821,
    "\"game\"": "Peggle 2",
    "\"platform\"": "XONE",
    "\"developer\"": "PopCap",
    "\"genre\"": "Miscellaneous",
    "\"number_players\"": "No Online Multiplayer",
    "\"rating\"": "E",
    "\"release_date\"": "2013-12-09",
    "\"positive_critics\"": 26,
    "\"neutral_critics\"": 13,
    "\"negative_critics\"": 0,
    "\"positive_users\"": 21,
    "\"neutral_users\"": 7,
    "\"negative_users\"": 5,
    "\"metascore\"": 77,
    "\"user_score\"": 72
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/metacritic_games_clean.csv

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
const rows = await loadCsv("/data/metacritic_games_clean.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_5417_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: game_crit
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_order: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- expected_series_values: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:neutral_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:negative_critics:qk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:Calculation_652740522679025665:qk]
- zone: x=800, y=47995, w=49200, h=47005
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: game_meta
- chart_intent: `line_chart`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[avg:metascore:qk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[tmn:release_date:qk]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- axis_title_rows: Average Metascore
- axis_title_cols: Month of release
- zone: x=800, y=1000, w=98400, h=46995
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:2:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:3:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: game_users
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk]`
- cols_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[:Measure Names]`
- series_field: `[federated.0oq0q4l11yebx014hr9c90j9cj6u].[Action (game,MES(release_date))]`
- zone: x=50000, y=47995, w=49200, h=47005
- highlight_fields: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=800, y=95000, w=49200, h=4000): Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
- zone(x=50000, y=95000, w=49200, h=4000): Created by Sergio Funes
## Dashboard Actions
- Filtro 1 (generado): kind=filter_action, source=game_meta, target=game
- Filtro 2 (generado): kind=filter_action, source=game_crit, target=game
- Filtro 6 (generado): kind=filter_action, source=game_users, target=game
## Highlight Bindings
- game_meta: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:2:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:3:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:platform:nk]
- game_crit: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
- game_users: [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:AdhocCluster:1:ok], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[none:game:nk], [federated.0oq0q4l11yebx014hr9c90j9cj6u].[sum:positive_critics:qk]
