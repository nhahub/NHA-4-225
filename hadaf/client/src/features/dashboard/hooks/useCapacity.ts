import { useQuery } from '@tanstack/react-query';
import { getCapacity, type CapacityData } from '../api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useCapacity = () =>
  useQuery({
    queryKey: QUERY_KEYS.DAILY_CAPACITY,
    queryFn: getCapacity,
    select: (data): CapacityData => data,
  });
