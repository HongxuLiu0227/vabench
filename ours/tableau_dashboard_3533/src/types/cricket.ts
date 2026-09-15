export interface CricketDataRow {
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
  date: string;
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
  // Computed field for Tableau internal object counting
  Cricket_DEEF6E2BDA6C44AC874DAF1C301A5129: number;
}

export interface AggregatedDataPoint {
  category: string;
  value: number;
  originalData?: CricketDataRow[];
}

export interface WorksheetData {
  data: AggregatedDataPoint[];
  title: string;
  axisTitle?: string;
}

export type HighlightState = Record<string, Set<string>>;
