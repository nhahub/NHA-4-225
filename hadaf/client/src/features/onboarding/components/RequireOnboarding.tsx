import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * ONB route guard.
 *
 * Decides where to send the user based on their auth + onboarding state:
 *
 *   - Authenticated AND onboardingCompleted=false AND path ≠ /onboarding
 *     → redirect to /onboarding (they must finish setup first).
 *   - onboardingCompleted=true AND path IS /onboarding
 *     → redirect to / (don't loop them back into a wizard they've done).
 *   - Otherwise render children unchanged.
 *
 * This component is NOT mounted by the lead agent's work — it ships
 * exported from this epic's file ownership so the lead can wrap the
 * protected-route tree at merge time, in coordination with
 * `RequireAuth` (auth check) and any future route additions.
 */
export const RequireOnboarding = ({ children }: RequireOnboardingProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const path = location.pathname;
  const onboardingComplete = user?.onboardingCompleted === true;

  if (!onboardingComplete && path !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingComplete && path === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};