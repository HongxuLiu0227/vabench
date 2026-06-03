import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await api.get<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch data');
  }
}