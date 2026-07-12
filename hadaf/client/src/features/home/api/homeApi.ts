import { apiClient } from '@/shared/lib/api-client';
import type { DailySummary } from '@/features/dashboard/api/dashboardApi';

export interface MarkSummaryShownResponse {
  summary: DailySummary;
  /**
   * `true` when the server just transitioned summaryShown from
   * `false → true`. `false` on subsequent calls within the same day —
   * the client uses this to fire the one-time toast exactly once.
   */
  wasNewlyShown: boolean;
}

/**
 * HOME-1 toast gating — flips the `summaryShown` flag on a specific day's
 * DailySummary. Idempotent on the server. Returns both the upserted
 * summary and a `wasNewlyShown` signal so the caller knows whether the
 * flag just flipped (and the toast should fire).
 */
export const markSummaryShown = async (
  date: string,
): Promise<MarkSummaryShownResponse> => {
  const response = await apiClient.patch<MarkSummaryShownResponse>(
    `/daily-summaries/${date}/summary-shown`,
  );
  return response.data;
};