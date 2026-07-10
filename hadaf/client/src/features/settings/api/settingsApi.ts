import { apiClient } from '@/shared/lib/api-client';

export interface UserSettings {
  work_hours_start: string;
  work_hours_end: string;
  day_start: string;
  off_days: string[];
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  notifications: {
    time_block_reminder: boolean;
  };
}

export interface UpdateSettingsInput {
  work_hours_start?: string;
  work_hours_end?: string;
  day_start?: string;
  off_days?: string[];
  theme?: 'light' | 'dark' | 'system';
  language?: 'ar' | 'en';
  notifications?: {
    time_block_reminder?: boolean;
  };
}

export const getSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>('/user/settings');
  return response.data;
};

export const updateSettings = async (
  patch: UpdateSettingsInput,
): Promise<UserSettings> => {
  const response = await apiClient.patch<UserSettings>('/user/settings', patch);
  return response.data;
};
