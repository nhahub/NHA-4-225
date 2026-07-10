import { create } from 'zustand';
import { startOfToday } from 'date-fns';

interface DateState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  resetToToday: () => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: startOfToday(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  resetToToday: () => set({ selectedDate: startOfToday() }),
}));