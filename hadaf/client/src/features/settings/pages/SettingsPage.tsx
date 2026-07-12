import { useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { useTheme } from '@/providers/useTheme';
import { Card } from '@/shared/components/ui/Card';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import type { UpdateSettingsInput } from '../api/settingsApi';

const WEEKDAYS = [
  { value: 'sunday', label_en: 'Sunday', label_ar: 'الأحد' },
  { value: 'monday', label_en: 'Monday', label_ar: 'الإثنين' },
  { value: 'tuesday', label_en: 'Tuesday', label_ar: 'الثلاثاء' },
  { value: 'wednesday', label_en: 'Wednesday', label_ar: 'الأربعاء' },
  { value: 'thursday', label_en: 'Thursday', label_ar: 'الخميس' },
  { value: 'friday', label_en: 'Friday', label_ar: 'الجمعة' },
  { value: 'saturday', label_en: 'Saturday', label_ar: 'السبت' },
];

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    document.title = `${t('nav.settings')} · ${t('app.name')}`;
  }, [t]);

  if (isLoading || !settings) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const save = (patch: UpdateSettingsInput, message: string) => {
    updateSettings.mutate(patch, {
      onSuccess: () => toast.success(message),
    });
  };

  const toggleOffDay = (weekday: string) => {
    const next = settings.off_days.includes(weekday)
      ? settings.off_days.filter((d) => d !== weekday)
      : [...settings.off_days, weekday];
    save({ off_days: next }, t('settings.saved'));
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    save({ theme: next }, t('settings.saved'));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-brand-500" />
          {t('nav.settings')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
      </header>

      <Card padding="lg">
        <div className="flex items-center gap-3 mb-3">
          {theme === 'dark' ? <Moon className="text-brand-500" /> : <Sun className="text-brand-500" />}
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('settings.theme')}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('settings.themeDescription')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            leftIcon={<Sun size={16} />}
          >
            {t('settings.themeLight')}
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            leftIcon={<Moon size={16} />}
          >
            {t('settings.themeDark')}
          </Button>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="text-brand-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('settings.workHours')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t('settings.workHoursStart')}
            </span>
            <Input
              type="time"
              defaultValue={settings.work_hours_start}
              onBlur={(e) =>
                save({ work_hours_start: e.target.value }, t('settings.saved'))
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t('settings.workHoursEnd')}
            </span>
            <Input
              type="time"
              defaultValue={settings.work_hours_end}
              onBlur={(e) =>
                save({ work_hours_end: e.target.value }, t('settings.saved'))
              }
            />
          </label>
        </div>

        <label className="space-y-2 block mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            {t('settings.dayStart')}
          </span>
          <Input
            type="time"
            min="01:00"
            max="06:00"
            defaultValue={settings.day_start}
            onBlur={(e) => save({ day_start: e.target.value }, t('settings.saved'))}
          />
          <span className="text-[11px] text-gray-400">
            {t('settings.dayStartHelper')}
          </span>
        </label>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
            {t('settings.offDays')}
          </span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => {
              const active = settings.off_days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleOffDay(d.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {locale === 'ar' ? d.label_ar : d.label_en}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{t('settings.offDaysHelper')}</p>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="text-brand-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('settings.notifications')}
          </h2>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={settings.notifications?.time_block_reminder ?? true}
            onChange={(e) =>
              save({ notifications: { time_block_reminder: e.target.checked } }, t('settings.saved'))
            }
            className="mt-1 w-4 h-4 accent-brand-600"
          />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {t('settings.timeBlockReminder')}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.timeBlockReminderHelper')}
            </p>
          </div>
        </label>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => save({}, t('settings.saved'))}
          isLoading={updateSettings.isPending}
          leftIcon={<Save size={16} />}
        >
          {t('settings.saveAll')}
        </Button>
      </div>
    </div>
  );
};
