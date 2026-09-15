export interface DiagnosisData {
  diagnosis: string;
  count: number;
  totalDischarges: number;
  avgCoveredCharges: number;
  avgTotalPayments: number;
  avgMedicarePayments: number;
  /** Derived field for action/filter: diagnosis code + name */
  actionDiagnosis?: string;
  /** Raw DRG Definition from CSV */
  drgDefinition?: string;
  /** DRG Definition - Split 2: the diagnosis name part (for Tableau compatibility) */
  drgDefinitionSplit2?: string;
  /** Sepsis indicator: true if diagnosis contains "SEPSIS" */
  sepsis?: boolean;
  /** Provider State for highlighting */
  providerState?: string;
}

export type SelectionState = string | null;

export interface DashboardContextType {
  data: DiagnosisData[];
  selectedDiagnosis: SelectionState;
  setSelectedDiagnosis: (diagnosis: SelectionState) => void;
  highlightedDiagnosis: SelectionState;
  setHighlightedDiagnosis: (diagnosis: SelectionState) => void;
}
