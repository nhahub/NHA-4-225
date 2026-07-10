import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, type UpdateSettingsInput } from '../api/settingsApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useSettings = () =>
  useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: getSettings,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateSettingsInput) => updateSettings(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.SETTINGS, data);
    },
  });
};
