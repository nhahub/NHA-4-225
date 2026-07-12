import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveGoals,
  getGoals,
  getGoalDetail,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  archiveGoal as apiArchiveGoal,
  replaceGoal as apiReplaceGoal,
  reorderMilestones as apiReorderMilestones,
  addMilestone as apiAddMilestone,
  type GetGoalsParams,
} from '../api/goalApi';
import type { CreateGoalInput } from '../types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useApiErrorHandler } from '@/shared/hooks/useApiErrorHandler';

export const useActiveGoals = () =>
  useQuery({
    queryKey: [...QUERY_KEYS.GOALS, 'active'] as const,
    queryFn: getActiveGoals,
  });

export const useGoals = (params: GetGoalsParams = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.GOALS, params] as const,
    queryFn: () => getGoals(params),
  });

export const useGoal = (id: string | undefined) =>
  useQuery({
    queryKey: id ? QUERY_KEYS.GOAL_DETAIL(id) : ['goal', 'pending'],
    queryFn: () => getGoalDetail(id!),
    enabled: !!id,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => apiCreateGoal(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS] });
    },
    onError: (err, input) =>
      handleError(err, {
        title: 'goals.errors.createFailed',
        retry: () => apiCreateGoal(input),
      }),
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateGoalInput> }) =>
      apiUpdateGoal(id, input),
    onSuccess: (goal) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GOAL_DETAIL(goal._id) });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'goals.errors.updateFailed',
        retry: () => apiUpdateGoal(vars.id, vars.input),
      }),
  });
};

export const useArchiveGoal = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiArchiveGoal(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS] });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'goals.errors.archiveFailed',
        retry: () => apiArchiveGoal(vars.id, vars.reason),
      }),
  });
};

export const useReplaceGoal = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CreateGoalInput & { reason: string };
    }) => apiReplaceGoal(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS] });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'goals.errors.replaceFailed',
        retry: () => apiReplaceGoal(vars.id, vars.input),
      }),
  });
};

export const useReorderMilestones = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: (milestones: Array<{ id: string; sort_order: number }>) =>
      apiReorderMilestones(milestones),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS, 'detail'] });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'goals.errors.reorderMilestonesFailed',
        retry: () => apiReorderMilestones(vars),
      }),
  });
};

export const useAddMilestone = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: ({ goalId, title }: { goalId: string; title: string }) =>
      apiAddMilestone(goalId, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS] });
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.GOALS, 'detail'] });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'goals.errors.addMilestoneFailed',
        retry: () => apiAddMilestone(vars.goalId, vars.title),
      }),
  });
};
