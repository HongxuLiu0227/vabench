import { ApiResponse } from '../types';
import { fetchData } from '../utils/api';

export async function login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
  return fetchData('/auth/login');
}

export async function logout(): Promise<ApiResponse<void>> {
  return fetchData('/auth/logout');
}