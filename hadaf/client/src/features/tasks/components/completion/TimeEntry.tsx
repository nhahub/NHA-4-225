import { Clock, ArrowRight, CalendarClock } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';
import { format, parse, isValid } from 'date-fns';

interface TimeEntryProps {
  startTime: string;
  endTime: string;
  setStartTime: (val: string) => void;
  setEndTime: (val: string) => void;
  taskStartTime?: string;
  taskEndTime?: string;
  expectedTime: number;
  actualDuration: number;
  timeDiff: number;
}

export const TimeEntry = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  taskStartTime,
  taskEndTime,
  expectedTime,
  actualDuration,
  timeDiff
}: TimeEntryProps) => {

  const formatTimeDisplay = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const date = parse(timeStr, 'HH:mm', new Date());
    return isValid(date) ? format(date, 'h:mm a') : timeStr;
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Planned Time */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span className="font-medium">Planned:</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>{formatTimeDisplay(taskStartTime)}</span>
          <ArrowRight size={10} className="text-gray-400" />
          <span>{formatTimeDisplay(taskEndTime)}</span>
          <span className="ms-1 bg-gray-200 dark:bg-gray-700 px-1.5 rounded text-gray-600 dark:text-gray-300">
            {expectedTime}m
          </span>
        </div>
      </div>

      {/* 2. Actual Time Input (Horizontal Layout) */}
      <div className={cn(
        "p-4 rounded-xl border transition-all",
        timeDiff >= 0 
          ? "bg-brand-50/30 border-brand-100 dark:bg-brand-900/10 dark:border-brand-900/30" 
          : "bg-orange-50/30 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30"
      )}>
        <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-center justify-center opacity-60">
          <CalendarClock size={12} /> 
          Adjust Actual Time
        </div>

        {/* Horizontal Row: Start -> End */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-11 px-1 text-center font-mono font-bold text-xl bg-white dark:bg-black/20 border-transparent shadow-sm focus:ring-1 focus:ring-brand-500 rounded-lg w-full" 
            />
          </div>
          
          <ArrowRight size={16} className="text-gray-400 shrink-0" />
          
          <div className="flex-1">
            <Input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-11 px-1 text-center font-mono font-bold text-xl bg-white dark:bg-black/20 border-transparent shadow-sm focus:ring-1 focus:ring-brand-500 rounded-lg w-full" 
            />
          </div>
        </div>

        {/* Duration Feedback */}
        <div className="mt-3 text-center border-t border-black/5 dark:border-white/5 pt-2">
           <span className={cn("text-sm font-bold", timeDiff >= 0 ? "text-brand-600 dark:text-brand-400" : "text-orange-600")}>
             Took: {actualDuration} min
           </span>
        </div>
      </div>

      {/* 3. Performance Badge */}
      <div className={cn(
        "py-1.5 px-3 rounded-lg text-center text-xs font-semibold border",
        timeDiff > 0 
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          : timeDiff < 0
          ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      )}>
        {timeDiff > 0 
          ? `⚡ Great! You saved ${timeDiff}m.`
          : timeDiff < 0
          ? `⏱️ Overtime by ${Math.abs(timeDiff)}m.`
          : `✅ Exact timing.`}
      </div>

    </div>
  );
};