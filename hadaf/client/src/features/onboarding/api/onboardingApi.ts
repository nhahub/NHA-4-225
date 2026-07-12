// ONB-3 → POST /api/user/onboarding/complete
//
// Mirrors the authController user-shape response so the caller can refresh
// its Zustand auth store from `response.data.user` directly without an
// extra /auth/refresh round-trip.

import { apiClient } from '@/shared/lib/api-client';
import type { User } from '@/features/auth/types';

export interface CompleteOnboardingResponse {
  user: User;
}

export const completeOnboarding = async (): Promise<CompleteOnboardingResponse> => {
  const response = await apiClient.post<CompleteOnboardingResponse>(
    '/user/onboarding/complete',
  );
  return response.data;
};