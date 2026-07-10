import React, { useRef } from 'react';
import { Moon, Sun, Calendar, Search, Plus, X, ChevronDown, RotateCcw, PanelLeft } from 'lucide-react';
import { format, isSameDay, differenceInCalendarDays, startOfToday } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/Button';
import { LanguageSwitcher } from '@/shared/components/layout/LanguageSwitcher';

interface HeaderContentProps {
  currentTime: Date;
  isDarkMode: boolean;
  isSearchExpanded: boolean;
  selectedDate: Date;
  isSidebarCollapsed: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchToggle: () => void;
  onSearchClear: () => void;
  onDateChange: (date: Date) => void;
  onResetToday: () => void;
  onThemeToggle: () => void;
  onAddTask: () => void;
  onMenuToggle: () => void;
}

export const HeaderContent = ({
  currentTime,
  isDarkMode,
  isSearchExpanded,
  selectedDate,
  isSidebarCollapsed,
  searchQuery,
  onSearchChange,
  onSearchToggle,
  onSearchClear,
  onDateChange,
  onResetToday,
  onThemeToggle,
  onAddTask,
  onMenuToggle
}: HeaderContentProps) => {
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const today = startOfToday();
  const isToday = isSameDay(selectedDate, today);

  const getRelativeDateText = () => {
    const diff = differenceInCalendarDays(selectedDate, today);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} Days`;
  };

  // Focus effect
  React.useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div className="relative z-10 flex items-center justify-between gap-4 h-full px-4 md:px-8 w-full">
        
      {/* Left: Date & Menu */}
      <div className="flex items-center gap-3 min-w-fit">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ms-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <PanelLeft size={22} className={cn("transition-transform", isSidebarCollapsed && "rotate-180")} />
        </button>

        <div 
          className="group/date relative cursor-pointer flex items-center gap-3 select-none"
          onClick={() => dateInputRef.current?.showPicker()}
        >
          <div className={cn(
            "hidden md:flex p-2 rounded-lg shadow-sm transition-all duration-200 border bg-white/50 dark:bg-black/20 backdrop-blur-sm",
            isToday 
              ? "border-brand-200 text-brand-600 dark:border-brand-900/30 dark:text-brand-100"
              : "border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
          )}>
             <Calendar size={18} />
          </div>

          <div>
            <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 group-hover/date:text-brand-600 transition-colors">
              {format(selectedDate, 'EEE, MMM d')}
              <ChevronDown size={14} className="text-gray-400 group-hover/date:text-brand-500 transition-transform group-hover/date:rotate-180" />
              <input 
                ref={dateInputRef}
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer -z-10"
                onChange={(e) => e.target.valueAsDate && onDateChange(e.target.valueAsDate)}
                value={format(selectedDate, 'yyyy-MM-dd')}
              />
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {getRelativeDateText()}
            </p>
          </div>
        </div>

        {!isToday && (
          <button
            onClick={onResetToday}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white/60 border border-brand-100 dark:bg-brand-900/20 dark:text-brand-200 dark:border-brand-900/30 rounded-md hover:bg-brand-100 transition-all shadow-sm backdrop-blur-sm"
          >
            <RotateCcw size={12} /> Today
          </button>
        )}
      </div>

      {/* Center: Clock */}
      <div className={cn(
        "absolute start-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center transition-opacity duration-300 pointer-events-none",
        isSearchExpanded ? "opacity-0" : "opacity-100"
      )}>
        <span className="text-2xl font-bold text-gray-900/80 dark:text-white/80 tabular-nums tracking-tight font-mono">
          {format(currentTime, 'h:mm')}
          <span className="text-sm font-sans font-medium text-gray-400 ms-1 relative -top-1">
            {format(currentTime, 'a')}
          </span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3 justify-end flex-1 md:flex-none">
        
        <div className={cn(
          "flex items-center rounded-lg border transition-all duration-300 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm",
          isSearchExpanded 
            ? "w-full md:w-64 px-2 border-brand-500 ring-1 ring-brand-500/20 shadow-sm bg-white dark:bg-gray-800" 
            : "w-9 h-9 justify-center border-transparent bg-transparent shadow-none"
        )}>
          <button 
            onClick={onSearchToggle}
            className={cn(
              "text-gray-500 hover:text-brand-600 dark:text-gray-400 transition-colors",
              !isSearchExpanded && "p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <Search size={18} />
          </button>
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "bg-transparent border-none outline-none text-sm ms-2 text-gray-900 dark:text-white placeholder:text-gray-400 w-full",
              !isSearchExpanded && "hidden"
            )}
            onBlur={() => !searchQuery && onSearchToggle()}
          />
          
          {searchQuery && isSearchExpanded && (
            <button onClick={onSearchClear} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />

        <LanguageSwitcher />

        <button
          onClick={onThemeToggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 border border-transparent hover:border-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-all"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Button 
          onClick={onAddTask}
          size="sm"
          className="rounded-lg px-4 shadow-lg shadow-brand-500/20 hidden md:flex font-semibold relative overflow-hidden"
          leftIcon={<Plus size={16} />}
        >
          Add Task
        </Button>
        
        <button 
          onClick={onAddTask}
          className="w-9 h-9 rounded-lg bg-brand-600 text-white flex md:hidden items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};