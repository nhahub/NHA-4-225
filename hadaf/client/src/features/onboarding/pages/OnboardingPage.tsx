import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { useTheme } from '@/providers/useTheme';
import { LanguageSwitcher } from '@/shared/components/layout/LanguageSwitcher';
import { OnboardingWizard } from '../components/OnboardingWizard';

/**
 * ONB — full-page onboarding screen.
 *
 * Rendered as a standalone route (`/onboarding`), NOT inside AppLayout.
 * It mirrors the LoginPage's outer-shell pattern (header bar + content
 * panel) so the first-run experience has the same shell as the
 * unauthenticated login screen, even though the user is already
 * authenticated here — they simply haven't completed onboarding yet.
 *
 * RTL-first and dark-mode aware by virtue of using the same providers
 * (Theme, Locale, DayType) as the rest of the app.
 */
export const OnboardingPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    document.title = `${t('onboarding.pageTitle')} · ${t('app.name')}`;
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors px-4 py-10 font-sans relative overflow-y-auto">
      <header className="absolute top-0 start-0 w-full p-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
            {'ح'}
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">
            {t('app.name')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-sm hover:shadow-md"
            aria-label={isDarkMode ? 'light' : 'dark'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="w-full max-w-2xl mt-20 md:mt-24">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('onboarding.pageTitle')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            {t('onboarding.subtitle')}
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
};