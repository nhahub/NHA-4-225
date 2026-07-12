import { CheckCircle2, Circle, Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { Milestone } from '../types';
import { useAddMilestone, useReorderMilestones } from '../hooks/useGoals';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Progress } from '@/shared/components/ui/Progress';

interface MilestoneListProps {
  goalId: string;
  milestones: Milestone[];
  canEdit: boolean;
}

// Milestone completion has no manual toggle — it is always derived from the
// points earned on its linked tasks. The circle below is a read-only status
// indicator, never a click target.
export const MilestoneList = ({ goalId, milestones, canEdit }: MilestoneListProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const add = useAddMilestone();
  const reorder = useReorderMilestones();
  const [draft, setDraft] = useState('');

  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = () => {
    const title = draft.trim();
    if (!title) return;
    add.mutate(
      { goalId, title },
      {
        onSuccess: () => setDraft(''),
      },
    );
  };

  const moveMilestone = (id: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((m) => m._id === id);
    if (idx < 0) return;
    const swap = idx + direction;
    if (swap < 0 || swap >= sorted.length) return;
    const next = [...sorted];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const payload = next.map((m, i) => ({ id: m._id, sort_order: i }));
    reorder.mutate(payload);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '';
    try {
      return format(parseISO(value), locale === 'ar' ? 'd MMM' : 'MMM d');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {t('goals.milestones')}
      </h3>
      <ul className="space-y-2">
        {sorted.map((m, idx) => {
          const progress = m.progress ?? 0;
          const range = m.startDate && m.endDate ? `${formatDate(m.startDate)} – ${formatDate(m.endDate)}` : null;
          return (
            <li
              key={m._id}
              className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => moveMilestone(m._id, -1)}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-brand-500 disabled:opacity-30 shrink-0"
                    aria-label={t('goals.moveUp')}
                  >
                    <GripVertical size={14} className="rotate-90" />
                  </button>
                )}
                <span
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    m.is_completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-label={m.is_completed ? t('goals.complete') : undefined}
                  title={t('goals.derivedFromTasks')}
                >
                  {m.is_completed && <CheckCircle2 size={12} className="text-white" />}
                  {!m.is_completed && <Circle size={12} className="opacity-0" />}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-medium ${
                      m.is_completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {m.title}
                  </span>
                  {range && <span className="block text-[11px] text-gray-400">{range}</span>}
                </div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="text-center text-sm text-gray-400 italic py-4">
            {t('goals.noMilestones')}
          </li>
        )}
      </ul>
      <p className="text-[11px] text-gray-400 italic">{t('goals.derivedFromTasks')}</p>

      {canEdit && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('goals.milestonePlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd} isLoading={add.isPending} leftIcon={<Plus size={14} />}>
            {t('goals.addMilestone')}
          </Button>
        </div>
      )}
    </div>
  );
};
