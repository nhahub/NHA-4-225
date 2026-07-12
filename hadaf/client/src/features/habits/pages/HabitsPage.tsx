import { useEffect, useState } from 'react';
import { Plus, Loader2, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { EmptyState } from '@/shared/components/EmptyState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/AlertDialog';
import { useTranslation } from '@/providers/useLocale';
import { useHabits, useCreateHabit } from '../hooks/useHabits';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

export const HabitsPage = () => {
  const { t } = useTranslation();
  const { data: habits = [], isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const [creating, setCreating] = useState(false);
  const [newHabit, setNewHabit] = useState<{
    title: string;
    category: 'education_work' | 'family' | 'health' | 'religion_spirituality' | 'other';
    type: 'boolean' | 'counter' | 'quit';
    targetValue: string;
    mvdValue: string;
    mvdDescription: string;
  }>({
    title: '',
    category: 'health',
    type: 'boolean',
    targetValue: '',
    mvdValue: '',
    mvdDescription: '',
  });

  useEffect(() => {
    document.title = `${t('nav.habits')} · ${t('app.name')}`;
  }, [t]);

  const onSubmit = () => {
    if (!newHabit.title.trim()) return;
    const payload = {
      title: newHabit.title.trim(),
      category: newHabit.category,
      type: newHabit.type,
      targetValue: newHabit.targetValue ? Number(newHabit.targetValue) : undefined,
      mvdValue: newHabit.mvdValue ? Number(newHabit.mvdValue) : undefined,
      mvdDescription: newHabit.mvdDescription || undefined,
    };
    createHabit.mutate(payload, {
      onSuccess: () => {
        toast.success(t('habits.created'));
        setCreating(false);
        setNewHabit({
          title: '',
          category: 'health',
          type: 'boolean',
          targetValue: '',
          mvdValue: '',
          mvdDescription: '',
        });
      },
    });
  };

  const byType = (type: Habit['type']) => habits.filter((h) => h.type === type);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.habits')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('habits.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setCreating(true)}
        >
          {t('habits.newHabit')}
        </Button>
      </header>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={28} strokeWidth={1.75} />}
          title={t('pol.empty.habitsTitle')}
          body={t('pol.empty.habitsBody')}
          cta={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setCreating(true)}
            >
              {t('habits.newHabit')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {byType('boolean').length > 0 && (
            <HabitSection title={t('habits.boolean')}>
              {byType('boolean').map((h) => <HabitCard key={h._id} habit={h} />)}
            </HabitSection>
          )}
          {byType('counter').length > 0 && (
            <HabitSection title={t('habits.counter')}>
              {byType('counter').map((h) => <HabitCard key={h._id} habit={h} />)}
            </HabitSection>
          )}
          {byType('quit').length > 0 && (
            <HabitSection title={t('habits.quit')}>
              {byType('quit').map((h) => <HabitCard key={h._id} habit={h} />)}
            </HabitSection>
          )}
        </div>
      )}

      <AlertDialog open={creating} onOpenChange={setCreating}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('habits.newHabit')}</AlertDialogTitle>
            <AlertDialogDescription>{t('habits.createHelper')}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 my-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                {t('habits.title')}
              </label>
              <Input
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                placeholder={t('habits.titlePlaceholder')}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                {t('habits.type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['boolean', 'counter', 'quit'] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setNewHabit({ ...newHabit, type: tp })}
                    className={cn(
                      'px-3 py-2 rounded-xl border text-sm font-semibold transition-colors',
                      newHabit.type === tp
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300',
                    )}
                  >
                    {t(`habits.type${tp.charAt(0).toUpperCase()}${tp.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            {newHabit.type === 'counter' && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    {t('habits.targetValue')}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={newHabit.targetValue}
                    onChange={(e) => setNewHabit({ ...newHabit, targetValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    {t('habits.mvdValue')}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={newHabit.mvdValue}
                    onChange={(e) => setNewHabit({ ...newHabit, mvdValue: e.target.value })}
                  />
                </div>
              </>
            )}

            {newHabit.type !== 'quit' && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('habits.mvdDescription')}
                </label>
                <Textarea
                  value={newHabit.mvdDescription}
                  onChange={(e) => setNewHabit({ ...newHabit, mvdDescription: e.target.value })}
                  placeholder={t('habits.mvdPlaceholder')}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCreating(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit} disabled={createHabit.isPending}>
              {createHabit.isPending && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const HabitSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
  </section>
);
