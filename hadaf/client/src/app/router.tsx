import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { AppLayout } from '@/shared/components/layout/AppLayout';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const GoalsPage = lazy(() => import('@/features/goals/pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const GoalDetailPage = lazy(() => import('@/features/goals/pages/GoalDetailPage').then((m) => ({ default: m.GoalDetailPage })));
const HabitsPage = lazy(() => import('@/features/habits/pages/HabitsPage').then((m) => ({ default: m.HabitsPage })));
const OverviewPage = lazy(() => import('@/features/overview/pages/OverviewPage').then((m) => ({ default: m.OverviewPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{`جاري التحميل...`}</p>
    </div>
  </div>
);

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const RedirectIfAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:id" element={<GoalDetailPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};