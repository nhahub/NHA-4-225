// Shape of the data sent when logging in. Matches Architecture.md §3.1 / §3.2
// (login: email + password).
export interface LoginCredentials {
  email: string;
  password: string;
}

// Shape of the data sent when registering. Matches the User schema
// (email + name + password). Avatar/onboarding/settings are derived later.
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Shape of the response from /api/auth/login, /api/auth/register, and
// /api/auth/refresh — see Architecture.md §3.3 ApiResponse<T> wrapped data.
// Note: refresh token is delivered via httpOnly cookie only and never
// appears in this payload.
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Shape of the authenticated user — matches the User model in
// Architecture.md §3.1 (email, name, avatarUrl, onboardingCompleted,
// settings). There is no `roles` field in Hadaf.
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  settings: {
    workHoursStart: string;
    workHoursEnd: string;
    dayStart: string;
    offDays: string[];
    theme: 'light' | 'dark' | 'system';
    language: 'ar' | 'en';
    notifications: {
      timeBlockReminder: boolean;
    };
  };
}