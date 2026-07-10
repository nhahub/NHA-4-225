import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { TaskFormModal } from '@/features/tasks/components/TaskFormModal';
import { GlobalTaskCompletion } from '@/features/tasks/components/GlobalTaskCompletion';
import { useUIStore } from '@/shared/stores/useUIStore';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useDateStore } from '@/shared/stores/useDateStore';
import { cn } from '@/shared/utils/cn';

export const AppLayout = () => {
  const { isTaskModalOpen, closeTaskModal, isSidebarCollapsed, taskToEdit } = useUIStore();
  const { selectedDate } = useDateStore();
  const stats = useDashboardStats(selectedDate);

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:bg-background transition-colors flex relative isolate">
      <Sidebar stats={stats} />

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-0',
          isSidebarCollapsed ? 'md:ps-[80px]' : 'md:ps-[280px]',
        )}
      >
        <Header />

        <main className="flex-1 p-4 md:p-8 pt-4 max-w-7xl mx-auto w-full animate-fade-in relative z-0 pb-24 md:pb-8">
          <Outlet />
        </main>

        <Footer />
      </div>

      <BottomNav />

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
