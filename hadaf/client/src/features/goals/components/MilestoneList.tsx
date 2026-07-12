import { CheckCircle2, Circle, Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/providers/useLocale';
import { Milestone } from '../types';
import {
  useAddMilestone,
  useToggleMilestone,
  useReorderMilestones,
} from '../hooks/useGoals';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

interface MilestoneListProps {
  goalId: string;
  milestones: Milestone[];
  canEdit: boolean;
}

export const MilestoneList = ({ goalId, milestones, canEdit }: MilestoneListProps) => {
  const { t } = useTranslation();
  const toggle = useToggleMilestone();
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

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {t('goals.milestones')}
      </h3>
      <ul className="space-y-2">
        {sorted.map((m, idx) => (
          <li
            key={m._id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
          >
            {canEdit && (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveMilestone(m._id, -1)}
                  disabled={idx === 0}
                  className="text-gray-400 hover:text-brand-500 disabled:opacity-30"
                  aria-label={t('goals.moveUp')}
                >
                  <GripVertical size={14} className="rotate-90" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => canEdit && toggle.mutate(m._id)}
              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                m.is_completed
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
              }`}
              disabled={!canEdit}
              aria-label={m.is_completed ? t('goals.uncomplete') : t('goals.complete')}
            >
              {m.is_completed && <CheckCircle2 size={12} className="text-white" />}
              {!m.is_completed && <Circle size={12} className="opacity-0" />}
            </button>
            <span
              className={`flex-1 text-sm font-medium ${
                m.is_completed
                  ? 'text-gray-400 line-through'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {m.title}
            </span>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="text-center text-sm text-gray-400 italic py-4">
            {t('goals.noMilestones')}
          </li>
        )}
      </ul>

      {canEdit && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('goals.milestonePlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <Button onClick={handleAdd} isLoading={add.isPending} leftIcon={<Plus size={14} />}>
            {t('goals.add')}
          </Button>
        </div>
      )}
    </div>
  );
};
