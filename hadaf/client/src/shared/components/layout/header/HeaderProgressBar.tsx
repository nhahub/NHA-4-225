import { cn } from '@/shared/utils/cn';
import { Zap } from 'lucide-react';

interface HeaderProgressBarProps {
  progress: number;
  score: number;
  isOverachiever: boolean;
}

export const HeaderProgressBar = ({ progress, score, isOverachiever }: HeaderProgressBarProps) => {
  
  const getStyles = (p: number, over: boolean) => {
    // 1. Legendary (> 100%) - Purple/Gold
    if (over) return {
      fill: "bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-amber-500/20",
      border: "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-500",
      badge: "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-purple-500/30",
    };

    // 2. Initial / Danger (0-30%) - Red
    if (p <= 30) return {
      fill: "bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-800/20",
      border: "bg-red-500",
      badge: "bg-white border-2 border-red-500 text-red-600 shadow-sm dark:bg-gray-800 dark:border-red-500 dark:text-red-400",
    };

    // 3. Progress (30-60%) - Amber/Orange
    if (p <= 60) return {
      fill: "bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/20",
      border: "bg-amber-500",
      badge: "bg-white border-2 border-amber-500 text-amber-600 shadow-sm dark:bg-gray-800 dark:border-amber-500 dark:text-amber-400",
    };

    // 4. Good (60-85%) - Blue
    if (p <= 85) return {
      fill: "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/20",
      border: "bg-blue-600",
      badge: "bg-white border-2 border-blue-600 text-blue-600 shadow-sm dark:bg-gray-800 dark:border-blue-600 dark:text-blue-400",
    };

    // 5. Completed (85-100%) - Emerald Green
    return {
      fill: "bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-800/20",
      border: "bg-emerald-600",
      badge: "bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
    };
  };

  const styles = getStyles(progress, isOverachiever);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      
      {/* 1. Static Background (Glass) */}
      <div className="absolute inset-0 bg-white/95 dark:bg-background/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors" />

      {/* 2. Moving Progress Fill */}
      <div
        className={cn(
          "absolute inset-y-0 start-0 transition-all duration-1000 ease-out border-e border-white/20",
          styles.fill
        )}
        style={{ width: `${Math.min(100, progress)}%` }}
      >
        {/* Border Line at Bottom */}
        <div className={cn(
           "absolute bottom-0 start-0 end-0 h-[3px] shadow-[0_0_10px_rgba(0,0,0,0.1)]",
           styles.border
         )} />

        {/* Shimmer Effect — slides in from start edge, exits at end edge */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 ltr:-left-[100%] rtl:-right-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      </div>

      {/* 3. The Tracking Badge (Smart Positioning) */}
      <div 
        className="absolute bottom-0 z-20 transition-all duration-1000 ease-out"
        style={{ 
          left: `${Math.min(100, progress)}%`,
          
          transform: `translate(-${Math.min(100, progress)}%, 50%)`
        }}
      >
        <div className={cn(
          "flex flex-col items-center transition-all duration-500",
          "opacity-100 scale-100"
        )}>
           {/* The Badge Pill */}
           <div className={cn(
             "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap justify-center shadow-md",
             styles.badge
           )}>
             {isOverachiever && <Zap size={8} fill="currentColor" />}
             <span>{score} pts</span>
           </div>
        </div>
      </div>
    </div>
  );
};