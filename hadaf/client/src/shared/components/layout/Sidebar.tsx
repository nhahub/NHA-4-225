import { NavLink } from 'react-router-dom';
import { Home, Target, Repeat, LayoutGrid, Settings, CheckCircle2, Clock, Zap, Hourglass, X, BookOpen, Quote, LogOut } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { DashboardStats } from '@/features/dashboard/api/dashboardApi';
import { useUIStore } from '@/shared/stores/useUIStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useLocale, useTranslation } from '@/providers/useLocale';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';

interface SidebarProps {
  stats?: DashboardStats;
}

export const Sidebar = ({ stats }: SidebarProps) => {
  const { isSidebarOpen, closeSidebar, isSidebarCollapsed } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();
  const { locale } = useLocale();
  const isDesktop = useIsDesktop();

  // Bypass the Tailwind `ltr:` / `rtl:` variant specificity trap. In Tailwind
  // v4 those variants wrap their selector in `:where(...)` (0 specificity), so
  // when the same class is paired with `md:translate-x-0`, the `ltr:`/`rtl:`
  // rule wins by source order (it's emitted later in the CSS bundle) — the
  // sidebar stays off-screen at every breakpoint.
  //
  // Computing the slide-off transform via React state and applying it as an
  // inline style guarantees the right value at every viewport and avoids the
  // flicker when `<html dir>` toggles on language change.
  const sidebarTransform = isDesktop
    ? 'none'
    : isSidebarOpen
    ? 'translateX(0)'
    : locale === 'ar'
    ? 'translateX(100%)' // RTL: closed → slides off the right edge
    : 'translateX(-100%)'; // LTR: closed → slides off the left edge

  const doneCount = stats?.completedTasks || 0;
  const pendingCount = stats?.pendingTasks || 0;
  const score = stats?.dailyScore || 0;

  const focusMinutes = stats?.totalFocusTime || 0;
  const hours = Math.floor(focusMinutes / 60);
  const minutes = focusMinutes % 60;
  const focusTimeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // 5 items per E0-6 spec (Home, Goals, Habits, Overview, Settings).
  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: Target, label: t('nav.goals'), path: '/goals' },
    { icon: Repeat, label: t('nav.habits'), path: '/habits' },
    { icon: LayoutGrid, label: t('nav.overview'), path: '/overview' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[59] md:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "h-full fixed start-0 top-0 z-[60] flex flex-col transition-all duration-300 ease-in-out",
          "bg-background-paper dark:bg-background-paper-dark border-e border-border dark:border-border-dark",
          isSidebarCollapsed ? "md:w-[80px]" : "md:w-[280px]"
        )}
        style={{ transform: sidebarTransform }}
      >
        
        {/* Logo Area */}
        <div className={cn(
          "h-[72px] flex items-center border-b border-gray-100 dark:border-gray-800/50 transition-all",
          isSidebarCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          <div className="flex items-center gap-3">
            <img 
              src="/logo.webp" 
              alt="Logo" 
              className="w-8 h-8 object-contain" 
            />
            <span className={cn(
              "text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-opacity duration-200",
              isSidebarCollapsed ? "hidden opacity-0" : "block opacity-100"
            )}>
              {`هدف`}
            </span>
          </div>
          
          <button 
            onClick={closeSidebar}
            className={cn("md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg", isSidebarCollapsed && "hidden")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-2 mt-6 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => closeSidebar()}
              className={({ isActive }) => cn(
                "flex items-center rounded-xl transition-all duration-200 group font-medium text-sm relative",
                isSidebarCollapsed ? "justify-center py-3 px-0" : "gap-3 px-3 py-2.5",
                isActive 
                  ? "bg-gray-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-100" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={22} 
                    className={cn(
                      "transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100", 
                      isActive && "text-brand-600 dark:text-brand-400"
                    )} 
                  />
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-200",
                    isSidebarCollapsed ? "hidden w-0 opacity-0" : "block w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* --- 🌟 Athar Section (Premium & Clear) 🌟 --- */}
        {!isSidebarCollapsed && (
          <div className="mx-3 mb-5 animate-fade-in">
            <div className="relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-5 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-800/30 group transition-all duration-300 hover:shadow-md hover:border-amber-300/70">
              
              {/* Decorative Background Icon */}
              <div className="absolute -end-4 -top-4 opacity-[0.07] dark:opacity-[0.05] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                <BookOpen size={100} className="text-amber-900 dark:text-amber-500" />
              </div>

              {/* Quote Mark */}
              <div className="absolute top-3 start-3 opacity-20">
                 <Quote size={16} className="text-amber-800 dark:text-amber-500 rotate-180" />
              </div>

              {/* Text Content */}
              <div className="relative z-10 text-center" dir="rtl">
                
                {/* Featured Header */}
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-2 drop-shadow-sm font-serif">
                  "أُصُولُ السُّنَّةِ عِنْدَنَا"
                </h4>

                {/* The Quote Body */}
                <p className="text-xs font-medium leading-relaxed text-gray-800 dark:text-gray-200 opacity-90 font-serif">
                  التَّمَسُّكُ بِمَا كَانَ عَلَيْهِ أَصْحَابُ رَسُولِ اللَّهِ ﷺ، وَالِاقْتِدَاءُ بِهِمْ، وَتَرْكُ الْبِدَعِ، وَكُلُّ بِدْعَةٍ فَهِيَ ضَلَالَةٌ.
                </p>
                
                {/* Decorative Divider */}
                <div className="mx-auto my-3 h-px w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700 opacity-70" />
                
                {/* Author Signature */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-bold tracking-wide text-amber-700 dark:text-amber-400">
                    الإمام أحمد بن حنبل
                  </span>
                  <span className="text-[9px] text-amber-600/60 dark:text-amber-500/50 font-medium">
                    رحمه الله
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tasks Summary Widget --- */}
        <div className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "px-2 mb-6" : "px-3 mb-6"
        )}>
          {!isSidebarCollapsed ? (
            // Full Widget
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 relative overflow-hidden animate-fade-in">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                {t('sidebar.dailySummary')}
              </h3>
              <div className="space-y-2.5">
                <SummaryRow icon={CheckCircle2} color="text-emerald-600" label={t('sidebar.done')} value={doneCount} />
                <SummaryRow icon={Clock} color="text-amber-600" label={t('sidebar.pending')} value={pendingCount} />
                <SummaryRow icon={Hourglass} color="text-blue-600" label={t('sidebar.focus')} value={focusTimeText} />
                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700 mt-2.5">
                   <SummaryRow icon={Zap} color="text-brand-600" label={t('sidebar.score')} value={score} isScore />
                </div>
              </div>
            </div>
          ) : (
            // Mini Widget
            <div className="py-4 flex flex-col items-center gap-4 bg-gray-50 dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-800 animate-fade-in">
               <div className="flex flex-col items-center gap-1 group relative cursor-help">
                 <CheckCircle2 size={18} className="text-emerald-600" />
                 <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{doneCount}</span>
               </div>
               <div className="flex flex-col items-center gap-1 group relative cursor-help">
                 <Clock size={18} className="text-amber-600" />
                 <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{pendingCount}</span>
               </div>
               <div className="flex flex-col items-center gap-1 group relative cursor-help">
                 <Hourglass size={18} className="text-blue-600" />
                 <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap tracking-tight">
                   {focusTimeText}
                 </span>
               </div>
               <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
               <div className="flex flex-col items-center gap-1 group relative cursor-help">
                 <Zap size={18} className="text-brand-600" />
                 <span className="text-[10px] font-bold text-brand-700 dark:text-brand-400">{score}</span>
               </div>
            </div>
          )}
        </div>

        {/* --- Sign Out Button (New) --- */}
        <div className="p-3 mt-auto border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center w-full rounded-xl transition-all duration-200 group font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10",
                isSidebarCollapsed ? "justify-center py-3 px-0" : "gap-3 px-3 py-2.5"
              )}
              title={t('sidebar.signOut')}
            >
              <LogOut
                size={22}
                className="transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <span className={cn(
                "whitespace-nowrap transition-all duration-200",
                isSidebarCollapsed ? "hidden w-0 opacity-0" : "block w-auto opacity-100"
              )}>
                {t('sidebar.signOut')}
              </span>
            </button>
         </div>
        
      </aside>
    </>
  );
};

const SummaryRow = ({ icon: Icon, color, label, value, isScore }: any) => (
  <div className="flex justify-between items-center text-xs">
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
      <Icon size={14} className={color} />
      <span className="font-medium">{label}</span>
    </div>
    <span className={cn("font-bold tabular-nums", isScore ? "text-brand-700 dark:text-brand-400" : "text-gray-900 dark:text-white")}>{value}</span>
  </div>
);