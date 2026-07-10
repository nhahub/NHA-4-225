import { createContext } from 'react';
import type { DayType } from '../features/settings/hooks/useDayType';

export interface DayTypeContextValue {
  dayType: DayType;
  dayTypeDate: string;
  isLoading: boolean;
}

export const DayTypeContext = createContext<DayTypeContextValue | undefined>(undefined);
