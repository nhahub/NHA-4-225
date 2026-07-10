import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { TaskFormModal } from '@/features/tasks/components/TaskFormModal';
import { GlobalTaskCompletion } from '@/features/tasks/components/GlobalTaskCompletion';
import { useUIStore } from '@/shared/stores/useUIStore';
import { getDashboardStats } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { cn } from '@/shared/utils/cn';

export const AppLayout = () => {
  const { isTaskModalOpen, closeTaskModal, isSidebarCollapsed, taskToEdit } = useUIStore();

  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: getDashboardStats,
  });

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark transition-colors flex relative isolate">

      {/* 1. Sidebar (desktop) */}
      <Sidebar stats={stats} />

      {/* 2. Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-0",
        isSidebarCollapsed ? "md:ps-[80px]" : "md:ps-[280px]"
      )}>

        <Header />

        {/* Page Content — extra bottom padding on mobile reserves space for BottomNav */}
        <main className="flex-1 p-4 md:p-8 pt-4 max-w-7xl mx-auto w-full animate-fade-in relative z-0 pb-24 md:pb-8">
          <Outlet />
        </main>

        <Footer />

      </div>

      {/* 3. Mobile Bottom Nav */}
      <BottomNav />

      {/* --- Global Modals --- */}

      <div className="relative z-[1200]">
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          task={taskToEdit || undefined}
        />
      </div>

      <div className="relative z-[1300]">
        <GlobalTaskCompletion />
      </div>

    </div>
  );
};