import { NavLink } from 'react-router-dom';
import { Home, Target, Repeat, MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';

// Mobile bottom navigation (visible <md). 4 items per E0-6: Home, Goals,
// Habits, More. Overview is sidebar/desktop-only — More absorbs secondary
// items on mobile (per work-order E0-6 spec).
export const BottomNav = () => {
  const { t } = useTranslation();

  const items = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: Target, label: t('nav.goals'), path: '/goals' },
    { icon: Repeat, label: t('nav.habits'), path: '/habits' },
    { icon: MoreHorizontal, label: t('nav.more'), path: '/settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background-paper dark:bg-background-paper-dark border-t border-gray-200 dark:border-gray-800 px-2 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around h-16">
        {items.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-semibold transition-colors',
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-transform"
                  />
                  <span className="leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};