import React from 'react';
import {
  ChevronRight,
  Dumbbell,
  Flame,
  Utensils,
  Droplets,
  Scale,
  Plus,
} from 'lucide-react';

export interface DashboardActivity {
  id: string;
  title: string;
  dateText: string;
  timeText: string;
  stat: string;
  type: 'workout' | 'meal' | 'water' | 'weight';
}

interface RecentActivityFeedCardProps {
  activities?: DashboardActivity[];
  onViewHistory?: () => void;
  onOpenQuickLog?: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
}

export const RecentActivityFeedCard: React.FC<RecentActivityFeedCardProps> = ({
  activities = [],
  onViewHistory,
  onOpenQuickLog,
}) => {
  const displayItems = activities.slice(0, 6);

  const getItemVisuals = (type: DashboardActivity['type']) => {
    switch (type) {
      case 'workout':
        return {
          icon: Dumbbell,
          iconColor: 'text-[#0079C1] dark:text-[#38bdf8]',
          bgColor: 'bg-[#E8F2FE] dark:bg-sky-950/50',
        };
      case 'meal':
        return {
          icon: Utensils,
          iconColor: 'text-[#FF5A5F] dark:text-[#fb7185]',
          bgColor: 'bg-[#FDECEE] dark:bg-rose-950/50',
        };
      case 'water':
        return {
          icon: Droplets,
          iconColor: 'text-[#00B4D8] dark:text-[#38bdf8]',
          bgColor: 'bg-[#E0F7FA] dark:bg-cyan-950/50',
        };
      case 'weight':
        return {
          icon: Scale,
          iconColor: 'text-[#10B981] dark:text-[#34d399]',
          bgColor: 'bg-[#EAF7EE] dark:bg-emerald-950/50',
        };
      default:
        return {
          icon: Flame,
          iconColor: 'text-[#FF5722] dark:text-orange-400',
          bgColor: 'bg-[#FDF2E8] dark:bg-orange-950/50',
        };
    }
  };

  return (
    <div
      id="recent-activity-card"
      className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col transition-all"
    >
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold tracking-tight font-['Outfit'] select-none">
          Recent activity
        </h2>

        <button
          id="recent-activity-view-all-btn"
          type="button"
          onClick={onViewHistory}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer select-none"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {displayItems.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Dumbbell className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No activities logged yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Take any action in the tracker to see your live activity timeline here.</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onOpenQuickLog?.('workout')}
              className="px-3.5 py-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold rounded-full flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Workout
            </button>
            <button
              onClick={() => onOpenQuickLog?.('meal')}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Meal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3.5 sm:space-y-4">
          {displayItems.map((item) => {
            const visuals = getItemVisuals(item.type);
            const Icon = visuals.icon;

            return (
              <div
                key={item.id}
                onClick={() => onOpenQuickLog?.(item.type)}
                className="flex items-center justify-between p-1.5 -mx-1.5 sm:p-2 sm:-mx-2 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${visuals.bgColor}`}
                  >
                    <Icon className={`w-5 h-5 stroke-[2.2] ${visuals.iconColor}`} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-900 dark:text-white text-sm sm:text-[15px] font-semibold tracking-tight font-['Outfit'] truncate">
                      {item.title}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-normal mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                      <span>{item.dateText}</span>
                      <span className="text-slate-300 dark:text-slate-600 font-bold">·</span>
                      <span>{item.timeText}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  <span className="text-slate-900 dark:text-white font-semibold text-sm sm:text-[15px] font-['Outfit'] tabular-nums">
                    {item.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
