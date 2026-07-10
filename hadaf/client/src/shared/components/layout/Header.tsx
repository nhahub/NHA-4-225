import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useUIStore } from '@/shared/stores/useUIStore';
import { getDashboardStats } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { HeaderProgressBar } from './header/HeaderProgressBar'; // Import new components
import { HeaderContent } from './header/HeaderContent';

export const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const { selectedDate, setSelectedDate, resetToToday } = useDateStore();
  const { openTaskModal, searchQuery, setSearchQuery, toggleSidebar, toggleSidebarCollapsed, isSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  // --- Stats & Progress ---
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: getDashboardStats,
  });

  const score = stats?.dailyScore || 0;
  const target = stats?.dailyTarget || 100;
  const rawProgress = target > 0 ? (score / target) * 100 : 0;
  const progress = Math.min(100, Math.round(rawProgress));
  const isOverachiever = rawProgress >= 100;

  // --- Effects ---
  useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark' || 
                 (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

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
      
      {/* 1. The Immersive Progress Background */}
      <HeaderProgressBar 
        progress={progress} 
        isOverachiever={isOverachiever} 
      />

      {/* 2. The Interactive Content */}
      <HeaderContent 
        currentTime={currentTime}
        isDarkMode={isDarkMode}
        isSearchExpanded={isSearchExpanded}
        selectedDate={selectedDate}
        isSidebarCollapsed={isSidebarCollapsed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchToggle={() => setIsSearchExpanded(!isSearchExpanded)}
        onSearchClear={() => setSearchQuery('')}
        onDateChange={setSelectedDate}
        onResetToday={resetToToday}
        onThemeToggle={handleThemeToggle}
        onAddTask={handleAddTask}
        onMenuToggle={handleMenuToggle}
      />
    </header>
  );
};