import { apiClient } from '@/shared/lib/api-client';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const loginWithEmail = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerWithEmail = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return response.data;
};

export const refreshSession = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};