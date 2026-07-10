import { useContext } from 'react';
import { DayTypeContext, type DayTypeContextValue } from './DayTypeContextValue';

export const useDayType = (): DayTypeContextValue => {
  const ctx = useContext(DayTypeContext);
  if (!ctx) {
    throw new Error('useDayType must be used within a <DayTypeProvider>');
  }
  return ctx;
};
