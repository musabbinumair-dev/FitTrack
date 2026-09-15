import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr: string; // e.g. "Today, Aug 21" or "Aug 21, 2026"
  onSelectDate: (dateStr: string, dateObj?: Date) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDateStr,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleDayClick = (day: number) => {
    setActiveDay(day);
    const clickedDate = new Date(currentYear, currentMonth, day);
    const monthShort = monthNames[currentMonth].substring(0, 3);

    const now = new Date();
    const isToday =
      clickedDate.getDate() === now.getDate() &&
      clickedDate.getMonth() === now.getMonth() &&
      clickedDate.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      clickedDate.getDate() === yesterday.getDate() &&
      clickedDate.getMonth() === yesterday.getMonth() &&
      clickedDate.getFullYear() === yesterday.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      clickedDate.getDate() === tomorrow.getDate() &&
      clickedDate.getMonth() === tomorrow.getMonth() &&
      clickedDate.getFullYear() === tomorrow.getFullYear();

    let formatted = `${monthShort} ${day}, ${currentYear}`;
    if (isToday) formatted = `Today, ${monthShort} ${day}`;
    else if (isYesterday) formatted = `Yesterday, ${monthShort} ${day}`;
    else if (isTomorrow) formatted = `Tomorrow, ${monthShort} ${day}`;

    onSelectDate(formatted, clickedDate);
    onClose();
  };

  const handleQuickPreset = (preset: 'yesterday' | 'today' | 'tomorrow') => {
    const now = new Date();
    let target = new Date();
    if (preset === 'yesterday') {
      target.setDate(now.getDate() - 1);
    } else if (preset === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    }

    setCurrentMonth(target.getMonth());
    setCurrentYear(target.getFullYear());
    setActiveDay(target.getDate());

    const monthShort = monthNames[target.getMonth()].substring(0, 3);
    const day = target.getDate();
    let formatted = `${monthShort} ${day}, ${target.getFullYear()}`;
    if (preset === 'today') formatted = `Today, ${monthShort} ${day}`;
    if (preset === 'yesterday') formatted = `Yesterday, ${monthShort} ${day}`;
    if (preset === 'tomorrow') formatted = `Tomorrow, ${monthShort} ${day}`;

    onSelectDate(formatted, target);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Outfit',sans-serif]">
          {/* Dark Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5"
          >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <CalendarIcon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white leading-tight">
                Select Date
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                View or log meals for any day
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Presets Pills */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickPreset('yesterday')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDateStr.includes('Aug 20')
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Yesterday
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('today')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDateStr.includes('Aug 21')
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('tomorrow')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDateStr.includes('Aug 22')
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tomorrow
          </button>
        </div>

        {/* Month & Year Controller */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-column Calendar Grid */}
        <div className="space-y-2">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {/* Date Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = activeDay === dayNum && currentMonth === 7 && currentYear === 2026;
              const isToday = dayNum === 21 && currentMonth === 7 && currentYear === 2026;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF5500] text-white shadow-xs'
                      : isToday
                      ? 'bg-orange-100 dark:bg-orange-950/60 text-[#FF5500] dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span>Active Selection:</span>
          <span className="font-bold text-slate-900 dark:text-white font-['Outfit']">
            {selectedDateStr}
          </span>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
