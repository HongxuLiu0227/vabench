# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Cricket'. The dashboard analyzes cricket match data, specifically focusing on team performance, batsmen statistics, and venues.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-selection`). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or styled-components). No UI component libraries (e.g., Ant Design) unless necessary for basic layout containers.

## Data Loading

The data source is a CSV file located at `/data/TEMP_1a0b54d0ncxp7o13uhh9c0ssmfny.csv`.

Implement a `useData` hook to fetch and parse this data.

```typescript
import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';

interface CricketDataRow {
  match_id: number;
  inning: number;
  batting_team: string;
  bowling_team: string;
  over: number;
  ball: number;
  batsman: string;
  non_striker: string;
  bowler: string;
  is_super_over: number;
  wide_runs: number;
  bye_runs: number;
  legbye_runs: number;
  noball_runs: number;
  penalty_runs: number;
  batsman_runs: number;
  extra_runs: number;
  total_runs: number;
  player_dismissed: string;
  dismissal_kind: string;
  fielder: string;
  id: number;
  season: number;
  city: string;
  date: string; // ISO date string
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  result: string;
  dl_applied: number;
  winner: string;
  win_by_runs: number;
  win_by_wickets: number;
  player_of_match: string;
  venue: string;
  umpire1: string;
  umpire2: string;
}

export const useData = () => {
  const [data, setData] = useState<CricketDataRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/TEMP_1a0b54d0ncxp7o13uhh9c0ssmfny.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const parsedData = csv<CricketDataRow>(csvText, (d) => {
          // Type coercion and parsing logic here if necessary
          return {
            ...d,
            match_id: +d.match_id,
            total_runs: +d.total_runs,
            batsman_runs: +d.batsman_runs,
            win_by_runs: +d.win_by_runs,
            win_by_wickets: +d.win_by_wickets,
            season: +d.season,
          } as CricketDataRow;
        });
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
    "﻿\"\"\"F1\"\"\"": 167540,
    "\"match_id\"": 11148,
    "\"inning\"": 1,
    "\"batting_team\"": "Chennai Super Kings",
    "\"bowling_team\"": "Rajasthan Royals",
    "\"over\"": 17,
    "\"ball\"": 5,
    "\"batsman\"": "DJ Bravo",
    "\"non_striker\"": "MS Dhoni",
    "\"bowler\"": "J Archer",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 11148,
    "\"season\"": 2019,
    "\"city\"": "Chennai",
    "\"date\"": "2019-03-31",
    "\"team1\"": "Chennai Super Kings",
    "\"team2\"": "Rajasthan Royals",
    "\"toss_winner\"": "Rajasthan Royals",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Chennai Super Kings",
    "\"win_by_runs\"": 8,
    "\"win_by_wickets\"": 0,
    "\"player_of_match\"": "MS Dhoni",
    "\"venue\"": "M. A. Chidambaram Stadium",
    "\"umpire1\"": "O Nandan",
    "\"umpire2\"": "Yeshwant Barde"
  },
  {
    "﻿\"\"\"F1\"\"\"": 1694,
    "\"match_id\"": 8,
    "\"inning\"": 1,
    "\"batting_team\"": "Royal Challengers Bangalore",
    "\"bowling_team\"": "Kings XI Punjab",
    "\"over\"": 3,
    "\"ball\"": 5,
    "\"batsman\"": "AB de Villiers",
    "\"non_striker\"": "Vishnu Vinod",
    "\"bowler\"": "MM Sharma",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 0,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 0,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 8,
    "\"season\"": 2017,
    "\"city\"": "Indore",
    "\"date\"": "2017-04-10",
    "\"team1\"": "Royal Challengers Bangalore",
    "\"team2\"": "Kings XI Punjab",
    "\"toss_winner\"": "Royal Challengers Bangalore",
    "\"toss_decision\"": "bat",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Kings XI Punjab",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 8,
    "\"player_of_match\"": "AR Patel",
    "\"venue\"": "Holkar Cricket Stadium",
    "\"umpire1\"": "AK Chaudhary",
    "\"umpire2\"": "C Shamshuddin"
  },
  {
    "﻿\"\"\"F1\"\"\"": 158646,
    "\"match_id\"": 7928,
    "\"inning\"": 2,
    "\"batting_team\"": "Chennai Super Kings",
    "\"bowling_team\"": "Royal Challengers Bangalore",
    "\"over\"": 2,
    "\"ball\"": 4,
    "\"batsman\"": "SR Watson",
    "\"non_striker\"": "AT Rayudu",
    "\"bowler\"": "YS Chahal",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 0,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 0,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 7928,
    "\"season\"": 2018,
    "\"city\"": "Pune",
    "\"date\"": "2018-05-05",
    "\"team1\"": "Royal Challengers Bangalore",
    "\"team2\"": "Chennai Super Kings",
    "\"toss_winner\"": "Chennai Super Kings",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Chennai Super Kings",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 6,
    "\"player_of_match\"": "RA Jadeja",
    "\"venue\"": "Maharashtra Cricket Association Stadium",
    "\"umpire1\"": "Nitin Menon",
    "\"umpire2\"": "Yeshwant Barde"
  },
  {
    "﻿\"\"\"F1\"\"\"": 177469,
    "\"match_id\"": 11345,
    "\"inning\"": 1,
    "\"batting_team\"": "Sunrisers Hyderabad",
    "\"bowling_team\"": "Royal Challengers Bangalore",
    "\"over\"": 13,
    "\"ball\"": 5,
    "\"batsman\"": "V Shankar",
    "\"non_striker\"": "KS Williamson",
    "\"bowler\"": "C de Grandhomme",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 11345,
    "\"season\"": 2019,
    "\"city\"": "Bengaluru",
    "\"date\"": "2019-05-04",
    "\"team1\"": "Sunrisers Hyderabad",
    "\"team2\"": "Royal Challengers Bangalore",
    "\"toss_winner\"": "Royal Challengers Bangalore",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Royal Challengers Bangalore",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 4,
    "\"player_of_match\"": "S Hetmyer",
    "\"venue\"": "M. Chinnaswamy Stadium",
    "\"umpire1\"": "Nigel Llong",
    "\"umpire2\"": "Anil Chaudhary"
  },
  {
    "﻿\"\"\"F1\"\"\"": 13643,
    "\"match_id\"": 59,
    "\"inning\"": 1,
    "\"batting_team\"": "Mumbai Indians",
    "\"bowling_team\"": "Rising Pune Supergiant",
    "\"over\"": 5,
    "\"ball\"": 6,
    "\"batsman\"": "RG Sharma",
    "\"non_striker\"": "AT Rayudu",
    "\"bowler\"": "SN Thakur",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 59,
    "\"season\"": 2017,
    "\"city\"": "Hyderabad",
    "\"date\"": "2017-05-21",
    "\"team1\"": "Mumbai Indians",
    "\"team2\"": "Rising Pune Supergiant",
    "\"toss_winner\"": "Mumbai Indians",
    "\"toss_decision\"": "bat",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Mumbai Indians",
    "\"win_by_runs\"": 1,
    "\"win_by_wickets\"": 0,
    "\"player_of_match\"": "KH Pandya",
    "\"venue\"": "Rajiv Gandhi International Stadium, Uppal",
    "\"umpire1\"": "NJ Llong",
    "\"umpire2\"": "S Ravi"
  },
  {
    "﻿\"\"\"F1\"\"\"": 68625,
    "\"match_id\"": 290,
    "\"inning\"": 2,
    "\"batting_team\"": "Kings XI Punjab",
    "\"bowling_team\"": "Kochi Tuskers Kerala",
    "\"over\"": 4,
    "\"ball\"": 7,
    "\"batsman\"": "AC Gilchrist",
    "\"non_striker\"": "SE Marsh",
    "\"bowler\"": "S Sreesanth",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 290,
    "\"season\"": 2011,
    "\"city\"": "Indore",
    "\"date\"": "2011-05-13",
    "\"team1\"": "Kochi Tuskers Kerala",
    "\"team2\"": "Kings XI Punjab",
    "\"toss_winner\"": "Kings XI Punjab",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Kings XI Punjab",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 6,
    "\"player_of_match\"": "KD Karthik",
    "\"venue\"": "Holkar Cricket Stadium",
    "\"umpire1\"": "S Asnani",
    "\"umpire2\"": "RJ Tucker"
  },
  {
    "﻿\"\"\"F1\"\"\"": 104030,
    "\"match_id\"": 439,
    "\"inning\"": 1,
    "\"batting_team\"": "Pune Warriors",
    "\"bowling_team\"": "Mumbai Indians",
    "\"over\"": 12,
    "\"ball\"": 3,
    "\"batsman\"": "MK Pandey",
    "\"non_striker\"": "Yuvraj Singh",
    "\"bowler\"": "Harbhajan Singh",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 439,
    "\"season\"": 2013,
    "\"city\"": "Pune",
    "\"date\"": "2013-05-11",
    "\"team1\"": "Pune Warriors",
    "\"team2\"": "Mumbai Indians",
    "\"toss_winner\"": "Pune Warriors",
    "\"toss_decision\"": "bat",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Mumbai Indians",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 5,
    "\"player_of_match\"": "MG Johnson",
    "\"venue\"": "Subrata Roy Sahara Stadium",
    "\"umpire1\"": "Asad Rauf",
    "\"umpire2\"": "AK Chaudhary"
  },
  {
    "﻿\"\"\"F1\"\"\"": 3711,
    "\"match_id\"": 16,
    "\"inning\"": 2,
    "\"batting_team\"": "Mumbai Indians",
    "\"bowling_team\"": "Gujarat Lions",
    "\"over\"": 3,
    "\"ball\"": 6,
    "\"batsman\"": "N Rana",
    "\"non_striker\"": "JC Buttler",
    "\"bowler\"": "P Kumar",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 3,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 0,
    "\"extra_runs\"": 3,
    "\"total_runs\"": 3,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 16,
    "\"season\"": 2017,
    "\"city\"": "Mumbai",
    "\"date\"": "2017-04-16",
    "\"team1\"": "Gujarat Lions",
    "\"team2\"": "Mumbai Indians",
    "\"toss_winner\"": "Mumbai Indians",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Mumbai Indians",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 6,
    "\"player_of_match\"": "N Rana",
    "\"venue\"": "Wankhede Stadium",
    "\"umpire1\"": "A Nand Kishore",
    "\"umpire2\"": "S Ravi"
  },
  {
    "﻿\"\"\"F1\"\"\"": 53632,
    "\"match_id\"": 227,
    "\"inning\"": 1,
    "\"batting_team\"": "Rajasthan Royals",
    "\"bowling_team\"": "Kolkata Knight Riders",
    "\"over\"": 12,
    "\"ball\"": 3,
    "\"batsman\"": "AC Voges",
    "\"non_striker\"": "AJ Finch",
    "\"bowler\"": "M Kartik",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 1,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 1,
    "\"player_dismissed\"": "",
    "\"dismissal_kind\"": "",
    "\"fielder\"": "",
    "\"id\"": 227,
    "\"season\"": 2010,
    "\"city\"": "Kolkata",
    "\"date\"": "2010-04-17",
    "\"team1\"": "Rajasthan Royals",
    "\"team2\"": "Kolkata Knight Riders",
    "\"toss_winner\"": "Rajasthan Royals",
    "\"toss_decision\"": "bat",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Kolkata Knight Riders",
    "\"win_by_runs\"": 0,
    "\"win_by_wickets\"": 8,
    "\"player_of_match\"": "JD Unadkat",
    "\"venue\"": "Eden Gardens",
    "\"umpire1\"": "BG Jerling",
    "\"umpire2\"": "RB Tiffin"
  },
  {
    "﻿\"\"\"F1\"\"\"": 65882,
    "\"match_id\"": 278,
    "\"inning\"": 2,
    "\"batting_team\"": "Kolkata Knight Riders",
    "\"bowling_team\"": "Kochi Tuskers Kerala",
    "\"over\"": 11,
    "\"ball\"": 2,
    "\"batsman\"": "JH Kallis",
    "\"non_striker\"": "EJG Morgan",
    "\"bowler\"": "RV Gomez",
    "\"is_super_over\"": 0,
    "\"wide_runs\"": 0,
    "\"bye_runs\"": 0,
    "\"legbye_runs\"": 0,
    "\"noball_runs\"": 0,
    "\"penalty_runs\"": 0,
    "\"batsman_runs\"": 0,
    "\"extra_runs\"": 0,
    "\"total_runs\"": 0,
    "\"player_dismissed\"": "JH Kallis",
    "\"dismissal_kind\"": "bowled",
    "\"fielder\"": "",
    "\"id\"": 278,
    "\"season\"": 2011,
    "\"city\"": "Kochi",
    "\"date\"": "2011-05-05",
    "\"team1\"": "Kochi Tuskers Kerala",
    "\"team2\"": "Kolkata Knight Riders",
    "\"toss_winner\"": "Kolkata Knight Riders",
    "\"toss_decision\"": "field",
    "\"result\"": "normal",
    "\"dl_applied\"": 0,
    "\"winner\"": "Kochi Tuskers Kerala",
    "\"win_by_runs\"": 17,
    "\"win_by_wickets\"": 0,
    "\"player_of_match\"": "BJ Hodge",
    "\"venue\"": "Nehru Stadium",
    "\"umpire1\"": "S Ravi",
    "\"umpire2\"": "RJ Tucker"
  }
]
```

## Dashboard Architecture

The application consists of a main `Dashboard` component that orchestrates the layout and state. The state is driven by a `selectedWinner` filter.

### State Management
- `selectedWinner`: string | null. Defaults to `"Kolkata Knight Riders"`.
- This state is lifted to the `Dashboard` component and passed down to child charts.

### Layout Structure
- Use a CSS Grid layout.
- **Left Column (approx 30% width):** Contains the `WinnerChart` ("Winner vs Count"). This acts as the primary filter controller.
- **Right Column (approx 70% width):** Contains a 2x2 grid of the following charts:
  1. Top Left: `TopBatsmenChart` ("Top Batsmen")
  2. Top Right: `TeamRunsChart` ("Team vs Total Runs")
  3. Bottom Left: `VenueChart` ("Venue")
  4. Bottom Right: `WinByRunsChart` ("Win By Runs")

## Component Specifications

### 1. WinnerChart ("Winner vs Count")
- **Data Source:** Full dataset.
- **Visual Encoding:**
  - Type: Horizontal Bar Chart.
  - X-Axis: `COUNT(records)` (Number of matches won).
  - Y-Axis: `[winner]` (Team Name).
  - Sort: Descending by Count.
  - Color: Encoded by `[winner]` using the specific color palette defined below.
- **Interaction:**
  - Clicking a bar updates the global `selectedWinner` state to that team's name.
  - The bar corresponding to the `selectedWinner` should be highlighted (e.g., opacity 1.0 vs 0.5 for others, or a stroke).
- **Color Palette (Teams):**
  - "Kolkata Knight Riders": #499894
  - "Mumbai Indians": #4e79a7
  - "Delhi Daredevils": #59a14f
  - "Rising Pune Supergiant": #79706e
  - "Gujarat Lions": #8cd17d
  - "Chennai Super Kings": #a0cbe8
  - "Kings XI Punjab": #b6992d
  - "Rising Pune Supergiants": #bab0ac
  - "Royal Challengers Bangalore": #d37295
  - "Pune Warriors": #e15759
  - "Kochi Tuskers Kerala": #f1ce63
  - "Deccan Chargers": #f28e2b
  - "Sunrisers Hyderabad": #fabfd2
  - "Rajasthan Royals": #ff9d9a
  - "Delhi Capitals": #ffbe7d

### 2. TopBatsmenChart ("Top Batsmen")
- **Title:** "Top Batsmen" (Bold, Italic, Underlined, Segoe UI Black, 12px).
- **Data Source:** Filtered dataset where `winner === selectedWinner`.
- **Visual Encoding:**
  - Type: Horizontal Bar Chart.
  - X-Axis: `SUM([batsman_runs])`.
  - Y-Axis: `[batsman]`.
  - Sort: Descending by `SUM([batsman_runs])`.
  - Filter: Top 15 Batsmen.
  - Color: Encoded by `[batsman]` (Use a categorical scale, e.g., `d3.schemeTableau10`).
- **Axis Labels:** X-axis title should be "Batsmen Runs".

### 3. TeamRunsChart ("Team vs Total Runs")
- **Data Source:** Full dataset (No filter applied based on workbook definition).
- **Visual Encoding:**
  - Type: Horizontal Bar Chart.
  - X-Axis: `SUM([total_runs])`.
  - Y-Axis: `[team1]`.
  - Sort: Descending by `SUM([total_runs])`.
  - Color: Automatic (Single color or encoded by team, default to a neutral blue if not specified).

### 4. VenueChart ("Venue")
- **Title:** "Venue (Where Match Take place)" (Bold, Italic, Underlined, Segoe UI Black, 12px/9px mixed).
- **Data Source:** Filtered dataset where `winner === selectedWinner`.
- **Visual Encoding:**
  - Type: Horizontal Bar Chart.
  - X-Axis: `COUNT(records)` (Number of matches).
  - Y-Axis: `[venue]`.
  - Sort: Descending by Count.
  - Filter: Top 10 Venues.
  - Color: Encoded by `[venue]` (Use a categorical scale).

### 5. WinByRunsChart ("Win By Runs")
- **Title:** "Win By Runs" (Bold, Italic, Underlined, Segoe UI Black, 12px).
- **Data Source:** Filtered dataset where `winner === selectedWinner`.
- **Visual Encoding:**
  - Type: Horizontal Bar Chart.
  - X-Axis: `SUM([win_by_runs])`.
  - Y-Axis: `[winner]` (Note: Since data is filtered by winner, this might show a single bar or comparison if the filter logic allows context. In Tableau, filtering a dimension on the view usually removes other members. However, if the view is just `SUM([win_by_runs])` vs `winner`, and we filter by `winner`, we get one bar. If the intention is to show the margin of victory for the selected team *across matches*, the axis would be different. Based on the XML `rows`=`SUM([win_by_runs])` and `cols`=`[winner]`, and the filter on `[winner]`, it will display the total runs won by for the selected team).
  - Sort: Descending.
  - Color: Encoded by `[winner]`.

## Implementation Details

- **D3 Setup:** Use `useRef` for the SVG container. Use `useEffect` to render the chart when data or dimensions change.
- **Margins:** Standard margins (top: 20, right: 30, bottom: 40, left: 100) to accommodate labels.
- **Responsiveness:** Use `ResizeObserver` or `window.addEventListener('resize')` to update chart dimensions.
- **Tooltips:** Implement a simple HTML tooltip that follows the mouse cursor, displaying the Dimension name and Measure value.

## Summary of Interactions
1.  **Initialization:** App loads data. `selectedWinner` defaults to "Kolkata Knight Riders".
2.  **Render:** All charts render. `WinnerChart` shows all teams. `TopBatsmenChart`, `VenueChart`, and `WinByRunsChart` show data only for "Kolkata Knight Riders". `TeamRunsChart` shows global data.
3.  **User Action:** User clicks "Mumbai Indians" in `WinnerChart`.
4.  **State Update:** `selectedWinner` becomes "Mumbai Indians".
5.  **Re-render:** `TopBatsmenChart`, `VenueChart`, and `WinByRunsChart` update to show data for "Mumbai Indians". `WinnerChart` highlights the "Mumbai Indians" bar.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_3533/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: batman vs runs
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[sum:batsman_runs:qk]`
- cols_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]`
- series_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]`
- bar_orientation: `vertical`
- axis_title_rows: Batsmen Runs
- zone: x=693, y=55297, w=49261, h=43352
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: team vs total runs
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[sum:total_runs:qk]`
- cols_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:team1:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team1:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: venue
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[__tableau_internal_object_id__].[cnt:Cricket_DEEF6E2BDA6C44AC874DAF1C301A5129:qk]`
- cols_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:venue:nk]`
- series_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:venue:nk]`
- bar_orientation: `vertical`
- zone: x=49954, y=55298, w=49353, h=43351
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:venue:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: win by runs
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[sum:win_by_runs:qk]`
- cols_field: `([federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk] / [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk])`
- series_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]`
- bar_orientation: `vertical`
- zone: x=49954, y=11977, w=24686, h=43321
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team1:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team2:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: win by wickets
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[sum:win_by_wickets:qk]`
- cols_field: `([federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk] / [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk])`
- series_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]`
- bar_orientation: `vertical`
- zone: x=74640, y=11977, w=24667, h=43321
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:dismissal_kind:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:result:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: winner vs count
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[__tableau_internal_object_id__].[cnt:Cricket_DEEF6E2BDA6C44AC874DAF1C301A5129:qk]`
- cols_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]`
- series_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]`
- bar_orientation: `vertical`
- zone: x=693, y=11977, w=49261, h=43320
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team2:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: winner vs win by runs
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[sum:win_by_runs:qk]`
- cols_field: `[federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=693, y=1351, w=98614, h=10626): Best Cricket Teams & Players -Imam Abdullah Khan
## Dashboard Actions
- Filter1: kind=filter_action, source=winner vs count, target=Dashboard 1
## Highlight Bindings
- winner vs win by runs: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- team vs total runs: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team1:nk]
- winner vs count: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team2:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- batman vs runs: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk]
- venue: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- win by runs: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team1:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:team2:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- win by wickets: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:batsman:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:dismissal_kind:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:result:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
- venue: [federated.132m8ox1o015gq1beqtcj1tugqih].[none:venue:nk], [federated.132m8ox1o015gq1beqtcj1tugqih].[none:winner:nk]
