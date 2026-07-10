import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import { useGoals } from '../hooks/useGoals';
import { GoalCard } from '../components/GoalCard';
import { GoalWizard } from '../components/GoalWizard';
import { GoalReadinessDialog } from '../components/GoalReadinessDialog';
import { GoalStatus, Goal, GOAL_STATUS_LABELS, GoalCategory } from '../types';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';

export const GoalsPage = () => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('active');
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: goals = [], isLoading } = useGoals({});

  const activeCount = goals.filter((g) => g.status === 'active').length;

  useEffect(() => {
    document.title = `${t('nav.goals')} · ${t('app.name')}`;
  }, [t]);

  const filtered = useMemo(() => {
    return goals.filter((g: Goal) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!g.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [goals, statusFilter, categoryFilter, search]);

  const openGoal = (id: string) => navigate(`/goals/${id}`);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.goals')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('goals.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setReadinessOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          {t('goals.newGoal')}
        </Button>
      </header>

      <Card padding="md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute top-3 start-3 text-gray-400 pointer-events-none" />
            <Input
              placeholder={t('goals.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter size={12} />
            {t('goals.totalActive', { count: activeCount })}
          </span>
          <select
            aria-label={t('goals.category')}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as GoalCategory | 'all')}
            className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t('goals.all')}</option>
            {(['education_work', 'family', 'health', 'religion_spirituality', 'other'] as const).map((c) => (
              <option key={c} value={c}>
                {c === 'other' ? '…' : c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(v: string) => setStatusFilter(v as GoalStatus | 'all')}
          className="mt-4"
        >
          <TabsList>
            <TabsTrigger value="all">{t('goals.all')}</TabsTrigger>
            {(['active', 'completed', 'archived'] as const).map((s) => (
              <TabsTrigger key={s} value={s}>
                {GOAL_STATUS_LABELS[s][locale as 'ar' | 'en']}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('goals.noGoals')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              {t('goals.noGoalsHelper')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GoalCard key={g._id} goal={g} onOpen={openGoal} />
          ))}
        </div>
      )}

      <GoalReadinessDialog
        isOpen={readinessOpen}
        onClose={() => setReadinessOpen(false)}
        onConfirm={() => {
          setReadinessOpen(false);
          setWizardOpen(true);
        }}
      />
      <GoalWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};
