export interface DealStage {
  id: string;
  title: string;
  color: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stageId: string;
}