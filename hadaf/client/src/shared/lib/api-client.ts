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

// --- Silent-refresh state (E0-6) ---
// On a 401 we call /auth/refresh once. While that refresh is in flight, any
// other 401s queue behind it (avoid refresh-storm). If refresh succeeds, the
// original request is replayed with the fresh access token. If it fails, we
// clear local state and redirect to /login with a `redirect` query param so
// the user lands back on the page they were trying to reach.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeToRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function notifyRefreshSubscribers(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function performRefresh(): Promise<string | null> {
  try {
    // Use a bare axios call (not apiClient) so we don't recurse through the
    // interceptor again. The refresh endpoint reads the httpOnly cookie and
    // rotates the refresh token.
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }
    );
    const data = unwrapEnvelope<{ accessToken?: string }>(response.data);
    const accessToken = data?.accessToken;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      return accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError<ApiResponseError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const payload = error.response?.data;

    // Auth endpoints (login, register, refresh) return 401 for legitimate
    // reasons (wrong password, expired token). We must NOT trigger the
    // silent-refresh cascade or redirect-to-login for these — just let the
    // error propagate to the caller.
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = /\/auth\/(login|register|refresh)/.test(requestUrl);

    // ---- 401 silent-refresh path (E0-6) ----
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      // If a refresh is already in flight, queue behind it.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeToRefresh((token) => {
            if (token) {
              originalRequest._retry = true;
              originalRequest.headers = originalRequest.headers ?? {};
              (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const token = await performRefresh();
      isRefreshing = false;
      notifyRefreshSubscribers(token);

      if (token) {
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — fall through to logout + redirect.
    }

    // Refresh failed or non-envelope 401 → clear + redirect.
    // Skip for auth endpoints — they handle their own error display.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      const currentPath = window.location.pathname + window.location.search;
      window.location.assign('/login?redirect=' + encodeURIComponent(currentPath));
      return new Promise(() => {}); // pause execution during redirect
    }

    // ---- Standard error envelope handling ----
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