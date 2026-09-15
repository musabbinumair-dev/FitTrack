import React, { useState } from 'react';
import {
  Search,
  Calendar,
  X,
  Check,
  Plus,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardHeaderProps {
  onOpenQuickLog?: (type?: 'workout' | 'meal' | 'water' | 'weight') => void;
  onOpenReport?: () => void;
  onShowWelcome?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  isDarkMode?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenQuickLog,
  onOpenReport,
  onShowWelcome,
  searchQuery,
  onSearchChange,
  selectedDateRange,
  onDateRangeChange,
  isDarkMode = false,
}) => {
  const { user } = useAuth();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const datePresets = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greeting = getGreeting();
  const userName = user?.name ? user.name.trim().split(' ')[0] : 'Athlete';

  return (
    <div id="dashboard-header-container" className="px-3.5 sm:px-6 lg:px-8 pt-2 pb-2 md:py-3">
      <div className="flex md:hidden items-center justify-between gap-3 relative">
        <div>
          <h1
            id="mobile-main-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit'] leading-tight"
          >
            {greeting}, {userName}
          </h1>
          <p className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Here is your daily performance summary.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative shrink-0">
            <button
              id="mobile-quick-date-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11.5px] font-medium">{selectedDateRange}</span>
            </button>

            {showDatePicker && (
              <div
                id="mobile-date-picker-dropdown"
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Select Time Range
                </div>
                {datePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onDateRangeChange(preset);
                      setShowDatePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${selectedDateRange === preset
                        ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>{preset}</span>
                    {selectedDateRange === preset && <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onOpenReport && (
            <button
              id="mobile-export-report-btn"
              onClick={onOpenReport}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
              title="Generate Performance Report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11.5px] font-medium">Report</span>
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-row items-center justify-between gap-4">
        <div className="shrink-0">
          <h1
            id="dashboard-main-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']"
          >
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Welcome back! Here is your daily performance summary.
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 shrink-0">
          <div className="relative shrink-0">
            <button
              id="date-range-picker-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-3.5 h-9 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{selectedDateRange}</span>
            </button>

            {showDatePicker && (
              <div
                id="date-picker-dropdown"
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Select Time Range
                </div>
                {datePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onDateRangeChange(preset);
                      setShowDatePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${selectedDateRange === preset
                        ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>{preset}</span>
                    {selectedDateRange === preset && <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onOpenReport && (
            <button
              id="header-export-report-btn"
              onClick={onOpenReport}
              className="h-9 px-3 flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Report</span>
            </button>
          )}

          {onShowWelcome && (
            <button
              id="header-welcome-screen-btn"
              onClick={onShowWelcome}
              className="h-9 px-3 hidden xl:flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="View FitTrack Welcome Screen"
            >
              <span>Welcome View</span>
            </button>
          )}

          {onOpenQuickLog && (
            <button
              id="header-quick-log-btn"
              onClick={() => onOpenQuickLog('workout')}
              className="h-9 px-3.5 flex items-center gap-1.5 bg-slate-950 dark:bg-emerald-600 text-white rounded-full text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-98 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
