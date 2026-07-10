import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useUIStore } from '@/shared/stores/useUIStore';
import { getDashboardStats } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { HeaderProgressBar } from './header/HeaderProgressBar';
import { HeaderContent } from './header/HeaderContent';
import { useTheme } from '@/providers/useTheme';

export const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { selectedDate, setSelectedDate, resetToToday } = useDateStore();
  const {
    openTaskModal,
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    toggleSidebarCollapsed,
    isSidebarCollapsed,
  } = useUIStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: getDashboardStats,
  });

  const score = stats?.dailyScore || 0;
  const target = stats?.dailyTarget || 100;
  const rawProgress = target > 0 ? (score / target) * 100 : 0;
  const progress = Math.min(100, Math.round(rawProgress));
  const isOverachiever = rawProgress >= 100;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleMenuToggle = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    } else {
      toggleSidebarCollapsed();
    }
  };

  const handleAddTask = () => {
    navigate('/tasks');
    openTaskModal();
  };

  return (
    <header className="h-[72px] sticky top-0 z-40 transition-all relative shadow-sm group">
      <HeaderProgressBar progress={progress} isOverachiever={isOverachiever} />

      <HeaderContent
        currentTime={currentTime}
        isDarkMode={theme === 'dark'}
        isSearchExpanded={isSearchExpanded}
        selectedDate={selectedDate}
        isSidebarCollapsed={isSidebarCollapsed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchToggle={() => setIsSearchExpanded((v) => !v)}
        onSearchClear={() => setSearchQuery('')}
        onDateChange={setSelectedDate}
        onResetToday={resetToToday}
        onThemeToggle={toggleTheme}
        onAddTask={handleAddTask}
        onMenuToggle={handleMenuToggle}
      />
    </header>
  );
};