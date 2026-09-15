/**
 * Swimming competition data types
 */

export interface SwimmerData {
  CompID: number;
  CompDate: Date | null;
  Сountry: string; // Competition Country
  City: string;
  StyleID: number;
  Style: string;
  Distance: number;
  ResTime: string;
  DisqID: string;
  Reason: string;
  Term: string;
  SwimmerId: number;
  NameSwimmer: string;
  GenderSwimmer: 'M' | 'F' | '';
  BirthDateSwimmers: Date | null;
  'BirthDateSwimmers (copy)_818529261980127232': Date | null; // Tableau calculated field copy
  CareerStartSwimmers: Date | null;
  RankSwimmers: string;
  CountrySwimmers: string;
  DopingRec: boolean;
  TrainerID: number;
  NameTrainer: string;
  GenderTrainer: 'M' | 'F' | '';
  RankTrainer: string;
  CareerStartTrainer: Date | null;
  SponsID: string;
  NameSponsors: string;
  Sum: string;
  PayDate: string;
  Age?: number; // Calculated field
}

export interface FilterState {
  selectedRankSwimmer: string | null;
  selectedRankTrainer: string | null;
  selectedCountrySwimmers: string[];
  selectedCompCountry: string[];
}

export interface AggregatedByRank {
  RankSwimmers: string;
  RankTrainer: string;
  count: number;
}

export interface AggregatedByCountry {
  Сountry: string;
  count: number;
}

export interface AggregatedByAge {
  Age: number;
  GenderSwimmer: string;
  count: number;
}

export interface ChartSelection {
  type: 'rank' | 'country' | 'age' | null;
  data: unknown;
}
