import { useQuery } from '@tanstack/react-query';
import { Clock, Lock } from 'lucide-react'; // ✅ Only kept used icons
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getDashboardStats } from '../api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { StatsCard } from '@/shared/components/ui/Card';
import { DashboardSkeleton } from '@/shared/components/ui/Skeleton';

const formatFocusTime = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.name || 'User'}!
        </p>
      </header>
      
      {/* Analytics Mockup */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm h-[420px] group">
        {/* Content Layer */}
        <div className="filter blur-[1.5px] pointer-events-none select-none p-8 space-y-8 h-full transition-all duration-500 group-hover:blur-[3px]">
           <div className="flex justify-between items-center opacity-80">
             <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
             <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
           </div>

           <div className="grid grid-cols-3 gap-6 h-64">
              <div className="col-span-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 flex items-end justify-between gap-4 border border-gray-100 dark:border-gray-700/50">
                  {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85, 65, 95].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="w-full bg-gradient-to-t from-brand-500 to-brand-300 dark:from-brand-600 dark:to-brand-800 rounded-t-md shadow-sm opacity-90"></div>
                  ))}
              </div>
              
              <div className="col-span-1 flex flex-col gap-4">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 relative">
                      <div className="w-28 h-28 rounded-full border-[12px] border-brand-200 dark:border-brand-900 border-t-brand-500 border-e-brand-400 rotate-45 shadow-sm"></div>
                      <div className="absolute text-brand-600 dark:text-brand-400 font-bold text-lg">78%</div>
                  </div>
                  <div className="h-12 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center px-4">
                      <div className="h-2 w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  </div>
              </div>
           </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/30 dark:bg-gray-950/50 backdrop-blur-[1px] p-6 text-center transition-all duration-300 group-hover:bg-white/40 dark:group-hover:bg-gray-950/60">
           <div className="relative">
             <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 animate-pulse"></div>
             <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-100 dark:border-gray-700 relative z-10">
               <Lock className="w-9 h-9 text-brand-500" strokeWidth={1.5} />
             </div>
           </div>

           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight drop-shadow-sm">
             Advanced Analytics
           </h2>
           <p className="text-gray-700 dark:text-gray-300 max-w-md mb-8 leading-relaxed text-sm md:text-base font-medium">
             Unlock deep insights into your productivity trends, focus hours, and task completion rates.
           </p>

           <div className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg cursor-default border border-transparent dark:border-gray-200 transform hover:scale-105 transition-transform">
             Coming Soon
           </div>
        </div>
      </div>

      {/* Active Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Focus Time"
          value={formatFocusTime(stats?.totalFocusTime || 0)}
          icon={<Clock size={24} />}
          color="info"
        />
      </div>
    </div>
  );
};