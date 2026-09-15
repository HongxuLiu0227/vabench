import { create } from 'zustand';
import type { DashboardState, HighlightState, ModelParameter, TrainTest, MAECategory } from '../types'


export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  trainTest: 'Test Accuracy',
  model: 'Linear Regression',

  // Default filters
  solidFlag: 0, // 0 = Solid
  season: 'SUMMER',
  clusters: [],
  merchants: [],
  months: [],

  // Actions
  setTrainTest: (value: TrainTest) => set({ trainTest: value }),
  setModel: (value: ModelParameter) => set({ model: value }),
  setSolidFlag: (value: number) => set({ solidFlag: value }),
  setSeason: (value: string) => set({ season: value }),
  setClusters: (value: string[]) => set({ clusters: value }),
  setMerchants: (value: string[]) => set({ merchants: value }),
  setMonths: (value: string[]) => set({ months: value }),
}))

export const useHighlightStore = create<HighlightState>((set) => ({
  selectedCluster: null,
  selectedMAECategory: null,
  selectedColorDescription: null,

  setSelectedCluster: (cluster: string | null) => set({ selectedCluster: cluster }),
  setSelectedMAECategory: (category: MAECategory | null) => set({ selectedMAECategory: category }),
  setSelectedColorDescription: (description: string | null) => set({ selectedColorDescription: description }),

  clearHighlights: () => set({
    selectedCluster: null,
    selectedMAECategory: null,
    selectedColorDescription: null,
  }),
}))
