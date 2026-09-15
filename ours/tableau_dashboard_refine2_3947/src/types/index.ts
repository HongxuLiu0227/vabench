export interface ScotusVote {
  F1: number;
  justice: number;
  justiceName: string;
  majVotes: number;
  minVotes: number;
  decisionDirection: number;
  majority: number;
  caseId: string;
  term: number;
  partyWinning: number;
  precedentAlteration: number;
  vote: number;
  issueArea: number;
  vote_direction: number;
}

export type VoteDirection = 0 | 1 | 2 | 3;
export type IssueArea = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export const ISSUE_AREA_LABELS: Record<IssueArea, string> = {
  1: "Criminal Procedure",
  2: "Civil Rights",
  3: "First Amendment",
  4: "Due Process",
  5: "Privacy",
  6: "Attorneys",
  7: "Unions",
  8: "Economic Activity",
  9: "Judicial Power",
  10: "Federalism",
  11: "Interstate Relations",
  12: "Federal Taxation",
  13: "Miscellaneous",
  14: "Private Action",
};

export const VOTE_DIRECTION_LABELS: Record<VoteDirection, string> = {
  0: "No Vote",
  1: "Conservative",
  2: "Liberal",
  3: "Unspecifiable",
};

export const VOTE_DIRECTION_COLORS: Record<VoteDirection, string> = {
  0: "#9c755f",
  1: "#e15759",
  2: "#4e79a7",
  3: "#76b7b2",
};

export const DEFAULT_JUSTICE_FILTERS = [
  "CThomas",
  "EKagan",
  "JGRoberts",
  "NMGorsuch",
  "RBGinsburg",
  "SAAlito",
  "SGBreyer",
  "SSotomayor",
];

export interface FilterState {
  issueAreas: Set<IssueArea>;
  justiceNames: Set<string>;
  voteDirections: Set<VoteDirection>;
}

export interface HighlightState {
  justiceName: string | null;
  voteDirection: VoteDirection | null;
  issueArea: IssueArea | null;
  caseId: string | null;
  term: number | null;
}

export interface AggregatedVoteData {
  justiceName: string;
  vote_direction: VoteDirection;
  count: number;
}

export interface PrecedentData {
  justiceName: string;
  issueArea: IssueArea;
  vote_direction: VoteDirection;
  sum: number;
}

export interface CareerVotesData {
  justiceName: string;
  term: number;
  vote_direction: VoteDirection;
  count: number;
}
