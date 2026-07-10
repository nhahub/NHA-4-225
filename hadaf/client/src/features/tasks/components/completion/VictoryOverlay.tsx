// @ts-nocheck — TODO(E2): rewire to the real Hadaf Task schema. This file still uses Impulse's pre-migration task shape (name/startTime/endTime/subTasks/type/points). Full Express rewiring lands in the E2 work order.
import { Trophy, CheckCircle2, TrendingUp, Zap, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface VictoryOverlayProps {
  points: number;
  basePoints: number;
  bonusPoints: number;
  timeDiff: number; // Will use it for logic below, even if not displayed directly
  remainingTasks: number;
  onContinue: () => void;
}

export const VictoryOverlay = ({ 
  points, 
  basePoints, 
  bonusPoints, 
  remainingTasks, 
  onContinue 
}: VictoryOverlayProps) => {
  return (
    <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in text-white p-8">
      
      {/* Background Effect */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
      
      {/* Icon */}
      <div className="relative mb-4 animate-scale-in delay-100 fill-mode-forwards scale-110">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-gray-800">
           <Trophy size={48} className="text-white fill-white/20" />
        </div>
        <div className="absolute -bottom-2 -end-2 bg-gray-800 rounded-full p-1.5 border-2 border-gray-700">
           <Star size={20} className="text-yellow-400 fill-yellow-400" />
        </div>
      </div>

      {/* Main Score */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-1 tracking-tight drop-shadow-sm">
          +{points}
        </h2>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Total Score</span>
      </div>

      {/* Detailed Breakdown */}
      <div className="w-full space-y-2 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-1.5 bg-gray-700 rounded text-gray-300">
               <CheckCircle2 size={14} />
             </div>
             <span className="text-sm font-medium text-gray-300">Task Completion</span>
           </div>
           <span className="text-sm font-bold text-white">+{basePoints}</span>
        </div>

        {bonusPoints > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-1.5 bg-green-500/20 rounded text-green-400">
                 <Zap size={14} fill="currentColor" />
               </div>
               <span className="text-sm font-medium text-green-300">Efficiency Bonus</span>
             </div>
             <span className="text-sm font-bold text-green-400">+{bonusPoints}</span>
          </div>
        )}

        {bonusPoints < 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-1.5 bg-orange-500/20 rounded text-orange-400">
                 <TrendingUp size={14} />
               </div>
               <span className="text-sm font-medium text-orange-300">Overtime Adjustment</span>
             </div>
             <span className="text-sm font-bold text-orange-400">{bonusPoints}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 font-medium mb-6">
        {remainingTasks > 0 
          ? `Keep it up! ${remainingTasks} tasks remaining today.` 
          : "All done for today! Amazing work."}
      </p>

      <Button 
        onClick={onContinue}
        className="bg-white text-gray-900 hover:bg-gray-200 font-bold px-10 py-3 rounded-xl shadow-lg w-full animate-slide-in-up"
      >
        Continue
      </Button>
    </div>
  );
};