import { Languages } from 'lucide-react';
import { useLocale } from '@/providers/useLocale';
import { type Locale } from '@/providers/LocaleContextValue';

// Compact language switcher (AR ↔ EN). Persists via LocaleProvider (cookie),
// flips <html dir>/<html lang> immediately. Server sync of users.settings.language
// is deferred to E4-1 (the settings endpoint doesn't exist yet).
//
// Renders a button + an inline toggle — no dropdown — to keep header real-estate
// tight on both desktop and mobile. The current locale is highlighted.
export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();

  const toggle = () => {
    const next: Locale = locale === 'ar' ? 'en' : 'ar';
    setLocale(next);
    // TODO(E4-1): sync to users.settings.language once the settings endpoint exists.
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('languageSwitcher.toggle')}
      title={t('languageSwitcher.toggle')}
      className="h-9 inline-flex items-center gap-1.5 px-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 text-xs font-bold tracking-wider"
    >
      <Languages size={16} className="text-gray-500" />
      <span className="font-mono">
        {locale === 'ar' ? 'AR' : 'EN'}
      </span>
      <span className="text-gray-300 dark:text-gray-600">/</span>
      <span className="text-gray-400 dark:text-gray-500 font-mono">
        {locale === 'ar' ? 'EN' : 'AR'}
      </span>
    </button>
  );
};