export interface TwitterData {
  投稿日時: Date;
  媒体: string;
  ユーザプロフィールURL: string;
  投稿URLキャプチャー: string;
  投稿内容: string;
  コメント数: number;
  リツイート数: number;
  いいね数: number;
  検索ワード: string;
  // Tableau calculated fields
  'Number of Records': number;
  'Calculation_269090137308614656': string;
  'Calculation_269090137310105601': string;
  'Calculation_269090137311887363': string;
}

export interface FilterState {
  selectedUser: string | null;
  selectedPost: string | null;
  selectedDate: Date | null;
}

export interface ChartDataPoint {
  category: string;
  value: number;
  originalData?: TwitterData[];
}

export interface AggregatedData {
  [key: string]: number | TwitterData[];
}

export type WorksheetName =
  | 'いいねユーザ日別'
  | 'いいね数'
  | 'いいね数(ユーザ別)'
  | 'いいね数(投稿別)'
  | 'コメントユーザ(ユーザ別)'
  | 'コメントユーザ(投稿別)'
  | 'コメントユーザ日別'
  | 'コメント数'
  | 'データ数'
  | 'ユーザ別投稿数ランキング'
  | 'リツイート(ユーザ別)'
  | 'リツイート(投稿別)'
  | 'リツイート日別'
  | 'リツート数'
  | '収集データ'
  | '検索ワード';
