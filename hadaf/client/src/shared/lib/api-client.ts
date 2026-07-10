import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { setupMockServer } from './mock-server';

export type ApiErrorCode = 'VALIDATION' | 'AUTH' | 'DB_ERROR' | 'RATE_LIMIT' | 'UNKNOWN';

export interface ApiResponseError {
  success: false;
  error: string;
  errorCode: ApiErrorCode;
  field?: string;
}

export class ApiError extends Error {
  code: ApiErrorCode;
  field?: string;
  status?: number;
  i18nKey: string;

  constructor(message: string, code: ApiErrorCode, status?: number, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.field = field;
    this.status = status;
    this.i18nKey = message;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

if (import.meta.env.VITE_USE_MOCK === 'true') {
  setupMockServer(apiClient);
  console.log('🔶 Mock Server Initialized');
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success: unknown }).success === true &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  (error: AxiosError<ApiResponseError>) => {
    const payload = error.response?.data;

    if (payload && payload.success === false) {
      const apiErr = new ApiError(
        payload.error ?? 'errors.unknown',
        payload.errorCode ?? 'UNKNOWN',
        error.response?.status,
        payload.field,
      );
      console.error('API Error:', apiErr.i18nKey, apiErr.code, apiErr.field ?? '');
      return Promise.reject(apiErr);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.assign('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }

    const fallback = new ApiError(
      'errors.networkError',
      'UNKNOWN',
      error.response?.status,
    );
    console.error('API Error (raw):', error.message);
    return Promise.reject(fallback);
  },
);

export default apiClient;