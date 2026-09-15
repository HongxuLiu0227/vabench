// Re-export data processing functions from dataService
export {
  processTripData,
  calculateOverallYOY,
  calculateFemaleYOY,
  processUserTypeGenderYear,
  getAllGenderYears,
  getYears,
  loadData,
  loadDataWithRetry
} from '../services/dataService';
