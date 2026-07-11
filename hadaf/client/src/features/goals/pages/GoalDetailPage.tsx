import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Edit, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/Card';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ProgressRing } from '@/shared/components/ui/ProgressRing';
import { HealthDot } from '@/shared/components/ui/HealthDot';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { useGoal, useOverrideProgress, useArchiveGoal } from '../hooks/useGoals';
import { MilestoneList } from '../components/MilestoneList';
import { WeeklyHeatmap } from '../components/WeeklyHeatmap';
import { GoalWizard } from '../components/GoalWizard';
import { GOAL_CATEGORY_LABELS } from '../types';

export const GoalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [overrideDraft, setOverrideDraft] = useState<number | ''>('');

  const { data: detail, isLoading } = useGoal(id);
  const overrideProgress = useOverrideProgress();
  const archiveGoal = useArchiveGoal();

  // Heatmap data: derive from goal-scoped tasks returned by /api/goals/:id.
  // No additional request needed since detail already includes them.
  const cycleEnd = detail?.goal.cycleEnd
    ? format(new Date(detail.goal.cycleEnd), 'yyyy-MM-dd')
    : '';

  const completedByDate = useMemo(() => {
    if (!detail) return {};
    const map: Record<string, number> = {};
    for (const task of detail.tasks ?? []) {
      if (task.status !== 'completed') continue;
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    document.title = `${detail.goal.title} · ${t('app.name')}`;
  }, [detail, t]);

  if (isLoading || !detail) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const { goal, milestones } = detail;
  const progress = goal.progress ?? 0;
  const isActive = goal.status === 'active';

  const handleSaveOverride = () => {
    if (overrideDraft === '' || typeof overrideDraft !== 'number') return;
    overrideProgress.mutate(
      { id: goal._id, progress: overrideDraft },
      {
        onSuccess: () => {
          toast.success(t('goals.overrideSaved'));
          setOverrideDraft('');
        },
        onError: () => toast.error(t('common.error')),
      },
    );
  };

  const handleClearOverride = () => {
    overrideProgress.mutate(
      { id: goal._id, progress: null },
      {
        onSuccess: () => toast.success(t('goals.overrideCleared')),
        onError: () => toast.error(t('common.error')),
      },
    );
  };

  const handleArchive = () => {
    const reason = window.prompt(t('goals.archivePrompt'));
    if (!reason) return;
    archiveGoal.mutate(
      { id: goal._id, reason },
      {
        onSuccess: () => {
          toast.success(t('goals.archived'));
          navigate('/goals');
        },
        onError: () => toast.error(t('common.error')),
      },
    );
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/goals')}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 inline-flex items-center gap-1"
      >
        {locale === 'ar' ? <ArrowRight size={14} /> : <ArrowRight size={14} className="rotate-180" />}
        {t('goals.backToList')}
      </button>

      <Card padding="lg">
        <div className="flex items-start gap-6 flex-wrap">
          <ProgressRing progress={progress} size={80} stroke={7} />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {goal.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {goal.category === 'other' ? goal.customCategory : GOAL_CATEGORY_LABELS[goal.category][locale as 'ar' | 'en']}
            </p>
            {goal.measure && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">
                  {t('goals.measure')}
                </span>
                {goal.measure}
              </p>
            )}
            {goal.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {goal.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <HealthDot health={goal.health ?? 'yellow'} label size="md" />
              {goal.isOverride && (
                <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  {t('goals.manualOverride')}
                </span>
              )}
              <span className="text-[11px] text-gray-400">
                {t('goals.cycleRange', {
                  from: format(new Date(goal.cycleStart), 'yyyy-MM-dd'),
                  to: format(new Date(goal.cycleEnd), 'yyyy-MM-dd'),
                })}
              </span>
            </div>
          </div>
          {isActive && (
            <div className="flex flex-col gap-2">
              <Button variant="secondary" leftIcon={<Edit size={16} />} onClick={() => setEditing(true)}>
                {t('common.edit')}
              </Button>
              <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={handleArchive}>
                {t('common.delete')}
              </Button>
            </div>
          )}
        </div>

        {isActive && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('goals.overrideTitle')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t('goals.overrideHelper')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder={String(progress)}
                value={overrideDraft}
                onChange={(e) =>
                  setOverrideDraft(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-32"
              />
              <span className="text-sm text-gray-500">%</span>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save size={14} />}
                isLoading={overrideProgress.isPending}
                onClick={handleSaveOverride}
                disabled={overrideDraft === '' || typeof overrideDraft !== 'number'}
              >
                {t('goals.setOverride')}
              </Button>
              {goal.isOverride && (
                <Button variant="ghost" size="sm" onClick={handleClearOverride}>
                  {t('goals.clearOverride')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <MilestoneList goalId={goal._id} milestones={milestones} canEdit={isActive} />
      </Card>

      <Card padding="lg">
        <WeeklyHeatmap
          completedByDate={completedByDate}
          cycleEnd={cycleEnd}
        />
      </Card>

      <GoalWizard
        isOpen={editing}
        onClose={() => setEditing(false)}
        editGoal={goal}
      />
    </div>
  );
}
