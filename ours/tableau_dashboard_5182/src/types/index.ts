export interface FightSongData {
  school: string;
  conference: string;
  song_name: string;
  writers: string;
  year: string | number;
  student_writer: string;
  official_song: string;
  contest: string;
  bpm: number;
  sec_duration: number;
  fight: string;
  number_fights: number;
  victory: string;
  win_won: string;
  victory_win_won: string;
  rah: string;
  nonsense: string;
  colors: string;
  men: string;
  opponents: string;
  spelling: string;
  trope_count: number;
  spotify_id: string;
  // Tableau calculated field for action filter combining conference and school
  Calculation_1314769640457560064: string;
}

export type SelectedSchool = string | null;
