import { Zap, Target, TrendingUp } from 'lucide-react';

interface ScoreBreakdownProps {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
}

export const ScoreBreakdown = ({ basePoints, bonusPoints, totalPoints }: ScoreBreakdownProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
       <div className="flex items-center justify-between mb-3">
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score Details</span>
       </div>
       
       <div className="space-y-2.5">
         {/* Base Points Row */}
         <div className="flex justify-between items-center text-sm">
           <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
             <Target size={14} className="text-gray-400" />
             <span className="font-medium">Task Base & Priority</span>
           </div>
           <span className="font-bold text-gray-700 dark:text-gray-200">{basePoints}</span>
         </div>

         {/* Bonus/Penalty Row */}
         <div className="flex justify-between items-center text-sm">
           <div className="flex items-center gap-2">
             <TrendingUp size={14} className={bonusPoints >= 0 ? "text-green-500" : "text-orange-500"} />
             <span className={bonusPoints >= 0 ? "text-green-700 dark:text-green-400 font-medium" : "text-orange-700 dark:text-orange-400 font-medium"}>
               Time {bonusPoints >= 0 ? 'Bonus' : 'Penalty'}
             </span>
           </div>
           <span className={bonusPoints >= 0 ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
             {bonusPoints >= 0 ? `+${bonusPoints}` : bonusPoints}
           </span>
         </div>

         {/* Divider */}
         <div className="h-px bg-gray-200 dark:bg-gray-700/50 my-1" />

         {/* Total Row */}
         <div className="flex justify-between items-center pt-1">
           <span className="text-xs font-bold text-gray-500 uppercase">Total Points</span>
           <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
             <Zap size={16} fill="currentColor" />
             <span className="font-black text-xl">{totalPoints}</span>
           </div>
         </div>
       </div>
    </div>
  );
};