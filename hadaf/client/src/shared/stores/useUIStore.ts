import { create } from 'zustand';
import { Task } from '@/features/tasks/types';

interface UIState {
  // Task Form Modal
  isTaskModalOpen: boolean;
  taskToEdit: Task | null; // ✅ Added to hold the task being edited
  openTaskModal: (task?: Task) => void; // ✅ Accept optional task
  closeTaskModal: () => void;

  // Task Completion Modal
  taskToComplete: Task | null;
  setTaskToComplete: (task: Task | null) => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTaskModalOpen: false,
  taskToEdit: null,
  // ✅ If a task is passed, save it. Otherwise set to null (Create mode)
  openTaskModal: (task) => set({ isTaskModalOpen: true, taskToEdit: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, taskToEdit: null }),

  taskToComplete: null,
  setTaskToComplete: (task) => set({ taskToComplete: task }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  isSidebarCollapsed: false,
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));