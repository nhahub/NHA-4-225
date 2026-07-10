import { useFormContext } from 'react-hook-form';
import { cn } from '@/shared/utils/cn';
import { Flame, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export const TaskPriority = () => {
  const { setValue, watch } = useFormContext();
  const selectedPriority = watch('priority');

  const priorities = [
    { 
      id: 'urgent', 
      label: 'Urgent', 
      icon: Flame,
      base: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100', 
      active: 'bg-red-600 text-white border-red-600 ring-2 ring-red-200' 
    },
    { 
      id: 'high', 
      label: 'High', 
      icon: AlertTriangle,
      base: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100', 
      active: 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200' 
    },
    { 
      id: 'medium', 
      label: 'Medium', 
      icon: ArrowUp,
      base: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100', 
      active: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200' 
    },
    { 
      id: 'low', 
      label: 'Low', 
      icon: ArrowDown,
      base: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100', 
      active: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200' 
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
        Priority Level
      </label>
      <div className="grid grid-cols-4 gap-2">
        {priorities.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setValue('priority', p.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all duration-200",
              selectedPriority === p.id 
                ? p.active 
                : cn("bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700", p.base)
            )}
          >
            <p.icon size={18} className={selectedPriority === p.id ? "animate-pulse" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};